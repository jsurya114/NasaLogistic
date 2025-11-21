import express from 'express'
import HttpStatus from '../../utils/statusCodes.js'
import { jobService } from '../../services/admin/jobQueries.js'

import pool from '../../config/db.js'


const jobController={
    getJob:async(req,res)=>{
        try {
            const jobs = await jobService.getCity()
            console.log(jobs)
            res.json(jobs)
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message })
        }
    },
    addJob:async(req,res)=>{
        try {
           const {job,city_code,enabled} =req.body

           console.log(job)
           console.log(city_code)
           console.log(req.body)

           if (!job || job.trim() === "") {
      return res.status(HttpStatus.BAD_REQUEST).json({ field: "job", message: "Job name is required" });
    }
    if (!city_code || city_code.trim() === "") {
      return res.status(HttpStatus.BAD_REQUEST).json({ field: "city_code", message: "City code is required" });
    }
    if (enabled === false) {
      return res.status(HttpStatus.BAD_REQUEST).json({ field: "enabled", message: "You must enable the city to add it" });
    }
           const jobs = await jobService.addcity(job,city_code);  
           res.status(HttpStatus.CREATED).json(jobs)
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message })
        }
    },
    updateJob:async(req,res)=>{
        try {
            const {id}=req.params
            const {job,city_code}=req.body

            const jobs = await jobService.updateCity(id,job,city_code)

            if (!jobs) return res.status(HttpStatus.NOT_FOUND).json({ message: "City not found" })
                res.json(jobs)
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message })
        } 
    },
    deleteJob:async(req,res)=>{
        try {
            const {id}=req.params
            const jobs =await jobService.deleteCity(id)
            if(!jobs) return res.status(HttpStatus.NOT_FOUND).json({ message: "City not found" })

                res.json({ message: "City deleted successfully" })
        } catch (error) {

            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message })
        }
    },
    jobStatus:async(req,res)=>{
        try {
         const {id}=req.params
         const jobs = await jobService.cityStatus(id)
        if(!jobs) return res.status(HttpStatus.NOT_FOUND).json({ message: "City not found" })
            
         res.json(jobs)   
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message })
        }
    },
    fetchPaginatedJobs:async(req,res)=>{
        try {
            const page = parseInt(req.query.page)||1
            const limit = parseInt(req.query.limit)||3
            const search = req.query.search||""
            const statusFilter = req.query.status || "all"
            const {jobs,total}=await jobService.jobPagination(page,limit,search,statusFilter)
            res.status(HttpStatus.OK).json({
                success:true,
                jobs,
                total,
                page,
                totalPages:Math.ceil(total/limit)
            })
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
        }
    },
    getCities:async(req,res)=>{
        try {
            const cities= await jobService.getTotalCities();
            return res.status(HttpStatus.OK).json(({cities}));
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false, message: error.message });
        }
    }

}
export default jobController