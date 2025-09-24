import multer from "multer";
import path from "path";
import { Worker } from "worker_threads";
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
