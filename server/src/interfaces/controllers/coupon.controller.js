import CouponService from "../../application/services/coupon.service.js";

const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await CouponService.getAllByAdmin(req.user.id);
    res.json({ data: coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCustomerCoupons = async (req, res) => {
  try {
    const { customerId } = req.params;
    const coupons = await CouponService.getAllByCustomer(customerId);
    res.json({ data: coupons });
  } catch (error) {
    console.error("Error fetching customer coupons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const redeemCoupon = async (req, res) => {
  try {
    const { couponId, paymentId, userId, session } = req.params;
    const result = await CouponService.useCoupon(
      couponId,
      paymentId,
      userId,
      session
    );
    res.json({ data: result });
  } catch (error) {
    console.error("Error redeeming coupon:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default { getAdminCoupons, getCustomerCoupons, redeemCoupon };
