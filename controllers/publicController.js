// controllers/publicController.js
const mongoose = require("mongoose");
const Apartment = require("../models/Apartment");
const Inquiry = require("../models/Inquiry");
const emailService = require("../services/emailService");
const logger = require("../utils/logger");

// Helper to validate and sanitize inputs
const validateNumber = (value, defaultValue, min, max) => {
  const num = parseInt(value);
  if (isNaN(num) || num < min) return defaultValue;
  if (max && num > max) return max;
  return num;
};

/**
 * @desc    Get all available apartments for public viewing with filtering, search, pagination & sorting
 * @route   GET /api/public/apartments
 * @access  Public
 */
exports.getPublicApartments = async (req, res) => {
  try {
    // STEP 1: Parse all query parameters
    const {
      city,
      area,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      maxGuests,
      amenities,
      search,
      sort,
      page,
      limit,
    } = req.query;

    // STEP 2: Build base filter object
    let filter = { isAvailable: true };

    // Add basic filters if provided
    if (city) filter.city = city;
    if (area) filter.area = area;
    if (bedrooms) {
      const validated = validateNumber(bedrooms, null, 1, 10);
      if (validated) filter.bedrooms = validated;
    }

    if (bathrooms) {
      const validated = validateNumber(bathrooms, null, 1, 10);
      if (validated) filter.bathrooms = validated;
    }

    if (maxGuests) {
      const validated = validateNumber(maxGuests, null, 1, 20);
      if (validated) filter.maxGuests = { $gte: validated };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = validateNumber(minPrice, 0, 0, 10000);
      }
      if (maxPrice) {
        filter.price.$lte = validateNumber(maxPrice, 10000, 0, 10000);
      }
    }
    // STEP 3: Handle complex filters

    // Amenities (must include ALL specified)
    if (amenities) {
      const amenitiesArray = amenities.split(",").map((a) => a.trim());
      filter.amenities = { $all: amenitiesArray };
    }

    // Text search (search in name and description)
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Combine base filter with search query
    const finalFilter = { ...filter, ...searchQuery };

    // STEP 4: Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 9;
    const skip = (pageNum - 1) * limitNum;

    // STEP 5: Sorting
    let sortOption = { createdAt: -1 }; // default: newest first

    if (sort) {
      switch (sort) {
        case "price_asc":
          sortOption = { price: 1 };
          break;
        case "price_desc":
          sortOption = { price: -1 };
          break;
        case "newest":
          sortOption = { createdAt: -1 };
          break;
        case "oldest":
          sortOption = { createdAt: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    // STEP 6: Get total count for pagination
    const total = await Apartment.countDocuments(finalFilter);

    // STEP 7: Execute query with all filters, pagination and sorting
    const apartments = await Apartment.find(finalFilter)
      .select("-contact -__v")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // STEP 8: Calculate total pages
    const pages = Math.ceil(total / limitNum);

    // STEP 9: Send paginated response
    res.status(200).json({
      success: true,
      count: apartments.length,
      total,
      page: pageNum,
      pages,
      data: apartments,
    });
  } catch (error) {
    logger.error("Error in getPublicApartments:", error, { query: req.query });
    res.status(500).json({
      success: false,
      message: "Unable to fetch apartments. Please try again later.",
    });
  }
};

/**
 * @desc    Get single available apartment by ID
 * @route   GET /api/public/apartments/:id
 * @access  Public
 */
exports.getPublicApartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid apartment ID format",
      });
    }

    // Find apartment that exists AND is available
    const apartment = await Apartment.findOne({
      _id: id,
      isAvailable: true,
    })
      .select("-contact -__v")
      .lean();

    // If no apartment found
    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: "Apartment not found or no longer available",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      data: apartment,
    });
  } catch (error) {
    logger.error("Error in getPublicApartmentById:", error, {
      apartmentId: id,
    });
    res.status(500).json({
      success: false,
      message: "Unable to fetch apartment details. Please try again later.",
    });
  }
};

/**
 * @desc    Submit a new inquiry from public users
 * @route   POST /api/public/inquiries
 * @access  Public
 */
