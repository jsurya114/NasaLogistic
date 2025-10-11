import pool from "../../config/db.js";
const AdminJourneyQuery={
    getAllJourneys:async()=>{
        const query = ` 
        SELECT d.*, r.name AS route_name
        FROM dashboard_data d 
        JOIN routes r ON d.route_id =r.id
        lEFT JOIN drivers dr ON d.driver_id = dr.id
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
    }

}

export default AdminJourneyQuery