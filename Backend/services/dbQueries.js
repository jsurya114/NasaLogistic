import pool  from "../config/db.js";
import bcrypt from "bcrypt";
import { jobService } from "./jobQueries.js";

export const dbService={
    getAdminByEmail : async(email)=>{
        let result = await pool.query("SELECT * FROM admin WHERE email =$1",[email]);
        return result.rows[0];
    },
    checkPassword:async(password,hashedPassword)=>{
        return await bcrypt.compare(password,hashedPassword)
    },

    hashedPassword : async(password)=>{
        const saltRounds=10;
        return await bcrypt.hash(password,saltRounds);
    },
    getDriverByEmail :async(email)=>{
        let result = await pool.query("SELECT * FROM drivers WHERE email =$1",[email]);
        return result.rows[0];
    },

    getDriverById: async(id)=>{
        let result = await pool.query("SELECT * FROM drivers WHERE id =$1",[id]);
        return result.rows[0];
    },

    getAllDrivers :async()=>{
        let result = await pool.query(`
            select d.id, d.driver_code, d.name,d.email, c.job, d.enabled 
            from drivers d
            join city c on d.city_id=c.id `);
        return result.rows;
    },

    insertUser : async(data)=>{    
      try {
    const city_id = await jobService.getCityByJob(data.city);
    const hashedPwd = await dbService.hashedPassword(data.password);

    const result = await pool.query(
      `INSERT INTO drivers (name, email, password, city_id, enabled) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [data.name, data.email, hashedPwd, city_id, data.enabled]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error inserting user:", err.message);
    throw err;
  }
  },

  changeStatus: async(id)=>{
   const result = await pool.query(
    `UPDATE drivers 
     SET enabled = NOT enabled 
     WHERE id = $1 
     RETURNING id, driver_code, name, email, city_id, enabled`,
    [id]
  );

  const updated = result.rows[0];
  if (!updated) return null;

  // Now join with city to get job field for only this driver
  const joined = await pool.query(
    `SELECT d.id, d.driver_code, d.name, d.email, c.job, d.enabled
     FROM drivers d
     JOIN city c ON d.city_id = c.id
     WHERE d.id = $1`,
    [updated.id]
  );

  return joined.rows[0];  
  }
    
}