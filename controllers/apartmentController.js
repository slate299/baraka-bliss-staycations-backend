// apartmentController.js
const Apartment = require("../models/Apartment");

// Example function placeholder
exports.getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find(); // fetch all apartments
    res.json(apartments); // send JSON response
  } catch (error) {
    res.status(500).json({ message: error.message }); // handle errors
  }
};

exports.getApartmentById = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id); // find by id
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }
    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createApartment = async (req, res) => {
  try {
    // Debug: see what files Multer received
    console.log("Files received by Multer:", req.files);

    // Get uploaded files from Multer
    const files = req.files || [];
    const mediaFiles = files.map((file) => file.path); // save file paths

    // Create new apartment
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
      mediaFiles: mediaFiles, // <-- use the mapped files here
      contact: req.body.contact,
      isAvailable: req.body.isAvailable || true,
    });

    const savedApartment = await newApartment.save();
    res.status(201).json(savedApartment); // return the saved apartment
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
