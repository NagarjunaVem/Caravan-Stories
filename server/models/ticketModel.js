import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, uppercase: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "IT", "HR", "Finance", "Facilities", "Management", "Support",
        "Operations", "Safety", "Electrical", "Mechanical", "Civil",
        "Maintenance", "Logistics", "Procurement", "Other",
      ],
      default: "Other",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "Open", "In Progress", "Resolved", "Closed", "Reopened"],
      default: "Pending",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    location: { type: String, trim: true },
    image: { type: String }, // URL or file path
    dueDate: { type: Date },
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Generate ticketId like TKT000001
ticketSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketId) {
    const count = await this.constructor.countDocuments();
    this.ticketId = `TKT${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// Set dueDate to now + 2 days on creation if not provided
ticketSchema.pre("validate", function (next) {
  if (this.isNew && !this.dueDate) {
    this.dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  }
  next();
});

const ticketModel = mongoose.models.ticket || mongoose.model("ticket", ticketSchema);
export default ticketModel;