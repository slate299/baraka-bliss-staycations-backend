const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary (uses env variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage instead of disk storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "baraka-bliss", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1000, height: 750, crop: "limit" }], // Optional: resize
    // Keep the original filename pattern but Cloudinary will handle it
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return uniqueSuffix + "-" + file.originalname.split(".")[0]; // Remove extension
    },
  },
});

// Create Multer instance with Cloudinary storage
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: 10MB limit
});

module.exports = upload;
