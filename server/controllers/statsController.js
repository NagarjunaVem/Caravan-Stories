// controllers/statsController.js
import userModel from "../models/userModel.js";
import ticketModel from "../models/ticketModel.js";

export const getPublicStats = async (req, res) => {
  try {
    const [employeeCount, totalTickets, resolvedTickets] = await Promise.all([
      userModel.countDocuments({ role: { $in: ['employee'] } }),
      ticketModel.countDocuments({}),
      ticketModel.countDocuments({ status: {$in:['resolved','closed'] }})
    ]);

    return res.json({
      success: true,
      stats: {
        employeeCount,
        totalTickets,
        resolvedTickets
      }
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    return res.json({ 
      success: false, 
      message: error.message 
    });
  }
};