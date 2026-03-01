// scripts/cleanup-logs.js
const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../logs");
const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS) || 30;
const now = Date.now();

if (fs.existsSync(logsDir)) {
  const files = fs.readdirSync(logsDir);

  files.forEach((file) => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    const age = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

    if (age > retentionDays) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old log file: ${file}`);
    }
  });
}
