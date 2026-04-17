import mongoose from "mongoose";
import Customer from "../../domain/models/customer.model.js";
import Payment from "../../domain/models/payment.model.js";
import Product from "../../domain/models/product.model.js";
import Sale from "../../domain/models/sale.model.js";

// ─── Helpers ──────────────────────────────────────────────────────────

const VALID_TRANSITIONS = {
  active: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function assertTransition(from, to) {
  if (!VALID_TRANSITIONS[from]?.includes(to)) {
    throw Object.assign(
      new Error(`Invalid status transition: ${from} → ${to}`),
      { status: 422 }
    );
  }
}

async function getTotalPayments(saleId, session) {
  const result = await Payment.aggregate([
    { $match: { saleId, isDeleted: { $ne: true } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]).session(session);
  return result.length > 0 ? result[0].total : 0;
}

function deriveBalanceAndStatus(totalAmount, totalPayments) {
  const remainingBalance = Math.max(0, totalAmount - totalPayments);
  const status = remainingBalance === 0 ? "completed" : "active";
  return { remainingBalance, status };
}

// ─── Service ──────────────────────────────────────────────────────────

class SaleService {
  // ═══════════════════════════════════════════════════════════════════
  // CREATE
  // ═══════════════════════════════════════════════════════════════════
  static async create(data, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validate references inside the transaction
      const customer = await Customer.findOne(
        { _id: data.customerId, userId },
        null,
        { session }
      );
      if (!customer) throw new Error("Customer not found");

      const product = await Product.findOne(
        { _id: data.productId, userId, deletedAt: null },
        null,
        { session }
      );
      if (!product) throw new Error("Product not found");

      const totalAmount = data.totalAmount ?? product.price;
      if (totalAmount <= 0) {
        throw new Error("Total amount must be greater than 0");
      }

      // 2. Atomic stock decrement — prevents overselling under concurrency
      const stockResult = await Product.updateOne(
        { _id: product._id, stock: { $gt: 0 } },
        { $inc: { stock: -1 } },
        { session }
      );
      if (stockResult.modifiedCount === 0) {
        throw new Error("Product is out of stock");
      }

      // 3. Create sale
      const [sale] = await Sale.create(
        [
          {
            customerId: data.customerId,
            productId: data.productId,
            totalAmount,
            remainingBalance: totalAmount,
            status: "active",
            userId,
            stockAdjusted: true,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return sale.populate("customerId productId");
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
    return Sale.find({ userId }).populate("customerId").populate("productId");
  }

  static async findByCustomerId(customerId) {
    return Sale.find({ customerId });
  }

  static async findById(id, userId) {
    const sale = await Sale.findOne({ _id: id, userId })
      .populate("customerId")
      .populate("productId");
    if (!sale) throw Object.assign(new Error("Sale not found"), { status: 404 });
    return sale;
  }

  // ═══════════════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════════════
  static async updateById(id, data, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sale = await Sale.findOne({ _id: id, userId }, null, { session });
      if (!sale) {
        throw Object.assign(new Error("Sale not found"), { status: 404 });
      }

      const previousStatus = sale.status;
      const totalPayments = await getTotalPayments(sale._id, session);

      // ── Update customer reference ────────────────────────────────
      if (data.customerId) {
        const customer = await Customer.findOne(
          { _id: data.customerId, userId },
          null,
          { session }
        );
        if (!customer) throw new Error("Customer not found");
        sale.customerId = data.customerId;
      }

      // ── Update product reference ─────────────────────────────────
      if (data.productId) {
        const product = await Product.findOne(
          { _id: data.productId, userId, deletedAt: null },
          null,
          { session }
        );
        if (!product) throw new Error("Product not found");
        sale.productId = data.productId;
      }

      // ── Update total amount ──────────────────────────────────────
      if (data.totalAmount !== undefined) {
        if (data.totalAmount < totalPayments) {
          throw Object.assign(
            new Error(
              `Total amount cannot be less than paid amount ($${totalPayments})`
            ),
            { status: 422 }
          );
        }
        sale.totalAmount = data.totalAmount;
      }

      // ── Cancel sale ──────────────────────────────────────────────
      if (data.status === "cancelled") {
        assertTransition(previousStatus, "cancelled");

        if (totalPayments > 0) {
          throw Object.assign(
            new Error("Cannot cancel sale with payments. Remove payments first."),
            { status: 422 }
          );
        }

        // Idempotent stock restore — only if we decremented it before
        if (sale.stockAdjusted) {
          await Product.updateOne(
            { _id: sale.productId },
            { $inc: { stock: 1 } },
            { session }
          );
          sale.stockAdjusted = false;
        }

        sale.status = "cancelled";
        sale.remainingBalance = 0;
        sale.cancelledAt = new Date();
      } else {
        // ── Recalculate derived fields ─────────────────────────────
        const { remainingBalance, status } = deriveBalanceAndStatus(
          sale.totalAmount,
          totalPayments
        );

        if (status !== previousStatus && status !== previousStatus) {
          // Only validate transition when status actually changes
          if (previousStatus !== status) {
            assertTransition(previousStatus, status);
          }
        }

        sale.remainingBalance = remainingBalance;
        sale.status = status;

        if (status === "completed" && previousStatus !== "completed") {
          sale.completedAt = new Date();
        }
      }

      await sale.save({ session });
      await session.commitTransaction();

      return sale.populate("customerId productId");
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════════════════════════════
  static async deleteById(id, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sale = await Sale.findOne({ _id: id, userId }, null, { session });
      if (!sale) {
        throw Object.assign(new Error("Sale not found"), { status: 404 });
      }

      // 1. Check for payments FIRST — fail fast before any side effects
      const totalPayments = await getTotalPayments(sale._id, session);
      if (totalPayments > 0) {
        throw Object.assign(
          new Error(
            `Cannot delete sale with payments ($${totalPayments}). Remove them first.`
          ),
          { status: 422 }
        );
      }

      // 2. Restore stock atomically (idempotent via stockAdjusted flag)
      if (sale.stockAdjusted) {
        await Product.updateOne(
          { _id: sale.productId },
          { $inc: { stock: 1 } },
          { session }
        );
      }

      // 3. Soft-delete the sale
      sale.isDeleted = true;
      sale.deletedAt = new Date();
      await sale.save({ session });

      await session.commitTransaction();
      return { message: "Sale deleted successfully" };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default SaleService;
