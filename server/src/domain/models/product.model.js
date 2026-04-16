import mongoose from "mongoose";
import softDeletePlugin from "../plugins/softDelete.plugin.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
        default: null,
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ deletedAt: 1 });
productSchema.index({ name: "text", description: "text", category: "text" });

productSchema.plugin(softDeletePlugin);

const Product = mongoose.model("Product", productSchema);

export default Product;
