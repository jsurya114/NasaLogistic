import pool from "../../config/db.js";

// ✅ Insert Journey
export const insertJourney = async (data) => {
  const { driver_id, route_id, packages, start_seq, end_seq, journey_date } = data;

  if (!journey_date) {
    console.error("❌ journey_date is required but not provided");
    return { 
      success: false, 
      message: "journey_date is required", 
      error: "Missing journey_date parameter" 
    };
  }

  try {
    const query = `
      INSERT INTO dashboard_data 
        (driver_id, journey_date, route_id, packages, start_seq, end_seq)
      VALUES ($1, $2, $3, $4, $5,$6)
      RETURNING 
        id,
        driver_id,
        TO_CHAR(journey_date, 'YYYY-MM-DD') as journey_date,
        route_id,
        packages,
        start_seq,
        end_seq;
    `;
    const values = [driver_id, journey_date, route_id, packages, start_seq, end_seq];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("❌ insertJourney failed:", error.message);
    return { 
      success: false, 
      message: "Error inserting journey", 
      error: error.message,
      detail: error.detail 
    };
  }
};

// ✅ Check for Sequence Conflicts
// export const checkSequenceConflict = async (route_id, start_seq, end_seq, journey_date) => {
//   try {
//     const query = `
//       SELECT * FROM dashboard_data
//       WHERE route_id = $1
//         AND journey_date = $4
//         AND $2 <= end_seq
//         AND $3 >= start_seq;
//     `;
//     const values = [route_id, start_seq, end_seq, journey_date];
//     const result = await pool.query(query, values);
//     return result.rows;
//   } catch (error) {
//     console.error("❌ checkSequenceConflict failed:", error.message);
//     return [];
//   }
// };

export const checkSequenceConflict = async (route_id, start_seq, end_seq, journey_date, excludedId = null) => {
  try {
    let query = `
      SELECT id, start_seq, end_seq, route_id, driver_id 
      FROM dashboard_data
      WHERE route_id = $1
        AND journey_date = $4::date
        AND $2 <= end_seq
        AND $3 >= start_seq
    `;
    
    const values = [route_id, start_seq, end_seq, journey_date];

    // If updating, exclude the current journey ID from the check
    if (excludedId) {
      query += ` AND id != $5`;
      values.push(excludedId);
    }

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("❌ checkSequenceConflict failed:", error.message);
    // Throwing error so controller knows validation actually failed technically
    throw error; 
  }
};

// ✅ Get Today’s Journey
export const getTodayJourney = async (driver_id) => {
  try {
    const query = `
      SELECT 
        d.id,
        d.driver_id, 
        TO_CHAR(d.journey_date, 'YYYY-MM-DD') as journey_date,
        d.route_id, 
        d.packages, 
        d.start_seq, 
        d.end_seq,
        r.name AS route_name
      FROM dashboard_data d
      JOIN routes r ON d.route_id = r.id
      WHERE driver_id = $1 AND journey_date = CURRENT_DATE
      ORDER BY d.start_seq ASC;
    `;
    const result = await pool.query(query, [driver_id]);
    console.log(result.rows,'journey data of driver')
    return result.rows;
  } catch (error) {
    console.error("❌ getTodayJourney failed:", error.message);
    return { success: false, message: "Error fetching today's journey", error: error.message };
  }
};

