import mongoose from "mongoose";
import softDeletePlugin from "../plugins/softDelete.plugin.js";

const saleSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: [0.01, "Total amount must be greater than 0"],
    },

    remainingBalance: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true,
    },

    stockAdjusted: {
      type: Boolean,
      default: false,
    },

    cancelledAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// ─── Hooks ────────────────────────────────────────────────────────────
// Intentionally thin: only defaults and invariants.
// All business logic (transitions, stock) lives in the service layer.

saleSchema.pre("validate", function () {
  if (this.isNew && this.remainingBalance == null) {
    this.remainingBalance = this.totalAmount;
  }

  if (this.remainingBalance > this.totalAmount) {
    throw new Error("Remaining balance cannot exceed total amount");
  }
  if (this.remainingBalance < 0) {
    throw new Error("Remaining balance cannot be negative");
  }
});

// ─── Indexes ──────────────────────────────────────────────────────────

saleSchema.index({ userId: 1, status: 1 });
saleSchema.index({ customerId: 1, status: 1 });
saleSchema.index({ createdAt: -1 });

// ─── Plugins ──────────────────────────────────────────────────────────

saleSchema.plugin(softDeletePlugin);

export default mongoose.model("Sale", saleSchema);
