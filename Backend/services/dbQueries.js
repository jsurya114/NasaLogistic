import pool  from "../config/db.js";
import bcrypt from "bcrypt";


export const dbService={
    getAdminByEmail : async(email)=>{
        let result = await pool.query("SELECT * FROM admin WHERE email =$1",[email]);
        return result.rows[0];
    },
    checkPassword:async(password,hashedPassword)=>{
        return await bcrypt.compare(password,hashedPassword)
    },
    
}