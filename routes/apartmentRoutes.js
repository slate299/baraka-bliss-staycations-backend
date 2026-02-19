// routes/apartmentRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
} = require("../controllers/apartmentController");

const upload = require("../middleware/upload");

// =======================
// Apartment Routes
// =======================

// GET all apartments
router.get("/", getAllApartments);

// GET single apartment by ID
router.get("/:id", getApartmentById);

// CREATE new apartment
router.post("/", upload.array("mediaFiles", 5), createApartment);

// UPDATE apartment
router.put("/:id", updateApartment);

// DELETE apartment
router.delete("/:id", deleteApartment);

module.exports = router;
