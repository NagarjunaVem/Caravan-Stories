import mongoose from 'mongoose';

const pendingRoleRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true }, // ✅ Add lowercase
  password: { type: String, required: true },
  requestedRole: { 
    type: String, 
    required: true, 
    enum: ['employee', 'admin'] // ✅ Only employee and admin
  },
  department: { type: String },
  reason: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewedAt: { type: Date },
  rejectionReason: { type: String }
}, { timestamps: true });

export default mongoose.model('PendingRoleRequest', pendingRoleRequestSchema);