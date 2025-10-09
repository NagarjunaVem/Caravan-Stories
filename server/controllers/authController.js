import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import pendingUserModel from "../models/pendingUserModel.js";
import pendingRoleRequestModel from "../models/pendingRoleRequestModel.js";
import transporter from "../configs/nodemailer.js";

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

// ✅ Register - Handle citizen (direct) vs employee/admin (approval required)
export const register = async (req, res) => {
  const { name, email, password, role, department, reason } = req.body;
  
  if (!name || !email || !password)
    return res.json({ success: false, message: "Name, email, and password are required" });

  const requestedRole = role || "citizen";

  // Validate role
  if (!["citizen", "employee", "admin"].includes(requestedRole)) {
    return res.json({ success: false, message: "Invalid role" });
  }

  // Validate department for employee role
  const DEPARTMENTS = [
    "IT", "HR", "Finance", "Facilities", "Management", "Support",
    "Operations", "Safety", "Electrical", "Mechanical", "Civil",
    "Maintenance", "Logistics", "Procurement",
  ];

  if (requestedRole === "employee" && !department) {
    return res.json({ success: false, message: "Department is required for employee role" });
  }

  if (requestedRole === "employee" && !DEPARTMENTS.includes(department)) {
    return res.json({ success: false, message: "Invalid department" });
  }

  try {
    const emailLower = email.toLowerCase();

    // Check if user already exists
    const existingUser = await userModel.findOne({ email: emailLower });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists with this email" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // ✅ CITIZEN: Direct registration with email verification
    if (requestedRole === "citizen") {
      // Check if pending user exists
      let pendingUser = await pendingUserModel.findOne({ email: emailLower });
      
      if (pendingUser) {
        // Update existing pending user
        const otp = generateOTP();
        pendingUser.name = name;
        pendingUser.password = hashed;
        pendingUser.verificationOTP = otp;
        pendingUser.verificationOTPExpires = Date.now() + 600000;
        await pendingUser.save();
        
        // Send OTP
        try {
          await transporter.sendMail({
            from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
            to: email,
            subject: "Email Verification - Caravan Stories",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Welcome to Caravan Stories!</h2>
                <p>Hello ${name},</p>
                <p>Please verify your email address using the code below:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; display: inline-block;">
                    <h1 style="color: #4F46E5; margin: 0; letter-spacing: 5px;">${otp}</h1>
                  </div>
                </div>
                <p><strong>This code will expire in 10 minutes.</strong></p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">Thanks,<br>Caravan Stories Team</p>
              </div>
            `
          });
        } catch (mailErr) {
          console.error("Email sending failed:", mailErr.message);
          return res.json({ success: false, message: "Failed to send verification email" });
        }

        return res.json({
          success: true,
          message: "New verification code sent! Please check your email.",
          email: pendingUser.email,
          needsVerification: true
        });
      }

      // Create new pending user
      const otp = generateOTP();
      pendingUser = await pendingUserModel.create({
        name,
        email: emailLower,
        password: hashed,
        verificationOTP: otp,
        verificationOTPExpires: Date.now() + 600000,
      });

      // Send OTP email
      try {
        await transporter.sendMail({
          from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
          to: email,
          subject: "Email Verification - Caravan Stories",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Welcome to Caravan Stories!</h2>
              <p>Hello ${name},</p>
              <p>Please verify your email address using the code below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; display: inline-block;">
                  <h1 style="color: #4F46E5; margin: 0; letter-spacing: 5px;">${otp}</h1>
                </div>
              </div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 14px;">Thanks,<br>Caravan Stories Team</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error("Email sending failed:", mailErr.message);
        await pendingUserModel.findByIdAndDelete(pendingUser._id);
        return res.json({ success: false, message: "Failed to send verification email" });
      }

      return res.json({
        success: true,
        message: "Registration successful! Please check your email for verification code.",
        email: pendingUser.email,
        needsVerification: true
      });
    }

    // ✅ EMPLOYEE/ADMIN: Request approval from admin
    // Check if request already exists
    const existingRequest = await pendingRoleRequestModel.findOne({ email: emailLower });
    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.json({ 
          success: false, 
          message: "You already have a pending role request. Please wait for admin approval." 
        });
      } else if (existingRequest.status === "rejected") {
        return res.json({ 
          success: false, 
          message: `Your previous ${requestedRole} request was rejected. Reason: ${existingRequest.rejectionReason || 'Not specified'}` 
        });
      } else {
        return res.json({ 
          success: false, 
          message: "Your request was already approved. Please contact admin." 
        });
      }
    }

    // Create role request
    await pendingRoleRequestModel.create({
      name,
      email: emailLower,
      password: hashed,
      requestedRole,
      department: requestedRole === "employee" ? department : undefined,
      reason: reason || "",
      status: "pending",
    });

    // Send confirmation to user
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: `${requestedRole.charAt(0).toUpperCase() + requestedRole.slice(1)} Role Request Submitted - Caravan Stories`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Role Request Submitted</h2>
            <p>Hello ${name},</p>
            <p>Your request for <strong>${requestedRole}</strong> role has been submitted successfully.</p>
            ${requestedRole === "employee" ? `<p><strong>Department:</strong> ${department}</p>` : ""}
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
            <p>An administrator will review your request and you will receive an email notification once it's processed.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">Thanks,<br>Caravan Stories Team</p>
          </div>
        `
      });
    } catch (mailErr) {
      console.warn("User confirmation email failed:", mailErr.message);
    }

    // Notify all admins
    try {
      const admins = await userModel.find({ role: "admin" }).select("email name");
      
      if (admins.length > 0) {
        const adminEmails = admins.map(admin => admin.email).join(", ");
        
        await transporter.sendMail({
          from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
          to: adminEmails,
          subject: `New ${requestedRole.charAt(0).toUpperCase() + requestedRole.slice(1)} Role Request - Caravan Stories`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">New Role Request</h2>
              <p>A new ${requestedRole} role request has been submitted:</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Requested Role:</strong> ${requestedRole}</p>
                ${requestedRole === "employee" ? `<p><strong>Department:</strong> ${department}</p>` : ""}
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
              </div>
              <p>Please review this request in the admin panel.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 14px;">Caravan Stories System</p>
            </div>
          `
        });
      }
    } catch (mailErr) {
      console.warn("Admin notification email failed:", mailErr.message);
    }

    return res.json({
      success: true,
      message: `Your ${requestedRole} role request has been submitted. You will receive an email once an admin reviews it.`,
      requiresApproval: true
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ✅ Verify Registration OTP
export const verifyRegistrationOTP = async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const pendingUser = await pendingUserModel.findOne({ 
      email: email.toLowerCase(),
      verificationOTP: otp
    });

    if (!pendingUser) {
      return res.json({ success: false, message: "Invalid verification code" });
    }

    if (pendingUser.verificationOTPExpires < Date.now()) {
      return res.json({ 
        success: false, 
        message: "Verification code has expired. Please request a new one." 
      });
    }

    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await pendingUserModel.findByIdAndDelete(pendingUser._id);
      return res.json({ 
        success: false, 
        message: "This email is already registered. Please login." 
      });
    }

    // Create actual user
    const user = await userModel.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: "citizen",
    });

    await pendingUserModel.findByIdAndDelete(pendingUser._id);
    setAuthCookie(res, user._id);

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: user.email,
        subject: "Welcome to Caravan Stories!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Account Created Successfully!</h2>
            <p>Hello ${user.name},</p>
            <p>Your email has been verified successfully. Welcome to Caravan Stories!</p>
            <p>You can now access all features of your account.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">Thanks,<br>Caravan Stories Team</p>
          </div>
        `
      });
    } catch (mailErr) {
      console.warn("Welcome email failed:", mailErr.message);
    }

    return res.json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ✅ Resend Verification OTP
export const resendVerificationOTP = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.json({ 
        success: false, 
        message: "This email is already registered. Please login." 
      });
    }

    const pendingUser = await pendingUserModel.findOne({ 
      email: email.toLowerCase()
    });

    if (!pendingUser) {
      return res.json({ 
        success: false, 
        message: "No pending registration found with this email. Please register first." 
      });
    }

    const otp = generateOTP();
    pendingUser.verificationOTP = otp;
    pendingUser.verificationOTPExpires = Date.now() + 600000;
    await pendingUser.save();

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: "New Verification Code - Caravan Stories",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">New Verification Code</h2>
            <p>Hello ${pendingUser.name},</p>
            <p>Here is your new verification code:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; display: inline-block;">
                <h1 style="color: #4F46E5; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
            </div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">Thanks,<br>Caravan Stories Team</p>
          </div>
        `
      });

      return res.json({
        success: true,
        message: "New verification code sent to your email"
      });
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr.message);
      return res.json({ 
        success: false, 
        message: "Failed to send verification email. Please try again." 
      });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ✅ Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({
      success: false,
      message: "Email and password are required",
    });

  try {
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      const pending = await pendingUserModel.findOne({ email: email.toLowerCase() });
      if (pending) {
        return res.json({ 
          success: false, 
          message: "Please verify your email first. Check your inbox for the verification code.",
          needsVerification: true,
          email: pending.email
        });
      }
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.json({ success: false, message: "Invalid email or password" });

    setAuthCookie(res, user._id);
    return res.json({
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
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
    const { name, email, password, role } = req.body;
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
    });

    return res.json({
      success: true,
      message: "User created",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
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
      message: "Role updated",
      user: { name: user.name, role: user.role },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Bootstrap Admin
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