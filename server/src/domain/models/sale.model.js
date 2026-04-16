import mongoose from "mongoose";
import softDeletePlugin from "../plugins/softDelete.plugin.js";

const saleSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingBalance: {
      type: Number,
      required: false,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

saleSchema.pre("validate", function () {
  if (this.isNew) {
    if (this.remainingBalance === undefined || this.remainingBalance === null) {
      this.remainingBalance = this.totalAmount;
    }
  }
});

saleSchema.index({ customerId: 1, status: 1 });
saleSchema.index({ productId: 1 });
saleSchema.index({ userId: 1, status: 1 });

saleSchema.plugin(softDeletePlugin);

export default mongoose.model("Sale", saleSchema);
