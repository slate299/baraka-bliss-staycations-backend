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

// CREATE new apartment (supports up to 5 media files)
router.post("/", upload.array("mediaFiles", 5), createApartment);

// UPDATE apartment (also supports up to 5 media files)
router.put("/:id", upload.array("mediaFiles", 5), updateApartment);

// DELETE apartment
router.delete("/:id", deleteApartment);

module.exports = router;
