import mongoose from "mongoose";
import Audit from "../../domain/models/audit.model.js";
import Payment from "../../domain/models/payment.model.js";
import Sale from "../../domain/models/sale.model.js";
import CouponService from "./coupon.service.js";

class PaymentService {
  // ═══════════════════════════════════════════════════════════════════
  // CREATE — fully transactional
  // ═══════════════════════════════════════════════════════════════════
  static async create({ saleId, amount, userId, couponId }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sale = await Sale.findOne({ _id: saleId, userId }, null, { session });
      if (!sale) throw new Error("Sale not found");

      if (sale.status === "completed") {
        throw Object.assign(new Error("Sale is already completed"), { status: 422 });
      }
      if (sale.status === "cancelled") {
        throw Object.assign(new Error("Cannot add payment to cancelled sale"), { status: 422 });
      }

      if (amount <= 0 || amount > sale.remainingBalance) {
        throw Object.assign(
          new Error(
            `Payment amount must be between $0.01 and $${sale.remainingBalance.toFixed(2)}`
          ),
          { status: 422 }
        );
      }

      const previousBalance = sale.remainingBalance;
      const newBalance = previousBalance - amount;

      // 1. Create payment
      const [payment] = await Payment.create(
        [{ saleId, amount, previousBalance, newBalance, userId }],
        { session }
      );

      // 2. Update sale atomically using $inc to prevent race conditions
      const newStatus = newBalance === 0 ? "completed" : "active";
      const updateFields = {
        $inc: { remainingBalance: -amount },
        $set: { status: newStatus },
      };
      if (newStatus === "completed") {
        updateFields.$set.completedAt = new Date();
      }

      const saleUpdate = await Sale.updateOne(
        { _id: saleId, remainingBalance: { $gte: amount } },
        updateFields,
        { session }
      );

      if (saleUpdate.modifiedCount === 0) {
        throw new Error("Failed to update sale balance (concurrent modification)");
      }

      // 3. Audit
      await Audit.create(
        [
          {
            entity: "payment",
            entityId: payment._id,
            action: "create",
            performedBy: userId,
            metadata: { amount, saleId, previousBalance, newBalance },
          },
        ],
        { session }
      );

      // 4. Apply coupon if provided
      if (couponId) {
        await CouponService.useCoupon(couponId, payment._id, userId, session);
      }

      await session.commitTransaction();

      // Post-commit: generate reward coupons (non-critical, outside transaction)
      let generatedCoupons = [];
      try {
        generatedCoupons = await CouponService.checkAndGenerateCoupons(
          sale.customerId,
          userId
        );
      } catch (err) {
        console.error("Non-critical: failed to check reward coupons:", err);
      }

      return { payment, generatedCoupons };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // READ
  // ═══════════════════════════════════════════════════════════════════
  static async findAll(userId) {
    return Payment.find({ deletedAt: null, userId })
      .populate({
        path: "saleId",
        populate: [{ path: "customerId" }, { path: "productId" }],
      })
      .sort({ createdAt: -1 });
  }

  static async findBySaleId(saleId, userId) {
    return Payment.find({ saleId, deletedAt: null, userId }).sort({
      createdAt: -1,
    });
  }

  static async findById(id, userId) {
    const payment = await Payment.findOne({ _id: id, userId }).populate({
      path: "saleId",
      populate: [{ path: "customerId" }, { path: "productId" }],
    });
    if (!payment) {
      throw Object.assign(new Error("Payment not found"), { status: 404 });
    }
    return payment;
  }

  // ═══════════════════════════════════════════════════════════════════
  // DELETE — transactional
  // ═══════════════════════════════════════════════════════════════════
  static async deleteById(paymentId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findOne({ _id: paymentId, userId }, null, { session });
      if (!payment) {
        throw Object.assign(new Error("Payment not found"), { status: 404 });
      }

      const sale = await Sale.findById(payment.saleId).session(session);
      if (!sale) {
        throw Object.assign(new Error("Associated sale not found"), { status: 404 });
      }

      // Atomic balance restore
      const newStatus = "active"; // Restoring a payment always makes sale active
      await Sale.updateOne(
        { _id: sale._id },
        {
          $inc: { remainingBalance: payment.amount },
          $set: { status: newStatus, completedAt: null },
        },
        { session }
      );

      // Soft-delete payment
      payment.isDeleted = true;
      payment.deletedAt = new Date();
      await payment.save({ session });

      // Audit
      await Audit.create(
        [
          {
            entity: "payment",
            entityId: payment._id,
            action: "delete",
            performedBy: userId,
            metadata: { amount: payment.amount, saleId: payment.saleId },
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return { message: "Payment deleted successfully" };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // UPDATE — transactional
  // ═══════════════════════════════════════════════════════════════════
  static async updateById(id, newData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findOne(
        { _id: id, userId, deletedAt: null },
        null,
        { session }
      );
      if (!payment) throw Object.assign(new Error("Payment not found"), { status: 404 });

      const sale = await Sale.findById(payment.saleId).session(session);
      if (!sale) throw Object.assign(new Error("Sale not found"), { status: 404 });

      // Max allowed = remainingBalance + current payment amount
      const maxAllowed = sale.remainingBalance + payment.amount;

      if (newData.amount <= 0) {
        throw Object.assign(new Error("Payment amount must be greater than 0"), { status: 400 });
      }

      if (newData.amount > maxAllowed) {
        throw Object.assign(
          new Error(
            `Amount cannot exceed $${maxAllowed.toFixed(2)} (remaining $${sale.remainingBalance.toFixed(2)} + current $${payment.amount.toFixed(2)})`
          ),
          { status: 422 }
        );
      }

      const diff = newData.amount - payment.amount; // positive = paying more, negative = refunding
      const previousBalance = sale.remainingBalance;
      const newBalance = previousBalance - diff;
      const newStatus = newBalance === 0 ? "completed" : "active";

      // Atomic sale update
      await Sale.updateOne(
        { _id: sale._id },
        {
          $inc: { remainingBalance: -diff },
          $set: {
            status: newStatus,
            ...(newStatus === "completed" ? { completedAt: new Date() } : { completedAt: null }),
          },
        },
        { session }
      );

      const oldAmount = payment.amount;
      payment.amount = newData.amount;
      payment.previousBalance = previousBalance;
      payment.newBalance = newBalance;
      payment.modified = true;
      await payment.save({ session });

      await Audit.create(
        [
          {
            entity: "payment",
            entityId: payment._id,
            action: "update",
            performedBy: userId,
            metadata: { oldAmount, newAmount: newData.amount, previousBalance, newBalance },
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return payment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default PaymentService;
