// controllers/statsController.js
import userModel from "../models/userModel.js";
import ticketModel from "../models/ticketModel.js";

export const getPublicStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Parallel queries for better performance
    const [
      employeeCount,
      totalTickets,
      resolvedTickets,
      pendingTickets,
      inProgressTickets,
      openTickets,
      ticketsLast30Days,
      resolvedLast30Days,
      ticketsByCategory,
      dailyTrendData
    ] = await Promise.all([
      userModel.countDocuments({ role: { $in: ['employee'] } }),
      ticketModel.countDocuments({}),
      ticketModel.countDocuments({ status: { $in: ['Resolved', 'Closed'] } }),
      ticketModel.countDocuments({ status: 'Pending' }),
      ticketModel.countDocuments({ status: 'In Progress' }),
      ticketModel.countDocuments({ status: 'Open' }),
      ticketModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      ticketModel.countDocuments({
        status: { $in: ['Resolved', 'Closed'] },
        updatedAt: { $gte: thirtyDaysAgo }
      }),
      ticketModel.aggregate([
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Resolved', 'Closed']] },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ]),
      ticketModel.aggregate([
        {
          $match: { createdAt: { $gte: sevenDaysAgo } }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            created: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Resolved', 'Closed']] },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const resolutionRate = totalTickets > 0 
      ? Math.round((resolvedTickets / totalTickets) * 100) 
      : 0;

    const activeTickets = pendingTickets + inProgressTickets + openTickets;

    const stats = {
      employeeCount,
      totalTickets,
      resolvedTickets,
      pendingTickets,
      inProgressTickets,
      openTickets,
      activeTickets,
      resolutionRate,
      ticketsLast30Days,
      resolvedLast30Days,
      ticketsByCategory: ticketsByCategory || [],
      dailyTrend: dailyTrendData || []
    };

    return res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get public stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Summary endpoint for lighter requests
export const getPublicSummary = async (req, res) => {
  try {
    const [
      totalTickets,
      resolvedTickets,
      pendingTickets,
      employeeCount
    ] = await Promise.all([
      ticketModel.countDocuments({}),
      ticketModel.countDocuments({ status: { $in: ['Resolved', 'Closed'] } }),
      ticketModel.countDocuments({ status: { $nin: ['Resolved', 'Closed'] } }),
      userModel.countDocuments({ role: 'employee' })
    ]);

    const resolutionRate = totalTickets > 0 
      ? Math.round((resolvedTickets / totalTickets) * 100) 
      : 0;

    return res.json({
      success: true,
      stats: {
        totalTickets,
        resolvedTickets,
        pendingTickets,
        resolutionRate,
        employeeCount
      }
    });
  } catch (error) {
    console.error('Get public summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch summary',
      error: error.message
    });
  }
};