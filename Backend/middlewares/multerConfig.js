import multer from "multer";
import path from "path";
import { Worker } from "worker_threads";
import fs from "fs";
// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // default folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

// File filter (optional: restrict types)
const fileFilter = (req, file, cb) => { 
  const allowedTypes = [
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/csv", // .csv
    // "image/jpeg", // .jpg
    // "image/png", // .png
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// Export a configured multer instance
export const upload = multer({ storage, fileFilter });

// Ensure destination dir exists
function ensureDir(dirPath){
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Dedicated storage and filter for access code images
const imagesDir = path.join("uploads", "accessCodeImages");
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(imagesDir);
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const safeBase = path.parse(file.originalname).name.replace(/[^a-z0-9_-]/gi, "_");
    cb(null, `${Date.now()}_${safeBase}${path.extname(file.originalname)}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"), false);
};

export const uploadAccessCodeImages = multer({ storage: imageStorage, fileFilter: imageFileFilter });
