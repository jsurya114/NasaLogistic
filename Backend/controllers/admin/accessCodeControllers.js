// controllers/admin/accessCodeControllers.js
import accessCodeQueries from "../../services/admin/accessCodeQueries.js";

export const getRoutes = async (req, res) => {
  try {
    console.log("Controller: Fetching routes for access codes..."); // Debug log
    const routes = await accessCodeQueries.getRoutes();
    console.log("Controller: Routes fetched:", routes); // Debug log
    res.json(routes);
  } catch (err) {
    console.error("Controller error in getRoutes:", err); // Debug log
    res.status(500).json({ message: err.message });
  }
};

export const getAccessCodes = async (req, res) => {
  try {
    console.log("Controller: Fetching access codes..."); // Debug log
    const accessCodes = await accessCodeQueries.getAccessCodes();
    console.log("Controller: Access codes fetched:", accessCodes); // Debug log
    res.json(accessCodes);
  } catch (err) {
    console.error("Controller error in getAccessCodes:", err); // Debug log
    res.status(500).json({ message: err.message });
  }
};

export const createAccessCode = async (req, res) => {
  const { route_id, address, access_code } = req.body;

  // Validation
  if (!route_id || !address || !access_code) {
    return res.status(400).json({ message: "All fields (route_id, address, access_code) are required" });
  }

  if (!/^[a-zA-Z0-9]+$/.test(access_code)) {
    return res.status(400).json({ message: "Access code must be alphanumeric (letters and numbers only)" });
  }

  try {
    console.log("Controller: Creating access code with data:", { route_id, address, access_code }); // Debug log
    const newAccessCode = await accessCodeQueries.createAccessCode(route_id, address, access_code);
    res.status(201).json({ message: "Access code saved successfully", data: newAccessCode });
  } catch (err) {
    console.error("Controller error in createAccessCode:", err); // Debug log
    if (err.message === "Access code already exists") {
      res.status(409).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

export const updateAccessCode = async (req, res) => {
  const { id } = req.params;
  const { route_id, address, access_code } = req.body;

  if (!route_id || !address || !access_code) {
    return res.status(400).json({ message: "All fields (route_id, address, access_code) are required" });
  }

  if (!/^[a-zA-Z0-9]+$/.test(access_code)) {
    return res.status(400).json({ message: "Access code must be alphanumeric (letters and numbers only)" });
  }

  try {
    console.log("Controller: Updating access code with id:", id, "and data:", { route_id, address, access_code }); // Debug log
    const updatedAccessCode = await accessCodeQueries.updateAccessCode(id, route_id, address, access_code);
    res.json({ message: "Access code updated successfully", data: updatedAccessCode });
  } catch (err) {
    console.error("Controller error in updateAccessCode:", err); // Debug log
    if (err.message === "Access code not found" || err.message === "Access code already exists") {
      res.status(err.message === "Access code not found" ? 404 : 409).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};