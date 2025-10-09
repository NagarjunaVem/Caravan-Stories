import pendingRoleRequestModel from "../models/pendingRoleRequestModel.js";
import userModel from "../models/userModel.js";
import transporter from "../configs/nodemailer.js";

// Get all pending role requests
export const getAllRoleRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await pendingRoleRequestModel
      .find(filter)
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get role requests error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Get single role request
export const getRoleRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await pendingRoleRequestModel
      .findById(id)
      .populate("reviewedBy", "name email");

    if (!request) {
      return res.json({ success: false, message: "Request not found" });
    }

    return res.json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get role request error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Approve role request
export const approveRoleRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const adminId = req.userId;

    if (!requestId) {
      return res.json({ success: false, message: "Request ID is required" });
    }

    const request = await pendingRoleRequestModel.findById(requestId);
    if (!request) {
      return res.json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.json({ 
        success: false, 
        message: `This request has already been ${request.status}` 
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email: request.email });
    if (existingUser) {
      return res.json({ 
        success: false, 
        message: "User already exists with this email" 
      });
    }

    // Create user
    const user = await userModel.create({
      name: request.name,
      email: request.email,
      password: request.password, // Already hashed
      role: request.requestedRole,
      department: request.department,
    });

    // Update request status
    request.status = "approved";
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    // Send approval email to user
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: request.email,
        subject: "Role Request Approved - Caravan Stories",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">Request Approved! 🎉</h2>
            <p>Hello ${request.name},</p>
            <p>Great news! Your request for <strong>${request.requestedRole}</strong> role has been approved.</p>
            ${request.department ? `<p><strong>Department:</strong> ${request.department}</p>` : ""}
            <p>You can now login to your account with the credentials you provided during registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                 style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Login Now
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Thanks,<br>
              Caravan Stories Team
            </p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error("Approval email error:", mailErr);
    }

    return res.json({
      success: true,
      message: "Request approved and user created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Approve request error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Reject role request
export const rejectRoleRequest = async (req, res) => {
  try {
    const { requestId, reason } = req.body;
    const adminId = req.userId;

    if (!requestId) {
      return res.json({ success: false, message: "Request ID is required" });
    }

    const request = await pendingRoleRequestModel.findById(requestId);
    if (!request) {
      return res.json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.json({ 
        success: false, 
        message: `This request has already been ${request.status}` 
      });
    }

    // Update request status
    request.status = "rejected";
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.rejectionReason = reason || "No reason provided";
    await request.save();

    // Send rejection email to user
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: request.email,
        subject: "Role Request Update - Caravan Stories",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EF4444;">Request Not Approved</h2>
            <p>Hello ${request.name},</p>
            <p>We regret to inform you that your request for <strong>${request.requestedRole}</strong> role could not be approved at this time.</p>
            ${reason ? `
              <div style="background-color: #FEE2E2; padding: 15px; border-left: 4px solid #EF4444; margin: 20px 0;">
                <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
              </div>
            ` : ""}
            <p>If you believe this is an error or would like to discuss this further, please contact our support team.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Thanks,<br>
              Caravan Stories Team
            </p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error("Rejection email error:", mailErr);
    }

    return res.json({
      success: true,
      message: "Request rejected",
    });
  } catch (error) {
    console.error("Reject request error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Get statistics
export const getRoleRequestStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected, employeeRequests, adminRequests] = await Promise.all([
      pendingRoleRequestModel.countDocuments({}),
      pendingRoleRequestModel.countDocuments({ status: "pending" }),
      pendingRoleRequestModel.countDocuments({ status: "approved" }),
      pendingRoleRequestModel.countDocuments({ status: "rejected" }),
      pendingRoleRequestModel.countDocuments({ requestedRole: "employee" }),
      pendingRoleRequestModel.countDocuments({ requestedRole: "admin" }),
    ]);

    return res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        employeeRequests,
        adminRequests,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return res.json({ success: false, message: error.message });
  }
};