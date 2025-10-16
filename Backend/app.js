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

const allowedOrigins = [
  "https://nasa-logistic.vercel.app", // production
  "https://nasa-logistic-76v5c819k-jayasurya-ss-projects-06141d93.vercel.app" // preview / older URL
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow non-browser requests (like Postman)
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}))

 app.use(express.json())
 app.use(cookieParser());
 app.use('/admin',adminRoutes);
 app.use('/driver',driverRoutes)
 

 app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`))



