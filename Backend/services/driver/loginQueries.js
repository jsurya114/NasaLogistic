import pool from "../../config/db.js";
import bcrypt from "bcrypt";

export const loginService = {
  getDriverByEmail: async (email) => {
    let result = await pool.query("SELECT * FROM drivers WHERE email = $1", [email]);
    return result.rows[0];
  },

  checkPassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  hashedPassword: async (password) => {
    const salt = 10;
    return await bcrypt.hash(password, salt);
  }
};
