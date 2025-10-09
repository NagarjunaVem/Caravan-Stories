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
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // Email change fields
    emailChangeOTP: String,
    emailChangeOTPExpires: Date,
    newEmailPending: String,
    
    // ✅ REMOVED: isVerified, verificationOTP, verificationOTPExpires
    // All users in this collection are verified by default
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;