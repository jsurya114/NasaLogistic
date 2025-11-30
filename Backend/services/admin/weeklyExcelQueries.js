import pool from "../../config/db.js";

        export const WeeklyExcelQueries={
            fetchDashboardDataByDates : async(dates)=>{
                const selectQuery=`SELECT 
            dd.id AS dashboard_id,
            dd.journey_date,
            d.name,
            r.name AS route_name, 
            dd.start_seq,
            dd.end_seq,
            dd.packages,
            dd.delivered,
            dd.ds,
            dd.no_scanned,
            dd.failed_attempt
        FROM dashboard_data dd
        JOIN drivers d ON dd.driver_id = d.id
        JOIN routes r ON dd.route_id = r.id
        WHERE journey_date = ANY($1)`        
        const res= await pool.query(selectQuery,[dates]);
        return res.rows;
            },

        createWeeklyTable:async(table_name)=>{
        try {
            await pool.query(`
                        CREATE TABLE ${table_name} (
                          id SERIAL PRIMARY KEY,
                          courier_name VARCHAR(100) NOT NULL,
                          driver_id INT NOT NULL,
                          del_route VARCHAR(100),
                          total_deliveries INT DEFAULT 0,
                          fs INT DEFAULT 0,
                          ds INT DEFAULT 0,
                          del_date DATE NOT NULL,
                          CONSTRAINT weeklycount_unique UNIQUE (driver_id, del_date, del_route)
                      );
                    `);
            console.log(`✅ Table ${table_name} created successfully`);
            } catch (error) {
            console.error("❌ Error creating table:", error);
            }
        },

        deleteWeeklyTableIfExists: async (table_name) => {
        try {
      await pool.query(`
                DROP TABLE IF EXISTS ${table_name}
            `);
      console.log(`✅ Table ${table_name} deleted`);
    } catch (error) {
      console.error(error);
    }
  },

  // tableCheckQuery:async()=>{
  //   const tableCheckQuery = `
  //           SELECT EXISTS (
  //               SELECT 1 FROM information_schema.tables 
  //               WHERE table_schema = 'public' 
  //               AND table_name = 'weeklycount'
  //           ) AS table_exists;
  //       `;

  //       const tableCheckResult = await pool.query(tableCheckQuery);
  //       const tableExists = tableCheckResult.rows[0].table_exists;
  // },

  insertBatchDatafromExcel:async(insertPlaceholders,insertValues)=>{

    let insertQuery=`
    INSERT INTO weekly_excel_data
    (orig_name, match_name, date, deliveries, fullStop, doubleStop, route, start_seq,end_seq, ambiguous,failedAttempt)
    VALUES ${insertPlaceholders.join(",")}
    RETURNING *`;

   let res=await pool.query(insertQuery ,insertValues);
   return res.rows;
  },

  getWeeklyData: async () => {
  try {
    // Check if table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'weeklycount'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      return { exists: false, data: [] };
    }
    
    // Table exists, fetch data
    const res = await pool.query(`
      SELECT * FROM weeklycount 
      ORDER BY del_date DESC
    `);
    
    return { exists: true, data: res.rows };
    
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    throw error;
  }
},

  UpdateWeeklyTempToDashboard : async()=>{
         const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const tempData = await WeeklyExcelQueries.getWeeklyData();
    
    if (!tempData.exists || tempData.data.length === 0) {
      await client.query('ROLLBACK');
      return { 
        success: false, 
        message: 'No weekly data found to process' 
      };
    }
    
    // Dashboard update
    const dashboardUpdate = await client.query(`
      WITH matched_weekly AS (
        SELECT 
          we.match_name,
          we.date as journey_date,
          we.deliveries,
          we.fullstop,
          we.doublestop,
          we.route,
          we.start_seq,
          we.end_seq,
          we.no_scanned,
          we.failedattempt,
          d.id as driver_id,
          r.id as route_id
        FROM weekly_excel_data we
        INNER JOIN drivers d ON d.name = we.match_name
        INNER JOIN routes r ON r.name = we.route
      )
      UPDATE dashboard_data dd
      SET 
        packages = mw.deliveries,
        no_scanned = COALESCE(mw.no_scanned, 0),
        failed_attempt = COALESCE(mw.failedattempt, 0),
        ds = COALESCE(mw.doublestop, 0),
        delivered = COALESCE(mw.fullstop, 0) + COALESCE(mw.doublestop, 0),
        start_seq = mw.start_seq,
        end_seq = mw.end_seq,
        first_stop = COALESCE(mw.fullstop, 0)
      FROM matched_weekly mw
      WHERE dd.driver_id = mw.driver_id 
        AND dd.journey_date = mw.journey_date
        AND dd.route_id = mw.route_id
        AND dd.closed = false
        AND dd.paid = false
      RETURNING dd.id, dd.driver_id, dd.journey_date, dd.route_id, 
                dd.packages, dd.no_scanned, dd.failed_attempt, 
                dd.ds, dd.delivered, dd.first_stop
    `);
    
    if (dashboardUpdate.rows.length === 0) {
      await client.query('ROLLBACK');
      return { 
        success: false, 
        message: 'No matching open records found in dashboard_data to update' 
      };
    }
    
    // Payment update
    const paymentUpdate = await client.query(`
      UPDATE payment_dashboard pd
      SET 
        packages = dd.packages,
        no_scanned = COALESCE(dd.no_scanned, 0),
        failed_attempt = COALESCE(dd.failed_attempt, 0),
        ds = COALESCE(dd.ds, 0),
        fs = COALESCE(dd.first_stop, 0),
        delivered = COALESCE(dd.ds, 0) + COALESCE(dd.first_stop, 0),
        start_seq = dd.start_seq,
        end_seq = dd.end_seq,
        first_stop = dd.first_stop,
        driver_payment = ROUND(
          (COALESCE(dd.ds, 0) * COALESCE(r.driver_doublestop_price, 0)) + 
          (COALESCE(dd.first_stop, 0) * COALESCE(r.company_route_price, 0)),
          2
        )
      FROM dashboard_data dd
      JOIN routes r ON dd.route_id = r.id
      WHERE pd.dashboard_data_id = dd.id
        AND pd.paid = false
        AND pd.closed = false
        AND EXISTS (
          SELECT 1 FROM weekly_excel_data we
          INNER JOIN drivers d ON d.name = we.match_name
          WHERE dd.driver_id = d.id 
            AND dd.journey_date = we.date
        )
      RETURNING pd.id, pd.driver_id, pd.journey_date, pd.driver_payment, pd.dashboard_data_id
    `);
    
    await client.query('COMMIT');
    
    return {
      success: true,
      message: 'Data updated successfully',
    //   dashboardRecords: dashboardUpdate.rows.length,
    //   paymentRecords: paymentUpdate.rows.length,
      updatedDashboard: dashboardUpdate.rows,
      updatedPayments: paymentUpdate.rows
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating dashboard from weekly data:', error);
    throw error;
  } finally {
    client.release();
  }
     },

     processWeeklyData: async () => {
  try {
    // Step 1: Update dashboards and payments
    const result = await WeeklyExcelQueries.UpdateWeeklyTempToDashboard();
    
    if (!result.success) {
      return result;
    }
    
    // Step 2: Delete weekly temp data after successful update
    await WeeklyExcelQueries.deleteWeeklyData();
    
    return {
      ...result,
      message: 'Weekly data processed and cleared successfully'
    };
    
  } catch (error) {
    console.error('Error processing weekly data:', error);
    throw error;
  }
},

