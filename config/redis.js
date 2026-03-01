// config/redis.js
const Redis = require("ioredis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    // Retry up to 3 times with delay
    if (times > 3) {
      console.error("Redis connection failed after 3 retries");
      return null; // Stop retrying
    }
    return Math.min(times * 100, 3000); // Delay between retries
  },
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
  // Don't crash the app, just log the error
});

module.exports = redisClient;
