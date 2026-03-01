// routes/inquiryRoutes.js
const express = require("express");
const router = express.Router();

const {
  createInquiry,
  getAllInquiries,
  getInquiriesByApartment,
  deleteInquiry,
  toggleReadStatus, // 👈 NEW: Import this
  markMultipleAsRead, // 👈 NEW: Import this
  markAsReplied, // 👈 NEW
  markMultipleAsReplied, // 👈 NEW
  addReply,
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

// 👇 NEW: Toggle read status for a single inquiry
router.patch("/:id/toggle-read", toggleReadStatus);

// 👇 NEW: Mark multiple inquiries as read
router.patch("/mark-read", markMultipleAsRead);

// 👇 NEW: Mark as replied
router.patch("/:id/mark-replied", markAsReplied);

// 👇 NEW: Mark multiple as replied
router.patch("/mark-replied", markMultipleAsReplied);

// 👇 NEW: Add reply message
router.patch("/:id/reply", addReply);

// DELETE inquiry
router.delete("/:id", deleteInquiry);

module.exports = router;
