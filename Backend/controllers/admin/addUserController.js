import express from 'express';
import HttpStatus from '../../utils/statusCodes.js';
import { dbService } from '../../services/admin/dbQueries.js';

export const createUsers=async(req,res)=>{
    try{
    const {email,password,name,city,enabled}= req.body;
    // console.log("Data from client ",req.body);

    if(!email || !password|| !city){
        return res.status(HttpStatus.UNAUTHORIZED).json({message:"Email , passoword & city is required"})
    }

    const driver= await dbService.getDriverByEmail(email);
    if(driver)
        return res.status(HttpStatus.CONFLICT).json({error:"User already Exists"});
    // const hashPassword= await dbService.hashedPassword(password);
    const insertUser= await dbService.insertUser({name,email,password,city,enabled});
    return res.status(HttpStatus.OK).json({message:"User Added Successfull!!",insertUser});
    }catch(err){
        console.log("Error while inserting data ",err.message)
    }
}

export const getUsers= async(req,res)=>{
    try{
       console.log("Page Number ",req.query.page);
       let page = parseInt(req.query.page);
       let limit=10;

       let offset = (page-1) * limit;

        const data =await dbService.getAllDrivers(limit,offset);
        const totalCount = await dbService.getCountOfDrivers();
        const totalPages= Math.ceil(totalCount/limit); 
        
        return res.status(HttpStatus.OK).json({drivers:data,page,totalPages,totalCount});
    }catch(err){
        console.error(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" })
    }
}

export const changeStatusUser= async(req,res)=>{
    try{
        const id=req.params.id;
        // console.log("Data from url ",id);
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