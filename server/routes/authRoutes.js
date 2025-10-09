import express from "express";
import {
  register,
  login,
  logout,
  isAuthenticated,
  adminCreateUser,
  updateRole,
  bootstrapAdmin,
  verifyEmail,       
  resendOTP,           
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/register", register);
authRouter.post("/verify-email", verifyEmail);      
authRouter.post("/resend-otp", resendOTP);          
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/bootstrap-admin", bootstrapAdmin);     // Development only

// Authenticated routes
authRouter.get("/is-auth", userAuth, isAuthenticated);

// Admin routes (add these if you have them)
authRouter.post("/admin/create-user", userAuth, requireAdmin, adminCreateUser);
authRouter.put("/admin/update-role", userAuth, requireAdmin, updateRole);

export default authRouter;