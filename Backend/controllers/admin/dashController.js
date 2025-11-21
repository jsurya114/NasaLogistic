// controllers/dataController.js
import { getAllCities, getAllDrivers, getAllRoutes } from "../../services/admin/dashboardService.js"

export const getAllData = async (req, res) => {
  try {
    const [cities, drivers, routes] = await Promise.all([
      getAllCities(),
      getAllDrivers(),
      getAllRoutes(),
    ]);

    res.status(200).json({
      success: true,
      data: { cities, drivers, routes },
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};