const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG and PNG are allowed."), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const processImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {
        const uploadDir = path.join(__dirname, "../public/uploads/products");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        req.files = await Promise.all(
            req.files.map(async (file) => {
                try {
                    const filename = `cropped-${Date.now()}.jpg`;
                    const outputPath = path.join(uploadDir, filename);

                    const processor = sharp(file.buffer)
                        .resize({
                            width: 500,
                            height: 500,
                            fit: "cover",
                            position: "center"
                        })
                        .jpeg({ 
                            quality: 80,
                            mozjpeg: true 
                        });

                    await processor.toFile(outputPath);
                    
                    const metadata = await processor.metadata();
                    const stats = await fs.promises.stat(outputPath);

                    return {
                        ...file,
                        filename,
                        path: outputPath,
                        destination: uploadDir,
                        size: stats.size,
                        width: metadata.width,
                        height: metadata.height
                    };
                } catch (error) {
                    console.error(`Error processing file ${file.originalname}:`, error);
                    throw error;
                }
            })
        );

        next();
    } catch (error) {
        console.error("Error processing images:", error);
        res.status(500).send("Error processing images");
    }
};

module.exports = { upload, processImages };