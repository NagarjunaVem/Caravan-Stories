import mongoose from "mongoose"

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: "open" },
  priority: { type: String, default: "medium" },
  attachments: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  dueDate: Date, // for SLA
});

module.exports = mongoose.model("Ticket", ticketSchema);
