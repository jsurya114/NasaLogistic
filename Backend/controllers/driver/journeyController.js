import { insertJourney,getTodayJourney } from "../../services/driver/journeyQueries.js";
import HttpStatus from '../../utils/statusCodes.js';

export const saveJourney = async(req,res)=>{
    try {
        const {driver_id,route_id,packages,start_seq,end_seq}=req.body

        const errors = {};
         if (!driver_id) errors.driver_id = "Driver ID is required"; 
        if (!route_id) errors.route_id = "Route is required";
         if (!start_seq || start_seq <= 0) errors.start_seq = "Start sequence must be > 0";
          if (!end_seq || end_seq > start_seq) errors.end_seq = "End sequence must be >= start sequence"; 
          if (!packages || packages <= 0) errors.packages = "Packages must be > 0"; 
          if (Object.keys(errors).length > 0) { return res.status(HttpStatus.BAD_REQUEST).json({ success: false, errors }) }


       const existingJourney = await getTodayJourney(driver_id)
       if(existingJourney.length>0){
        return res.status(HttpStatus.BAD_REQUEST).json({
            message:"journey for today is already saved"
        })
       }

       const conflict  =await getTodayJourney(route_id,start_seq,end_seq)
       if(conflict.length>0){
        return res.status(HttpStatus.BAD_REQUEST).json({
        message: "This route already has a journey with overlapping sequences today",
      })
       }
const journey = await insertJourney({ driver_id, route_id, packages, start_seq, end_seq });

res.status(HttpStatus.CREATED).json({success:true,data:journey})
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error inserting journey" })
    }
}

export const fetchTodayJourney = async(req,res)=>{
    try {
      const driverId = req.params.driver_id;
        const journey = await getTodayJourney(driverId)
        res.status(HttpStatus.OK).json({success:true,data:journey})

    } catch (error) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error fetching journey" })

    }
}