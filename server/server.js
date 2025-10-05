import express from "express"
import "dotenv/config"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./configs/db.js"
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js"
import adminRouter from "./routes/adminRoutes.js"
import ticketRouter from "./routes/ticketRoutes.js"

const app = express()
connectDB()
const allowedOrigins = ['http://localhost:5173']

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin:allowedOrigins,credentials:true}))
const PORT = process.env.PORT || 3000

//API Endpoints
app.get("/",(req,res)=>{
    res.send("API is working")
})

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/admin",adminRouter)
app.use("/api/tickets",ticketRouter)

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})