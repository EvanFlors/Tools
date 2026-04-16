import Customer from "../../domain/models/customer.model.js";
import Payment from "../../domain/models/payment.model.js";
import Product from "../../domain/models/product.model.js";
import Sale from "../../domain/models/sale.model.js";

class SaleService {
  static async getTotalPayments(saleId) {
    const result = await Payment.aggregate([
      { $match: { saleId: saleId, deletedAt: null } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  static deriveBalanceAndStatus(totalAmount, totalPayments) {
    const remainingBalance = Math.max(0, totalAmount - totalPayments);
    const status = remainingBalance === 0 ? "completed" : "active";
    return { remainingBalance, status };
  }

  /**
   * Create a sale as an independent entity — no initial payment, no paymentType.
   * Sale starts with remainingBalance = totalAmount, status = "active".
   * Payments are registered separately through the Payment flow.
   */
  static async create(data, userId) {
    const customer = await Customer.findOne({ _id: data.customerId, userId });
    if (!customer) throw new Error("Customer not found");

    const product = await Product.findOne({
      _id: data.productId,
      userId,
      deletedAt: null,
    });
    if (!product) throw new Error("Product not found");

    const totalAmount = data.totalAmount ?? product.price;

    if (totalAmount <= 0) {
      throw new Error("Total amount must be greater than 0");
    }

    const sale = await Sale.create({
      customerId: data.customerId,
      productId: data.productId,
      totalAmount,
      remainingBalance: totalAmount,
      status: "active",
      userId,
    });

    return sale.populate("customerId productId");
  }

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
    if (!sale) throw new Error("Sale not found");
    return sale;
  }

  static async updateById(id, data, userId) {
    const sale = await Sale.findOne({ _id: id, userId });
    if (!sale) {
      const error = new Error("Sale not found");
      error.status = 404;
      throw error;
    }

    const totalPayments = await SaleService.getTotalPayments(sale._id);

    if (data.customerId !== undefined) {
      const customer = await Customer.findOne({ _id: data.customerId, userId });
      if (!customer) {
        const error = new Error("Customer not found");
        error.status = 404;
        throw error;
      }
      sale.customerId = data.customerId;
    }

    if (data.productId !== undefined) {
      const product = await Product.findOne({ _id: data.productId, userId, deletedAt: null });
      if (!product) {
        const error = new Error("Product not found");
        error.status = 404;
        throw error;
      }
      sale.productId = data.productId;
    }

    if (data.totalAmount !== undefined) {
      if (data.totalAmount < 0) {
        const error = new Error("Total amount must be positive");
        error.status = 400;
        throw error;
      }
      if (data.totalAmount < totalPayments) {
        const error = new Error(
          `Total amount cannot be less than the amount already paid ($${totalPayments})`
        );
        error.status = 422;
        throw error;
      }
      sale.totalAmount = data.totalAmount;
    }

    if (data.status === "cancelled") {
      if (totalPayments > 0) {
        const error = new Error("Cannot cancel a sale with existing payments. Delete payments first.");
        error.status = 422;
        throw error;
      }
      sale.status = "cancelled";
      sale.remainingBalance = 0;
    } else {
      const { remainingBalance, status } = SaleService.deriveBalanceAndStatus(
        sale.totalAmount,
        totalPayments
      );
      sale.remainingBalance = remainingBalance;
      sale.status = status;
    }

    await sale.save();
    return sale.populate("customerId productId");
  }

  static async deleteById(id, userId) {
    const sale = await Sale.findOne({ _id: id, userId });
    if (!sale) {
      const error = new Error("Sale not found");
      error.status = 404;
      throw error;
    }

    const totalPayments = await SaleService.getTotalPayments(sale._id);

    if (totalPayments > 0 && sale.status === "active") {
      const error = new Error(
        `Cannot delete sale with $${totalPayments.toFixed(2)} in recorded payments. Delete all payments first.`
      );
      error.status = 422;
      throw error;
    }

    await Payment.updateMany(
      { saleId: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    await sale.softDelete();
    return { message: "Sale deleted successfully" };
  }
}

export default SaleService;
