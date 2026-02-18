// inquiryController.js
const Inquiry = require("../models/Inquiry");

exports.createInquiry = async (req, res) => {
  const newInquiry = new Inquiry({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    apartmentId: req.body.apartmentId,
  });

  try {
    const savedInquiry = await newInquiry.save();
    res.status(201).json(savedInquiry); // return the saved inquiry
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
