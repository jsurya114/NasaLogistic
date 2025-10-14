// controllers/driver/accessCodeControllers.js
import accessCodeQueries from "../../services/driver/accessCodeQueries.js";

export const getAccessCodes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const zipCodeFilter = req.query.zip_code || '';

    console.log("Driver Controller: Fetching access codes with pagination...", { page, limit, search, zipCodeFilter });
    
    const result = await accessCodeQueries.getAccessCodes(page, limit, search, zipCodeFilter);
    
    console.log("Driver Controller: Access codes fetched:", result);
    res.json(result);
  } catch (err) {
    console.error("Driver Controller error in getAccessCodes:", err);
    res.status(500).json({ message: err.message });
  }
};

export const createAccessCode = async (req, res) => {
  const { zip_code, address, access_code } = req.body;

  // Validation
  if (!zip_code || !address || !access_code) {
    return res.status(400).json({ message: "All fields (zip_code, address, access_code) are required" });
  }

  if (!/^\d{5}(-\d{4})?$/.test(zip_code)) {
    return res.status(400).json({ message: "Please enter a valid zip code (5 digits or 5+4 format)" });
  }

  if (!/^[a-zA-Z0-9]+$/.test(access_code)) {
    return res.status(400).json({ message: "Access code must be alphanumeric (letters and numbers only)" });
  }

  try {
    console.log("Driver Controller: Creating access code with data:", { zip_code, address, access_code });
    const newAccessCode = await accessCodeQueries.createAccessCode(zip_code, address, access_code);
    res.status(201).json({ message: "Access code saved successfully", data: newAccessCode });
  } catch (err) {
    console.error("Driver Controller error in createAccessCode:", err);
    if (err.message === "Access code already exists") {
      res.status(409).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};