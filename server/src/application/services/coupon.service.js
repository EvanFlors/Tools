import crypto from "crypto";
import Coupon from "../../domain/models/coupon.model.js";
import Payment from "../../domain/models/payment.model.js";

// Configurable: every THRESHOLD pesos in cumulative payments → generate a coupon worth COUPON_VALUE
const THRESHOLD = 1000;
const COUPON_VALUE = 50;
const COUPON_EXPIRY_DAYS = 90;

class CouponService {
  /**
   * Generate a unique coupon code.
   */
  static generateCode() {
    return `HER-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }

  /**
   * Check if a customer has earned new coupons based on cumulative payments.
   * Called after each payment is created.
   */
  static async checkAndGenerateCoupons(customerId, userId) {
    // Get cumulative payments for this customer across all their sales
    const Sale = (await import("../../domain/models/sale.model.js")).default;
    const customerSales = await Sale.find({
      customerId,
      isDeleted: { $ne: true },
    });
    const saleIds = customerSales.map((s) => s._id);

    const paymentResult = await Payment.aggregate([
      { $match: { saleId: { $in: saleIds }, deletedAt: null } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalPaid = paymentResult.length > 0 ? paymentResult[0].total : 0;

    // Count existing coupons generated for this customer (including used)
    const existingCoupons = await Coupon.countDocuments({
      customerId,
      isDeleted: { $ne: true },
    });

    // How many coupons should exist based on cumulative payments
    const earnedCoupons = Math.floor(totalPaid / THRESHOLD);
    const newCouponsNeeded = earnedCoupons - existingCoupons;

    const generated = [];

    for (let i = 0; i < newCouponsNeeded; i++) {
      const coupon = await Coupon.create({
        customerId,
        code: CouponService.generateCode(),
        value: COUPON_VALUE,
        status: "available",
        expiresAt: new Date(
          Date.now() + COUPON_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        ),
        userId,
      });
      generated.push(coupon);
    }

    return generated;
  }

  /**
   * Get available coupons for a customer.
   */
  static async getAvailableCoupons(customerId) {
    return Coupon.find({
      customerId,
      status: "available",
      isDeleted: { $ne: true },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).sort({ createdAt: -1 });
  }

  /**
   * Get all coupons for a customer (all statuses).
   */
  static async getAllByCustomer(customerId) {
    return Coupon.find({
      customerId,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });
  }

  /**
   * Get all coupons for an admin (across all customers).
   */
  static async getAllByAdmin(userId) {
    return Coupon.find({
      userId,
      isDeleted: { $ne: true },
    })
      .populate("customerId")
      .sort({ createdAt: -1 });
  }

  /**
   * Use a coupon as payment on a sale.
   * Returns the coupon value that was applied.
   */
  static async useCoupon(couponId, paymentId, userId, session = null) {
    const query = {
      _id: couponId,
      userId,
      status: "available",
      isDeleted: { $ne: true },
    };

    const coupon = session
      ? await Coupon.findOne(query).session(session)
      : await Coupon.findOne(query);

    if (!coupon) {
      throw Object.assign(new Error("Coupon not found or already used"), {
        status: 404,
      });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      coupon.status = "expired";
      await coupon.save({ session });
      throw Object.assign(new Error("Coupon has expired"), { status: 400 });
    }

    coupon.status = "used";
    coupon.usedInPaymentId = paymentId;
    coupon.usedAt = new Date();
    await coupon.save({ session });

    return coupon;
  }

  /**
   * Get rewards summary for a customer.
   */
  static async getRewardsSummary(customerId) {
    const Sale = (await import("../../domain/models/sale.model.js")).default;
    const customerSales = await Sale.find({
      customerId,
      isDeleted: { $ne: true },
    });
    const saleIds = customerSales.map((s) => s._id);

    const paymentResult = await Payment.aggregate([
      { $match: { saleId: { $in: saleIds }, deletedAt: null } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalPaid = paymentResult.length > 0 ? paymentResult[0].total : 0;
    const progressToNext = totalPaid % THRESHOLD;
    const availableCoupons = await CouponService.getAvailableCoupons(
      customerId
    );

    return {
      totalPaid,
      threshold: THRESHOLD,
      progressToNext,
      percentToNext: Math.round((progressToNext / THRESHOLD) * 100),
      availableCoupons: availableCoupons.length,
      couponValue: COUPON_VALUE,
    };
  }

  /**
   * Redeem a coupon directly on a sale (customer-initiated).
   * Creates a payment for min(couponValue, remainingBalance), marks coupon used.
   */
  static async redeemForSale(couponId, saleId, customerId) {
    const mongoose = (await import("mongoose")).default;
    const Sale = (await import("../../domain/models/sale.model.js")).default;
    const Audit = (await import("../../domain/models/audit.model.js")).default;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Load & validate sale
      const sale = await Sale.findOne({ _id: saleId, customerId }, null, {
        session,
      });
      if (!sale)
        throw Object.assign(new Error("Sale not found"), { status: 404 });
      if (sale.status !== "active") {
        throw Object.assign(
          new Error("Can only redeem coupons on active sales"),
          { status: 422 }
        );
      }

      // 2. Load & validate coupon (must belong to same customer and admin)
      const coupon = await Coupon.findOne({
        _id: couponId,
        customerId,
        userId: sale.userId,
        status: "available",
        isDeleted: { $ne: true },
      }).session(session);

      if (!coupon) {
        throw Object.assign(new Error("Coupon not found or already used"), {
          status: 404,
        });
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        coupon.status = "expired";
        await coupon.save({ session });
        throw Object.assign(new Error("Coupon has expired"), { status: 400 });
      }

      // 3. Calculate effective amount
      const amount = Math.min(coupon.value, sale.remainingBalance);
      const previousBalance = sale.remainingBalance;
      const newBalance = previousBalance - amount;
      const newStatus = newBalance === 0 ? "completed" : "active";

      // 4. Create payment
      const [payment] = await Payment.create(
        [{ saleId, amount, previousBalance, newBalance, userId: sale.userId }],
        { session }
      );

      // 5. Update sale atomically
      const updateFields = {
        $inc: { remainingBalance: -amount },
        $set: { status: newStatus },
      };
      if (newStatus === "completed") updateFields.$set.completedAt = new Date();

      const saleUpdate = await Sale.updateOne(
        { _id: saleId, remainingBalance: { $gte: amount } },
        updateFields,
        { session }
      );
      if (saleUpdate.modifiedCount === 0) {
        throw new Error("Failed to update sale balance");
      }

      // 6. Mark coupon as used
      coupon.status = "used";
      coupon.usedInPaymentId = payment._id;
      coupon.usedInSaleId = saleId;
      coupon.usedAt = new Date();
      await coupon.save({ session });

      // 7. Audit
      await Audit.create(
        [
          {
            entity: "coupon",
            entityId: coupon._id,
            action: "redeem",
            performedBy: customerId,
            metadata: {
              couponCode: coupon.code,
              amount,
              saleId,
              paymentId: payment._id,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return { payment, coupon, appliedAmount: amount };
    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      throw error;
    } finally {
      if (!session.hasEnded) session.endSession();
    }
  }
}

export default CouponService;
