// middleware/rateLimiter.final.js
const rateLimit = require("express-rate-limit");

// Use the library's built-in IP generator (THIS IS THE KEY!)
const { ipKeyGenerator } = rateLimit;

// General limiter for all public routes
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator, // Use the library's built-in helper
  skip: (req) => req.method === "OPTIONS",
});

// Strict limiter for inquiry submissions
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many inquiry submissions. Please wait 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator, // Use the library's built-in helper
  skip: (req) => req.method === "OPTIONS",
});

// Health check limiter
const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    message: "Too many health checks. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator, // Use the library's built-in helper
  skip: (req) => req.method === "OPTIONS",
});

// Auth limiter (for future use)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator, // Use the library's built-in helper
  skipSuccessfulRequests: true,
  skip: (req) => req.method === "OPTIONS",
});

module.exports = {
  publicLimiter,
  inquiryLimiter,
  healthLimiter,
  authLimiter,
};
