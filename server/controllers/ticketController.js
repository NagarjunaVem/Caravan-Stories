import ticketModel from "../models/ticketModel.js";
import userModel from "../models/userModel.js";
import transporter from "../configs/nodemailer.js";
import { Parser } from 'json2csv';

const DEPARTMENTS = [
  "IT", "HR", "Finance", "Facilities", "Management", "Support",
  "Operations", "Safety", "Electrical", "Mechanical", "Civil",
  "Maintenance", "Logistics", "Procurement", "Other",
];

const normalizeCategory = (val) => {
  const s = String(val || "").trim();
  const match = DEPARTMENTS.find((d) => d.toLowerCase() === s.toLowerCase());
  return match || "Other";
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Send an email to submitter and assignee on status changes
const sendStatusChangeEmails = async ({ ticket, oldStatus, newStatus, reason }) => {
  try {
    const [submitter, assignee] = await Promise.all([
      userModel.findById(ticket.submittedBy).select("name email"),
      ticket.assignedTo ? userModel.findById(ticket.assignedTo).select("name email") : null,
    ]);

    const subject = `Ticket ${ticket.ticketId} status: ${oldStatus} → ${newStatus}`;
    const lines = [
      `Ticket: ${ticket.ticketId}`,
      `Title: ${ticket.title}`,
      `Status: ${oldStatus} → ${newStatus}`,
    ];
    if (reason && reason.trim()) lines.push(`Reason: ${reason.trim()}`);
    const text = `${lines.join("\n")}\n\nThanks,\nCaravan Stories`;

    const recipients = new Set();
    if (submitter?.email) recipients.add(submitter.email);
    if (assignee?.email) recipients.add(assignee.email);
    if (recipients.size === 0) return;

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: Array.from(recipients).join(", "),
      subject,
      text,
    });
  } catch (err) {
    console.log("Status change mail error:", err.message);
  }
};

