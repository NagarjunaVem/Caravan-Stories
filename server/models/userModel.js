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
        "IT",
        "HR",
        "Finance",
        "Facilities",
        "Management",
        "Support",
        "Operations",
        "Safety",
        "Electrical",
        "Mechanical",
        "Civil",
        "Maintenance",
        "Logistics",
        "Procurement",
      ],
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;