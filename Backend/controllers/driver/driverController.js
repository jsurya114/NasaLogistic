import express from 'express'
import HttpStatus from '../../utils/statusCodes.js'
 import {loginService} from "../../services/driver/loginQueries.js"
const driverController ={
    Login:async(req,res)=>{
      try {
         const {email,password}=req.body
          if(!email||!password){
            return res.status(HttpStatus.UNAUTHORIZED).json({message:"Email and password are required"})
        }
         const driver = await loginService.getDriverByEmail(email)
         if(!driver){
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" })
         }
         const validPassword = await loginService.checkPassword(password,driver.password)
         if (!validPassword) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
      }
      res.status(HttpStatus.OK).json({message:"Login Successful",driver: {
    id: driver.id,
    email: driver.email,
    name: driver.name  // if your table has it
  }})
      } catch (error) {
       console.error(error.message)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" })
      }
    }
}
export default driverController   