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

  static async create(data, userId) {
    const customer = await Customer.findOne({ _id: data.customerId, userId });
    if (!customer) throw new Error("Customer not found");

    const product = await Product.findOne({
      _id: data.productId,
      userId,
      deletedAt: null,
    });
    if (!product) throw new Error("Product not found");

    let totalAmount;

    if (data.paymentType !== "full" && data.paymentType !== "installments") {
      throw new Error("Payment type must be 'full' or 'installments'");
    }

    if (data.paymentType === "full") {
      totalAmount = product.price;
    } else if (data.paymentType === "installments") {
      if (!data.totalAmount)
        throw new Error("Total amount is required for installments");
      if (data.totalAmount < 0) throw new Error("Invalid total amount");
      totalAmount = data.totalAmount;
    }

    const effectivePayments = data.paymentType === "full" ? totalAmount : 0;
    const { remainingBalance, status } = SaleService.deriveBalanceAndStatus(
      totalAmount,
      effectivePayments
    );

    const sale = await Sale.create({
      customerId: data.customerId,
      productId: data.productId,
      paymentType: data.paymentType,
      totalAmount,
      remainingBalance,
      status,
      userId,
    });

    if (data.paymentType === "full") {
      await Payment.create({
        saleId: sale._id,
        amount: totalAmount,
        previousBalance: totalAmount,
        newBalance: 0,
        userId,
      });
    }

    return sale.populate("customerId productId");
  }

  static async findAll(userId) {
    return Sale.find({ userId }).populate("customerId").populate("productId");
  }

  static async findByCustomerId(customerId) {
    const sales = await Sale.find({ customerId });

    return sales;
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
      const product = await Product.findOne({
        _id: data.productId,
        userId,
        deletedAt: null,
      });
      if (!product) {
        const error = new Error("Product not found");
        error.status = 404;
        throw error;
      }
      sale.productId = data.productId;
    }

    if (data.paymentType !== undefined) {
      if (!["full", "installments"].includes(data.paymentType)) {
        const error = new Error(
          "Payment type must be 'full' or 'installments'"
        );
        error.status = 400;
        throw error;
      }

      if (
        sale.paymentType === "installments" &&
        data.paymentType === "full" &&
        totalPayments > 0
      ) {
        const error = new Error(
          "Cannot change to full payment when installment payments have been registered"
        );
        error.status = 422;
        throw error;
      }

      sale.paymentType = data.paymentType;
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

    const effectivePayments =
      sale.paymentType === "full" ? sale.totalAmount : totalPayments;

    const { remainingBalance, status } = SaleService.deriveBalanceAndStatus(
      sale.totalAmount,
      effectivePayments
    );

    sale.remainingBalance = remainingBalance;
    sale.status = status;

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
        `Cannot delete sale with $${totalPayments.toFixed(
          2
        )} in recorded payments. Delete all payments first.`
      );
      error.status = 422;
      throw error;
    }

    if (sale.status === "active" && sale.paymentType === "installments") {
      const error = new Error(
        "Cannot delete an active installment sale. Mark it as completed or remove associated data first."
      );
      error.status = 422;
      throw error;
    }

    // Soft-delete all payments linked to this sale
    await Payment.updateMany(
      { saleId: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    // Soft-delete the sale
    await sale.softDelete();

    return { message: "Sale deleted successfully" };
  }
}

export default SaleService;
