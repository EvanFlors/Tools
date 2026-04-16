import Product from "../../domain/models/product.model.js";

/**
 * Get all products (public — no authentication required).
 * Supports search, category, and price filters via query params.
 */
const getProducts = async (req, res) => {
  try {
    const query = { deletedAt: null };

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { category: { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    const products = await Product.find(query)
      .populate("imageIds")
      .sort({ createdAt: -1 })
      .lean();

    // Get all categories for filters
    const categories = await Product.distinct("category", { deletedAt: null });

    res.json({ data: products, categories });
  } catch (error) {
    console.error("Error fetching public catalog:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default { getProducts };
