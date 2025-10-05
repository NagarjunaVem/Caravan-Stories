import express from "express";
import userAuth from "../middleware/userAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";
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
} from "../controllers/ticketController.js";

const ticketRouter = express.Router();

// Create
ticketRouter.post("/create", userAuth, createTicket);

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


ticketRouter.get("/summary", userAuth, requireAdmin, getTicketSummary);

// My summaries
ticketRouter.get("/my-summary", userAuth, getMyTicketSummary);
ticketRouter.get("/my-assigned-summary", userAuth, getMyAssignedTicketSummary);
ticketRouter.get('/export', exportTicketsToCSV);
export default ticketRouter;