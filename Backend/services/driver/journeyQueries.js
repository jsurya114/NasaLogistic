import pool  from "../../config/db.js";
export const insertJourney = async (data) => {
  const { driver_id, route_id, packages, start_seq, end_seq } = data;

 

 
  const query = `
    INSERT INTO dashboard_data 
      (driver_id, journey_date, route_id, packages, start_seq, end_seq)
    VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [driver_id, route_id, packages, start_seq, end_seq];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getTodayJourney = async (driver_id) => {
  const query = `
    SELECT d.driver_id, d.journey_date, d.route_id, d.packages, d.start_seq, d.end_seq,r.name AS route_name
    FROM dashboard_data d
    JOIN routes r ON d.route_id = r.id
    WHERE driver_id = $1 AND journey_date = CURRENT_DATE
      ORDER BY d.start_seq ASC;
  `;
  const result = await pool.query(query, [driver_id]);
  return result.rows;
};