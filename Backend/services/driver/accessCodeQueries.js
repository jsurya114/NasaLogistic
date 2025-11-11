// services/driver/accessCodeQueries.js
import pool from "../../config/db.js";

const accessCodeQueries = {
  getAccessCodes: async (page = 1, limit = 10, search = '', zipCodeFilter = '') => {
    try {
      const offset = (page - 1) * limit;
      
      // Build the WHERE clause dynamically
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (search) {
        whereConditions.push(`(ac.address ILIKE $${paramIndex} OR ac.access_code ILIKE $${paramIndex} OR ac.zip_code ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (zipCodeFilter) {
        whereConditions.push(`ac.zip_code ILIKE $${paramIndex}`);
        queryParams.push(`%${zipCodeFilter}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM public.access_codes ac
        ${whereClause};
      `;
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT ac.id,
               ac.zip_code,
               ac.address,
               ac.access_code,
               ac.image_url1,
               ac.image_url2,
               ac.image_url3,
               ac.created_at 
        FROM public.access_codes ac
        ${whereClause}
        ORDER BY ac.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
      `;
      queryParams.push(limit, offset);
      const dataResult = await pool.query(dataQuery, queryParams);

      console.log('Driver Database query result for access codes:', {
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
      console.error('Driver Database error in getAccessCodes:', error);
      throw error;
    }
  },

  createAccessCode: async (zipCode, address, accessCode, imageUrls = []) => {
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
        INSERT INTO public.access_codes (
          zip_code, address, access_code, image_url1, image_url2, image_url3
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const [u1, u2, u3] = imageUrls;
      const result = await pool.query(insertQuery, [zipCode, address, accessCode, u1 || null, u2 || null, u3 || null]);
      console.log('Driver Created access code:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Driver Database error in createAccessCode:', error);
      throw error;
    }
  },
};

export default accessCodeQueries;