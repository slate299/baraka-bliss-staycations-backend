// controllers/apartmentController.js
const Apartment = require("../models/Apartment");
const cloudinary = require("cloudinary").v2; // ADD THIS

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
    console.log("Files received by Multer:", req.files);

    const files = req.files || [];
    // Store as objects with url and publicId
    const mediaFiles = files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      filename: file.originalname,
    }));

    const newApartment = new Apartment({
      name: req.body.name,
      city: req.body.city,
      area: req.body.area,
      price: req.body.price,
      description: req.body.description,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      maxGuests: req.body.maxGuests,
      amenities: req.body.amenities,
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
  console.log("=== UPDATE APARTMENT DEBUG ===");
  console.log("Files received:", req.files);
  console.log("Media to remove:", req.body.mediaToRemove);

  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    // Update basic fields
    apartment.name = req.body.name || apartment.name;
    apartment.city = req.body.city || apartment.city;
    apartment.area = req.body.area || apartment.area;
    apartment.price = req.body.price || apartment.price;
    apartment.description = req.body.description || apartment.description;
    apartment.bedrooms = req.body.bedrooms || apartment.bedrooms;
    apartment.bathrooms = req.body.bathrooms || apartment.bathrooms;
    apartment.maxGuests = req.body.maxGuests || apartment.maxGuests;
    apartment.contact = req.body.contact || apartment.contact;

    // Parse amenities
    if (req.body.amenities) {
      if (Array.isArray(req.body.amenities)) {
        apartment.amenities = req.body.amenities;
      } else if (typeof req.body.amenities === "string") {
        apartment.amenities = req.body.amenities
          .split(",")
          .map((a) => a.trim());
      }
    }

    // Handle isAvailable
    if (req.body.isAvailable !== undefined) {
      apartment.isAvailable =
        req.body.isAvailable === "true" || req.body.isAvailable === true;
    }

    // 🔥 HANDLE MEDIA REMOVAL - Delete from Cloudinary
    if (req.body.mediaToRemove) {
      try {
        const filesToRemove = JSON.parse(req.body.mediaToRemove);
        console.log("Files to remove:", filesToRemove);

        // Delete each file from Cloudinary
        for (const fileUrl of filesToRemove) {
          try {
            // Extract public_id from the URL or use stored publicId
            let publicId;

            // Find the media object in current apartment
            const mediaItem = apartment.mediaFiles.find(
              (m) =>
                (typeof m === "object" && m.url === fileUrl) || m === fileUrl,
            );

            if (
              mediaItem &&
              typeof mediaItem === "object" &&
              mediaItem.publicId
            ) {
              // If we have stored publicId, use it
              publicId = mediaItem.publicId;
            } else {
              // Extract from URL (for backward compatibility)
              const urlParts = fileUrl.split("/");
              const filename = urlParts[urlParts.length - 1];
              publicId = `baraka-bliss/${filename.split(".")[0]}`;
            }

            // Delete from Cloudinary
            await cloudinary.uploader.destroy(publicId);
            console.log(`✅ Deleted from Cloudinary: ${publicId}`);
          } catch (cloudinaryError) {
            console.error(
              "❌ Failed to delete from Cloudinary:",
              cloudinaryError.message,
            );
          }
        }

        // Filter out removed files from mediaFiles array
        apartment.mediaFiles = apartment.mediaFiles.filter((media) => {
          const mediaUrl = typeof media === "object" ? media.url : media;
          return !filesToRemove.includes(mediaUrl);
        });
      } catch (error) {
        console.error("Error parsing mediaToRemove:", error);
      }
    }

    // Handle new uploaded files
    if (req.files && req.files.length > 0) {
      console.log("New files:", req.files);
      const newMediaFiles = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
        filename: file.originalname,
      }));

      apartment.mediaFiles = [...apartment.mediaFiles, ...newMediaFiles];
    }

    const updatedApartment = await apartment.save();
    res.json(updatedApartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// =======================
// DELETE apartment - NOW WITH CLOUDINARY CLEANUP
// =======================
exports.deleteApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    // 🔥 DELETE ALL IMAGES FROM CLOUDINARY FIRST
    if (apartment.mediaFiles && apartment.mediaFiles.length > 0) {
      console.log(
        `Deleting ${apartment.mediaFiles.length} images from Cloudinary...`,
      );

      for (const media of apartment.mediaFiles) {
        try {
          let publicId;

          if (typeof media === "object" && media.publicId) {
            // New format: we have publicId stored
            publicId = media.publicId;
          } else if (typeof media === "string") {
            // Old format: extract from URL
            const urlParts = media.split("/");
            const filename = urlParts[urlParts.length - 1];
            publicId = `baraka-bliss/${filename.split(".")[0]}`;
          } else {
            console.log("Skipping unknown media format:", media);
            continue;
          }

          // Delete from Cloudinary
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`✅ Deleted from Cloudinary: ${publicId}`, result);
        } catch (cloudinaryError) {
          console.error(
            "❌ Failed to delete from Cloudinary:",
            cloudinaryError.message,
          );
        }
      }
    }

    // Now delete the apartment from MongoDB
    await apartment.deleteOne();

    res.json({
      message: "Apartment and all associated images deleted successfully",
      imagesDeleted: apartment.mediaFiles?.length || 0,
    });
  } catch (error) {
    console.error("Error deleting apartment:", error);
    res.status(500).json({ message: error.message });
  }
};
