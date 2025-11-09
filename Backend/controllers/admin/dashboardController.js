import { AdminDashboardQueries } from "../../services/admin/dashboardQueries.js";
import { WeeklyExcelQueries } from "../../services/admin/weeklyExcelQueries.js";
import HttpStatus from "../../utils/statusCodes.js";

export const getPaymentDashboardData = async (req, res) => {
  try {
    console.log("getPaymentDashboardData called");
    console.log("Query params:", req.query);

    // Extract query parameters for filtering
    const { job, driver, route, startDate, endDate, paymentStatus, companyEarnings } = req.query;

    // Build filters object - only include non-null/non-"All" values
    const filters = {};
    
    if (job && job !== "All") filters.job = job;
    if (driver && driver !== "All") filters.driver = driver;
    if (route && route !== "All") filters.route = route;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (paymentStatus && paymentStatus !== "All") filters.paymentStatus = paymentStatus;
    if (companyEarnings === "true") filters.companyEarnings = true;

    console.log("Processed filters:", filters);

    // Fetch filtered data
    const result = await AdminDashboardQueries.PaymentDashboardTable(filters);
    
    console.log("Query successful, returning", result.length, "rows");
    
    return res.status(HttpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    console.error("Error in getPaymentDashboardData:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: error.message || "Failed to fetch payment dashboard data" 
    });
  }
};

export const updatePaymentData = async (req, res) => {
  try {
    await AdminDashboardQueries.updatePaymentTable();
    res.status(HttpStatus.OK).json({ success: true });
  } catch (error) {
    console.error("Error in updatePaymentData:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false });
  }
};

export const updateWeeklyTempDataToDashboard = async (req, res) => {
  try {
    console.log("Reached Update of Temp data to dashboard");
    const updateData = await WeeklyExcelQueries.processWeeklyData();
    return res.status(HttpStatus.OK).json({ updateData });
  } catch (err) {
    console.error("Error in updateWeeklyTempDataToDashboard:", err);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false });
  }
};