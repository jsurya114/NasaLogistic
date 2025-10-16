import express from 'express';
import HttpStatus from '../../utils/statusCodes.js';
import { dbService } from '../../services/admin/dbQueries.js';

export const createAdmins=async(req,res)=>{
    try{
    const {email,password,name,role,cities}= req.body;
    // console.log("Data from client ",req.body);
     const city=Array.isArray(cities) ? cities :[];
    if(role==='admin' && city.length <= 0){
        return res.status(HttpStatus.UNAUTHORIZED).json({message:"Atleast one city to be provided for Admin User"})
    }

    if(!email || !password|| !name){
        return res.status(HttpStatus.UNAUTHORIZED).json({message:"Email , password & Name is required"})
    }

    const admin= await dbService.getAdminByEmail(email);
    if(admin)
        return res.status(HttpStatus.CONFLICT).json({error:"Admin email already exists"});
    // const hashPassword= await dbService.hashedPassword(password);
    const insertAdmin= await dbService.insertAdmin({name,email,password,role,city});    

    return res.status(HttpStatus.OK).json({message:"Admin Added Successfully!!",insertAdmin});
    }catch(err){
        console.log("Error while inserting data ",err.message)
    }
}

export const getAdmins= async(req,res)=>{
    try{
        // console.log("Entered by Get admins route");
        let page= req.query.page;
        let limit=5;
        let offset= (page-1)*limit;

        const data =await dbService.getAllAdmins(limit,offset);
        const totalCount = await dbService.getCountOfAdmins();
        const totalPages= Math.ceil(totalCount/limit); 
        // console.log("List of Data ",data);
        return res.status(HttpStatus.OK).json({admins:data,page,totalPages});
    }catch(err){
        console.error(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" })
    }
}

export const changeStatusAdmin= async(req,res)=>{
    try{
        const id=req.params.id;
        console.log("Data from url ",id);
        const checkUser= await dbService.getAdminById(id);
        if(!checkUser)
            return res.status(HttpStatus.NOT_FOUND).json({message:"Admin does not exist!!"});
        const data= await dbService.changeStatusOfAdmin(id);
        // console.log("Data",data)
        return res.status(HttpStatus.OK).json({message:"Admin updated successfully!!",data});
    }catch(err){
        console.error(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

export const changeRoleAdmin=async(req,res)=>{
    try{
        const id=req.params.id;
        const checkUser= await dbService.getAdminById(id);
        if(!checkUser)
            return res.status(HttpStatus.NOT_FOUND).json({message:"Admin does not exist"});
        const data= await dbService.changeRoleOfAdmin(id);
        // console.log("Data",data)
        return res.status(HttpStatus.OK).json({message:"Admin updated successfully!!",data});
    }catch(err){
        console.error(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}