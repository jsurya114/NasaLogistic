import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js'
import adminRoutes from './routes/adminRoutes.js'

dotenv.config()

const PORT = process.env.PORT
 const app = express()
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
 app.use(express.json())
 



 app.use('/admin',adminRoutes)


 

 app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`))



