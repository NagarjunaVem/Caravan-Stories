// models/userModel.js - Add these fields to the schema
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["citizen", "employee", "admin"],
      default: "citizen",
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
    // Add these new fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailChangeOTP: String,
    emailChangeOTPExpires: Date,
    newEmailPending: String,
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;