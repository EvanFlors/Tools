import Image from "../../domain/models/image.model.js";
import Product from "../../domain/models/product.model.js";
import Sale from "../../domain/models/sale.model.js";
import {
  deleteImage,
  uploadImage,
} from "../../infrastructure/storage/image.service.js";

class ProductService {
  static async create(data, files = null, userId) {
    const productWithSameName = await Product.findOne({
      name: data.name,
      userId,
      deletedAt: null,
    });

    if (productWithSameName) {
      throw new Error("Product with the same name already exists");
    }

    let imageIds = [];

    // Upload images if files are provided
    if (files && files.length > 0) {
      for (const file of files) {
        const image = await uploadImage(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        imageIds.push(image._id);
      }
    }

    const product = await Product.create({
      name: data.name,
      price: data.price,
      description: data.description,
      category: data.category || "General",
      stock: data.stock || 0,
      imageIds,
      userId,
    });

    return product.populate("imageIds");
  }

  static async findAll(userId, filters = {}) {
    const query = { userId, deletedAt: null };

    // Text search
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { category: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Category filter
    if (filters.category) {
      query.category = filters.category;
    }

    // Price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined)
        query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice !== undefined)
        query.price.$lte = Number(filters.maxPrice);
    }

    // Stock availability
    if (filters.inStock === "true") {
      query.stock = { $gt: 0 };
    }

    const products = await Product.find(query)
      .populate("imageIds")
      .sort({ createdAt: -1 })
      .lean();

    return products;
  }

  /**
   * Get distinct categories for filter UI.
   */
  static async getCategories(userId) {
    return Product.distinct("category", { userId, deletedAt: null });
  }

  static async findById(id, userId) {
    const product = await Product.findOne({ _id: id, userId, deletedAt: null })
      .populate("imageIds")
      .lean();

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  static async updateById(id, newData, files = null, userId) {
    const product = await Product.findOne({
      _id: id,
      userId,
      deletedAt: null,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Handle images update
    if (files && files.length > 0) {
      // Delete old images if they exist
      if (product.imageIds && product.imageIds.length > 0) {
        for (const imageId of product.imageIds) {
          const oldImage = await Image.findById(imageId);
          if (oldImage) {
            try {
              await deleteImage(oldImage.gridfsId);
            } catch (error) {
              console.error("Error deleting old image:", error);
            }
          }
        }
      }

      // Upload new images
      const newImageIds = [];
      for (const file of files) {
        const newImage = await uploadImage(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        newImageIds.push(newImage._id);
      }
      product.imageIds = newImageIds;
    } else if (newData.imageIds !== undefined) {
      // If imageIds is explicitly provided in data
      product.imageIds = newData.imageIds;
    }

    // Update other fields
    if (newData.name !== undefined) {
      product.name = newData.name;
    }

    if (newData.price !== undefined) {
      if (newData.price < 0) {
        throw new Error("Price cannot be negative");
      }
      product.price = newData.price;
    }

    if (newData.description !== undefined) {
      product.description = newData.description;
    }

    if (newData.category !== undefined) {
      product.category = newData.category;
    }

    if (newData.stock !== undefined) {
      product.stock = newData.stock;
    }

    await product.save();

    return product.populate("imageIds");
  }

  static async deleteById(id, userId) {
    const product = await Product.findOne({
      _id: id,
      userId,
      deletedAt: null,
    });

    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      throw error;
    }

    // Check if any non-deleted sale references this product
    const salesCount = await Sale.countDocuments({
      userId,
      productId: id,
      isDeleted: { $ne: true },
    });

    if (salesCount > 0) {
      const error = new Error(
        `Cannot delete product with ${salesCount} existing sale(s). Delete all associated sales first.`
      );
      error.status = 422;
      throw error;
    }

    // Delete associated images
    if (product.imageIds && product.imageIds.length > 0) {
      for (const imageId of product.imageIds) {
        const image = await Image.findById(imageId);
        if (image) {
          try {
            await deleteImage(image.gridfsId);
          } catch (error) {
            console.error("Error deleting product image:", error);
            // Continue with product deletion even if image deletion fails
          }
        }
      }
    }

    await product.softDelete();

    return { message: "Product deleted successfully" };
  }

  static async removeImage(productId, imageId, userId) {
    const product = await Product.findOne({
      _id: productId,
      userId,
      deletedAt: null,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.imageIds || product.imageIds.length === 0) {
      throw new Error("Product has no images");
    }

    const image = await Image.findById(imageId);

    if (image) {
      await deleteImage(image.gridfsId);
    }

    product.imageIds = product.imageIds.filter((id) => id !== imageId);
    await product.save();

    return { message: "Image removed successfully" };
  }
}

export default ProductService;
