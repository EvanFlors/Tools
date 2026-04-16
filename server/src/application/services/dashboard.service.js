import mongoose from "mongoose";
import Customer from "../../domain/models/customer.model.js";
import Payment from "../../domain/models/payment.model.js";
import Sale from "../../domain/models/sale.model.js";

class DashboardService {
  /**
   * Get all dashboard metrics in a single aggregated call.
   */
  static async getMetrics(userId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // Run all queries in parallel
    const [
      salesByStatus,
      monthlyPayments,
      totalPendingResult,
      customerCount,
      totalPaymentsCount,
      recentSales,
      topProducts,
    ] = await Promise.all([
      // Sales grouped by status
      Sale.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: { $ne: true },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Money received this month
      Payment.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            deletedAt: null,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } },
        },
      ]),

      // Total pending balance
      Sale.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: { $ne: true },
            status: "active",
          },
        },
        { $group: { _id: null, total: { $sum: "$remainingBalance" } } },
      ]),

      // Customer count
      Customer.countDocuments({ userId, isDeleted: { $ne: true } }),

      // Total payments count
      Payment.countDocuments({ userId, deletedAt: null }),

      // Recent 5 sales
      Sale.find({ userId, isDeleted: { $ne: true } })
        .populate("customerId productId")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Top selling products
      Sale.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: { $ne: true },
          },
        },
        {
          $group: {
            _id: "$productId",
            salesCount: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { salesCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            productName: "$product.name",
            salesCount: 1,
            totalRevenue: 1,
          },
        },
      ]),
    ]);

    // Parse sales by status
    const statusMap = {};
    for (const s of salesByStatus) {
      statusMap[s._id] = s.count;
    }

    return {
      sales: {
        active: statusMap.active || 0,
        completed: statusMap.completed || 0,
        cancelled: statusMap.cancelled || 0,
        total:
          (statusMap.active || 0) +
          (statusMap.completed || 0) +
          (statusMap.cancelled || 0),
      },
      payments: {
        total: totalPaymentsCount,
        thisMonth: {
          count: monthlyPayments[0]?.count || 0,
          amount: monthlyPayments[0]?.total || 0,
        },
      },
      pendingBalance: totalPendingResult[0]?.total || 0,
      customerCount,
      recentSales,
      topProducts,
    };
  }
}

export default DashboardService;
