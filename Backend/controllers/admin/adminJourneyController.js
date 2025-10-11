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
    updateJourney :async(req,res)=>{
        try {
            const journey_id = req.params.journey_id
            const updatedData = req.body
            const updatedJourney = await AdminJourneyQuery.updateJourneyById(journey_id,updatedData)
            res.status(HttpStatus.OK).json({success:true,data:updatedJourney})
        } catch (error) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }
}
export default adminJourneyController