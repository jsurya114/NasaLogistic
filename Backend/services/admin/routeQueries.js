import pool from "../../config/db.js";

// Insert route with job and price validation
export const insertRoute = async (data) => {
  const {
    name,
    job,
    company_route_price,
    driver_route_price,
    company_doublestop_price,
    driver_doublestop_price,
    route_code_in_string,
    enabled,
  } = data;

  // Validate job exists in city table
  const jobCheck = await pool.query("SELECT job FROM city WHERE job = $1", [job]);
  if (jobCheck.rows.length === 0) {
    throw new Error(`Job '${job}' does not exist in city table`);
  }

  // Validate price fields
  const prices = {
    company_route_price: parseFloat(company_route_price),
    driver_route_price: parseFloat(driver_route_price),
    company_doublestop_price: parseFloat(company_doublestop_price),
    driver_doublestop_price: parseFloat(driver_doublestop_price),
  };
  for (const [key, value] of Object.entries(prices)) {
    if (isNaN(value) || value == null) {
      throw new Error(`Invalid or missing value for ${key}`);
    }
  }

  console.log("Inserting route with data:", { ...data, ...prices }); // Debug log
  const result = await pool.query(
    `INSERT INTO routes 
      (name, job, company_route_price, driver_route_price, company_doublestop_price, driver_doublestop_price, route_code_in_string, enabled) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      name,
      job,
      prices.company_route_price,
      prices.driver_route_price,
      prices.company_doublestop_price,
      prices.driver_doublestop_price,
      route_code_in_string,
      enabled,
    ]
  );

  console.log("Inserted route:", result.rows[0]); // Debug log
  return result.rows[0];
};

// Get all routes
export const getAllRoutes = async () => {
  // console.log("Fetching all routes..."); // Debug log
  const result = await pool.query("SELECT * FROM routes ORDER BY id ASC");
  // console.log("Fetched routes:", result.rows); // Debug log
  return result.rows;
};

// Get route by ID
export const getRouteByIdQuery = async (id) => {
  // console.log(`Fetching route with id: ${id}`); // Debug log
  const result = await pool.query("SELECT * FROM routes WHERE id = $1", [id]);
  // console.log("Fetched route:", result.rows[0] || null); // Debug log
  return result.rows[0];
};

// Update route with job and price validation
export const updateRouteQuery = async (id, data) => {
  const {
    name,
    job,
    company_route_price,
    driver_route_price,
    company_doublestop_price,
    driver_doublestop_price,
    route_code_in_string,
    enabled,
  } = data;

  // Validate job exists in city table
  const jobCheck = await pool.query("SELECT job FROM city WHERE job = $1", [job]);
  if (jobCheck.rows.length === 0) {
    throw new Error(`Job '${job}' does not exist in city table`);
  }

  // Validate price fields
  const prices = {
    company_route_price: parseFloat(company_route_price),
    driver_route_price: parseFloat(driver_route_price),
    company_doublestop_price: parseFloat(company_doublestop_price),
    driver_doublestop_price: parseFloat(driver_doublestop_price),
  };
  for (const [key, value] of Object.entries(prices)) {
    if (isNaN(value) || value == null) {
      throw new Error(`Invalid or missing value for ${key}`);
    }
  }

  console.log(`Updating route id: ${id} with data:`, { ...data, ...prices }); // Debug log
  const result = await pool.query(
    `UPDATE routes 
     SET name=$1, job=$2, company_route_price=$3, driver_route_price=$4, 
        company_doublestop_price=$5, driver_doublestop_price=$6, enabled=$7, route_code_in_string=$8 
     WHERE id=$9 RETURNING *`,
    [
      name,
      job,
      prices.company_route_price,
      prices.driver_route_price,
      prices.company_doublestop_price,
      prices.driver_doublestop_price,
      enabled,
      route_code_in_string,
      id,
    ]
  );

  console.log("Updated route:", result.rows[0] || null); // Debug log
  return result.rows[0];
};

// Toggle route status
export const toggleRouteStatusQuery = async (id) => {
  console.log(`Toggling status for route id: ${id}`); // Debug log
  const route = await getRouteByIdQuery(id);
  if (!route) {
    console.log(`Route id: ${id} not found`); // Debug log
    return null;
  }
  const result = await pool.query(
    "UPDATE routes SET enabled = NOT enabled WHERE id=$1 RETURNING *",
    [id]
  );
  console.log("Toggled route:", result.rows[0]); // Debug log
  return result.rows[0];
};

// Delete route
export const deleteRouteQuery = async (id) => {
  console.log(`Deleting route id: ${id}`); // Debug log
  const result = await pool.query("DELETE FROM routes WHERE id=$1 RETURNING *", [id]);
  console.log("Deleted route:", result.rows[0] || null); // Debug log
  return result.rows[0];
};

export const routePagination=async(page,limit,search="")=>{
try {
  const offset = (page-1)*limit
  let routeQuery
  let countQuery
  let values
if(search){
  routeQuery=`
  SELECT * FROM routes
  WHERE job ILIKE $1 OR name ILIKE $1
  ORDER BY id ASC
  LIMIT $2 OFFSET $3`;
  values = [`%${search}%`,limit,offset]
  countQuery =`
  SELECT COUNT(*) FROM routes
  WHERE job ILIKE $1 OR name ILIKE $1`;
}else{
  routeQuery =`
  SELECT * FROM routes
  ORDER BY id ASC
  LIMIT $1 OFFSET $2`;
  values = [limit,offset]
  countQuery = `
  SELECT COUNT(*) FROM routes`;
}
const routes = await pool.query(routeQuery,values)
    const total = search
      ? await pool.query(countQuery, [`%${search}%`])
      : await pool.query(countQuery);

      return {
        routes:routes.rows,
        total:parseInt(total.rows[0].count)
      }
} catch (error) {
  console.error("routePagination error:", error.message);
      throw error;
}
}