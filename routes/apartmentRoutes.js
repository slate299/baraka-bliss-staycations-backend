// routes/apartmentRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllApartments,
  getApartmentById,
  createApartment,
} = require("../controllers/apartmentController");

const upload = require("../middleware/upload");

// Routes
router.get("/", getAllApartments); // GET all apartments
router.get("/:id", getApartmentById); // GET apartment by ID
router.post("/", upload.array("mediaFiles", 5), createApartment); // POST new apartment

module.exports = router;