// ✅ Add Deliveries by Sequence Range
export const addRangeOfSqeunceToDeliveries = async (driver_id, route_id, start_seq, end_seq, dashboard_data_id) => {
  try {
    const query = `
      INSERT INTO deliveries (
          driver_id,
          driver_set_date,
          route_id,
		  sequence_number,
		  seq_route_code,
          dashboard_data_id
      )
      SELECT
          $1 AS driver_id,
          CURRENT_DATE AS driver_set_date,
          r.id AS route_id,
          seq AS sequence_number,
          seq || '-' || r.route_code_in_string AS seq_route_code,
          $5 AS dashboard_data_id
      FROM generate_series($3::int, $4::int) AS seq
      JOIN routes r ON r.id = $2
      RETURNING *;
    `;

    const values = [Number(driver_id), Number(route_id), Number(start_seq), Number(end_seq), Number(dashboard_data_id)];
    const result = await pool.query(query, values);
    return result.rows;

  } catch (error) {
    console.error("❌ addRangeOfSqeunceToDeliveries failed:", error.message);
    return { success: false, message: "Error inserting deliveries", error: error.message };
  }
};


// export const updateSeqRouteCodeToDeliveriesTable = async ()=>{
//     try {
//       const query = ` UPDATE deliveries d
//         SET seq_route_code = d.sequence_number || '-' || r.route_code_in_string
//         FROM routes r
//         WHERE d.route_id = r.id;
//       `
//       await pool.query(query)
//     } catch (error) {
//       console.error(error,'error in updation seq_route_code for deliveries table')
//     }
// }

// ✅ Mark No Address as No Scanned
export const markNoAddressAsNoScanned = async () => {
  try {
    const query = `
      UPDATE deliveries
      SET status = 'no_scanned'
      WHERE address = 'No_Address' AND recp_name = 'Unknown Recipient';
    `;
    await pool.query(query);
  } catch (error) {
    console.error("❌ markNoAddressAsNoScanned failed:", error.message);
  }
};





// ✅ Sync Deliveries when Journey is Updated
export const syncJourneyDeliveries = async (journey_id, driver_id, route_id, start_seq, end_seq, journey_date) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Prune: Delete deliveries that are no longer in the new Sequence Range
    // (e.g., if range changed from 10-20 to 10-15, delete 16-20)
    const deleteQuery = `
      DELETE FROM deliveries 
      WHERE dashboard_data_id = $1 
      AND (sequence_number < $2 OR sequence_number > $3)
    `;
    await client.query(deleteQuery, [journey_id, start_seq, end_seq]);

    // 2. Update: Update Driver, Route, and Recalculate seq_route_code for existing rows
    // This ensures if driver or route changed, the existing deliveries reflect that.
    const updateQuery = `
      UPDATE deliveries d
      SET 
        driver_id = $1, 
        route_id = $2,
        seq_route_code = d.sequence_number || '-' || r.route_code_in_string
      FROM routes r
      WHERE d.dashboard_data_id = $3 
      AND r.id = $2
    `;
    await client.query(updateQuery, [driver_id, route_id, journey_id]);

    // 3. Insert: Add new deliveries for any "Missing" sequences in the new range
    // (e.g., if range changed from 10-20 to 10-25, insert 21-25)
    // We use generate_series and NOT EXISTS to only insert what is missing.
    const insertQuery = `
      INSERT INTO deliveries (
          driver_id,
          driver_set_date,
          route_id,
          sequence_number,
          seq_route_code,
          dashboard_data_id
      )
      SELECT
          $1 AS driver_id,
          $5::date AS driver_set_date,
          r.id AS route_id,
          seq AS sequence_number,
          seq || '-' || r.route_code_in_string AS seq_route_code,
          $6 AS dashboard_data_id
      FROM generate_series($3::int, $4::int) AS seq
      JOIN routes r ON r.id = $2
      WHERE NOT EXISTS (
          SELECT 1 FROM deliveries d 
          WHERE d.dashboard_data_id = $6 
          AND d.sequence_number = seq
      );
    `;
    
    await client.query(insertQuery, [
      driver_id, 
      route_id, 
      start_seq, 
      end_seq, 
      journey_date, 
      journey_id
    ]);

    await client.query('COMMIT');
    return { success: true };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ syncJourneyDeliveries failed:", error.message);
    throw new Error(`Failed to sync deliveries: ${error.message}`);
  } finally {
    client.release();
  }
};
