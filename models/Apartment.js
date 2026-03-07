const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 1,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1,
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    // UPDATED: mediaFiles can be either strings (old) or objects (new)
    mediaFiles: [
      {
        type: mongoose.Schema.Types.Mixed, // This allows both strings and objects
      },
    ],
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Apartment", apartmentSchema);
