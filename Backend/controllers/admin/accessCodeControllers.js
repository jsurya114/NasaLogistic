// controllers/admin/accessCodeControllers.js
import accessCodeQueries from "../../services/admin/accessCodeQueries.js";
import path from "path";
import fs from "fs";

export const getAccessCodes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const zipCodeFilter = req.query.zip_code || '';

    console.log("Controller: Fetching access codes with pagination...", { page, limit, search, zipCodeFilter });
    
    const result = await accessCodeQueries.getAccessCodes(page, limit, search, zipCodeFilter);
    result.data.map((access_code)=>{
      access_code.imageCount = 0
      if(access_code.image_url1){
        access_code.imageCount++
      }
      if(access_code.image_url2){
        access_code.imageCount++
      }
      if(access_code.image_url3){
        access_code.imageCount++
      }
    })
    console.log("Controller: Access codes fetched:", result);
    res.json(result);
  } catch (err) {
    console.error("Controller error in getAccessCodes:", err);
    res.status(500).json({ message: err.message });
  }
};

export const createAccessCode = async (req, res) => {
  const { zip_code, address, access_code } = req.body;
  const files = Array.isArray(req.files) ? req.files : [];

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
    console.log("Controller: Creating access code with data:", { zip_code, address, access_code });
    const imageUrls = files.map((f) => `/uploads/accessCodeImages/${f.filename}`);
    const newAccessCode = await accessCodeQueries.createAccessCode(zip_code, address, access_code, imageUrls);
    const imageFiles = files.map((f) => ({
      fieldname: f.fieldname,
      filename: f.filename,
      mimetype: f.mimetype,
      path: f.path,
      url: `/uploads/accessCodeImages/${f.filename}`,
    }));
    res.status(201).json({ message: "Access code saved successfully", data: newAccessCode, images: imageFiles });
  } catch (err) {
    console.error("Controller error in createAccessCode:", err);
    if (err.message === "Access code already exists") {
      res.status(409).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

export const updateAccessCode = async (req, res) => {
  const { id } = req.params;
  const { zip_code, address, access_code, deletedImages } = req.body;
  const files = Array.isArray(req.files) ? req.files : [];

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
    console.log("Controller: Updating access code with id:", id, "and data:", { zip_code, address, access_code });

    // Get current record for existing image URLs
    const current = await accessCodeQueries.getAccessCodeById(id);
    const existingUrls = [current.image_url1, current.image_url2, current.image_url3].filter(Boolean);

    // Parse deleted images list (URLs)
    let toDelete = [];
    if (deletedImages) {
      try {
        toDelete = Array.isArray(deletedImages) ? deletedImages : JSON.parse(deletedImages);
      } catch (_) {
        // allow comma separated
        toDelete = String(deletedImages).split(",").map(s => s.trim()).filter(Boolean);
      }
    }

    // Keep only those not marked for deletion
    const kept = existingUrls.filter(u => !toDelete.includes(u));

    // New uploaded images -> URLs
    const newUrls = files.map(f => `/uploads/accessCodeImages/${f.filename}`);

    // Determine remaining slots
    const remainingSlots = Math.max(0, 3 - kept.length);

    // If no slots left and uploads attempted, cleanup uploaded files and error
    if (remainingSlots === 0 && newUrls.length > 0) {
      for (const f of files) {
        const abs = path.join(process.cwd(), 'uploads', 'accessCodeImages', f.filename);
        fs.unlink(abs, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.warn('Failed to delete excess uploaded file:', abs, err.message);
          }
        });
      }
      return res.status(400).json({ message: 'Already 3 images present. Remove one to add a new image.' });
    }

    // Keep only up to remainingSlots from new uploads; delete the rest immediately
    const keptNewUrls = newUrls.slice(0, remainingSlots);
    const discardedNew = newUrls.slice(remainingSlots);
    if (discardedNew.length > 0) {
      for (const url of discardedNew) {
        const filename = url.split('/').pop();
        if (!filename) continue;
        const abs = path.join(process.cwd(), 'uploads', 'accessCodeImages', filename);
        fs.unlink(abs, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.warn('Failed to delete excess uploaded file:', abs, err.message);
          }
        });
      }
    }

    // Compose final up to 3
    const finalUrls = [...kept, ...keptNewUrls].slice(0, 3);

    const updatedAccessCode = await accessCodeQueries.updateAccessCode(id, zip_code, address, access_code, finalUrls);

    // Physically remove deleted files
    for (const url of toDelete) {
      const filename = url.split('/').pop();
      if (!filename) continue;
      const abs = path.join(process.cwd(), 'uploads', 'accessCodeImages', filename);
      fs.unlink(abs, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.warn('Failed to delete file:', abs, err.message);
        }
      });
    }

    // counts
    const addedCount = finalUrls.filter(u => keptNewUrls.includes(u)).length;
    const removedCount = existingUrls.filter(u => toDelete.includes(u)).length;
    res.json({ message: "Access code updated successfully", data: updatedAccessCode, counts: { added: addedCount, removed: removedCount } });
  } catch (err) {
    console.error("Controller error in updateAccessCode:", err);
    if (err.message === "Access code not found" || err.message === "Access code already exists") {
      res.status(err.message === "Access code not found" ? 404 : 409).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

export const deleteAccessCode = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("Controller: Deleting access code with id:", id);
    await accessCodeQueries.deleteAccessCode(id);
    res.json({ message: "Access code deleted successfully" });
  } catch (err) {
    console.error("Controller error in deleteAccessCode:", err);
    if (err.message === "Access code not found") {
      res.status(404).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};