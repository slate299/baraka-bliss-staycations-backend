// controllers/apartmentController.js
const Apartment = require("../models/Apartment");

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
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    // Update fields if provided
    apartment.name = req.body.name || apartment.name;
    apartment.city = req.body.city || apartment.city;
    apartment.area = req.body.area || apartment.area;
    apartment.price = req.body.price || apartment.price;
    apartment.description = req.body.description || apartment.description;
    apartment.bedrooms = req.body.bedrooms || apartment.bedrooms;
    apartment.bathrooms = req.body.bathrooms || apartment.bathrooms;
    apartment.maxGuests = req.body.maxGuests || apartment.maxGuests;
    apartment.amenities = req.body.amenities || apartment.amenities;
    apartment.contact = req.body.contact || apartment.contact;
    apartment.isAvailable =
      req.body.isAvailable !== undefined
        ? req.body.isAvailable
        : apartment.isAvailable;

    // Optional: handle new uploaded media files
    if (req.files && req.files.length > 0) {
      const mediaFiles = req.files.map((file) => file.path);
      apartment.mediaFiles = mediaFiles;
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