// Delete weekly data after successful update
deleteWeeklyData: async () => {
  try {
    await pool.query('DROP TABLE IF EXISTS weekly_excel_data CASCADE');
    return { success: true, message: 'Weekly data cleared' };
  } catch (error) {
    console.error('Error deleting weekly data:', error);
    throw error;
  }
},



  // createEntriesFromWeeklyCount:async()=>{
  //   try{
  //        let res=await pool.query(`
  //         INSERT INTO dashboard_data (
  //                         driver_id,
  //                         journey_date,
  //                         route_id,
  //                         packages,
  //                         first_stop,
  //                         ds,
  //                         delivered,
  //                         driver_payment,
  //                         closed,
  //                         paid
  //                     )
  //       SELECT 
  //           d.id AS driver_id,
  //           wc.del_date AS journey_date,
  //           r.id AS route_id,
  //           wc.total_deliveries AS packages,
  //           wc.fs AS first_stop,
  //           wc.ds AS ds,
  //           wc.total_deliveries AS delivered,  -- Assuming all packages are delivered
  //           ((wc.fs * r.driver_route_price) + (wc.ds * r.driver_doublestop_price)) AS driver_payment,
  //           false AS closed,
  //           false AS paid
  //           FROM 
  //               weeklycount wc
  //           INNER JOIN 
  //               drivers d ON wc.driver_id = d.driver_code
  //           LEFT JOIN 
  //               city c ON SUBSTRING(wc.del_route FROM '^[A-Za-z]+') = c.city_code
  //           INNER JOIN 
  //               routes r ON LTRIM(SUBSTRING(wc.del_route FROM '\d+$'), '0') = r.name
  //                       AND r.job = c.job
  //                       AND r.enabled = true
  //           WHERE 
  //               d.enabled = true
  //               AND r.id IS NOT NULL  -- Only insert where route is found
  //           ON CONFLICT DO NOTHING;  -- Prevents duplicates if you run it multiple times`);
  //           console.log("Query completed and data inserted");
  //           return res.rows;
  //   }catch(err){
  //       console.error('Error inserting dashboard from weekly data:', err);
  //   throw err;
  //   }
  // }


//   createEntriesFromWeeklyCount: async () => {

//     console.log("⏳ Starting dashboard_data insertion...");
//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');

