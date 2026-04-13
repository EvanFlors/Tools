import Product from "../../domain/models/product.model.js";

/**
 * Get all products (public — no authentication required).
 */
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ deletedAt: null })
      .populate("imageIds")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: products });
  } catch (error) {
    console.error("Error fetching public catalog:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default { getProducts };
