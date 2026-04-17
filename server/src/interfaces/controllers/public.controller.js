import Product from "../../domain/models/product.model.js";
import User from "../../domain/models/user.model.js";

const getProducts = async (req, res) => {
  try {
    const query = { deletedAt: null };

    // Filter by admin (userId or username)
    if (req.query.userId) {
      query.userId = req.query.userId;
    } else if (req.query.username) {
      const user = await User.findOne({
        username: { $regex: `^${req.query.username}$`, $options: "i" },
        deletedAt: null,
      })
        .select("_id")
        .lean();
      if (user) {
        query.userId = user._id;
      } else {
        return res.json({ data: [], categories: [] });
      }
    }

    // Text search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { category: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Stock availability
    if (req.query.inStock === "true") {
      query.stock = { $gt: 0 };
    }

    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 20, 1),
      100 // hard cap para evitar abuso
    );

    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    const products = await Product.find({
      ...query,
      deletedAt: null, // seguridad obligatoria
    })
      .select("name price stock imageIds userId description createdAt") // evita username si no existe en schema
      .populate([
        {
          path: "imageIds",
          select: "url altText",
          options: { lean: true },
        },
        {
          path: "userId",
          select: "username",
          options: { lean: true },
        },
      ])
      .sort({ createdAt: -1, _id: -1 }) // estabilidad en paginación
      .limit(limit)
      .skip(offset)
      .lean({ virtuals: false });

    // Categories scoped to the same filter context
    const categoryQuery = { deletedAt: null };
    if (req.query.userId) categoryQuery.userId = req.query.userId;
    const categories = await Product.distinct("category", categoryQuery);

    // All sellers (unfiltered) so the dropdown always shows every option
    const sellerIds = await Product.distinct("userId", { deletedAt: null });
    const sellers = await User.find({
      _id: { $in: sellerIds },
      deletedAt: null,
    })
      .select("username")
      .lean();

    res.json({ data: products, categories, sellers });
  } catch (error) {
    console.error("Error fetching public catalog:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default { getProducts };
