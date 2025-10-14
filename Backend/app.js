import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js';
import adminRoutes from './routes/adminRoutes.js'
import driverRoutes from "./routes/driverRoutes.js"
import cookieParser from 'cookie-parser';
dotenv.config()


const PORT = process.env.PORT;
 const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))

 app.use(express.json())
 app.use(cookieParser());
 app.use('/admin',(req,_,next)=>{
  console.log(req.originalUrl,'##',req.headers?.cookie?.slice(0,15) ?? 'no-Cookie','**',Date().toString().slice(16,25))
  next()
 },adminRoutes);
 app.use('/driver',driverRoutes)
 

 app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`))



