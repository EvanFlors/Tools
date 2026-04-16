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
  static async useCoupon(couponId, paymentId, userId) {
    const coupon = await Coupon.findOne({
      _id: couponId,
      userId,
      status: "available",
      isDeleted: { $ne: true },
    });

    if (!coupon) {
      throw { status: 404, message: "Coupon not found or already used" };
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      coupon.status = "expired";
      await coupon.save();
      throw { status: 400, message: "Coupon has expired" };
    }

    coupon.status = "used";
    coupon.usedInPaymentId = paymentId;
    coupon.usedAt = new Date();
    await coupon.save();

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
}

export default CouponService;
