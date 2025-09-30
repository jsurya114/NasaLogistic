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
      console.log('Database query result for routes:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Database error in getRoutes:', error);
      throw error;
    }
  },

  getAccessCodes: async (page = 1, limit = 10, search = '', routeFilter = '') => {
    try {
      const offset = (page - 1) * limit;
      
      // Build the WHERE clause dynamically
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (search) {
        whereConditions.push(`(ac.address ILIKE $${paramIndex} OR ac.access_code ILIKE $${paramIndex} OR r.name ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (routeFilter) {
        whereConditions.push(`ac.route_id = $${paramIndex}`);
        queryParams.push(routeFilter);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM public.access_codes ac
        JOIN public.routes r ON ac.route_id = r.id
        ${whereClause};
      `;
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT ac.id, ac.route_id, r.name as route_name, ac.address, ac.access_code, ac.created_at 
        FROM public.access_codes ac
        JOIN public.routes r ON ac.route_id = r.id
        ${whereClause}
        ORDER BY ac.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
      `;
      queryParams.push(limit, offset);
      const dataResult = await pool.query(dataQuery, queryParams);

      console.log('Database query result for access codes:', {
        total,
        page,
        limit,
        data: dataResult.rows
      });

      return {
        data: dataResult.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + dataResult.rows.length < total
        }
      };
    } catch (error) {
      console.error('Database error in getAccessCodes:', error);
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
      console.log('Created access code:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in createAccessCode:', error);
      throw error;
    }
  },

  updateAccessCode: async (id, routeId, address, accessCode) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Check if access code exists
      const current = await client.query('SELECT access_code FROM public.access_codes WHERE id = $1', [id]);
      if (current.rowCount === 0) throw new Error('Access code not found');
      
      // Check if new access code already exists (if changed)
      if (current.rows[0].access_code !== accessCode) {
        const check = await client.query('SELECT id FROM public.access_codes WHERE access_code = $1 AND id != $2', [accessCode, id]);
        if (check.rowCount > 0) throw new Error('Access code already exists');
      }
      
      const result = await client.query(`
        UPDATE public.access_codes
        SET route_id = $1, address = $2, access_code = $3
        WHERE id = $4
        RETURNING *;
      `, [routeId, address, accessCode, id]);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  deleteAccessCode: async (id) => {
    try {
      const result = await pool.query('DELETE FROM public.access_codes WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        throw new Error('Access code not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Database error in deleteAccessCode:', error);
      throw error;
    }
  },
};

export default accessCodeQueries;

// Note: Update your routes file to include the delete endpoint:
// router.delete("/access-codes/:id", deleteAccessCode)