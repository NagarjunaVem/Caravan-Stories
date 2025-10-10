import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import pendingRoleRequestModel from "../models/pendingRoleRequestModel.js";
import transporter from "../configs/nodemailer.js";
import { checkAndAutoApproveFirstAdmin } from "./roleRequestController.js";

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to set JWT cookie
const setAuthCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Send OTP Email Helper
const sendOTPEmail = async (email, name, otp, isResend = false) => {
  return await transporter.sendMail({
    from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
    to: email,
    subject: isResend
      ? "New Verification OTP - Caravan Stories"
      : "Email Verification OTP - Caravan Stories",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">${
              isResend
                ? "New Verification Code! 🔄"
                : "Welcome to Caravan Stories! 🎪"
            }</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
            <p style="color: white; margin: 0 0 15px 0; font-size: 16px; font-weight: 500;">Your Verification OTP</p>
            <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <span style="font-size: 36px; font-weight: bold; color: #4F46E5; letter-spacing: 10px; font-family: monospace;">${otp}</span>
            </div>
          </div>

          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #6b7280; margin: 0; line-height: 1.6; font-size: 14px;">
              ${
                isResend
                  ? "We've sent you a new OTP to complete your registration. Please enter this code to verify your email."
                  : "Thank you for registering as a citizen. Please enter the OTP code above on the verification page to complete your registration and start reporting grievances."
              }
            </p>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 13px;">
              ⏰ <strong>Important:</strong> This OTP will expire in 24 hours. Do not share this code with anyone.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            If you didn't request this verification, please ignore this email.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
            Best regards,<br>
            <strong style="color: #4F46E5;">Caravan Stories Team</strong>
          </p>
        </div>
      </div>
    `,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, requestedRole, department, reason } =
      req.body;

    // Validate input
    if (!name || !email || !password || !requestedRole) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // ✅ Check if email already exists in users (lowercase)
    const existingUser = await userModel.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      // If user exists but not verified, allow resending OTP
      if (!existingUser.accountVerified && existingUser.role === "citizen") {
        // Generate new OTP
        const verifyOtp = generateOTP();
        existingUser.verifyOtp = verifyOtp;
        existingUser.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await existingUser.save();

        // Resend OTP email
        try {
          await sendOTPEmail(email, existingUser.name, verifyOtp, true);
        } catch (mailErr) {
          console.error("OTP resend email error:", mailErr);
          return res.json({
            success: false,
            message: "Failed to send verification OTP. Please try again.",
          });
        }

        return res.json({
          success: true,
          needsVerification: true,
          message:
            "A new OTP has been sent to your email. Please verify to complete registration.",
          email: email.toLowerCase(), // ✅ Return lowercase email
        });
      }

      return res.json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // CITIZEN REGISTRATION - Direct registration with OTP verification
    if (requestedRole === "citizen") {
      // Generate 6-digit OTP
      const verifyOtp = generateOTP();

      // ✅ Create citizen user directly (NOT VERIFIED YET) - with lowercase email
      const newUser = await userModel.create({
        name,
        email: email.toLowerCase(), // ✅ Lowercase email
        password: hashedPassword,
        role: "citizen",
        accountVerified: false,
        verifyOtp,
        verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      // Send OTP email
      try {
        await sendOTPEmail(email, name, verifyOtp, false);
      } catch (mailErr) {
        console.error("OTP email error:", mailErr);
        // Delete user if email fails
        await userModel.deleteOne({ _id: newUser._id });
        return res.json({
          success: false,
          message: "Failed to send verification OTP. Please try again.",
        });
      }

      return res.json({
        success: true,
        needsVerification: true,
        message:
          "Registration successful! A 6-digit OTP has been sent to your email. Please verify to complete registration.",
        email: email.toLowerCase(), // ✅ Return lowercase email
      });
    }

    // EMPLOYEE/ADMIN REGISTRATION - Goes through role request approval
    if (requestedRole === "employee" || requestedRole === "admin") {
      // ✅ Check if there's already a pending request (lowercase email)
      const existingRequest = await pendingRoleRequestModel.findOne({
        email: email.toLowerCase(), // ✅ Lowercase email
        status: "pending",
      });

      if (existingRequest) {
        return res.json({
          success: false,
          message: "You already have a pending role request",
        });
      }

      // ✅ Check if request already approved/rejected (lowercase email)
      const processedRequest = await pendingRoleRequestModel.findOne({
        email: email.toLowerCase(), // ✅ Lowercase email
      });
      if (processedRequest && processedRequest.status === "approved") {
        return res.json({
          success: false,
          message: "Your request was already approved. Please login.",
        });
      }

      // Validate department for employees
      if (requestedRole === "employee" && !department) {
        return res.json({
          success: false,
          message: "Department is required for employee role",
        });
      }

      // ✅ Create pending request (lowercase email)
      const roleRequest = await pendingRoleRequestModel.create({
        name,
        email: email.toLowerCase(), // ✅ Lowercase email
        password: hashedPassword,
        requestedRole,
        department: requestedRole === "employee" ? department : undefined,
        reason,
        status: "pending",
      });

      // Auto-approve if first admin
      const autoApproveResult = await checkAndAutoApproveFirstAdmin(
        roleRequest
      );

      if (autoApproveResult.success && autoApproveResult.autoApproved) {
        return res.json({
          success: true,
          message:
            "Congratulations! You've been approved as the first administrator. Please login.",
          autoApproved: true,
          user: autoApproveResult.user,
        });
      }

      // Send notification email to user
      try {
        await transporter.sendMail({
          from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
          to: email,
          subject: "Role Request Submitted - Caravan Stories",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h2 style="color: #4F46E5; margin: 0;">Request Submitted Successfully! ✅</h2>
                </div>

                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Hello <strong>${name}</strong>,</p>
                  <p style="color: #6b7280; margin: 0 0 15px 0; line-height: 1.6; font-size: 14px;">
                    Your request for <strong style="color: #4F46E5;">${requestedRole.toUpperCase()}</strong> role has been submitted and is awaiting admin approval.
                  </p>
                  ${
                    department
                      ? `<p style="color: #6b7280; margin: 0; font-size: 14px;"><strong>Department:</strong> ${department}</p>`
                      : ""
                  }
                  ${
                    reason
                      ? `<p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>`
                      : ""
                  }
                </div>

                <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 5px; padding: 15px; margin: 20px 0;">
                  <p style="color: #1e40af; margin: 0; font-size: 13px;">
                    📧 You will receive an email notification once your request has been reviewed by an administrator.
                  </p>
                </div>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                  Best regards,<br>
                  <strong style="color: #4F46E5;">Caravan Stories Team</strong>
                </p>
              </div>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error("Registration email error:", mailErr);
        // Don't fail registration if email fails
      }

      return res.json({
        success: true,
        requiresApproval: true,
        message:
          "Registration request submitted successfully. Please wait for admin approval.",
      });
    }

    // Invalid role
    return res.json({
      success: false,
      message: "Invalid role selected",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// Verify Email with OTP
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("Verification attempt:", { email, otp, otpType: typeof otp });

    if (!email || !otp) {
      return res.json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Convert OTP to string and trim it
    const otpString = String(otp).trim();

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log("User not found:", email);
      return res.json({ success: false, message: "User not found" });
    }

    console.log("User found:", {
      email: user.email,
      accountVerified: user.accountVerified,
      storedOtp: user.verifyOtp,
      otpExpiry: user.verifyOtpExpireAt,
      now: Date.now(),
    });

    if (user.accountVerified) {
      return res.json({
        success: false,
        message: "Email already verified. Please login.",
      });
    }

    if (!user.verifyOtp) {
      return res.json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    // Compare OTPs as strings
    if (user.verifyOtp.trim() !== otpString) {
      console.log("OTP mismatch:", {
        stored: user.verifyOtp,
        received: otpString,
      });
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      console.log("OTP expired");
      return res.json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify the account
    user.accountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    console.log("Verification successful for:", email);

    // Send welcome email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: "Welcome to Caravan Stories! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #10B981; margin: 0;">Account Verified Successfully! 🎉</h2>
              </div>

              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Hello <strong>${
                  user.name
                }</strong>,</p>
                <p style="color: #6b7280; margin: 0; line-height: 1.6; font-size: 14px;">
                  Your email has been verified successfully! Welcome to Caravan Stories Grievance Tracker.
                </p>
                <p style="color: #6b7280; margin: 15px 0 0 0; line-height: 1.6; font-size: 14px;">
                  You can now login and start reporting grievances to help keep our circus running smoothly.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:5173"
                }/login" 
                   style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                  Login Now
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                Best regards,<br>
                <strong style="color: #4F46E5;">Caravan Stories Team</strong>
              </p>
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Welcome email error:", mailErr);
    }

    return res.json({
      success: true,
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Resend OTP for Citizen Email Verification
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // ✅ Find user with lowercase email
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        success: false,
        message: "No account found with this email",
      });
    }

    if (user.accountVerified) {
      return res.json({
        success: false,
        message: "Email already verified. Please login.",
      });
    }

    // Generate new OTP
    const verifyOtp = generateOTP();
    user.verifyOtp = verifyOtp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, user.name, verifyOtp, true);
    } catch (mailErr) {
      console.error("Resend OTP email error:", mailErr);
      return res.json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: "A new OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // Check if citizen account is verified
    if (user.role === "citizen" && !user.accountVerified) {
      return res.json({
        success: false,
        message:
          "Please verify your email first. Check your inbox for the OTP.",
        needsVerification: true,
        email: email.toLowerCase(),
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // ✅ Set cookie BEFORE sending response
    setAuthCookie(res, user._id);

    // ✅ Return user data in login response
    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };

    if (process.env.NODE_ENV === "development") {
      cookieOptions.secure = false;
      cookieOptions.sameSite = "lax";
    }

    res.clearCookie("token", cookieOptions);
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// isAuthenticated
export const isAuthenticated = async (req, res) => {
  try {
    const userId = req.body?.userId || req.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Not Authorised. Login again" });

    const user = await userModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Admin: create user with any role
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password || !role) {
      return res.json({
        success: false,
        message: "name, email, password, and role are required",
      });
    }
    if (!["citizen", "employee", "admin"].includes(role)) {
      return res.json({ success: false, message: "Invalid role" });
    }

    const exists = await userModel.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role,
      department: role === "employee" ? department : undefined,
      accountVerified: true, // Admin-created users are auto-verified
    });

    return res.json({
      success: true,
      message: "User created successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Admin: update a user's role
export const updateRole = async (req, res) => {
  try {
    const { targetUserId, role } = req.body;
    if (!targetUserId || !role)
      return res.json({
        success: false,
        message: "targetUserId and role are required",
      });
    if (!["citizen", "employee", "admin"].includes(role)) {
      return res.json({ success: false, message: "Invalid role" });
    }

    const user = await userModel.findById(targetUserId);
    if (!user) return res.json({ success: false, message: "User not found" });

    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: "Role updated successfully",
      user: { name: user.name, role: user.role },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Bootstrap Admin (Development Only)
export const bootstrapAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (process.env.NODE_ENV === "production") {
      return res.json({ success: false, message: "Disabled in production" });
    }

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "name, email, password are required",
      });
    }

    const adminExists = await userModel.exists({ role: "admin" });
    if (adminExists) {
      return res.json({ success: false, message: "Admin already exists" });
    }

    const already = await userModel.findOne({ email: email.toLowerCase() });
    if (already)
      return res.json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = await userModel.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "admin",
      accountVerified: true,
    });

    return res.json({
      success: true,
      message: "Admin created. You can now login using this account.",
      user: { name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// Send OTP for Password Reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // Find user with lowercase email
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Check if account is verified (for citizens)
    if (user.role === "citizen" && !user.accountVerified) {
      return res.json({
        success: false,
        message: "Please verify your email first before resetting password",
      });
    }

    // Generate 6-digit OTP
    const resetOtp = generateOTP();

    // Save OTP to user (reusing verifyOtp fields or add new fields)
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: "Password Reset OTP - Caravan Stories",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">Password Reset Request 🔐</h1>
              </div>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
                <p style="color: white; margin: 0 0 15px 0; font-size: 16px; font-weight: 500;">Your Password Reset OTP</p>
                <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <span style="font-size: 36px; font-weight: bold; color: #4F46E5; letter-spacing: 10px; font-family: monospace;">${resetOtp}</span>
                </div>
              </div>

              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                <p style="color: #6b7280; margin: 0; line-height: 1.6; font-size: 14px;">
                  We received a request to reset your password. Please enter the OTP code above to proceed with resetting your password.
                </p>
              </div>

              <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="color: #991b1b; margin: 0; font-size: 13px;">
                  ⏰ <strong>Important:</strong> This OTP will expire in 15 minutes. Do not share this code with anyone.
                </p>
              </div>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0; font-size: 13px;">
                  ℹ️ If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                </p>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                Best regards,<br>
                <strong style="color: #4F46E5;">Caravan Stories Team</strong>
              </p>
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Password reset email error:", mailErr);
      return res.json({
        success: false,
        message: "Failed to send password reset OTP. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: "Password reset OTP has been sent to your email",
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Reset Password with OTP Verification
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    console.log("Password reset attempt:", { email, otp, otpType: typeof otp });

    if (!email || !otp || !newPassword) {
      return res.json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Convert OTP to string and trim
    const otpString = String(otp).trim();

    // Find user
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log("User not found:", email);
      return res.json({ success: false, message: "User not found" });
    }

    console.log("Password reset - User found:", {
      email: user.email,
      storedOtp: user.resetPasswordOtp,
      otpExpiry: user.resetPasswordOtpExpireAt,
      now: Date.now(),
    });

    // Check if OTP exists
    if (!user.resetPasswordOtp) {
      return res.json({
        success: false,
        message: "No password reset request found. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (user.resetPasswordOtp.trim() !== otpString) {
      console.log("OTP mismatch:", {
        stored: user.resetPasswordOtp,
        received: otpString,
      });
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // Check if OTP expired
    if (user.resetPasswordOtpExpireAt < Date.now()) {
      console.log("OTP expired");
      return res.json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.resetPasswordOtp = "";
    user.resetPasswordOtpExpireAt = 0;
    await user.save();

    console.log("Password reset successful for:", email);

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: "Password Reset Successful - Caravan Stories",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #10B981; margin: 0;">Password Reset Successful! ✅</h2>
              </div>

              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Hello <strong>${
                  user.name
                }</strong>,</p>
                <p style="color: #6b7280; margin: 0; line-height: 1.6; font-size: 14px;">
                  Your password has been reset successfully. You can now login with your new password.
                </p>
              </div>

              <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="color: #991b1b; margin: 0; font-size: 13px;">
                  🔒 <strong>Security Alert:</strong> If you didn't make this change, please contact support immediately.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:5173"
                }/login" 
                   style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                  Login Now
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                Best regards,<br>
                <strong style="color: #4F46E5;">Caravan Stories Team</strong>
              </p>
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Password reset confirmation email error:", mailErr);
      // Don't fail the password reset if email fails
    }

    return res.json({
      success: true,
      message:
        "Password reset successfully! You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Resend Password Reset OTP
export const resendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // Find user
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate new OTP
    const resetOtp = generateOTP();
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: "New Password Reset OTP - Caravan Stories",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">New Password Reset OTP 🔄</h1>
              </div>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
                <p style="color: white; margin: 0 0 15px 0; font-size: 16px; font-weight: 500;">Your New Password Reset OTP</p>
                <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <span style="font-size: 36px; font-weight: bold; color: #4F46E5; letter-spacing: 10px; font-family: monospace;">${resetOtp}</span>
                </div>
              </div>

              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                <p style="color: #6b7280; margin: 0; line-height: 1.6; font-size: 14px;">
                  Here's your new OTP to reset your password.
                </p>
              </div>

              <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="color: #991b1b; margin: 0; font-size: 13px;">
                  ⏰ <strong>Important:</strong> This OTP will expire in 15 minutes.
                </p>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                Best regards,<br>
                <strong style="color: #4F46E5;">Caravan Stories Team</strong>
              </p>
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Resend reset OTP email error:", mailErr);
      return res.json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: "A new password reset OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Resend reset OTP error:", error);
    return res.json({ success: false, message: error.message });
  }
};
