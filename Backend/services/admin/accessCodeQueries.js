import pool from "../../config/db.js";

const accessCodeQueries = {
  getRoutes: async () => {
    try {
      const result = await pool.query(`
        SELECT id, name 
        FROM public.routes 
        WHERE enabled = true 
        ORDER BY name;
      `);
      console.log('Database query result for routes:', result.rows); // Debug log
      return result.rows;
    } catch (error) {
      console.error('Database error in getRoutes:', error);
      throw error;
    }
  },

  createAccessCode: async (routeId, address, accessCode) => {
    try {
      // Check if access code already exists
      const checkQuery = `
        SELECT id FROM public.access_codes WHERE access_code = $1;
      `;
      const checkResult = await pool.query(checkQuery, [accessCode]);
      if (checkResult.rowCount > 0) {
        throw new Error('Access code already exists');
      }

      // Insert new access code
      const insertQuery = `
        INSERT INTO public.access_codes (route_id, address, access_code)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const result = await pool.query(insertQuery, [routeId, address, accessCode]);
      console.log('Created access code:', result.rows[0]); // Debug log
      return result.rows[0];
    } catch (error) {
      console.error('Database error in createAccessCode:', error);
      throw error;
    }
  },
};

export default accessCodeQueries;