import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../configs/nodemailer.js";

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

// Public: register (citizen only)
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.json({ success: false, message: "Missing details" });

  try {
    const exists = await userModel.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashed,
      role: "citizen",
    });

    setAuthCookie(res, user._id);

    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Creation of Account successful - Caravan Stories",
        text: `Successfully registered using email ${email}`,
      });
    } catch (mailErr) {
      console.warn("⚠️ Email sending failed:", mailErr.message);
    }

    return res.json({
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Public: login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({
      success: false,
      message: "Email and password are required",
    });

  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.json({ success: false, message: "Invalid email or password" });

    setAuthCookie(res, user._id);
    return res.json({
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Auth: logout
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

// Auth: isAuthenticated
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

    const exists = await userModel.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
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

export const bootstrapAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //Optional safety: only allow in development
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

    const already = await userModel.findOne({ email });
    if (already)
      return res.json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = await userModel.create({
      name,
      email,
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
