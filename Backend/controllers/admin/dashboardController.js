import {AdminDashboardQueries} from "../../services/admin/dashboardQueries.js"
import HttpStatus from "../../utils/statusCodes.js"



export const getPaymentDashboardData = async (req,res)=>{
    try {
        const result = await AdminDashboardQueries.PaymentDashboardTable()
        return res.status(HttpStatus.OK).json({sucess:true,data:result})
        
    } catch (error) {
        console.error(error)
    }
}