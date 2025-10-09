import express from "express";
import userAuth from "../middleware/userAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  getAllRoleRequests,
  getRoleRequestById,
  approveRoleRequest,
  rejectRoleRequest,
  getRoleRequestStats,
} from "../controllers/roleRequestController.js";

const roleRequestRouter = express.Router();

// All routes require admin authentication
roleRequestRouter.get("/all", userAuth, requireAdmin, getAllRoleRequests);
roleRequestRouter.get("/stats", userAuth, requireAdmin, getRoleRequestStats);
roleRequestRouter.get("/:id", userAuth, requireAdmin, getRoleRequestById);
roleRequestRouter.post("/approve", userAuth, requireAdmin, approveRoleRequest);
roleRequestRouter.post("/reject", userAuth, requireAdmin, rejectRoleRequest);

export default roleRequestRouter;