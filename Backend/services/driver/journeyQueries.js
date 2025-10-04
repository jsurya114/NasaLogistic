// import { start } from "repl";
// import pool  from "../../config/db.js";
// export const insertJourney = async (data) => {
//   const { driver_id, route_id, packages, start_seq, end_seq } = data;

 

 
//   const query = `
//     INSERT INTO dashboard_data 
//       (driver_id, journey_date, route_id, packages, start_seq, end_seq)
//     VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
//     RETURNING *;
//   `;

//   const values = [driver_id, route_id, packages, start_seq, end_seq];

//   const result = await pool.query(query, values);
//   return result.rows[0];
// };
// export const checkSequenceConflict = async (route_id,start_seq,end_seq)=>{
//   const query = `
//     SELECT * FROM dashboard_data
//     WHERE 
//           route_id = $1
//     AND   journey_date=CURRENT_DATE
//     AND   $2 <= end_seq
//     AND   $3 >= start_seq;
//   `;
//   const values = [route_id,start_seq,end_seq]
//   const result = await pool.query(query,values)
//   return result.rows
// }
// export const getTodayJourney = async (driver_id) => {
//   const query = `
//     SELECT d.driver_id, d.journey_date, d.route_id, d.packages, d.start_seq, d.end_seq,r.name AS route_name
//     FROM dashboard_data d
//     JOIN routes r ON d.route_id = r.id
//     WHERE driver_id = $1 AND journey_date = CURRENT_DATE
//       ORDER BY d.start_seq ASC;
//   `;
//   const result = await pool.query(query, [driver_id]);
//   return result.rows;
// };

// export const addRangeOfSqeunceToDeliveries = async(driver_id,route_id,start_seq,end_seq)=>{
//   const query = `
//         INSERT INTO deliveries (
//             driver_id,driver_set_date,route_id,sequence_number)
//         SELECT 
//             $1 AS driver_id,
//             CURRENT_DATE AS driver_set_date,
//             $2 AS route_id,
//             seq AS sequence_number,
//         FROM generate_series($3,$4) AS seq 
//         RETURNING *;
//   `

//   const values = [driver_id,route_id,start_seq,end_seq];
//   const result = await pool.query(query,values)
//   return result.rows;
// }



import { start } from "repl";
import pool from "../../config/db.js";

export const insertJourney = async (data) => {
  const { driver_id, route_id, packages, start_seq, end_seq } = data;

  try {
    const query = `
      INSERT INTO dashboard_data 
        (driver_id, journey_date, route_id, packages, start_seq, end_seq)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [driver_id, route_id, packages, start_seq, end_seq];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("❌ insertJourney failed:", error.message);
    return { success: false, message: "Error inserting journey", error: error.message };
  }
};

export const checkSequenceConflict = async (route_id, start_seq, end_seq) => {
  try {
    const query = `
      SELECT * FROM dashboard_data
      WHERE route_id = $1
        AND journey_date = CURRENT_DATE
        AND $2 <= end_seq
        AND $3 >= start_seq;
    `;
    const values = [Number( route_id), start_seq, end_seq];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("❌ checkSequenceConflict failed:", error.message);
    return { success: false, message: "Error checking sequence conflict", error: error.message };
  }
};

export const getTodayJourney = async (driver_id) => {
  try {
    const query = `
      SELECT d.driver_id, d.journey_date, d.route_id, d.packages, d.start_seq, d.end_seq,
             r.name AS route_name
      FROM dashboard_data d
      JOIN routes r ON d.route_id = r.id
      WHERE driver_id = $1 
      ORDER BY d.start_seq ASC;
    `;
    const result = await pool.query(query, [driver_id]);
    return result.rows;
  } catch (error) {
    console.error("❌ getTodayJourney failed:", error.message);
    return { success: false, message: "Error fetching today's journey", error: error.message };
  }
};

export const addRangeOfSqeunceToDeliveries = async (driver_id, route_id, start_seq, end_seq) => {
  try {
    const query = `
      INSERT INTO deliveries (
          driver_id, driver_set_date, route_id, sequence_number
      )
      SELECT 
          $1 AS driver_id,
          DATE '2025-10-02' AS driver_set_date,
          $2 AS route_id,
          seq AS sequence_number
      FROM generate_series($3::int, $4::int) AS seq 
      RETURNING *;

     
    `;
    const values = [Number(driver_id), Number(route_id),Number( start_seq),Number( end_seq)];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("❌ addRangeOfSqeunceToDeliveries failed:", error.message);
    return { success: false, message: "Error inserting deliveries", error: error.message };
  }
};

export const updateSeqRouteCodeToDeliveriesTable = async ()=>{
    try {
      const query = ` UPDATE deliveries d
        SET seq_route_code = d.sequence_number || '-' || r.route_code_in_string
        FROM routes r
        WHERE d.route_id = r.id;
      `
      await pool.query(query)
    } catch (error) {
      console.error(error,'error in updation seq_route_code for deliveries table')
    }
}

export const markNoAddressAsNoScanned = async ()=>{
  try {
      const query =`
      UPDATE TABLE deliveries
      SET status = 'no_scanned'
      WHERE 
      address = 'No_Address' AND recp_name ='Unknown Recipient'
      `
  } catch (error) {
    
  }
}
