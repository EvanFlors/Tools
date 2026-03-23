import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  entity: String,
  entityId: mongoose.Schema.Types.ObjectId,
  action: String,
  performedBy: mongoose.Schema.Types.ObjectId,
  metadata: Object
}, { timestamps: true });

auditSchema.index({ entity: 1, entityId: 1 });

export default mongoose.model("Audit", auditSchema);