const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const apartmentRoutes = require("./routes/apartmentRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); // serve uploaded files

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Baraka Bliss Backend is running");
});

app.use("/api/apartments", apartmentRoutes);
app.use("/api/inquiries", inquiryRoutes);

module.exports = app; // only needed if imported elsewhere (like server.js)
