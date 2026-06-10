require("dotenv").config();
const express = require("express");
const whatsappRouter = require("./routes/whatsapp");

const app = express();
const PORT = process.env.PORT || 3000;

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Middleware for parsing URL-encoded bodies (essential for Twilio webhook payloads)
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Support JSON payloads for testing utility

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Mount the WhatsApp webhook route
// This exposes: POST /webhook/whatsapp
app.use("/webhook", whatsappRouter);

// Base route fallback
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Fatal Error]:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` WhatsApp Bot Server running on port ${PORT}`);
  console.log(` Webhook URL: http://localhost:${PORT}/webhook/whatsapp`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
  console.log(`===============================================`);
});
