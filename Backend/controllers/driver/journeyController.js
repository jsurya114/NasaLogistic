import e from "express";
import {
  insertJourney,
  getTodayJourney,
  addRangeOfSqeunceToDeliveries,
  checkSequenceConflict,
  // updateSeqRouteCodeToDeliveriesTable
} from "../../services/driver/journeyQueries.js";
import HttpStatus from "../../utils/statusCodes.js";

export const saveJourney = async (req, res) => {
  try {
    let { driver_id, route_id, packages, start_seq, end_seq } = req.body;
    packages = Number(packages)
    start_seq = Number(start_seq)
    end_seq = Number(end_seq)
    console.log(driver_id, route_id, packages, start_seq, end_seq )
    const errors = {};
    if (!driver_id) errors.driver_id = "Driver ID is required";
    if (!route_id) errors.route_id = "Route is required";
    if (!start_seq || start_seq <= 0)
      errors.start_seq = "Start sequence must be Greater Than 0";
    if (!end_seq || end_seq < start_seq)
      errors.end_seq =
        "End sequence must be Greater Or Equal1 to start sequence";
    if (!packages || packages <= 0) errors.packages = "Packages must be > 0";
    // route_id = Number(route_id)
    const conflictSequences = await checkSequenceConflict(route_id,start_seq,end_seq)
    if(conflictSequences.length>0) errors.sequenceConflict = 'some packages chosen in the Sequence has been already taken by another driver'
    if (Object.keys(errors).length > 0) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, errors });
    }

    const existingJourney = await getTodayJourney(driver_id);
    if (existingJourney.length > 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "journey for today is already saved",
      });
    }

    const conflict = await getTodayJourney(route_id, start_seq, end_seq);
    if (conflict.length > 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message:
          "This route already has a journey with overlapping sequences today",
      });
    }
    // console.log('get today journery')
    const journey = await insertJourney({
      driver_id,
      route_id,
      packages,
      start_seq,
      end_seq,
      journey_date: journey_date || new Date().toISOString().split('T')[0]
    });
    
    if(journey.success===false){
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success:false,
        message:journey.message,
        error:journey.error
      })
    }


    // const routes = await ge
    const sequence = await addRangeOfSqeunceToDeliveries(driver_id,route_id,start_seq,end_seq)
    
    if(sequence.success===false){
      console.error("failed to add sequences",sequence.message)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success:false,
        message:"journey saved but failed to add delivery sequences",
        error:sequence.error
      })
    }

    console.log(sequence.length,'nos sequnce added...')
    // await updateSeqRouteCodeToDeliveriesTable()
    res.status(HttpStatus.CREATED).json({ success: true, data: journey });
  } catch (error) {
    console.error('❌ Error inserting journey:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: "Error inserting journey",
      error: error.message 
    });
  }
};

export const fetchTodayJourney = async (req, res) => {
  try {
    const driverId = req.params.driver_id;
    const journey = await getTodayJourney(driverId);
    res.status(HttpStatus.OK).json({ success: true, data: journey });
  } catch (error) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Error fetching journey" });
  }
};