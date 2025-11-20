import pool from "../../config/db.js";

const AdminJourneyQuery = {
  getAllJourneys: async () => {
    const query = `
      SELECT 
        d.*, 
        r.name AS route_name, 
        dr.name AS driver_name,
        TO_CHAR(d.journey_date, 'YYYY-MM-DD') as journey_date
      FROM dashboard_data d
      JOIN routes r ON d.route_id = r.id
      JOIN drivers dr ON d.driver_id = dr.id
      ORDER BY d.journey_date DESC, d.start_seq
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  updateJourneyById: async (id, data) => {
    const { start_seq, end_seq, route_id, driver_id } = data;
    let packages = (end_seq - start_seq) + 1;
    
    const query = `
      UPDATE dashboard_data 
      SET start_seq = $1, end_seq = $2, route_id = $3, driver_id = $4, packages = $5
      WHERE id = $6
      RETURNING *, TO_CHAR(journey_date, 'YYYY-MM-DD') as journey_date
    `;
    const values = [start_seq, end_seq, route_id, driver_id, packages, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  checkDriverExists: async (driver_id) => {
    const result = await pool.query(
      `SELECT id FROM drivers WHERE id = $1`,
      [driver_id]
    );
    return result.rowCount > 0;
  },

  // UPDATED: Now checks driver_id, route_id, AND journey_date
  checkSequenceOverlap: async (driver_id, route_id, start_seq, end_seq, journey_date, excludedId = null) => {
    let query = `
      SELECT 
        d.id, 
        d.driver_id, 
        dr.name AS driver_name, 
        d.start_seq, 
        d.end_seq,
        TO_CHAR(d.journey_date, 'YYYY-MM-DD') as journey_date
      FROM dashboard_data d
      JOIN drivers dr ON d.driver_id = dr.id
      WHERE d.driver_id = $1
        AND d.route_id = $2
        AND d.journey_date = $3::date
        AND (d.start_seq <= $5 AND d.end_seq >= $4)
    `;
    
    const values = [
      parseInt(driver_id), 
      parseInt(route_id), 
      journey_date,
      parseInt(start_seq), 
      parseInt(end_seq)
    ];

    if (excludedId) {
      query += ` AND d.id <> $6`;
      values.push(parseInt(excludedId));
    }

    const result = await pool.query(query, values);
    return result.rows;
  },

  addJourney: async (data) => {
    const { driver_id, route_id, start_seq, end_seq, journey_date } = data;
    const packages = (end_seq - start_seq) + 1;

const query = `
  INSERT INTO dashboard_data 
    (driver_id, route_id, start_seq, end_seq, journey_date, packages)
  VALUES ($1, $2, $3, $4, $5::date, $6)
  RETURNING *, TO_CHAR(journey_date, 'YYYY-MM-DD') as journey_date;
`;

const values = [driver_id, route_id, start_seq, end_seq, journey_date, packages];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  getAllDrivers: async () => {
    const query = `
      SELECT id, name 
      FROM drivers 
      WHERE enabled = true 
      ORDER BY name
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};

export default AdminJourneyQuery;