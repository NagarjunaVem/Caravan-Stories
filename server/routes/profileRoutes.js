// routes/profileRoutes.js
import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getUserProfile,
  updateProfile,
  changePasswordWithOld,
  requestPasswordReset,
  resetPasswordWithToken,
  requestEmailChange,
  verifyEmailChangeOTP,
  cancelEmailChange
} from "../controllers/profileController.js";

const profileRouter = express.Router();

// Protected routes (require authentication)
profileRouter.get("/", userAuth, getUserProfile);
profileRouter.put("/update", userAuth, updateProfile);
profileRouter.post("/change-password", userAuth, changePasswordWithOld);
profileRouter.post("/change-email", userAuth, requestEmailChange);
profileRouter.post("/verify-email-otp", userAuth, verifyEmailChangeOTP);
profileRouter.post("/cancel-email-change", userAuth, cancelEmailChange);

// Public routes (no authentication required)
profileRouter.post("/request-reset", requestPasswordReset);
profileRouter.post("/reset-password", resetPasswordWithToken);

export default profileRouter;