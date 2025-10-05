// middleware/requireAdmin.js
import userModel from "../models/userModel.js";

const requireAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body; // set by userAuth
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const me = await userModel.findById(userId);
    if (!me) return res.status(401).json({ success: false, message: "Unauthorized" });

    if (me.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden (admin only)" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default requireAdmin;