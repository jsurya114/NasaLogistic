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

     getDriverByCode :async(code)=>{
        let result = await pool.query("SELECT * FROM drivers WHERE email =$1",[code]);
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
        // `SELECT id,name, email, role,is_active
        // FROM admin
        // WHERE id != $1
        // LIMIT $2 OFFSET $3`,

  `     SELECT 
        a.id AS id,
        a.name AS admin_name,
        a.email AS admin_email,
        a.role AS admin_role,
        a.is_active,
        COALESCE(STRING_AGG(c.job, ', '), '') AS cities
      FROM admin a
      LEFT JOIN admin_city_ref acr ON a.id = acr.admin_id
      LEFT JOIN city c ON acr.city_id = c.id
      WHERE a.id != $1
      GROUP BY a.id, a.name, a.email, a.role, a.is_active
      ORDER BY a.id
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
      `INSERT INTO drivers (name, email,driver_code, password, city_id, enabled) 
       VALUES ($1, $2, $3, $4, $5,$6)
       RETURNING id,name,email,enabled,city_id,driver_code`,
      [data.name, data.email,data.driverCode, hashedPwd, city_id, data.enabled]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error inserting user:", err.message);
    throw err;
  }
  },

  insertAdmin : async(data)=>{    
      const client= await pool.connect();
      try {
        await client.query('BEGIN');

    const hashedPwd = await dbService.hashedPassword(data.password);
    const result = await pool.query(
      `INSERT INTO admin (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id,name,email,role,is_active`,
      [data.name, data.email, hashedPwd, data.role]
    );
    const admin= result.rows[0];

    const cities = Array.isArray(data.city) ? data.city : [];
    if( data.role==='admin' && cities.length>0){
      const values=data.city.map((c)=>`(${admin.id},${c.value})`).join(',');
      const query=`
      INSERT INTO admin_city_ref(admin_id,city_id)
      VALUES ${values}
      ON CONFLICT (admin_id, city_id) DO NOTHING;`

      await client.query(query);
    }

    await client.query(`COMMIT`);
    return admin;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error inserting new admin:", err.message);
    throw err;
  }finally {
    client.release();
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