import express from 'express'
import statusCode from '../../utils/statusCodes.js'
import { dbService } from '../../services/dbQueries.js'
import { generateToken } from '../../services/jwtservice.js'
import HttpStatus from '../../utils/statusCodes.js'

 const adminController={
    Login:async(req,res)=>{
       try {
        const {email,password}=req.body

        console.log(req.body)

        console.log("email",email)

        console.log("password",password)
         
        if(!email||!password){
            return res.status(statusCode.UNAUTHORIZED).json({message:"Email and password are required"})
        }

        const admin = await dbService.getAdminByEmail(email)

          if (!admin) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
      }

      const validPassword = await dbService.checkPassword(password,admin.password)

      if (!validPassword) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
      }
      

      let token = generateToken({id:admin.id,email:admin.email})

      res.status(HttpStatus.OK).json({ message: "Login successful", token });


       } catch (error) {
        console.error(error.message)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" })

       }
    },

    

     
}

export default adminController
