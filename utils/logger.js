// utils/logger.js
const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get current date for log file naming
const getDateString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

// Write to log file
const writeToFile = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };

  const fileName = `${getDateString()}.log`;
  const filePath = path.join(logsDir, fileName);

  fs.appendFileSync(filePath, JSON.stringify(logEntry) + "\n");
};

// Logger object with different log levels
const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${message}`, Object.keys(data).length ? data : "");
    writeToFile("INFO", message, data);
  },

  error: (message, error = null, data = {}) => {
    console.error(`[ERROR] ${message}`, error ? error.message : "", data);
    writeToFile("ERROR", message, {
      error: error ? { message: error.message, stack: error.stack } : null,
      ...data,
    });
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, Object.keys(data).length ? data : "");
    writeToFile("WARN", message, data);
  },

  debug: (message, data = {}) => {
    if (process.env.DEBUG === "true") {
      console.log(`[DEBUG] ${message}`, Object.keys(data).length ? data : "");
      writeToFile("DEBUG", message, data);
    }
  },

  // Special method for inquiry logging
  inquiry: (inquiry, action = "created") => {
    const logData = {
      inquiryId: inquiry._id,
      name: inquiry.name,
      email: inquiry.email,
      apartmentId: inquiry.apartmentId?._id || inquiry.apartmentId,
      action,
    };

    console.log(`[INQUIRY] ${action}: ${inquiry.email} - ${inquiry._id}`);
    writeToFile("INQUIRY", `Inquiry ${action}`, logData);
  },

  // Special method for API request logging
  request: (req, status = 200, duration = 0) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      status,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
    };

    if (process.env.DEBUG === "true") {
      console.log(
        `[REQUEST] ${req.method} ${req.originalUrl} - ${status} (${duration}ms)`,
      );
    }
    writeToFile("REQUEST", `${req.method} ${req.originalUrl}`, logData);
  },
};

module.exports = logger;
