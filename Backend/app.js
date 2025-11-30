import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js';
import adminRoutes from './routes/adminRoutes.js'
import driverRoutes from "./routes/driverRoutes.js"
import cookieParser from 'cookie-parser';
import sanitizeMiddleware from './middlewares/sanitize.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import rateLimit from './middlewares/rateLimit.js';

dotenv.config()


const PORT = process.env.PORT;
 const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))

 app.use(express.json())
 app.use(cookieParser());
 // Serve static uploads (e.g., access code images)
 app.use('/uploads', express.static('uploads'));
 // Global input sanitization for all requests
 app.use(sanitizeMiddleware);
 // Global rate limit (per IP per base path)
 app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
 app.use('/admin',(req,_,next)=>{
  console.log(req.originalUrl,'##',req.headers?.cookie?.slice(0,15) ?? 'no-Cookie','**',Date().toString().slice(16,25))
  next()
 },adminRoutes);
 app.use('/driver',(req,_,next)=>{
  console.log(req.originalUrl,'##',req.headers?.cookie?.slice(0,15) ?? 'no-Cookie','**',Date().toString().slice(16,25))
  next()
 },driverRoutes)
 
 // 404 for unmatched routes
 app.use(notFound);
 // Centralized error handler (must be last)
 app.use(errorHandler);

 app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`))



