import statusCode from "../../utils/statusCodes.js";
import { dbService } from "../../services/admin/dbQueries.js";
import { generateToken } from "../../services/jwtservice.js";
import HttpStatus from "../../utils/statusCodes.js";
import XLSX from "xlsx";
import XlsxPopulate from 'xlsx-populate';
import { ExcelFileQueries } from "../../services/admin/excelFileQueries.js";
import { formatExcelDate } from "../../utils/helper.js";
import { table } from "console";
import stringSimilarity from 'string-similarity'
import { WeeklyExcelQueries } from "../../services/admin/weeklyExcelQueries.js";
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


        // const DataObj = {}
        // for(let row of rows){
        //     const str2 = row['Route'].slice(4)
        //     const str1 = row["Sequence"]
        //     const res = str1+str2
        //     // console.log(res)
        //     DataObj[res] = {
        //       'address':row['Address'],
        //         'zip_code':row['ZipCode'],
        //         'courier_code':row['TrackingNo'],
        //         'recp_name':row['RecipientName'],
        //         'recipient_phone':row['RecipientPhone'],
        //         'status':row['Status'],
        //         'address_unit':row['Unit']??'',
        //     }        }
        
        // console.log(DataObj)
   
            // rows = null  
    // console.log(rows[0], rows[1], rows.length);
    // console.log(rows);
    // const routes = rows.reduce((a, e) => {
    //   e["Route"] = e["Route"].slice(5);
    //   e["Route"] = RouteObj[e["Route"]];
    //   if (a[e["Route"]]) a[e["Route"]] += 1;
    //   else a[e["Route"]] = 1;
    //   return a;
    // }, {});
    // console.log(routes, "routes      ");

    // const dashData = await dbService.getDashboardData();
    // dashData.forEach(item=>item['seqCount'] = item['end_seq']-item['start_seq']+1)
    // console.log(dashData, "dashData");
    
    return res.status(statusCode.OK).json({ message: "code endeddd" });
  } catch (error) {
    console.error(error)
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({message:'Error Occured while processing Excel'})
  }
};




// export default fileUpload


export const weeklyExcelUpload=async(req,res)=>{
  const file=req.file;  
  if(!file)
     return res.status(400).json({success:false,message:'NO file uploaded'});

   const workbook = await XlsxPopulate.fromFileAsync(file.path);
    const values = workbook.sheet("Driver Daily Summary").usedRange().value();
     const excelData = values
      .map((row, i) => {
        if (i === 0 || i === 1) return null;
        return {
          name: row[1]?.trim(),
          date: row[2],       
          deliveries: row[6] || 0,
          fullStop: row[10] || 0,
          doubleStop: row[12] || 0,
        };
      })
      .filter(Boolean);

      if(!excelData)
        return res.status(HttpStatus.BAD_REQUEST).json({success: false, message: "No valid rows found in Excel"});

      const formattedData=excelData.map((d)=>({
        ...d,
        date:formatExcelDate(d.date),
      }));

      const dates=formattedData.map((d)=>`${d.date}`).join(",");
      const dashboardData= await WeeklyExcelQueries(dates);

      const normalizedDrivers = new Map(
      dashboardData.map(d => [
        `${d.name.toLowerCase()}|${d.journey_date.toISOString().slice(0, 10)}`,d]));

      const insertValues = [];
      const insertPlaceholders = [];

      formattedData.forEach((row, i) => {
    // direct case-insensitive + date key
    let dashRecord = normalizedDrivers.get(`${row.name.toLowerCase()}|${row.date}`);

    if (!dashRecord) {     
      const candidates = dashboardData
        .filter(d => d.journey_date.toISOString().slice(0, 10) === row.date)
        .map(d => d.name.toLowerCase());  

      if (candidates.length > 0) {
        const bestMatch = stringSimilarity.findBestMatch(row.name.toLowerCase(), candidates);
        const match = bestMatch.bestMatch.target;
        const score = bestMatch.bestMatch.rating;

        if (score >= 0.8) {
          dashRecord = normalizedDrivers.get(`${match}|${row.date}`);
        }
      }
      }

      const ambiguous = !dashRecord;

      insertValues.push(
        row.name,                     // original_name
        dashRecord?.name || null,     // matched_name
        row.date,                     // date
        row.deliveries,
        row.fullStop,
        row.doubleStop,
        dashRecord?.route_name || null,
        dashRecord?.start_seq || null,
        dashRecord?.end_seq || null,
        ambiguous
      );

      const baseIndex = i * 9;
      insertPlaceholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9})`
      );
        }) 

        let tableName="weekly_excel_data";
        await WeeklyExcelQueries.deleteWeeklyTableIfExists(tableName);
        await WeeklyExcelQueries.createWeeklyTable(tableName);

      }
  

