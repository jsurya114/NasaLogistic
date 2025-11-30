import pool from "../../config/db.js";

const fetchDeliverySummary = async (driverId, fromDate, toDate) => {
    let query = `
        SELECT 
            pd.id,
            pd.driver_id,
            pd.journey_date,
            pd.route_id,
            r.name AS route_name,
           (pd.end_seq - pd.start_seq + 1) AS packages,
            pd.no_scanned,
            pd.failed_attempt,
            pd.ds AS double_stop,
            pd.delivered,
            pd.driver_payment AS earning,
            pd.start_seq,
            pd.end_seq
        FROM payment_dashboard pd
        LEFT JOIN routes r ON pd.route_id = r.id
        WHERE pd.driver_id = $1`;

    const params = [driverId];
    
    if (fromDate && toDate) {
        query += ` AND pd.journey_date BETWEEN $2 AND $3`;
        params.push(fromDate, toDate);
    }else if(fromDate){
        query+=`AND pd.journey_date>=$2`
        params.push(fromDate)
    }else if (toDate){
        query+=`AND pd.journey_date<=$2`
        params.push(toDate)
    }
    query+=` ORDER BY pd.journey_date DESC`
    
  
    
    const { rows } = await pool.query(query, params);
    return rows;
};

export default { fetchDeliverySummary };