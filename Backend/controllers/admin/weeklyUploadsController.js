import statusCode from "../../utils/statusCodes.js";
import { dbService } from "../../services/admin/dbQueries.js";
import { generateToken } from "../../services/jwtservice.js";
import pool from "../../config/db.js";
import HttpStatus from "../../utils/statusCodes.js";
import XLSX from "xlsx";
import ExcelJS from 'exceljs'
import moment from 'moment';

import { ExcelFileQueries } from "../../services/admin/excelFileQueries.js";
import { formatExcelDate,getLocalDateString } from "../../utils/helper.js";

import { WeeklyExcelQueries } from "../../services/admin/weeklyExcelQueries.js";

import { fsync,unlink } from "fs";

import { createDateBasedIndex, createDriverMap } from "../../utils/excelHelperFns.js";
import { buildInsertData} from "../../utils/matchFns.js";


export const getWeeklyTempData=async(req,res)=>{
  try{
    let data=await WeeklyExcelQueries.getWeeklyData();
      return res.status(HttpStatus.OK).json({data});
  }catch(err){
    console.error("Upload Error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// export const weeklyExcelUpload=async(req,res)=>{
//  try{ 
//   const file=req.file;  
//   if(!file)
//      return res.status(400).json({success:false,message:'NO file uploaded'});
//     console.log("File is ",req.file);
   
//     const workbook = XLSX.readFile(file.path);
//       const sheetName = "Driver Daily Summary";
//       const worksheet = workbook.Sheets[sheetName];

//       // Convert to JSON with formatted values
//       const data = XLSX.utils.sheet_to_json(worksheet, {
//         header: 1,
//         raw: false, // Get formatted strings instead of raw numbers
//       });

//       const excelData = data
//         .slice(2) // Skip first 2 header rows
//         .map(row => ({
//           name: row[1]?.toString().trim(),
//           date: row[2], // Will be the formatted date string
//           deliveries: parseInt(row[6]) || 0,
//           fullStop: parseInt(row[10]) || 0,
//           doubleStop: parseInt(row[12]) || 0,
//         }))
//         .filter(item => item.name); // Remove empty rows

//       if (!excelData || excelData.length === 0) {
//         return res.status(HttpStatus.BAD_REQUEST).json({
//           success: false, 
//           message: "No valid rows found in Excel"
//         });
//       }

//       const formattedData = excelData.map((d) => ({ 
//         ...d,
//         date: formatExcelDate(d.date),
//       }));

//       const dates = formattedData.map((d) => d.date);
//       const uniqueDates = [...new Set(dates)];

//       const dashboardData= await WeeklyExcelQueries.fetchDashboardDataByDates(uniqueDates);
//         if(!dashboardData)
//           return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:"No valid rows match thge data in driver entered journey"})

//         // console.log("Data from DB ",dashboardData);   

//         const normalizedDrivers = createDriverMap(dashboardData);
//         const driversByDate = createDateBasedIndex(dashboardData);

//         const { insertValues, insertPlaceholders, 
//           // matchResults 
//         } = buildInsertData(
//           formattedData,
//           normalizedDrivers,
//           driversByDate
//         );
//         // printMatchSummary(matchResults);

//         // console.log("\n=== INSERT DATA ===");
//         // console.log("Values:", insertValues);
//         // console.log("Placeholders:", insertPlaceholders);
//         let tableName="weekly_excel_data";
//         await WeeklyExcelQueries.deleteWeeklyTableIfExists(tableName);
//         await WeeklyExcelQueries.createWeeklyTable(tableName);

//          unlink(file.path,(e)=>{
//       if(e) throw new Error(e)
//         console.log('excel file deleted')
//      })
//         let insertedData = await WeeklyExcelQueries.insertBatchDatafromExcel(insertPlaceholders,insertValues);
        
//         return res.status(HttpStatus.OK).json({success:true,message:"Excel data processed and stored successfully",insertedData})
//       }catch(err){        
//         console.error("Upload Error:", err);
//         res.status(500).json({ success: false, message: "Internal server error" });  
//       }
//       }



    export const weeklyExcelUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Function to process Excel in batches
    async function processExcelInBatches(filePath, batchSize = 500) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet("Details of dlivery Fee");
      
      if (!worksheet) {
        console.error(`Sheet "${sheetName}" not found. Available sheets:`, Object.keys(workbook.Sheets));
        return;
      }
      
      const jsonData = [];
      worksheet.eachRow((row) => {
        jsonData.push(row.values.slice(1)); 
      });
      console.log(`Total rows in Excel (including header): ${jsonData.length}`);      
      
      // Remove header row
      // jsonData.shift();
      console.log(`Rows after removing header: ${jsonData.length}`);
      
      if (jsonData.length === 0) {
        console.log('No data rows found after header removal.');
        return;
      }

      // Map to accumulate aggregated data across batches
      const aggregatedData = new Map();
      let totalProcessed = 0;
      let totalSkipped = 0;
      let batchCount = 0;

      // Process in batches
      for (let i = 0; i < jsonData.length; i += batchSize) {
        batchCount++;
        const batch = jsonData.slice(i, i + batchSize);
        console.log(`Starting batch ${batchCount} (rows ${i + 1} to ${Math.min(i + batchSize, jsonData.length)}) - ${batch.length} rows in this batch`);

        for (let rowIndex = 0; rowIndex < batch.length; rowIndex++) {
          const row = batch[rowIndex];
          
          try {
            // Extract fields (confirm indices match your Excel)
            const regionRoute = (row[6] || '').toString().trim(); // Region/route
            const courier = (row[8] || '').toString().trim(); // Courier
            const deliveryId = parseInt(row[9]) || null; // Delivery ID
            const signingTime = (row[12] || '').toString().trim(); // Signing time
            const structuredAddress = (row[13] || '').toString().trim(); // Structured Address
            const stopPointDetails = (row[18] || '').toString().trim(); // STOP Point Details

            
            if (totalProcessed + totalSkipped < 3) {
              console.log(`Sample row ${totalProcessed + totalSkipped + 1}:`, { regionRoute, courier, deliveryId, signingTime, structuredAddress, stopPointDetails });
            }

            if (!deliveryId || !signingTime) {
              console.log(`Batch ${batchCount}, Row ${rowIndex + 1}: Skipping - Missing deliveryId (${deliveryId}) or signingTime ("${signingTime}")`);
              totalSkipped++;
              continue;
            }

            // Parse date
            const isValidDate = moment(signingTime, 'MM/DD/YYYY HH:mm:ss', true).isValid() || moment(signingTime, 'MM/DD/YYYY', true).isValid();
            if (!isValidDate) {
              console.log(`Batch ${batchCount}, Row ${rowIndex + 1}: Skipping - Invalid date: "${signingTime}"`);
              totalSkipped++;
              continue;
            }
            const delDate = moment(signingTime, ['MM/DD/YYYY HH:mm:ss', 'MM/DD/YYYY']).format('YYYY-MM-DD');

            // Determine address
            const address = structuredAddress.toUpperCase() || stopPointDetails;
            if (!address) {
              console.log(`Batch ${batchCount}, Row ${rowIndex + 1}: Skipping - No address: Structured("${structuredAddress}"), Stop("${stopPointDetails}")`);
              totalSkipped++;
              continue;
            }

            // Create key and aggregate
            const key = `${delDate}-${deliveryId}-${regionRoute}`;
            if (!aggregatedData.has(key)) {
              aggregatedData.set(key, {
                courier_name: courier,
                driver_id: deliveryId,
                del_route: regionRoute,
                del_date: delDate,
                total_deliveries: 0,
                fs: 0,
                ds: 0,
                addresses: new Map(),
              });
            }

            const entry = aggregatedData.get(key);
            entry.total_deliveries++;
            if (!entry.addresses.has(address)) {
              entry.addresses.set(address, 0);
              entry.fs++;
            } else {
              entry.ds++;
            }

            totalProcessed++;
          } catch (rowError) {
            console.error(`Batch ${batchCount}, Row ${rowIndex + 1}: Error processing row -`, rowError.message);
            totalSkipped++;
            continue; 
          }
        }
        
        console.log(`Batch ${batchCount} completed. Processed so far: ${totalProcessed}, Skipped: ${totalSkipped}`);
      }

      console.log(`\nFinal Summary: Total rows in file: ${jsonData.length}, Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Aggregated groups: ${aggregatedData.size}`);


       let tableName="weeklycount";
        await WeeklyExcelQueries.deleteWeeklyTableIfExists(tableName);
        await WeeklyExcelQueries.createWeeklyTable(tableName);
      // DB insert/update
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        let insertCount = 0;
        for (const [key, data] of aggregatedData) {
          const { courier_name, driver_id, del_route, del_date, total_deliveries, fs, ds } = data;
          await client.query(
            `INSERT INTO weeklycount (courier_name, driver_id, del_route, total_deliveries, fs, ds, del_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (driver_id, del_date, del_route)
             DO UPDATE SET
               total_deliveries = weeklycount.total_deliveries + EXCLUDED.total_deliveries,
               fs = weeklycount.fs + EXCLUDED.fs,
               ds = weeklycount.ds + EXCLUDED.ds`,
            [courier_name, driver_id, del_route, total_deliveries, fs, ds, del_date]
          );
          insertCount++;
        }
        await client.query('COMMIT');

        unlink(filePath,(e)=>{
      if(e) throw new Error(e)
        console.log('excel file deleted')
     });
        console.log(`DB: ${insertCount} records inserted/updated successfully.`);


      } catch (error) {
        await client.query('ROLLBACK');
        console.error('DB Error:', error);
      } finally {
        client.release();
      }
    }

    await processExcelInBatches(file.path, 500);
    res.status(200).json({ success: true, message: 'Upload and processing completed' });

  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



