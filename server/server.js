import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import serverless from "serverless-http";
import connectDB from "./configs/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import ticketRouter from "./routes/ticketRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import roleRequestRouter from "./routes/roleRequestRoutes.js";
import statsRouter from "./routes/statsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
connectDB();

const allowedOrigins = ['http://localhost:5173','https://caravan-stories.vercel.app'];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Endpoints
app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/profile", profileRouter);
app.use("/api/role-requests", roleRequestRouter);
app.use('/api/stats', statsRouter);

// Remove app.listen
// app.listen(PORT, () => console.log(Server running on port ${PORT}));

export default app;
export const handler = serverless(app);