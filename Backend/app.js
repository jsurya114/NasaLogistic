import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js'
import adminRoutes from './routes/adminRoutes.js'

dotenv.config()

const PORT = process.env.PORT
 const app = express()
 app.use(cors())
 app.use(express.json())
 

 app.get('/',(req,res)=>{
    res.send("Backend running with ES Modules")
 })

 app.use('/admin',adminRoutes)


 

 app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`))



