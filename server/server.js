import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
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

const allowedOrigins = [
  'http://localhost:5173',
  'https://caravan-stories.vercel.app'
];

// ✅ Enhanced CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'https://caravan-stories.vercel.app'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

// API Endpoints
app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/tickets", ticketRouter);
app.use(cors(corsOptions));
app.use("/api/profile", profileRouter);
app.use("/api/role-requests", roleRequestRouter);
app.use('/api/stats', statsRouter);

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});