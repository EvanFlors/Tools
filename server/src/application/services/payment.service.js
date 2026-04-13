import Audit from "../../domain/models/audit.model.js";
import Payment from "../../domain/models/payment.model.js";
import Sale from "../../domain/models/sale.model.js";

class PaymentService {
  static async create({ saleId, amount, userId }) {
    const sale = await Sale.findOne({ _id: saleId, userId });

    if (!sale) throw new Error("Sale not found");

    if (sale.status === "completed")
      throw new Error("Sale is already completed");

    if (amount <= 0 || amount > sale.remainingBalance) {
      const error = new Error(
        `Payment amount must be between $0.01 and $${sale.remainingBalance.toFixed(
          2
        )}`
      );
      error.status = 422;
      throw error;
    }

    const previousBalance = sale.remainingBalance;
    const newBalance = previousBalance - amount;

    const payment = await Payment.create({
      saleId,
      amount,
      previousBalance,
      newBalance,
      userId,
    });

    sale.remainingBalance = newBalance;

    // Business rule: status based on remaining balance
    if (newBalance === 0) {
      sale.status = "completed";
    } else {
      sale.status = "active";
    }

    await sale.save();

    await Audit.create({
      entity: "payment",
      entityId: payment.id,
      action: "create",
      performedBy: userId,
      metadata: {
        amount,
        saleId,
        previousBalance,
        newBalance,
      },
    });

    return payment;
  }

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
      const error = new Error("Payment not found");
      error.status = 404;
      throw error;
    }
    return payment;
  }

  static async deleteById(paymentId, userId) {
    const payment = await Payment.findOne({ _id: paymentId, userId });

    if (!payment) {
      const error = new Error("Payment not found");
      error.status = 404;
      throw error;
    }

    const sale = await Sale.findById(payment.saleId);

    if (!sale) {
      const error = new Error("Associated sale not found");
      error.status = 404;
      throw error;
    }

    // restore sale balance
    sale.remainingBalance += payment.amount;

    if (sale.remainingBalance > 0) {
      sale.status = "active";
    }

    await sale.save();
    await payment.softDelete();

    await Audit.create({
      entity: "payment",
      entityId: payment.id,
      action: "delete",
      performedBy: userId,
      metadata: {
        amount: payment.amount,
        saleId: payment.saleId,
      },
    });

    return { message: "Payment deleted successfully" };
  }

  static async updateById(id, newData, userId) {
    const payment = await Payment.findOne({
      _id: id,
      userId,
      deletedAt: null,
    });

    if (!payment) throw new Error("Payment not found");

    const sale = await Sale.findById(payment.saleId);

    if (!sale) throw new Error("Sale not found");

    // Max allowed = remainingBalance + current payment amount
    // (the current payment is "refunded" back before reapplying the new amount)
    const maxAllowed = sale.remainingBalance + payment.amount;

    if (newData.amount <= 0) {
      const error = new Error("Payment amount must be greater than 0");
      error.status = 400;
      throw error;
    }

    if (newData.amount > maxAllowed) {
      const error = new Error(
        `Amount cannot exceed $${maxAllowed.toFixed(
          2
        )} (remaining balance $${sale.remainingBalance.toFixed(
          2
        )} + current payment $${payment.amount.toFixed(2)})`
      );
      error.status = 422;
      throw error;
    }

    // Recalculate: refund old payment, apply new one
    const previousBalance = sale.remainingBalance;
    sale.remainingBalance =
      sale.remainingBalance + payment.amount - newData.amount;

    // Business rule: status based on remaining balance
    if (sale.remainingBalance === 0) {
      sale.status = "completed";
    } else if (sale.remainingBalance > 0) {
      sale.status = "active";
    }

    await sale.save();

    const oldAmount = payment.amount;
    payment.amount = newData.amount;
    payment.previousBalance = previousBalance;
    payment.newBalance = sale.remainingBalance;
    payment.modified = true;
    await payment.save();

    await Audit.create({
      entity: "payment",
      entityId: payment.id,
      action: "update",
      performedBy: userId,
      metadata: {
        oldAmount,
        newAmount: newData.amount,
        previousBalance,
        newBalance: sale.remainingBalance,
      },
    });

    return payment;
  }
}

export default PaymentService;
