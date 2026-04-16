import mongoose from "mongoose";
import Payment from "../../domain/models/payment.model.js";
import Product from "../../domain/models/product.model.js";
import Sale from "../../domain/models/sale.model.js";

import CouponService from "../../application/services/coupon.service.js";

/**
 * Get products belonging to the admin who created this customer.
 * The JWT payload includes `adminUserId` — the admin who owns the data.
 */
const getProducts = async (req, res) => {
  try {
    const adminUserId = req.user.adminUserId;

    const products = await Product.find({
      userId: adminUserId,
      deletedAt: null,
    })
      .populate("imageIds")
      .lean();

    res.json({ data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all sales for the logged-in customer, with product info.
 */
const getMySales = async (req, res) => {
  try {
    const customerId = req.user.id;

    const sales = await Sale.find({ customerId })
      .populate("productId")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: sales });
  } catch (error) {
    console.error("Error fetching customer sales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a single sale detail with its payment history.
 * Only returns if the sale belongs to the logged-in customer.
 */
const getSaleDetail = async (req, res) => {
  try {
    const { saleId } = req.params;
    const customerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      return res.status(400).json({ error: "Invalid sale ID" });
    }

    const sale = await Sale.findOne({ _id: saleId, customerId })
      .populate("productId")
      .lean();

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    const payments = await Payment.find({ saleId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: { ...sale, payments } });
  } catch (error) {
    console.error("Error fetching sale detail:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a single product by ID (must belong to the customer's admin).
 */
const getProductDetail = async (req, res) => {
  try {
    const adminUserId = req.user.adminUserId;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findOne({
      _id: productId,
      userId: adminUserId,
      deletedAt: null,
    })
      .populate("imageIds")
      .lean();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ data: product });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get rewards summary for the logged-in customer.
 */
const getRewards = async (req, res) => {
  try {
    const customerId = req.user.id;
    const summary = await CouponService.getRewardsSummary(customerId);
    res.json({ data: summary });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all coupons for the logged-in customer.
 */
const getMyCoupons = async (req, res) => {
  try {
    const customerId = req.user.id;
    const coupons = await CouponService.getAllByCustomer(customerId);
    res.json({ data: coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  getProducts,
  getProductDetail,
  getMySales,
  getSaleDetail,
  getRewards,
  getMyCoupons,
};
