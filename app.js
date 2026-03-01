const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Import routes
const apartmentRoutes = require("./routes/apartmentRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const publicRoutes = require("./routes/publicRoutes");

// Import logger
const requestLogger = require("./middleware/loggerMiddleware");

const app = express();

// =======================
// HELMET (SECURITY HEADERS)
// =======================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images from other origins
  }),
);

// =======================
// CORS CONFIGURATION
// =======================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://hoppscotch.io",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// =======================
// BODY PARSING
// =======================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =======================
// OTHER MIDDLEWARE
// =======================
app.use(requestLogger);
app.use("/uploads", express.static("uploads"));

// =======================
// DATABASE CONNECTION
// =======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// =======================
// ROUTES
// =======================
app.get("/", (req, res) => {
  res.send("Baraka Bliss Backend is running");
});

app.use("/api/apartments", apartmentRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/public", publicRoutes);

// =======================
// 404 HANDLER
// =======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  if (err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: "CORS policy: Origin not allowed",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;
