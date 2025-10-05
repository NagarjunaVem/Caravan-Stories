import express from "express";
import {
  register,
  login,
  logout,
  isAuthenticated,
  adminCreateUser,
  updateRole,
  bootstrapAdmin,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const authRouter = express.Router();

// Public
authRouter.post("/register", register); // citizen-only
authRouter.post("/login", login);
authRouter.post("/logout", logout);

authRouter.post("/bootstrap-admin", bootstrapAdmin);

// Authenticated
authRouter.get("/is-auth", userAuth, isAuthenticated);
export default authRouter;