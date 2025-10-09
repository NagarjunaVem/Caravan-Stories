import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
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
    verificationOTP: { type: String, required: true },
    verificationOTPExpires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }, // Auto-delete after 1 hour
  }
);

const pendingUserModel = mongoose.models.pendingUser || mongoose.model("pendingUser", pendingUserSchema);
export default pendingUserModel;