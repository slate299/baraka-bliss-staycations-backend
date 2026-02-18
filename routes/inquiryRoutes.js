const express = require("express");
const router = express.Router();
const { createInquiry } = require("../controllers/inquiryController");

// Routes
router.post("/", createInquiry); // POST new inquiry

module.exports = router;
