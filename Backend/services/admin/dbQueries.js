import pool  from "../../config/db.js";
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

     getAdminById: async(id)=>{
        let result = await pool.query("SELECT * FROM admin WHERE id =$1",[id]);
        return result.rows[0];
    },

    
    getCountOfAdmins:async()=>{
      const countResult = await pool.query(`SELECT COUNT(*) FROM admin`);
      return parseInt(countResult.rows[0].count,10);
    },
    getCountOfDrivers:async()=>{
      const countResult = await pool.query(`SELECT COUNT(*) FROM drivers`);
      return parseInt(countResult.rows[0].count,10);
    },
    getAllDrivers :async(lim,offset)=>{
        let result = await pool.query(`
            select d.id, d.driver_code, d.name,d.email, c.job, d.enabled 
            from drivers d
            join city c on d.city_id=c.id 
            order by d.name asc
            limit $1 offset $2`,
          [lim,offset]);
        return result.rows;
    },
    getAllAdmins: async (limit,offset) => {
      const result = await pool.query(
        `SELECT id,name, email, role,is_active
        FROM admin
        WHERE id != $1
        LIMIT $2 OFFSET $3`,
        [100,limit,offset]
      );
      return result.rows;
    },

    insertUser : async(data)=>{    
      try {
    const city_id = await jobService.getCityByJob(data.city);
    const hashedPwd = await dbService.hashedPassword(data.password);

    const result = await pool.query(
      `INSERT INTO drivers (name, email, password, city_id, enabled) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id,name,email,enabled,city_id,driver_code`,
      [data.name, data.email, hashedPwd, city_id, data.enabled]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error inserting user:", err.message);
    throw err;
  }
  },

  insertAdmin : async(data)=>{    
      try {
    const hashedPwd = await dbService.hashedPassword(data.password);
    const result = await pool.query(
      `INSERT INTO admin (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id,name,email,role`,
      [data.name, data.email, hashedPwd, data.role]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error inserting new admin:", err.message);
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
  },

   changeStatusOfAdmin: async(id)=>{
   const result = await pool.query(
    `UPDATE admin 
     SET is_active = NOT is_active 
     WHERE id = $1 
     RETURNING id, name, email,role,is_active`,
    [id]
  );
    return result.rows[0];
   },

  changeRoleOfAdmin: async (id) => {
  const result = await pool.query(
    `UPDATE admin 
     SET role = CASE 
                  WHEN role = 'admin' THEN 'superadmin'
                  ELSE 'admin'
                END
     WHERE id = $1 
     RETURNING id, name, email, role, is_active`,
    [id]
  );
  return result.rows[0];
},

  getDashboardData : async ()=>{
    const result = await pool.query(
      `SELECT * FROM dashboard_data
         
        ;
        
      `
    )
    console.log('db dash query')
    return result.rows
  }
    
}