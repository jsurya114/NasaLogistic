import pool from "../../config/db.js";

export const ExcelFileQueries = {
  createDailyTable: async (tableName,client) => {
    try {
      await client.query(`
                CREATE TABLE ${tableName}(
                        id SERIAL PRIMARY KEY,
                        route TEXT,
                        sequence INT,
                        address TEXT,
                        unit TEXT,
                        zipcode INT,
                        tracking_no TEXT,
                        recipient_name TEXT,
                        recipient_phone TEXT,
                        status TEXT,
                        complete_time TIMESTAMP,
                        seq_route_code TEXT,
                        upload_date DATE
                )
            `);
      console.log(`✅ Table ${tableName} created successfully`);
    } catch (error) {
      console.error("❌ Error creating table:", error);
      throw error

    }
  },

  insertDataIntoDailyTable: async (tableName, data,client) => {
    try {
      if (!data || data.length === 0) {
        console.log("⚠️ No data to insert");
        return;
      }

      const values = [];
      const placeholders = [];
      data.forEach((row, i) => {
        const idx = i * 12; // 11 columns now (10 + new seq_route_code)
        placeholders.push(
          `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5},
                      $${idx + 6}, $${idx + 7}, $${idx + 8}, $${idx + 9}, $${
            idx + 10
          }, $${idx + 11}, $${idx + 12} )`
        );

        // Remove first 4 chars of route
        const routeModified = row.Route ? row.Route.substring(4) : null;
        const dateFromRoute = `${new Date().getFullYear()}-${row.Route[0]}${row.Route[1]}-${row.Route[2]}${row.Route[3]}`

        values.push(
          row.Route,
          row.Sequence,
          row.Address,
          row.Unit || null,
          Number(row.ZipCode),
          row.TrackingNo,
          row.RecipientName,
          row.RecipientPhone,
          row.Status,
          row.CompleteTime ? new Date(row.CompleteTime) : null,
          `${row.Sequence}${routeModified}`,
          new Date(dateFromRoute)
        );
      });
      console.log(values[0],values[1],values.length,'valleeues')

      const query = `
              INSERT INTO ${tableName} (
                route, sequence, address, unit, zipcode,
                tracking_no, recipient_name, recipient_phone,
                status, complete_time, seq_route_code,upload_date
              ) VALUES ${placeholders.join(", ")}
            `;

      await client.query(query, values);
      console.log(
        `✅ Successfully inserted ${data.length} rows into ${tableName}`
      );
    } catch (error) {
      console.error("❌ Error inserting daily data:", error);
      throw error

    }
  },

  deleteIfTableAlreadyExists: async (tableName,client) => {
    try {
      await client.query(`
                DROP TABLE IF EXISTS ${tableName}
            `);
      console.log(`✅ Table ${tableName} deleted`);
    } catch (error) {
      console.error(error);
      throw error

    }
  },

  mergeDeliveriesAndExcelData: async (client) => {
    try {
      await client.query(`
    UPDATE deliveries d
    SET
    address = e.address,
    address_unit = e.unit,
    zip_code = e.zipcode,
    courier_code = e.tracking_no,
    recp_name = e.recipient_name,
    recipient_phone = e.recipient_phone,
    status = e.status
    
    FROM todays_excel_data e, todays_excel_data u

    WHERE d.seq_route_code = e.seq_route_code AND DATE(u.upload_date)= DATE(d.driver_set_date) ;

                `);
      console.log("table merged");
    } catch (error) {
      throw error

    }
  },


  setUntouchedRowsAsNoScannedAndUpdateFailedAttempt : async (client)=>{
    try {

      // const queryStr = `
      //       UPDATE deliveries d
      //       SET final_result = 'no_scanned'
      //       WHERE address ='No_Address' AND zip_code = 0 AND recp_name = 'Unknown Recipient';
      //       `
      const queryStr = `
      UPDATE deliveries
     SET final_result = CASE
     WHEN status = 'FAILED_ATTEMPT' THEN 'failed_attempt'
     WHEN status = 'Pending'
          AND address = 'No_Address'
          AND recp_name = 'Unknown Recipient'
       THEN 'no_scanned'
     WHEN status = 'NEW' THEN 'no_scanned'
     ELSE final_result
     END;
     `
        await client. query(queryStr)
        console.log('updated noscanned and failed attempts..')
    } catch (error) {
      throw error

    }
  },

  addEachDriversCount :async(client)=>{
    try {
      // const queryStr =   `
      
      // UPDATE dashboard_data d
      // SET no_scanned = sub.no_scanned_count
      // FROM (
      //   SELECT driver_id, COUNT(*) AS no_scanned_count
      //   FROM deliveries
      //   WHERE final_result = 'no_scanned'
      //   GROUP BY driver_id
      //   ) AS sub
      //   WHERE d.driver_id = sub.driver_id;
        
        
      //   `
      const queryStr = `UPDATE 	
      	dashboard_data d
      SET
      	no_scanned = sub.no_scanned_count,
      	failed_attempt = sub.failed_attempt_count,
        ds = sub.double_stop_count,
        first_stop = sub.first_stop_count,
        delivered = sub.first_stop_count + sub.double_stop_count,
        is_deliveries_count_added = true

      FROM (
          SELECT driver_id,
        	COUNT (*) FILTER (WHERE final_result = 'no_scanned') AS no_scanned_count,
      		COUNT (*) FILTER (WHERE final_result = 'failed_attempt') AS failed_attempt_count,
          COUNT (*) FILTER (WHERE final_result = 'first_stop') AS first_stop_count,
          COUNT (*) FILTER (WHERE final_result = 'double_stop') AS double_stop_count
              FROM deliveries
          GROUP BY driver_id
      ) AS sub
      WHERE d.driver_id = sub.driver_id AND d.is_deliveries_count_added = false;`
        await client.query(queryStr  )
    } catch (error) {
        console.error(error)
      throw error

    }
  },
//   addEachDriverFailedAttempt:async()=>{

//     try {
//       const query = `
//           UPDATE dashboard_data d
// SET no_scanned = sub.no_scanned_count
// FROM (
//     SELECT driver_id, COUNT(*) AS no_scanned_count
//     FROM deliveries
//     WHERE final_result = 'no_scanned'
//     GROUP BY driver_id
// ) AS sub
// WHERE d.driver_id = sub.driver_id;    
//       `
//     } catch (error) {
      
//     }
//   },

  getTempDashboardData:async(client)=>{
    try {
       const res =  await client.query(`
            select
             d.name,dd.journey_date ,
             r.name as route,
              dd.start_seq||' - '||dd.end_seq as sequence,
              dd.packages, 
              dd.no_scanned, 
              dd.failed_attempt,
               dd.ds,
               dd.delivered 
            from
                dashboard_data dd 
            join 
                routes r on dd.route_id = r.id
            join 
                drivers d on d.id = dd.driver_id
            where
                dd.journey_date between CURRENT_DATE - INTERVAL '1 day' and CURRENT_DATE;

            `)
            return res.rows
    } catch (error) {
        console.error(error)
      throw error

    }
  },
  updateFirstStopAndDoubleStop:async(client)=>{
    try {
      const queryStr = `WITH ranked AS (
    SELECT
        unique_id,
        driver_id,
        address,
        address_unit,
        ROW_NUMBER() OVER (
            PARTITION BY driver_id,
                address,
                recp_name,
                COALESCE(NULLIF(address_unit, ''), '##NO_UNIT##')
            ORDER BY address
        ) AS rn,
        COUNT(*) OVER (
            PARTITION BY driver_id,
                address,
                COALESCE(NULLIF(address_unit, ''), '##NO_UNIT##')
        ) AS cnt
    FROM deliveries
    WHERE final_result = 'not_assigned'
    )
    UPDATE deliveries d
    SET final_result = CASE 
            WHEN r.cnt = 1 THEN 'first_stop'::final_result_enum        -- no duplicates
            WHEN r.rn = 1 THEN 'first_stop'::final_result_enum        -- first of duplicates
            ELSE 'double_stop' :: final_result_enum                      -- subsequent duplicates
        END
    FROM ranked r
    WHERE d.unique_id = r.unique_id;
    `

      await client.query(queryStr)
      console.log('updated table with doublestop and first stop')
    } catch (error) {
      console.error(error)
      throw error
    }
  }
};



// 5586	61	"2025-07-20"	28	58	"2121 Handley Dr Apt 1,Fort Worth,TX,76112,USA"	76112	"Christina McCorkle"	"2142545742"	"DELIVERED"	"SPXDFW056753887887"	"1"	"58-DFW 036-1"	"double_stop"
// 5587	61	"2025-07-20"	28	59	"2121 Handley Dr Apt 1,Fort Worth,TX,76112,USA"	76112	"Rayen Mccorkle"	"6828007565"	"DELIVERED"	"SPXDFW056753866091"	"1"	"59-DFW 036-1"	"first_stop"
