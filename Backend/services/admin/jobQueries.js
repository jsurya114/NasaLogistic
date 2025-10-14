import pool  from "../../config/db.js"
 
export const jobService={

  getCityByJob : async(job)=>{    
    const result = await pool.query(
    "SELECT id FROM city WHERE job = $1",
    [job]
  );

  if (result.rows.length === 0) {
    throw new Error(`City with job "${job}" not found`);
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
jobPagination: async (page, limit, search = "") => {
  try {
    const offset = (page - 1) * limit;

    let jobsQuery;
    let countQuery;
    let values;

    if (search) {
      jobsQuery = `
        SELECT * FROM city
        WHERE job ILIKE $1 OR city_code ILIKE $1
        ORDER BY id ASC
        LIMIT $2 OFFSET $3
      `;
      values = [`%${search}%`, limit, offset];

      countQuery = `
        SELECT COUNT(*) FROM city
        WHERE job ILIKE $1 OR city_code ILIKE $1
      `;
    } else {
      jobsQuery = `
        SELECT * FROM city
        ORDER BY id ASC
        LIMIT $1 OFFSET $2
      `;
      values = [limit, offset];

      countQuery = `
        SELECT COUNT(*) FROM city
      `;
    }

    const jobs = await pool.query(jobsQuery, values);

    const total = search
      ? await pool.query(countQuery, [`%${search}%`])
      : await pool.query(countQuery);

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
      const cities= await pool.query(`SELECT id,job  FROM city ORDER BY id ASC `);
      return cities.rows;
    } catch (error) {
      console.error("GETTING CITIES ERROR:", error.message);
        throw error;
    }
    },

}


