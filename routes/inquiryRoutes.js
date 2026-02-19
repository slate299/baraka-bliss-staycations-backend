// routes/inquiryRoutes.js
const express = require("express");
const router = express.Router();

const {
  createInquiry,
  getAllInquiries,
  getInquiriesByApartment,
  deleteInquiry,
} = require("../controllers/inquiryController");

// =======================
// Inquiry Routes
// =======================

// CREATE new inquiry
router.post("/", createInquiry);

// GET all inquiries (Admin)
router.get("/", getAllInquiries);

// GET inquiries for a specific apartment
router.get("/apartment/:apartmentId", getInquiriesByApartment);

// DELETE inquiry
router.delete("/:id", deleteInquiry);

module.exports = router;
