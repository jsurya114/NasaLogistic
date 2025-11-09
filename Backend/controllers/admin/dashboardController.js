import {AdminDashboardQueries} from "../../services/admin/dashboardQueries.js"
import { WeeklyExcelQueries } from "../../services/admin/weeklyExcelQueries.js"
import HttpStatus from "../../utils/statusCodes.js"



export const getPaymentDashboardData = async (req,res)=>{
    try {
        const result = await AdminDashboardQueries.PaymentDashboardTable()
        return res.status(HttpStatus.OK).json({sucess:true,data:result})
        
    } catch (error) {
        console.error(error)
    }
}

export const updatePaymentData = async (req,res)=>{
    try {
        await AdminDashboardQueries.updatePaymentTable()
        res.status(HttpStatus.OK).json({success:true})
    } catch (error) {
        console.error(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false})
    }
}

export const updateWeeklyTempDataToDashboard=async(req,res)=>{
    try {
        console.log("Reached Update of Temp data to dashboard");        
        let insertData= await WeeklyExcelQueries.createEntriesFromWeeklyCount();

        return res.status(HttpStatus.OK).json({insertData});        
    } catch (err) {
        console.error(err)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false});
    }
}