// controllers/profileController.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import userModel from "../models/userModel.js";
import transporter from "../configs/nodemailer.js";

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await userModel
      .findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires -emailChangeOTP -emailChangeOTPExpires");
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt,
        newEmailPending: user.newEmailPending,
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Update profile (name only for now)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.json({ success: false, message: "Name must be at least 2 characters" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.name = name.trim();
    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Change password with old password
export const changePasswordWithOld = async (req, res) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.json({ success: false, message: "Both old and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Current password is incorrect" });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: user.email,
        subject: "Password Changed Successfully - HalfStack",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Password Changed</h2>
            <p>Hello ${user.name},</p>
            <p>Your password has been successfully changed.</p>
            <p>If you did not make this change, please contact support immediately.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Thanks,<br>
              HalfStack Team
            </p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error("Email send error:", mailErr);
    }

    return res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Request password reset via email
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ 
        success: true, 
        message: "If an account exists with this email, a reset link has been sent" 
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL (update with your frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${email}`;

    // Send reset email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: user.email,
        subject: "Password Reset Request - HalfStack",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #6b7280; word-break: break-all;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Thanks,<br>
              HalfStack Team
            </p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error("Email send error:", mailErr);
      return res.json({ success: false, message: "Failed to send reset email" });
    }

    return res.json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent"
    });
  } catch (error) {
    console.error("Request reset error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Reset password with token
export const resetPasswordWithToken = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.json({ success: false, message: "Email, token, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await userModel.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired reset token" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: user.email,
        subject: "Password Reset Successful - HalfStack",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Password Reset Successful</h2>
            <p>Hello ${user.name},</p>
            <p>Your password has been successfully reset.</p>
            <p>You can now login with your new password.</p>
            <p>If you did not make this change, please contact support immediately.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Thanks,<br>
              HalfStack Team
            </p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error("Email send error:", mailErr);
    }

    return res.json({
      success: true,
      message: "Password reset successful. You can now login with your new password."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Request email change (send OTP to new email)
export const requestEmailChange = async (req, res) => {
  try {
    const userId = req.userId;
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.json({ success: false, message: "New email and password are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Password is incorrect" });
    }

    // Check if new email is same as current
    if (user.email === newEmail.toLowerCase()) {
      return res.json({ success: false, message: "New email cannot be same as current email" });
    }

    // Check if new email already exists
    const emailExists = await userModel.findOne({ email: newEmail.toLowerCase() });
    if (emailExists) {
      return res.json({ success: false, message: "Email already in use" });
    }

    // Generate OTP
    const otp = generateOTP();
    user.emailChangeOTP = otp;
    user.emailChangeOTPExpires = Date.now() + 600000; // 10 minutes
    user.newEmailPending = newEmail.toLowerCase();
    await user.save();

    // Send OTP to new email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: newEmail,
        subject: "Email Change Verification - HalfStack",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Email Change Verification</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to change your email address. Please use the verification code below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; display: inline-block;">
                <h1 style="color: #4F46E5; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
            </div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this change, please ignore this email and your email will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Thanks,<br>
              HalfStack Team
            </p>
          </div>
        `
      });

      return res.json({
        success: true,
        message: "Verification code sent to new email address"
      });
    } catch (mailErr) {
      console.error("Email send error:", mailErr);
      // Clear OTP data on email failure
      user.emailChangeOTP = undefined;
      user.emailChangeOTPExpires = undefined;
      user.newEmailPending = undefined;
      await user.save();
      return res.json({ success: false, message: "Failed to send verification email" });
    }
  } catch (error) {
    console.error("Request email change error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Verify OTP and change email
export const verifyEmailChangeOTP = async (req, res) => {
  try {
    const userId = req.userId;
    const { otp } = req.body;

    if (!otp) {
      return res.json({ success: false, message: "Verification code is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Check if OTP process is active
    if (!user.emailChangeOTP || !user.newEmailPending) {
      return res.json({ success: false, message: "No email change request found" });
    }

    // Check if OTP expired
    if (user.emailChangeOTPExpires < Date.now()) {
      // Clear OTP data
      user.emailChangeOTP = undefined;
      user.emailChangeOTPExpires = undefined;
      user.newEmailPending = undefined;
      await user.save();
      return res.json({ success: false, message: "Verification code has expired" });
    }

    // Verify OTP
    if (user.emailChangeOTP !== otp) {
      return res.json({ success: false, message: "Invalid verification code" });
    }

    // Update email
    const oldEmail = user.email;
    user.email = user.newEmailPending;
    user.emailChangeOTP = undefined;
    user.emailChangeOTPExpires = undefined;
    user.newEmailPending = undefined;
    await user.save();

    // Send confirmation to both old and new email
    try {
      // To old email
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: oldEmail,
        subject: "Email Address Changed - HalfStack",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Email Address Changed</h2>
            <p>Hello ${user.name},</p>
            <p>Your email address has been successfully changed from <strong>${oldEmail}</strong> to <strong>${user.email}</strong>.</p>
            <p>If you did not make this change, please contact support immediately.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Thanks,<br>
              HalfStack Team
            </p>
          </div>
        `
      });

      // To new email
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: user.email,
        subject: "Email Address Updated - HalfStack",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Welcome to Your New Email</h2>
            <p>Hello ${user.name},</p>
            <p>Your email address has been successfully updated to <strong>${user.email}</strong>.</p>
            <p>You will now receive all notifications at this email address.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Thanks,<br>
              HalfStack Team
            </p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error("Confirmation email error:", mailErr);
    }

    return res.json({
      success: true,
      message: "Email address updated successfully",
      newEmail: user.email
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Cancel email change
export const cancelEmailChange = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.emailChangeOTP = undefined;
    user.emailChangeOTPExpires = undefined;
    user.newEmailPending = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Email change request cancelled"
    });
  } catch (error) {
    console.error("Cancel email change error:", error);
    return res.json({ success: false, message: error.message });
  }
};