import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  action: { type:String, required:true },
  entity: { type:String, required:true },
  entityId: { type:mongoose.Schema.Types.ObjectId },
  performedBy: { type:mongoose.Schema.Types.ObjectId, ref:"User" },
  metadata: Object,
  createdAt: { type:Date, default:Date.now }
});

export default mongoose.model("AuditLog", AuditLogSchema);
