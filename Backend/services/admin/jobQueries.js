import pool  from "../../config/db.js"
 
export const jobService={

  getCityByJob : async(job)=>{    
    const result = await pool.query(
    "SELECT id FROM city WHERE job = $1 AND enabled = true",
    [job]
  );

  if (result.rows.length === 0) {
    throw new Error(`City with job "${job}" not found or is disabled`);
  }

  return result.rows[0].id;
  },
  getCity:async  ()=> {
      const result = await pool.query("SELECT * FROM city ORDER BY id ASC")
      return result.rows
  },
addcity:async(job,city_code)=>{
const result = await pool.query("INSERT INTO city (job,city_code,enabled) VALUES ($1, $2, true) RETURNING *",
    [job, city_code])
    return result.rows[0]
},
updateCity:async(id,job,city_code)=>{
    const result = await pool.query("UPDATE city SET job = $1, city_code = $2 WHERE id = $3 RETURNING *",
    [job, city_code, id])
    return result.rows[0]
},
deleteCity:async(id)=>{
    const result = await pool.query("DELETE FROM city WHERE id = $1 RETURNING *", [id])
    return result.rows[0]
},

cityStatus: async (id) => {
  const city = await pool.query("SELECT enabled FROM city WHERE id = $1", [id]);
  if (city.rows.length === 0) return null;
  const newStatus = !city.rows[0].enabled;

  const result = await pool.query(
    "UPDATE city SET enabled = $1 WHERE id = $2 RETURNING *",
    [newStatus, id]
  );
  return result.rows[0];
},
jobPagination: async (page, limit, search = "", statusFilter = "all") => {
  try {
    const offset = (page - 1) * limit;

    let jobsQuery;
    let countQuery;
    let values;

    // Build WHERE clause based on filters
    let whereConditions = [];
    let paramIndex = 1;
    let queryParams = [];

    // Search filter
    if (search) {
      whereConditions.push(`(job ILIKE $${paramIndex} OR city_code ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Status filter
    if (statusFilter === "enabled") {
      whereConditions.push(`enabled = true`);
    } else if (statusFilter === "disabled") {
      whereConditions.push(`enabled = false`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    jobsQuery = `
      SELECT * FROM city
      ${whereClause}
      ORDER BY id ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    values = [...queryParams, limit, offset];

    countQuery = `
      SELECT COUNT(*) FROM city
      ${whereClause}
    `;

    const jobs = await pool.query(jobsQuery, values);
    const total = await pool.query(countQuery, queryParams);

    return {
      jobs: jobs.rows,
      total: parseInt(total.rows[0].count),
    };
  } catch (error) {
    console.error("jobPagination error:", error.message);
    throw error;
  }
},
    getTotalCities: async(req,res)=>{
      try {
    // Only return enabled cities
    const cities= await pool.query(`SELECT id, job FROM city WHERE enabled = true ORDER BY id ASC`);
    return cities.rows;
  } catch (error) {
    console.error("GETTING CITIES ERROR:", error.message);
    throw error;
  }

    },

}


