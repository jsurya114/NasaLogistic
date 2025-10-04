import statusCode from "../../utils/statusCodes.js";
import { dbService } from "../../services/admin/dbQueries.js";
import { generateToken } from "../../services/jwtservice.js";
import HttpStatus from "../../utils/statusCodes.js";
import XLSX from "xlsx";
import XlsxPopulate from 'xlsx-populate';
import { ExcelFileQueries } from "../../services/admin/excelFileQueries.js";
import { formatExcelDate,getLocalDateString } from "../../utils/helper.js";
import stringSimilarity from 'string-similarity'
import { WeeklyExcelQueries } from "../../services/admin/weeklyExcelQueries.js";
import { table } from "console";
import { createDateBasedIndex, createDriverMap } from "../../utils/excelHelperFns.js";
import { buildInsertData, 
  // printMatchSummary 
} from "../../utils/matchFns.js";


// import { AdminDashboardQueries } from "../../services/admin/dashboardQueries.js";
const RouteObj = Object.freeze({
  "DFW 036-1": "36A",
  "DFW 041 A-1": "41A",
  "DFW 039-1": "39A",
  "DFW 037-1": "37A",
  "DFW 034-A-1": "34A",
  "DFW 041 B-1": "41B",
  "DFW 040-1": "40A",
  "DFW 035-1": "35A",
  "DFW 034 B-1": "34B",
  "DFW 038-1": "38A",
});
// const sheetName = "dup";
const sheetName = "dup";
export const getUpdatedTempDashboardData = async(req,res)=>{
  try {
    const result = await ExcelFileQueries.getTempDashboardData()
    return res.status(statusCode.OK).json({success:true,data:result})
  } catch (error) {
    console.error(error)
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({message:'error in server',error})
  }
}

export const DailyExcelUpload = async (req, res) => {
  try {
    console.log(req.body)
    const chosenDate = req.body?.date
    if(!chosenDate) return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"No Date Chosen"})
    // if(!req.file) {
    //     return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:'NO file uploaded'})
    // }
    // const fileName = req.file
    const fileData = {
      fieldname: "file",
      originalname: "dms_tmp_route_parcel_info_175306440034lsx",
      encoding: "7bit",
      mimetype:
        "application/vnd.openxmlformats-officedocum.spreadsheetml.sheet",
      destination: "uploads/",
      filename: "1758729143472.xlsx",
      path: "uploads\\1758729143472.xlsx",
      size: 250675,
    };
    // console.log(fileData, "uploaded file data");

    // console.log("fileuploaded",req.file.filename);
    const workbook = XLSX.readFile(fileData.path);
    // const workbook = XLSX.readFile(fileData.path);
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return res.status(400).json({ error: "Sheet named ... not found" });
    }
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(rows[1])
    // const now = new Date()
    // const dd = String(now.getDate()).padStart(2,'0');
    // const mm = String(now.getMonth()).padStart(2,'0');
    const tableName = `todays_excel_data`;
    await ExcelFileQueries.deleteIfTableAlreadyExists(tableName)
    await ExcelFileQueries.createDailyTable(tableName);
    await ExcelFileQueries.insertDataIntoDailyTable(tableName,rows,chosenDate)
    await ExcelFileQueries.mergeDeliveriesAndExcelData()
    await ExcelFileQueries.setUntouchedRowsAsNoScannedAndUpdateFailedAttempt()
    await ExcelFileQueries.updateFirstStopAndDoubleStop()
    await ExcelFileQueries.addEachDriversCount()


    
    return res.status(statusCode.OK).json({ message: "code endeddd" });
  } catch (error) {
    console.error(error)
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({message:'Error Occured while processing Excel'})
  }
};

// export const updateDriverPayment = async (req,res)=>{
//   try {
//     await AdminDashboardQueries.updatePaymentTable()
    
//   } catch (error) {
    
//   }
// }
// export default fileUpload


export const getWeeklyTempData=async(req,res)=>{
  try{
    let data=await WeeklyExcelQueries.getWeeklyData();
      return res.status(HttpStatus.OK).json({data});
  }catch(err){
    console.error("Upload Error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export const weeklyExcelUpload=async(req,res)=>{
 try{ 
  const file=req.file;  
  if(!file)
     return res.status(400).json({success:false,message:'NO file uploaded'});
    console.log("File is ",req.file);
   
    const workbook = XLSX.readFile(file.path);
      const sheetName = "Driver Daily Summary";
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with formatted values
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false, // Get formatted strings instead of raw numbers
      });

      const excelData = data
        .slice(2) // Skip first 2 header rows
        .map(row => ({
          name: row[1]?.toString().trim(),
          date: row[2], // Will be the formatted date string
          deliveries: parseInt(row[6]) || 0,
          fullStop: parseInt(row[10]) || 0,
          doubleStop: parseInt(row[12]) || 0,
        }))
        .filter(item => item.name); // Remove empty rows

      if (!excelData || excelData.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false, 
          message: "No valid rows found in Excel"
        });
      }

      const formattedData = excelData.map((d) => ({ 
        ...d,
        date: formatExcelDate(d.date),
      }));

      const dates = formattedData.map((d) => d.date);
      const uniqueDates = [...new Set(dates)];

      const dashboardData= await WeeklyExcelQueries.fetchDashboardDataByDates(uniqueDates);
        if(!dashboardData)
          return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"No valid rows match thge data in driver entered journey"})

        // console.log("Data from DB ",dashboardData);   

        const normalizedDrivers = createDriverMap(dashboardData);
        const driversByDate = createDateBasedIndex(dashboardData);

        const { insertValues, insertPlaceholders, 
          // matchResults 
        } = buildInsertData(
          formattedData,
          normalizedDrivers,
          driversByDate
        );
        // printMatchSummary(matchResults);

        // console.log("\n=== INSERT DATA ===");
        // console.log("Values:", insertValues);
        // console.log("Placeholders:", insertPlaceholders);
        let tableName="weekly_excel_data";
        await WeeklyExcelQueries.deleteWeeklyTableIfExists(tableName);
        await WeeklyExcelQueries.createWeeklyTable(tableName);
        let insertedData = await WeeklyExcelQueries.insertBatchDatafromExcel(insertPlaceholders,insertValues);
        
        return res.status(HttpStatus.OK).json({success:true,message:"Excel data processed and stored successfully",insertedData})
      }catch(err){        
        console.error("Upload Error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });  
      }
      }
  