exports.createPublicInquiry = async (req, res) => {
  try {
    const { name, phone, email, message, apartmentId } = req.body;

    // =======================
    // VALIDATION - All fields required
    // =======================
    const errors = [];

    if (!name || name.trim() === "") {
      errors.push({ field: "name", message: "Name is required" });
    } else if (name.length < 2) {
      errors.push({
        field: "name",
        message: "Name must be at least 2 characters",
      });
    } else if (name.length > 100) {
      errors.push({
        field: "name",
        message: "Name must be less than 100 characters",
      });
    }

    // =======================
    // PHONE VALIDATION (Required - Kenyan format)
    // =======================
    if (!req.body.phone || req.body.phone.trim() === "") {
      errors.push({ field: "phone", message: "Phone number is required" });
    } else {
      const phone = req.body.phone.trim();

      // Kenyan phone number regex
      // Formats accepted: 0712345678, 0112345678, +254712345678, 254712345678
      const kenyanPhoneRegex = /^(?:\+?254|0)[17]\d{8}$/;

      if (!kenyanPhoneRegex.test(phone)) {
        errors.push({
          field: "phone",
          message:
            "Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)",
        });
      }
    }

    // =======================
    // EMAIL VALIDATION (Optional)
    // =======================
    if (req.body.email && req.body.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        errors.push({
          field: "email",
          message: "Please provide a valid email address",
        });
      }
    }
    // If email is empty, it's fine (optional)

    if (!message || message.trim() === "") {
      errors.push({ field: "message", message: "Message is required" });
    } else if (message.length < 10) {
      errors.push({
        field: "message",
        message: "Message must be at least 10 characters",
      });
    } else if (message.length > 1000) {
      errors.push({
        field: "message",
        message: "Message must be less than 1000 characters",
      });
    }

    if (!apartmentId) {
      errors.push({
        field: "apartmentId",
        message: "Apartment ID is required",
      });
    } else if (!apartmentId.match(/^[0-9a-fA-F]{24}$/)) {
      errors.push({
        field: "apartmentId",
        message: "Invalid apartment ID format",
      });
    }

    // If validation errors exist, return them
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // =======================
    // VERIFY APARTMENT EXISTS AND IS AVAILABLE
    // =======================
    const apartment = await Apartment.findOne({
      _id: apartmentId,
      isAvailable: true,
    });

    if (!apartment) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            field: "apartmentId",
            message: "Selected apartment is not available for inquiries",
          },
        ],
      });
    }

    // =======================
    // STEP 8: CHECK FOR DUPLICATE SUBMISSIONS (LAST 24 HOURS)
    // =======================
    const recentInquiry = await Inquiry.findOne({
      phone: phone.trim(),
      apartmentId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    });

    if (recentInquiry) {
      return res.status(429).json({
        success: false,
        message:
          "You've already submitted an inquiry for this apartment within the last 24 hours. We'll get back to you soon!",
      });
    }

    // =======================
    // CREATE INQUIRY
    // =======================
    const inquiry = new Inquiry({
      name: name.trim(),
      phone: phone.trim(), // 👈 ADD THIS
      email: email ? email.trim().toLowerCase() : null, // Handle optional email
      message: message.trim(),
      apartmentId,
      isRead: false,
      replied: false,
      repliedAt: null,
      replyMessage: null,
    });

    const savedInquiry = await inquiry.save();

    // =======================
    // POPULATE APARTMENT DETAILS FOR RESPONSE
    // =======================
    await savedInquiry.populate("apartmentId", "name city area price");

    // =======================
    // SEND EMAIL NOTIFICATIONS (NON-BLOCKING)
    // =======================
    try {
      // Send emails in background - don't await to avoid delaying response
      emailService
        .sendInquiryConfirmation(savedInquiry, savedInquiry.apartmentId)
        .then((result) => {
          if (result.success) {
            console.log(`📧 Confirmation email preview: ${result.previewUrl}`);
          }
        })
        .catch((err) => console.error("Email confirmation failed:", err));

      emailService
        .sendAdminNotification(savedInquiry, savedInquiry.apartmentId)
        .then((result) => {
          if (result.success) {
            console.log(`📧 Admin notification preview: ${result.previewUrl}`);
          }
        })
        .catch((err) => console.error("Admin notification failed:", err));
    } catch (emailError) {
      // Log but don't fail the request
      console.error("Email notification error:", emailError);
    }

    // =======================
    // SUCCESS RESPONSE (limited fields)
    // =======================
    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: {
        _id: savedInquiry._id,
        name: savedInquiry.name,
        phone: savedInquiry.phone, // 👈 ADD THIS
        email: savedInquiry.email,
        message: savedInquiry.message,
        apartment: {
          _id: savedInquiry.apartmentId._id,
          name: savedInquiry.apartmentId.name,
          city: savedInquiry.apartmentId.city,
          area: savedInquiry.apartmentId.area,
        },
        createdAt: savedInquiry.createdAt,
      },
    });
  } catch (error) {
    logger.error("Error in createPublicInquiry:", error, {
      body: { name, email, apartmentId },
    });

    // Handle duplicate key errors or other MongoDB errors
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));

      logger.warn("Validation error in inquiry", { errors });

      return res.status(400).json({
        success: false,
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to submit inquiry. Please try again later.",
    });
  }
};

