const express = require("express");
const router = express.Router();
const {
  getPublicApartments,
  getPublicApartmentById,
  createPublicInquiry,
  healthCheck,
  checkDatabase,
  testEmail,
  getFilterOptions,
} = require("../controllers/publicController");

// Import rate limiters
const {
  publicLimiter,
  inquiryLimiter,
  healthLimiter,
} = require("../middleware/rateLimiter.final");

// =======================
// PUBLIC ROUTES WITH RATE LIMITING
// =======================

// Apply general rate limiting to ALL public routes
router.use(publicLimiter);

// Health check - stricter limit
router.get("/health", healthLimiter, healthCheck);

// Apartment listing and details
router.get("/apartments", getPublicApartments);
router.get("/apartments/:id", getPublicApartmentById);

// Add this with your other routes (before or after the apartment routes)
router.get("/filter-options", getFilterOptions);

// Inquiry submission - strictest limits
router.post("/inquiries", inquiryLimiter, createPublicInquiry);

// Database check (useful for monitoring)
router.get("/check-db", healthLimiter, checkDatabase);

// Test email (also limited)
router.get("/test-email", healthLimiter, testEmail);

module.exports = router;