//     const insertQuery = `
//       WITH inserted AS (
//         INSERT INTO dashboard_data (
//           driver_id, journey_date, route_id, packages, first_stop, ds, delivered,
//           driver_payment, closed, paid, is_deliveries_count_added
//         )
//         SELECT 
//           d.id AS driver_id,
//           wc.del_date AS journey_date,
//           r.id AS route_id,
//           wc.total_deliveries AS packages,
//           wc.fs AS first_stop,
//           wc.ds AS ds,
//           wc.total_deliveries AS delivered,
//           ((wc.fs * r.driver_route_price) + (wc.ds * r.driver_doublestop_price)) AS driver_payment,
//           FALSE, FALSE, FALSE
//         FROM weeklycount wc
//         INNER JOIN drivers d ON wc.driver_id = d.driver_code
//         LEFT JOIN city c ON SUBSTRING(wc.del_route FROM '^[A-Za-z]+') = c.city_code
//         INNER JOIN routes r 
//           ON LTRIM(SUBSTRING(wc.del_route FROM '\\d+$'), '0') = r.name
//          AND r.job = c.job
//          AND r.enabled = TRUE
//         WHERE d.enabled = TRUE
//         ON CONFLICT DO NOTHING
//         RETURNING id, packages, first_stop, ds, delivered, driver_payment, closed, paid
//       )
//       UPDATE payment_dashboard pd
//       SET 
//         packages = i.packages,
//         fs = i.first_stop,
//         ds = i.ds,
//         delivered = i.delivered,
//         driver_payment = i.driver_payment,
//         closed = i.closed,
//         paid = i.paid
//       FROM inserted i
//       WHERE pd.dashboard_data_id = i.id
//       RETURNING i.id;
//     `;

//     const result = await client.query(insertQuery);

//     console.log(`✅ Inserted or updated ${result.rowCount} rows in dashboard_data/payment_dashboard`);

//     await client.query('COMMIT');
//     return result.rowCount;
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error("❌ Error in createEntriesFromWeeklyCount:", err);
//     throw err;
//   } finally {
//     client.release();
//   }
// },

createEntriesFromWeeklyCount: async () => {
  console.log("⏳ Starting dashboard_data insertion...");
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // QUERY 1: Insert into dashboard_data (triggers the function)
    const insertQuery = `
      INSERT INTO dashboard_data (
        driver_id, journey_date, route_id, packages, first_stop, ds, delivered,
        driver_payment, closed, paid, is_deliveries_count_added
      )
      SELECT 
        d.id AS driver_id,
        wc.del_date AS journey_date,
        r.id AS route_id,
        wc.total_deliveries AS packages,
        wc.fs AS first_stop,
        wc.ds AS ds,
        wc.total_deliveries AS delivered,
        ((wc.fs * r.driver_route_price) + (wc.ds * r.driver_doublestop_price)) AS driver_payment,
        FALSE, FALSE, FALSE
      FROM weeklycount wc
      INNER JOIN drivers d ON wc.driver_id = d.driver_code
      LEFT JOIN city c ON SUBSTRING(wc.del_route FROM '^[A-Za-z]+') = c.city_code
      INNER JOIN routes r 
        ON LTRIM(SUBSTRING(wc.del_route FROM '\\d+$'), '0') = r.name
       AND r.job = c.job
       AND r.enabled = TRUE
      WHERE d.enabled = TRUE
       AND NOT EXISTS (
          SELECT 1 FROM dashboard_data dd
          WHERE dd.driver_id = d.id
            AND dd.journey_date = wc.del_date
            AND dd.route_id = r.id
        )
      RETURNING id
    `;

    const insertResult = await client.query(insertQuery);
    const insertedIds = insertResult.rows.map(row => row.id);

    console.log(`✅ Inserted ${insertResult.rowCount} rows into dashboard_data`);
    console.log(`⏳ Trigger function has created payment_dashboard entries...`);

    // QUERY 2: Update payment_dashboard with business logic
    // Only update the newly inserted records
    const updateQuery = `
      UPDATE payment_dashboard pd
      SET 
        packages = dd.packages,
        fs = dd.first_stop,
        ds = dd.ds,
        delivered = dd.delivered,
        driver_payment = dd.driver_payment,
        closed = dd.closed,
        paid = dd.paid
      FROM dashboard_data dd
      WHERE pd.dashboard_data_id = dd.id
        AND dd.id = ANY($1)
      RETURNING pd.id
    `;

    const updateResult = await client.query(updateQuery, [insertedIds]);

    console.log(`✅ Updated ${updateResult.rowCount} rows in payment_dashboard`);

    await client.query('COMMIT');

    return {
      inserted: insertResult.rowCount,
      updated: updateResult.rowCount,
      totalAffected: insertResult.rowCount
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Error in createEntriesFromWeeklyCount:", err);
    throw err;
  } finally {
    client.release();
  }
},
  
}