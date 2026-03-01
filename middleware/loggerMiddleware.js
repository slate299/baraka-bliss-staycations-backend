// middleware/loggerMiddleware.js
const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log when request completes
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.request(req, res.statusCode, duration);
  });

  next();
};

module.exports = requestLogger;
