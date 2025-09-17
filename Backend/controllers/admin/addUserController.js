import express from 'express';
import HttpStatus from '../../utils/statusCodes.js';
import { dbService } from '../../services/dbQueries.js';

export const createUsers=async(req,res)=>{
    try{
    const {email,password,name,city,enabled}= req.body;
    console.log("Data from client ",req.body);

    if(!email || !password|| !city){
        return res.status(HttpStatus.UNAUTHORIZED).json({message:"Email , passoword & city is required"})
    }

    const driver= await dbService.getDriverByEmail(email);
    if(driver)
        return res.status(HttpStatus.CONFLICT).json({message:"User already Exists"});
    // const hashPassword= await dbService.hashedPassword(password);
    const insertUser= await dbService.insertUser({name,email,password,city,enabled});
    return res.status(HttpStatus.OK).json({message:"User Added Successfull!!",insertUser});
    }catch(err){
        console.log("Error while inserting data ",err.message)
    }
}

export const getUsers= async(req,res)=>{
    try{
        console.log("Entered by Get users route");
        const data =await dbService.getAllDrivers();
        console.log("List of Data ",data);
        return res.status(HttpStatus.OK).json({data});
    }catch(err){
        console.error(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" })
    }
}

export const changeStatusUser= async(req,res)=>{
    try{
        const id=req.params.id;
        const checkUser= await dbService.getDriverById(id);
        if(!checkUser)
            return res.status(HttpStatus.NOT_FOUND).json({message:"User does not exists"});
        const data= await dbService.changeStatus(id);
        return res.status(HttpStatus.OK).json({message:"User updated successfully!!",data});
    }catch(err){
        console.error(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}