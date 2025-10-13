import deliveryService from "../../services/driver/deliveryQuery.js"
import HttpStatus from "../../utils/statusCodes.js"

const getDeliverySummary = async(req,res)=>{
    try {
        const driverId = req.params.driverId
        const {from_date,to_date}=req.query

         if (!driverId) {
            return res.status(HttpStatus.BAD_REQUEST).json({ 
                message: "Driver ID is required" 
            });
        }

         if ((from_date && !to_date) || (!from_date && to_date)) {
            return res.status(HttpStatus.BAD_REQUEST).json({ 
                message: "Both from_date and to_date are required for filtering" 
            });
        }


        // Validate date format (YYYY-MM-DD)
        if (from_date && to_date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(from_date) || !dateRegex.test(to_date)) {
                return res.status(HttpStatus.BAD_REQUEST).json({ 
                    message: "Invalid date format. Use YYYY-MM-DD" 
                });
            }

            // Validate from_date is not after to_date
            if (new Date(from_date) > new Date(to_date)) {
                return res.status(HttpStatus.BAD_REQUEST).json({ 
                    message: "from_date cannot be after to_date" 
                });
            }
        }



        const data= await deliveryService.fetchDeliverySummary(driverId,from_date,to_date)
  console.log("Fetched deliveries:", data.length);
        res.status(HttpStatus.OK).json(data)
    } catch (error) {
           console.error("Delivery query failed:", error)

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch delivery summary" })
    }
}

export default getDeliverySummary