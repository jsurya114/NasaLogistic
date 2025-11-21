import { Pool,types } from "pg";
import dotenv from "dotenv" 
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,         // e.g. postgres
  host: process.env.DB_HOST,         // e.g. 127.0.0.1 or Public IP
  database: process.env.DB_NAME,     // your db name
  password: (process.env.DB_PASSWORD), // db password
  port: process.env.DB_PORT , 
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
});
types.setTypeParser(1082, (stringValue) => stringValue);

export default pool;


// async function testConnection() {
//   try {
//     const res = await pool.query("SELECT NOW()");
//     console.log("Connected to DB:", res.rows[0]);
//   } catch (err) {
//     console.error("DB connection error:", err);
//   }
// }
// testConnection();