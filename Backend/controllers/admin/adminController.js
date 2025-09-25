import express from 'express'
import statusCode from '../../utils/statusCodes.js'
import { dbService } from '../../services/admin/dbQueries.js'
import { generateToken, verifyToken } from '../../services/jwtservice.js'
import HttpStatus from '../../utils/statusCodes.js'

 const adminController={
    Login:async(req,res)=>{
       try {
        const {email,password}=req.body;
         
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

      let token = generateToken({id:admin.id,email:admin.email,role:admin.role,name:admin.name});
        
      if (!token) {
          return res.status(HttpStatus.UNAUTHORIZED).json({ message: "UNAUTHORIZED" });
        }

      res.cookie("adminToken", token, {
        httpOnly: true,   // cannot be accessed via JS
        secure: false,    // true in production (HTTPS only)
        sameSite: "strict",
        maxAge: 60 * 60 * 1000 // 1 hour
      });

      res.status(HttpStatus.OK).json({ message: "Login successful",admin});

       } catch (error) {
        console.error(error.message)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" })

       }
    },

    Logout:async(req,res)=>{
      res.clearCookie("adminToken");
      res.status(HttpStatus.OK).json({message:"Logged out successfully"});
    },   
    
    getUser:async(req,res)=>{
      try{
        const token = req.cookies.adminToken;
        // console.log("Token from request",token)
        if(!token) return res.status(HttpStatus.UNAUTHORIZED).json({message:"UNAUTHORIZED"})
        
          const decoded= verifyToken(token);
          // console.log("Token from service ", decoded);
          return res.status(HttpStatus.OK).json({admin:decoded});
        
      }catch(err){
        console.error(err.message)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" })
      }
    }

     
}

export default adminController
