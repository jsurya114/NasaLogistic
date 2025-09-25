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
}


}


