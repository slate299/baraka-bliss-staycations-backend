// controllers/apartmentController.js
const Apartment = require("../models/Apartment");
const fs = require("fs");
const path = require("path");

// =======================
// GET all apartments
// =======================
exports.getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find();
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// GET single apartment by ID
// =======================
exports.getApartmentById = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }
    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// CREATE new apartment
// =======================
exports.createApartment = async (req, res) => {
  try {
    // Debug: see what files Multer received
    console.log("Files received by Multer:", req.files);

    // Get uploaded files from Multer
    const files = req.files || [];
    const mediaFiles = files.map((file) => file.path);

    const newApartment = new Apartment({
      name: req.body.name,
      city: req.body.city,
      area: req.body.area,
      price: req.body.price,
      description: req.body.description,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      maxGuests: req.body.maxGuests,
      amenities: req.body.amenities, // array of strings
      mediaFiles: mediaFiles,
      contact: req.body.contact,
      isAvailable:
        req.body.isAvailable !== undefined ? req.body.isAvailable : true,
    });

    const savedApartment = await newApartment.save();
    res.status(201).json(savedApartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// =======================
// UPDATE apartment
// =======================
exports.updateApartment = async (req, res) => {
  // ADD THIS DEBUG BLOCK
  console.log("=== UPDATE APARTMENT DEBUG ===");
  console.log("1. Headers content-type:", req.headers["content-type"]);
  console.log("2. Body keys:", Object.keys(req.body));
  console.log("3. Files received by Multer:", req.files);
  console.log("4. Request body:", req.body);
  console.log("5. Media to remove:", req.body.mediaToRemove); // ADD THIS
  console.log("==============================");

  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    // Update basic fields if provided
    apartment.name = req.body.name || apartment.name;
    apartment.city = req.body.city || apartment.city;
    apartment.area = req.body.area || apartment.area;
    apartment.price = req.body.price || apartment.price;
    apartment.description = req.body.description || apartment.description;
    apartment.bedrooms = req.body.bedrooms || apartment.bedrooms;
    apartment.bathrooms = req.body.bathrooms || apartment.bathrooms;
    apartment.maxGuests = req.body.maxGuests || apartment.maxGuests;
    apartment.contact = req.body.contact || apartment.contact;

    // Parse amenities array correctly
    if (req.body.amenities) {
      if (Array.isArray(req.body.amenities)) {
        apartment.amenities = req.body.amenities;
      } else if (typeof req.body.amenities === "string") {
        // Split comma-separated string from FormData
        apartment.amenities = req.body.amenities
          .split(",")
          .map((a) => a.trim());
      }
    }

    // Convert isAvailable string ("true"/"false") to boolean
    if (req.body.isAvailable !== undefined) {
      apartment.isAvailable =
        req.body.isAvailable === "true" || req.body.isAvailable === true;
    }

    // 🔥 NEW: Handle media files to remove
    if (req.body.mediaToRemove) {
      try {
        const filesToRemove = JSON.parse(req.body.mediaToRemove);
        console.log("Files to remove from database:", filesToRemove);

        // Filter out the removed files from mediaFiles array
        apartment.mediaFiles = apartment.mediaFiles.filter(
          (media) => !filesToRemove.includes(media),
        );

        // Optional: Delete physical files from uploads folder
        const fs = require("fs");
        const path = require("path");

        filesToRemove.forEach((filePath) => {
          const fullPath = path.join(__dirname, "..", filePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log("Deleted physical file:", fullPath);
          }
        });
      } catch (error) {
        console.error("Error parsing mediaToRemove:", error);
      }
    }

    // Handle new uploaded media files
    if (req.files && req.files.length > 0) {
      console.log("Files being saved:", req.files);
      const mediaFiles = req.files.map((file) => file.path);

      // IMPORTANT: Append new files to existing ones, don't replace
      apartment.mediaFiles = [...apartment.mediaFiles, ...mediaFiles];
    }

    const updatedApartment = await apartment.save();
    res.json(updatedApartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// =======================
// DELETE apartment
// =======================
exports.deleteApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    await apartment.deleteOne();
    res.json({ message: "Apartment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
