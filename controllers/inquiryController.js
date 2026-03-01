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
      // isRead defaults to false automatically
      // replied defaults to false automatically
    });

    const savedInquiry = await newInquiry.save();
    res.status(201).json(savedInquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// =======================
// GET all inquiries (Admin) - UPDATED with populate and sort
// =======================
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("apartmentId", "name city area price")
      .sort("-createdAt");
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
    }).sort("-createdAt");
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// TOGGLE read status
// =======================
exports.toggleReadStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    inquiry.isRead = !inquiry.isRead;
    await inquiry.save();

    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// MARK MULTIPLE as read
// =======================
exports.markMultipleAsRead = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No inquiry IDs provided" });
    }

    await Inquiry.updateMany({ _id: { $in: ids } }, { isRead: true });

    res.json({
      message: `${ids.length} ${ids.length === 1 ? "inquiry" : "inquiries"} marked as read`,
      count: ids.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// MARK AS REPLIED - NEW
// =======================
exports.markAsReplied = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    inquiry.replied = true;
    inquiry.repliedAt = new Date();
    if (replyMessage) {
      inquiry.replyMessage = replyMessage;
    }

    await inquiry.save();
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// MARK MULTIPLE AS REPLIED - NEW
// =======================
exports.markMultipleAsReplied = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No inquiry IDs provided" });
    }
    
    await Inquiry.updateMany(
      { _id: { $in: ids } },
      { 
        replied: true, 
        repliedAt: new Date() 
      }
    );
    
    res.json({ 
      message: `${ids.length} ${ids.length === 1 ? 'inquiry' : 'inquiries'} marked as replied`,
      count: ids.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// ADD REPLY MESSAGE - NEW
// =======================
exports.addReply = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    inquiry.replied = true;
    inquiry.repliedAt = new Date();
    inquiry.replyMessage = replyMessage;

    await inquiry.save();
    res.json(inquiry);
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