import mongoose from "mongoose";

const pendingRoleRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true }, // Already hashed
    requestedRole: {
      type: String,
      enum: ["employee", "admin"],
      required: true,
    },
    department: {
      type: String,
      enum: [
        "IT", "HR", "Finance", "Facilities", "Management", "Support",
        "Operations", "Safety", "Electrical", "Mechanical", "Civil",
        "Maintenance", "Logistics", "Procurement",
      ],
    },
    reason: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

const pendingRoleRequestModel = mongoose.models.pendingRoleRequest || 
  mongoose.model("pendingRoleRequest", pendingRoleRequestSchema);

export default pendingRoleRequestModel;