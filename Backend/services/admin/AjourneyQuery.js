import pool from "../../config/db.js";
const AdminJourneyQuery={
    getAllJourneys:async()=>{
       const query = ` 
SELECT d.*, r.name AS route_name, dr.name AS driver_name
FROM dashboard_data d 
JOIN routes r ON d.route_id = r.id
JOIN drivers dr ON d.driver_id = dr.id
ORDER BY d.journey_date DESC, d.start_seq`;

       
        const result = await pool.query(query)
        return result.rows;

    },
    updateJourneyById:async(id,data)=>{
        const {start_seq,end_seq,route_id}=data
        const query=`
        UPDATE dashboard_data
        SET start_seq=$1, end_seq=$2, route_id=$3
        WHERE id=$4
        RETURNING *;
        `;
        const values = [start_seq,end_seq,route_id,id]
        const result = await pool.query(query ,values)
        return result.rows[0]
    },
     checkDriverExists: async (driver_id) => {
    const result = await pool.query(
      `SELECT id FROM drivers WHERE id = $1`, 
      [driver_id]
    );
    return result.rowCount > 0;
  },
  checkSequenceOverlap:async(driver_id,route_id,start_seq,end_seq,excludedId=null)=>{
let query = `
      SELECT * FROM dashboard_data
      WHERE driver_id = $1
      AND route_id = $2
      AND (
        (start_seq <= $4 AND end_seq >= $3) OR
        (start_seq >= $3 AND start_seq <= $4) OR
        (end_seq >= $3 AND end_seq <= $4)
      )
    `;
    const values = [driver_id,route_id,start_seq,end_seq]
    if(excludedId){
          query += ` AND id <> $5`;
      values.push(excludedId);
    }
    const result = await pool.query(query, values);
    return result.rows;
  },
    checkDuplicateJourney:async(driver_id,route_id,start_seq,end_seq,excludedId=null)=>{
          let query =`
          SELECT * FROM dashboard_data
          WHERE driver_id =$1
          AND route_id = $2
          AND (start_seq=$3 OR end_seq=$4)
          `;
          const values = [driver_id,route_id,start_seq,end_seq]
          if(excludedId){
            query+=`AND id <> $5`
            values.push(excludedId)
          }
          const result = await pool.query(query,values)
          return result.rowCount>0
    },
    updateJourneyById:async(id,data)=>{
        const {start_seq,end_seq,route_id}=data
         const query = `
      UPDATE dashboard_data
      SET start_seq = $1, end_seq = $2, route_id = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [start_seq,end_seq,route_id,id]
    const result = await pool.query(query,values)
    return result.rows[0]

    },
    addJourney:async(data)=>{
        const {driver_id,route_id ,start_seq,end_seq,journey_date}=data
         const query = `
      INSERT INTO dashboard_data (driver_id, route_id, start_seq, end_seq, journey_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values =[driver_id,route_id,start_seq,end_seq,journey_date]
    const result = await pool.query(query,values)
    return result.rows[0]
    },
    getAllDrivers:async()=>{
         const query = `SELECT id, name FROM drivers WHERE enabled
          = true ORDER BY name`;
        const result = await pool.query(query);
        return result.rows;
    }

}

export default AdminJourneyQuery