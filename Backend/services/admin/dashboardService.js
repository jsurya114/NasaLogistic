// services/dataService.js
import pool from "../../config/db.js"; // PostgreSQL connection pool

// Fetch all cities
export const getAllCities = async () => {
  const result = await pool.query(`SELECT * FROM city WHERE enabled = true ORDER BY job ASC`);
  return result.rows;
};

// Fetch all drivers
export const getAllDrivers = async () => {
  const result = await pool.query(`SELECT * FROM drivers WHERE enabled = true ORDER BY name ASC`);
  return result.rows;
};

// Fetch all routes
export const getAllRoutes = async () => {
  const result = await pool.query(`SELECT * FROM routes WHERE enabled = true ORDER BY name ASC`);
  return result.rows;
};