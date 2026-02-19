// controllers/inquiryController.js
const Inquiry = require("../models/Inquiry");

// =======================
// CREATE new inquiry
// =======================
exports.createInquiry = async (req, res) => {
  try {
    const newInquiry = new Inquiry({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      apartmentId: req.body.apartmentId,
    });

    const savedInquiry = await newInquiry.save();
    res.status(201).json(savedInquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// =======================
// GET all inquiries (Admin)
// =======================
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find();
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// GET inquiries for a specific apartment
// =======================
exports.getInquiriesByApartment = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({
      apartmentId: req.params.apartmentId,
    });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// DELETE inquiry
// =======================
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    await inquiry.deleteOne();
    res.json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
