import express from "express"
import "dotenv/config"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./configs/db.js"
import authRouter from "./routes/authRoutes.js"

const app = express()
connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials:true}))
const PORT = process.env.PORT || 3000

//API Endpoints
app.get("/",(req,res)=>{
    res.send("API is working")
})
app.use("/api/auth",authRouter)

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})