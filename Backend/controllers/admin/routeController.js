import {
  insertRoute,
  getAllRoutes,
  getRouteByIdQuery,
  updateRouteQuery,
  deleteRouteQuery,
  toggleRouteStatusQuery,
  routePagination
} from "../../services/admin/routeQueries.js";
import HttpStatus from "../../utils/statusCodes.js";


const mapRoute = (r) => ({
  id: r.id,
  route: r.name, // Map DB 'name' to frontend 'route'
  job: r.job,
  companyRoutePrice: parseFloat(r.company_route_price),
  driverRoutePrice: parseFloat(r.driver_route_price),
  companyDoubleStopPrice: parseFloat(r.company_doublestop_price),
  driverDoubleStopPrice: parseFloat(r.driver_doublestop_price),
  routeCodeInString: r.route_code_in_string,
  enabled: r.enabled,
});

// Create a new route
export const createRoute = async (req, res) => {
  try {
    const { route, job, companyRoutePrice, driverRoutePrice, companyDoubleStopPrice, driverDoubleStopPrice, enabled, routeCodeInString } = req.body;
    console.log("Creating route with data:", req.body); // Debug log


if (!route || route.trim() === "") {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: "Route name is required" });
    }
    if (!job || job.trim() === "") {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: "Job is required" });
    }


    // Convert price fields to numbers
    const routeData = {
      name: route,
      job,
      company_route_price: parseFloat(companyRoutePrice),
      driver_route_price: parseFloat(driverRoutePrice),
      company_doublestop_price: parseFloat(companyDoubleStopPrice),
      driver_doublestop_price: parseFloat(driverDoubleStopPrice),
      route_code_in_string: routeCodeInString ? routeCodeInString.trim() : null,
      enabled: enabled || false,
    };

    // Validate price fields
    for (const [key, value] of Object.entries({
      company_route_price: routeData.company_route_price,
      driver_route_price: routeData.driver_route_price,
      company_doublestop_price: routeData.company_doublestop_price,
      driver_doublestop_price: routeData.driver_doublestop_price,
    })) {
      if (isNaN(value) || value == null) {
        throw new Error(`Invalid or missing value for ${key}`);
      }
    }

    const newRouteDb = await insertRoute(routeData);
    const newRoute = mapRoute(newRouteDb);
    res.status(HttpStatus.CREATED).json(newRoute);

  } catch (err) {
    console.error("❌ createRoute error:", err.message);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: `Failed to create route: ${err.message}` });
  }
};


export const fetchPaginatedRoutes=async(req,res)=>{
  try {
    const page = parseInt(req.query.page)||1
    const limit = parseInt(req.query.limit)||4
    const search  = req.query.search||""
    const {routes,total}=await routePagination(page,limit,search)

    res.status(HttpStatus.OK).json({
      success:true,
      routes:routes.map(mapRoute),
      total,
      page,
      totalPages:Math.ceil(total/limit)
    })
  } catch (error) {
     console.error("❌ fetchPaginatedRoutes error:", error.message);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all routes
export const getRoutes = async (req, res) => {
  try {
    // console.log("Fetching all routes..."); // Debug log
    const routesDb = await getAllRoutes();
    const routes = routesDb.map(mapRoute);
    // console.log("Returning routes:", routes); // Debug log
    res.json({routes});
  } catch (err) {
    console.error("❌ getRoutes error:", err.message); // Debug log
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json( {err:message});
  }
};

// Get route by ID
export const getRouteById = async (req, res) => {
  try {
    // console.log(`Fetching route with id: ${req.params.id}`); // Debug log
    const routeDb = await getRouteByIdQuery(req.params.id);
    if (!routeDb) {
      console.log(`Route id: ${req.params.id} not found`); // Debug log
      return res.status(404).json({ error: "Route not found" });
    }
    const route = mapRoute(routeDb);
    // console.log("Returning route:", route); // Debug log
    res.json(route);
  } catch (err) {
    console.error("❌ getRouteById error:", err.message); // Debug log
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json( {err:message});
  }
};

// Update route
export const updateRoute = async (req, res) => {
  try {
    const { route, job, companyRoutePrice, driverRoutePrice, companyDoubleStopPrice, driverDoubleStopPrice, enabled, routeCodeInString } = req.body;
    console.log(`Updating route id: ${req.params.id} with data:`, req.body); // Debug log

    // Convert price fields to numbers
    const routeData = {
      name: route,
      job,
      company_route_price: parseFloat(companyRoutePrice),
      driver_route_price: parseFloat(driverRoutePrice),
      company_doublestop_price: parseFloat(companyDoubleStopPrice),
      driver_doublestop_price: parseFloat(driverDoubleStopPrice),
      route_code_in_string: routeCodeInString ? routeCodeInString.trim() : null,
      enabled: enabled || false,
    };

    // Validate price fields
    for (const [key, value] of Object.entries({
      company_route_price: routeData.company_route_price,
      driver_route_price: routeData.driver_route_price,
      company_doublestop_price: routeData.company_doublestop_price,
      driver_doublestop_price: routeData.driver_doublestop_price,
    })) {
      if (isNaN(value) || value == null) {
        throw new Error(`Invalid or missing value for ${key}`);
      }
    }

    const updatedDb = await updateRouteQuery(req.params.id, routeData);
    if (!updatedDb) {
      console.log(`Route id: ${req.params.id} not found`); // Debug log
      return res.status(404).json({ error: "Route not found" });
    }
    const updated = mapRoute(updatedDb);
    console.log("Updated route:", updated); // Debug log
    res.json(updated);
  } catch (err) {
    console.error("❌ updateRoute error:", err.message); // Debug log
    res.status(400).json({ error: `Failed to update route: ${err.message}` });
  }
};

// Toggle route status
export const toggleRouteStatus = async (req, res) => {
  try {
    console.log(`Toggling status for route id: ${req.params.id}`); // Debug log
    const updatedDb = await toggleRouteStatusQuery(req.params.id);
    if (!updatedDb) {
      console.log(`Route id: ${req.params.id} not found`); // Debug log
      return res.status(404).json({ error: "Route not found" });
    }
    const updated = mapRoute(updatedDb);
    console.log("Toggled route:", updated); // Debug log
    res.json(updated);
  } catch (err) {
    console.error("❌ toggleRouteStatus error:", err.message); // Debug log
    res.status(500).json({ error: `Failed to toggle route status: ${err.message}` });
  }
};

// Delete route
export const deleteRoute = async (req, res) => {
  try {
    console.log(`Deleting route id: ${req.params.id}`); // Debug log
    const deletedDb = await deleteRouteQuery(req.params.id);
    if (!deletedDb) {
      console.log(`Route id: ${req.params.id} not found`); // Debug log
      return res.status(404).json({ error: "Route not found" });
    }
    console.log("Deleted route:", deletedDb); // Debug log
    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    console.error("❌ deleteRoute error:", err.message); // Debug log
    res.status(500).json({ error: `Failed to delete route: ${err.message}` });
  }
};