import express from 'express';
import HttpStatus from '../../utils/statusCodes.js';
import { dbService } from '../../services/admin/dbQueries.js';

export const createUsers=async(req,res)=>{
    try{
     const {email,password,name,driverCode,city,enabled}= req.body;
    // console.log("Data from client ",req.body);

    if(!email || !password|| !city|| !driverCode){
        return res.status(HttpStatus.UNAUTHORIZED).json({message:"Email , password, city  & driver code is required"})
    }

    const driver= await dbService.getDriverByEmail(email);
    if(driver)
        return res.status(HttpStatus.CONFLICT).json({message:"User already Exists"});
    
     const driverCodeExists= await dbService.getDriverByCode(driverCode);
    if(driverCodeExists)
        return res.status(HttpStatus.CONFLICT).json({message:"Driver Code already used"});
    
    const insertUser= await dbService.insertUser({name,email,driverCode,password,city,enabled});

    return res.status(HttpStatus.OK).json({message:"User Added Successfull!!",insertUser});
    }catch(err){
        console.log("Error while inserting data ",err.message)
       return  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" })
    }
}

export const getUsers= async(req,res)=>{
    try{
        console.log("Entered by Get users route");

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const drivers = await dbService.getAllDrivers(limit, offset);
        const totalDrivers = await dbService.getCountOfDrivers();
        const totalPages = Math.ceil(totalDrivers / limit);

        return res.status(HttpStatus.OK).json({
            drivers,
            page,
            totalPages
        });
    }catch(err){
        console.error(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" })
    }
}

export const changeStatusUser= async(req,res)=>{
    try{
        const id=req.params.id;
        console.log("Data from url ",id);
        const checkUser= await dbService.getDriverById(id);
        if(!checkUser)
            return res.status(HttpStatus.NOT_FOUND).json({message:"User does not exists"});
        const data= await dbService.changeStatus(id);
        // console.log("Data",data)
        return res.status(HttpStatus.OK).json({message:"User updated successfully!!",data});
    }catch(err){
        console.error(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

// export const checkforSuperAdminOrNot= async(req,res)=>{
//     try{
//         // const res= await dbService.
//     }catch(err){
//         console.error(err.message);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
//     }
// }