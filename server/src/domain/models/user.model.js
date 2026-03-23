import mongoose from "mongoose";
import softDeletePlugin from "../plugins/softDelete.plugin.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true
    },
    phone: {
      type: String,
      unique: true,
      sparse: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      required: true
    },
    refreshToken: {
      type: String
    }
  },
  { timestamps: true }
);

userSchema.plugin(softDeletePlugin);
userSchema.index({ username: 1, isDeleted: 1 });
userSchema.index({ phone: 1, isDeleted: 1 });

export default mongoose.model("User", userSchema);
