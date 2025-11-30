import statusCode from "../../utils/statusCodes.js";
import { dbService } from "../../services/admin/dbQueries.js";
import { generateToken } from "../../services/jwtservice.js";
import pool from "../../config/db.js";
import HttpStatus from "../../utils/statusCodes.js";
import XLSX from "xlsx";
// import XlsxPopulate from 'xlsx-populate';
import { ExcelFileQueries } from "../../services/admin/excelFileQueries.js";
import { formatExcelDate,getLocalDateString } from "../../utils/helper.js";
// import stringSimilarity from 'string-similarity'
import { WeeklyExcelQueries } from "../../services/admin/weeklyExcelQueries.js";
import { table } from "console";


import { fsync,unlink } from "fs";

import { createDateBasedIndex, createDriverMap } from "../../utils/excelHelperFns.js";
import { buildInsertData} from "../../utils/matchFns.js";
// printMatchSummary 

// import { AdminDashboardQueries } from "../../services/admin/dashboardQueries.js";

// const sheetName = "dup";
const sheetName = "result";
export const getUpdatedTempDashboardData = async(req,res)=>{
  const client = await pool.connect()
  try {
    client.query('BEGIN')
    const result = await ExcelFileQueries.getTempDashboardData(client)
    client.query('COMMIT')
    return res.status(statusCode.OK).json({success:true,data:result})
  } catch (error) {
    console.error(error)
    client.query('ROLLBACK')
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({message:'error in server',error})
  }
  finally{
    client.release()
  }
}

export const DailyExcelUpload = async (req, res) => {
  const client = await pool.connect()
  try {
    console.log(req.body,'dated')
   if(!req.file) {
        return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:'NO file uploaded'})
    }
    const fileName = req.file
 

    // console.log("fileuploaded",req.file.filename);
    const workbook = XLSX.readFile(fileName.path);
    // const workbook = XLSX.readFile(fileData.path);
    // console.log(workbook.SheetNames())
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return res.status(400).json({ error: "Sheet named ... not found" });
    }
    const rows = XLSX.utils.sheet_to_json(sheet);

      console.log(rows[20])
    
    // const now = new Date()
    // const dd = String(now.getDate()).padStart(2,'0');
    // const mm = String(now.getMonth()).padStart(2,'0');
    const tableName = `todays_excel_data`;

    await client.query('BEGIN');

    await ExcelFileQueries.deleteIfTableAlreadyExists(tableName,client)
    await ExcelFileQueries.createDailyTable(tableName,client);
    await ExcelFileQueries.insertDataIntoDailyTable(tableName,rows,client)
    await ExcelFileQueries.mergeDeliveriesAndExcelData(client)
    await ExcelFileQueries.setUntouchedRowsAsNoScannedAndUpdateFailedAttempt(client)
    await ExcelFileQueries.updateFirstStopAndDoubleStop(client)
    await ExcelFileQueries.addEachDriversCount(client)
    // throw new Error("error")
    await client.query('COMMIT')
     unlink(fileName.path,(e)=>{
      if(e) throw new Error(e)
        console.log('excel file deleted')
     })
    return res.status(statusCode.OK).json({ message: "code endeddd" });
  } catch (error) {
    console.error(error)
    await client.query('ROLLBACK')
    console.log('Tracsaction method failed in file controller')
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({message:'Error Occured while processing Excel'})
  }
  finally{
     client.release()
  }
};

// export const updateDriverPayment = async (req,res)=>{
//   try {
//     await AdminDashboardQueries.updatePaymentTable()
    
//   } catch (error) {
    
//   }
// }
// export default fileUpload





  




      
