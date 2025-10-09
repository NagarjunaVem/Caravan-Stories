import express from "express";
import userAuth from "../middleware/userAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { 
  adminCreateEmployee, 
  assignDepartment,
  getAllEmployees 
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.post("/create-user", userAuth, requireAdmin, adminCreateEmployee);
adminRouter.post("/assign-department", userAuth, requireAdmin, assignDepartment);
adminRouter.get("/employees", userAuth, requireAdmin, getAllEmployees);

export default adminRouter;