// Create a ticket with image, location, priority
export const createTicket = async (req, res) => {
  try {
    const { title, description, category, location, priority } = req.body;
    const submittedBy = req.userId; // ✅ Use req.userId

    if (!submittedBy) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!title || !description) {
      return res.json({ success: false, message: "title and description are required" });
    }

    const safeCategory = normalizeCategory(category || "Other");
    const safePriority = ["Low", "Medium", "High", "Urgent"].includes(priority) ? priority : "Medium";

    // Get image path if uploaded
    const imagePath = req.file ? `/uploads/tickets/${req.file.filename}` : null;

    const employees = await userModel
      .find({ role: "employee", department: safeCategory })
      .select("_id name email");

    let assignedTo;
    let status = "Pending";
    if (employees.length) {
      assignedTo = pickRandom(employees)._id;
      status = "Open";
    }

    const ticket = await ticketModel.create({
      title,
      description,
      category: safeCategory,
      priority: safePriority,
      location: location || "",
      image: imagePath,
      submittedBy,
      assignedTo,
      status,
    });

    // Populate for response
    await ticket.populate([
      { path: 'submittedBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email department' }
    ]);

    if (status === "Open") {
      await sendStatusChangeEmails({
        ticket,
        oldStatus: "Pending",
        newStatus: "Open",
        reason: `Auto-assigned to ${safeCategory}`,
      });
    }

    return res.json({
      success: true,
      ticket,
      message: employees.length
        ? "Ticket created and auto-assigned"
        : "Ticket created; no employee found in this department, left unassigned",
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Get single ticket details
export const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.userId; // ✅ Use req.userId

    const ticket = await ticketModel
      .findOne({ ticketId })
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email department")
      .populate("comments.user", "name email");

    if (!ticket) {
      return res.json({ success: false, message: "Ticket not found" });
    }

    // Check if user has access to this ticket
    const user = await userModel.findById(userId);
    const isAdmin = user.role === "admin";
    const isSubmitter = String(ticket.submittedBy._id) === String(userId);
    const isAssignee = ticket.assignedTo && String(ticket.assignedTo._id) === String(userId);

    if (!isAdmin && !isSubmitter && !isAssignee) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({ success: true, ticket });
  } catch (error) {
    console.error("Get ticket details error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Admin: reassign to a random employee in a department
export const assignTicketToDept = async (req, res) => {
  try {
    const { ticketId, department } = req.body;
    if (!ticketId || !department) {
      return res.json({ success: false, message: "ticketId and department are required" });
    }

    const safeDepartment = normalizeCategory(department);
    const ticket = await ticketModel.findOne({ ticketId });
    if (!ticket) return res.json({ success: false, message: "Ticket not found" });

    const employees = await userModel
      .find({ role: "employee", department: safeDepartment })
      .select("_id name email");

    if (!employees.length) {
      return res.json({ success: false, message: `No employees found in ${safeDepartment}` });
    }

    const pick = pickRandom(employees);
    const oldStatus = ticket.status;

    ticket.assignedTo = pick._id;
    ticket.category = safeDepartment;
    ticket.status = ticket.status === "Pending" ? "Open" : ticket.status;
    await ticket.save();

    // Populate for response
    await ticket.populate([
      { path: 'submittedBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email department' }
    ]);

    if (oldStatus !== ticket.status) {
      await sendStatusChangeEmails({
        ticket,
        oldStatus,
        newStatus: ticket.status,
        reason: `Assigned to ${safeDepartment}`,
      });
    }

    return res.json({ success: true, message: "Ticket reassigned", ticket });
  } catch (error) {
    console.error("Assign ticket error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Update status (assignee or admin)
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId, status } = req.body;
    const meId = req.userId; // ✅ Use req.userId

    const ALLOWED = ["Pending", "Open", "In Progress", "Resolved", "Closed", "Reopened"];
    if (!ticketId || !status) {
      return res.json({ success: false, message: "ticketId and status are required" });
    }
    if (!ALLOWED.includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }

    const [ticket, me] = await Promise.all([
      ticketModel.findOne({ ticketId }),
      userModel.findById(meId).select("role"),
    ]);

    if (!ticket) return res.json({ success: false, message: "Ticket not found" });
    if (!me) return res.json({ success: false, message: "User not found" });

    const isAdmin = me.role === "admin";
    const isAssignee = String(ticket.assignedTo || "") === String(meId);

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    // Populate for response
    await ticket.populate([
      { path: 'submittedBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email department' }
    ]);

    if (oldStatus !== status) {
      await sendStatusChangeEmails({ ticket, oldStatus, newStatus: status });
    }

    return res.json({ success: true, ticket });
  } catch (error) {
    console.error("Update status error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Reopen a ticket (submitter or admin)
export const reopenTicket = async (req, res) => {
  try {
    const { ticketId, reason } = req.body;
    const meId = req.userId; // ✅ Use req.userId

    if (!ticketId) {
      return res.json({ success: false, message: "ticketId is required" });
    }

    const [ticket, me] = await Promise.all([
      ticketModel.findOne({ ticketId }),
      userModel.findById(meId).select("role"),
    ]);

    if (!ticket) return res.json({ success: false, message: "Ticket not found" });
    if (!me) return res.json({ success: false, message: "User not found" });

    const isAdmin = me.role === "admin";
    const isSubmitter = String(ticket.submittedBy) === String(meId);

    if (!isAdmin && !isSubmitter) {
      return res.status(403).json({ success: false, message: "Not allowed to reopen this ticket" });
    }

    if (!["Resolved", "Closed"].includes(ticket.status)) {
      return res.json({ 
        success: false, 
        message: `Ticket is ${ticket.status}. Only Resolved/Closed tickets can be reopened.` 
      });
    }

    // Auto-assign if no assignee
    if (!ticket.assignedTo) {
      const employees = await userModel
        .find({ role: "employee", department: ticket.category })
        .select("_id name email");
      if (employees.length) {
        const pick = pickRandom(employees);
        ticket.assignedTo = pick._id;
      }
    }

    const oldStatus = ticket.status;
    ticket.status = "Reopened";
    ticket.dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    if (reason && reason.trim()) {
      ticket.comments.push({ user: meId, text: `Reopened: ${reason.trim()}` });
    }

    await ticket.save();

    // Populate for response
    await ticket.populate([
      { path: 'submittedBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email department' },
      { path: 'comments.user', select: 'name email' }
    ]);

    await sendStatusChangeEmails({
      ticket,
      oldStatus,
      newStatus: "Reopened",
      reason,
    });

    return res.json({ success: true, message: "Ticket reopened", ticket });
  } catch (error) {
    console.error("Reopen ticket error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Add a comment
export const addComment = async (req, res) => {
  try {
    const { ticketId, text } = req.body;
    const userId = req.userId; // ✅ Use req.userId

    if (!ticketId || !text) {
      return res.json({ success: false, message: "ticketId and text are required" });
    }

    const ticket = await ticketModel.findOne({ ticketId });
    if (!ticket) return res.json({ success: false, message: "Ticket not found" });

    ticket.comments.push({ user: userId, text: String(text).trim() });
    await ticket.save();

    // Populate for response
    await ticket.populate([
      { path: 'submittedBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email department' },
      { path: 'comments.user', select: 'name email' }
    ]);

    return res.json({ success: true, ticket });
  } catch (error) {
    console.error("Add comment error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Lists
export const getMySubmittedTickets = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Use req.userId
    const tickets = await ticketModel
      .find({ submittedBy: userId })
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email department")
      .sort({ createdAt: -1 });

    return res.json({ success: true, tickets });
  } catch (error) {
    console.error("Get submitted tickets error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const getMyAssignedTickets = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Use req.userId
    const tickets = await ticketModel
      .find({ assignedTo: userId })
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email department")
      .sort({ createdAt: -1 });

    return res.json({ success: true, tickets });
  } catch (error) {
    console.error("Get assigned tickets error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketModel
      .find({})
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email department")
      .sort({ createdAt: -1 });

    return res.json({ success: true, tickets });
  } catch (error) {
    console.error("Get all tickets error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Global/public summary
export const getTicketSummary = async (req, res) => {
  try {
    const now = new Date();
    const [total, pending, open, inProgress, resolved, closed, reopened, overdue, byCategory] = await Promise.all([
      ticketModel.countDocuments({}),
      ticketModel.countDocuments({ status: "Pending" }),
      ticketModel.countDocuments({ status: "Open" }),
      ticketModel.countDocuments({ status: "In Progress" }),
      ticketModel.countDocuments({ status: "Resolved" }),
      ticketModel.countDocuments({ status: "Closed" }),
      ticketModel.countDocuments({ status: "Reopened" }),
      ticketModel.countDocuments({ 
        dueDate: { $lt: now }, 
        status: { $nin: ["Resolved", "Closed"] } 
      }),
      ticketModel.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { _id: 0, category: "$_id", count: 1 } },
        { $sort: { category: 1 } },
      ]),
    ]);

    return res.json({
      success: true,
      summary: {
        total,
        pending,
        open,
        inProgress,
        resolved,
        closed,
        reopened,
        overdue,
        byCategory,
      },
    });
  } catch (error) {
    console.error("Get summary error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// My summaries
export const getMyTicketSummary = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Use req.userId

    const [total, pending, open, inProgress, resolved, closed, reopened] = await Promise.all([
      ticketModel.countDocuments({ submittedBy: userId }),
      ticketModel.countDocuments({ submittedBy: userId, status: "Pending" }),
      ticketModel.countDocuments({ submittedBy: userId, status: "Open" }),
      ticketModel.countDocuments({ submittedBy: userId, status: "In Progress" }),
      ticketModel.countDocuments({ submittedBy: userId, status: "Resolved" }),
      ticketModel.countDocuments({ submittedBy: userId, status: "Closed" }),
      ticketModel.countDocuments({ submittedBy: userId, status: "Reopened" }),
    ]);

    return res.json({
      success: true,
      summary: { total, pending, open, inProgress, resolved, closed, reopened },
    });
  } catch (error) {
    console.error("Get my summary error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const getMyAssignedTicketSummary = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Use req.userId

    const [total, pending, open, inProgress, resolved, closed, reopened] = await Promise.all([
      ticketModel.countDocuments({ assignedTo: userId }),
      ticketModel.countDocuments({ assignedTo: userId, status: "Pending" }),
      ticketModel.countDocuments({ assignedTo: userId, status: "Open" }),
      ticketModel.countDocuments({ assignedTo: userId, status: "In Progress" }),
      ticketModel.countDocuments({ assignedTo: userId, status: "Resolved" }),
      ticketModel.countDocuments({ assignedTo: userId, status: "Closed" }),
      ticketModel.countDocuments({ assignedTo: userId, status: "Reopened" }),
    ]);

    return res.json({
      success: true,
      summary: { total, pending, open, inProgress, resolved, closed, reopened },
    });
  } catch (error) {
    console.error("Get assigned summary error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Export tickets to CSV
export const exportTicketsToCSV = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    const now = new Date();
    if (!startDate) {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = firstDay.toISOString();
    }

    if (!endDate) {
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate = lastDay.toISOString();
    }

    const tickets = await ticketModel
      .find({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email department");

    if (tickets.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No tickets found in the selected date range.' 
      });
    }

    const ticketData = tickets.map(ticket => ({
      ticketId: ticket.ticketId,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      location: ticket.location || '',
      submittedBy: ticket.submittedBy?.name || 'Unknown',
      submittedByEmail: ticket.submittedBy?.email || '',
      assignedTo: ticket.assignedTo?.name || 'Unassigned',
      assignedToEmail: ticket.assignedTo?.email || '',
      department: ticket.assignedTo?.department || '',
      dueDate: ticket.dueDate,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }));

    const fields = [
      'ticketId', 'title', 'description', 'category', 'priority', 'status',
      'location', 'submittedBy', 'submittedByEmail', 'assignedTo',
      'assignedToEmail', 'department', 'dueDate', 'createdAt', 'updatedAt'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(ticketData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`tickets_${startDate.slice(0, 10)}_to_${endDate.slice(0, 10)}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error during CSV export' 
    });
  }
};