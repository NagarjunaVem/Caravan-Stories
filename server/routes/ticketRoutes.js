import express from "express";
import userAuth from "../middleware/userAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import upload from "../middleware/upload.js";
import {
  createTicket,
  assignTicketToDept,
  updateTicketStatus,
  addComment,
  getMySubmittedTickets,
  getMyAssignedTickets,
  getAllTickets,
  reopenTicket,
  getTicketSummary,
  getMyTicketSummary,
  getMyAssignedTicketSummary,
  exportTicketsToCSV,
  getTicketDetails,
} from "../controllers/ticketController.js";

const ticketRouter = express.Router();

// Create with image upload
ticketRouter.post("/create", userAuth, upload.single('image'), createTicket);

// Get single ticket details
ticketRouter.get("/details/:ticketId", userAuth, getTicketDetails);

// Assign (admin)
ticketRouter.post("/assign", userAuth, requireAdmin, assignTicketToDept);

// Status + comments
ticketRouter.post("/status", userAuth, updateTicketStatus);
ticketRouter.post("/reopen", userAuth, reopenTicket);
ticketRouter.post("/comment", userAuth, addComment);

// Lists
ticketRouter.get("/my-submitted", userAuth, getMySubmittedTickets);
ticketRouter.get("/my-assigned", userAuth, getMyAssignedTickets);
ticketRouter.get("/all", userAuth, requireAdmin, getAllTickets);

// Summaries
ticketRouter.get("/summary", getTicketSummary);
ticketRouter.get("/my-summary", userAuth, getMyTicketSummary);
ticketRouter.get("/my-assigned-summary", userAuth, getMyAssignedTicketSummary);

// Export
ticketRouter.get('/export', userAuth, requireAdmin, exportTicketsToCSV);

export default ticketRouter;