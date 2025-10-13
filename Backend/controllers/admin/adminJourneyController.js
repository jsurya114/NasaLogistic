import AdminJourneyQuery from "../../services/admin/AjourneyQuery.js";

import HttpStatus from "../../utils/statusCodes.js";

const adminJourneyController={
    fetchAllJourneys:async(req,res)=>{
        try {
           const journeys = await AdminJourneyQuery.getAllJourneys()
           res.status(HttpStatus.OK).json({success:true,data:journeys}) 
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    },
    addJourney:async(req,res)=>{
      try {
        const {driver_id,route_id,start_seq,end_seq,journey_date}=req.body
              // Inline field validations
      const errors = {};
      if (!driver_id) errors.driver_id = "Driver is required";
      if (!route_id) errors.route_id = "Route is required";
      if (!start_seq) errors.start_seq = "Start sequence is required";
      if (!end_seq) errors.end_seq = "End sequence is required";
      if (!journey_date) errors.journey_date = "Journey date is required";
      if (start_seq && end_seq && parseInt(start_seq) >= parseInt(end_seq)) {
        errors.sequence = "End sequence must be greater than start sequence";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, errors });
      }

        const driverExists = await AdminJourneyQuery.checkDriverExists(driver_id)
        if(!driverExists){
            return res
            .status(HttpStatus.BAD_REQUEST)
            .json({success:false,message:"Driver does not exists."})
             }
             
const overlappingJourneys = await AdminJourneyQuery.checkSequenceOverlap(
  driver_id,
  route_id,
  start_seq,
  end_seq
)

   if (overlappingJourneys.length > 0) {
        const overlap = overlappingJourneys[0];
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          errors: {
            sequence: `Sequence overlap detected! This driver already has sequences ${overlap.start_seq}-${overlap.end_seq} on this route.`
          }
        });
      }
            const newJourney = await AdminJourneyQuery.addJourney({driver_id,
                route_id,
                start_seq,
                end_seq,
                journey_date
            })
            res.status(HttpStatus.CREATED).json({success:true,data:newJourney})
       
      } catch (error) {
         res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
      }
    },
updateJourney: async (req, res) => {
    try {
      const journey_id = req.params.journey_id;
      const { start_seq, end_seq, route_id, driver_id } = req.body;

     // Inline field validations
      const errors = {};
      if (!driver_id) errors.driver_id = "Driver is required";
      if (!route_id) errors.route_id = "Route is required";
      if (!start_seq) errors.start_seq = "Start sequence is required";
      if (!end_seq) errors.end_seq = "End sequence is required";
      if (start_seq && end_seq && parseInt(start_seq) >= parseInt(end_seq)) {
        errors.sequence = "End sequence must be greater than start sequence";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, errors });
      }

      const driverExists = await AdminJourneyQuery.checkDriverExists(driver_id);
      if (!driverExists) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          errors: { driver_id: "Driver does not exist" }
        });
      }

      const overlappingJourneys = await AdminJourneyQuery.checkSequenceOverlap(
        driver_id,
        route_id,
        start_seq,
        end_seq,
        journey_id // exclude current journey
      );

      if (overlappingJourneys.length > 0) {
        const overlap = overlappingJourneys[0];
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          errors: {
            sequence: `Sequence overlap detected! This driver already has sequences ${overlap.start_seq}-${overlap.end_seq} on this route.`
          }
        });
      }
      
      const updatedJourney = await AdminJourneyQuery.updateJourneyById(
        journey_id,
        { start_seq, end_seq, route_id }
      );
      res.status(HttpStatus.OK).json({ success: true, data: updatedJourney });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  },
  fetchAllDrivers:async(req,res)=>{
     try {
            const drivers = await AdminJourneyQuery.getAllDrivers();
            res.status(HttpStatus.OK).json({ success: true, data: drivers });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
                success: false, 
                message: error.message 
            });
        }
  }
}
export default adminJourneyController