/**
 * @desc    Health check for public API
 * @route   GET /api/public/health
 * @access  Public
 */
exports.healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Public API is operational",
    timestamp: new Date().toISOString(),
  });
};

/**
 * @desc    Get filter options for frontend (distinct cities, areas, price range)
 * @route   GET /api/public/filter-options
 * @access  Public
 */
exports.getFilterOptions = async (req, res) => {
  try {
    // Run aggregations in parallel for better performance
    const [cities, areas, priceStats] = await Promise.all([
      // Get distinct cities with their areas
      Apartment.aggregate([
        { $match: { isAvailable: true } },
        {
          $group: {
            _id: "$city",
            areas: { $addToSet: "$area" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            city: "$_id",
            areas: 1,
            _id: 0,
          },
        },
      ]),

      // Alternative: Get distinct areas (flat list if needed)
      Apartment.distinct("area", { isAvailable: true }),

      // Get min and max prices
      Apartment.aggregate([
        { $match: { isAvailable: true } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]),
    ]);

    // Get distinct amenities (if needed)
    const amenities = await Apartment.distinct("amenities", {
      isAvailable: true,
    });

    // Format price stats
    const priceRange = priceStats[0] || { minPrice: 0, maxPrice: 10000 };

    res.status(200).json({
      success: true,
      data: {
        cities: cities.map((c) => ({
          name: c.city,
          areas: c.areas.sort(),
        })),
        areas: areas.sort(),
        priceRange: {
          min: priceRange.minPrice,
          max: priceRange.maxPrice,
        },
        amenities: amenities.sort(),
      },
    });
  } catch (error) {
    logger.error("Error in getFilterOptions:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch filter options",
    });
  }
};

/**
 * @desc    Check MongoDB connection status
 * @route   GET /api/public/check-db
 * @access  Public
 */
exports.checkDatabase = async (req, res) => {
  try {
    // Try a simple count operation
    const start = Date.now();
    const count = await Apartment.countDocuments({});
    const duration = Date.now() - start;

    logger.info("Database check performed", {
      count,
      duration,
      state: mongoose.connection.readyState,
    });

    res.json({
      success: true,
      message: "MongoDB connected",
      count,
      responseTimeMs: duration,
      mongooseState: mongoose.connection.readyState,
    });
  } catch (error) {
    logger.error("Database check failed:", error);
    res.status(500).json({
      success: false,
      message: "MongoDB error",
      error: error.message,
    });
  }
};

/**
 * @desc    Test email functionality
 * @route   GET /api/public/test-email
 * @access  Public
 */
exports.testEmail = async (req, res) => {
  try {
    const testEmail = req.query.email || "test@example.com";
    const result = await emailService.testEmail(testEmail);

    if (result.success) {
      res.json({
        success: true,
        message: "Test email sent successfully",
        previewUrl: result.previewUrl,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
        error: result.error,
      });
    }
  } catch (error) {
    logger.error("Email test failed:", error);
    res.status(500).json({
      success: false,
      message: "Email test failed",
      error: error.message,
    });
  }
};
