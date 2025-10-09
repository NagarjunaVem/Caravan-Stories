import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";

const DEPARTMENTS = [
  "IT","HR","Finance","Facilities","Management","Support","Operations","Safety",
  "Electrical","Mechanical","Civil","Maintenance","Logistics","Procurement",
];

// Admin: create employee
export const adminCreateEmployee = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.json({ success: false, message: "name, email, password, and department are required" });
    }
    if (!DEPARTMENTS.includes(department)) {
      return res.json({ success: false, message: "Invalid department" });
    }

    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashed,
      role: "employee",
      department,
      isVerified: true, // ✅ Admin-created employees are auto-verified
    });

    return res.json({
      success: true,
      message: "Employee created",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Admin: assign or update department for an existing employee
export const assignDepartment = async (req, res) => {
  try {
    const { employeeId, department } = req.body;

    if (!employeeId || !department) {
      return res.json({ success: false, message: "employeeId and department are required" });
    }
    if (!DEPARTMENTS.includes(department)) {
      return res.json({ success: false, message: "Invalid department" });
    }

    const user = await userModel.findById(employeeId);
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.role !== "employee") {
      return res.json({ success: false, message: "Target user is not an employee" });
    }

    user.department = department;
    await user.save();

    return res.json({
      success: true,
      message: "Department assigned",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await userModel
      .find({ role: "employee" })
      .select("name email department createdAt")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      employees,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};