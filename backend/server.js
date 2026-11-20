
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const serviceRoutes = require("./routes/serviceRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const connectDB = require("./config/db");
const { startMonitoring } = require("./services/scheduler");

const app = express();

// Fix: Use process.env.PORT for the server port, and MONGO_URI for the DB string
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI;

app.use(
  cors({
    origin: [
      "https://automated-web-service-frontend.onrender.com",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/services", serviceRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/notifications", notificationRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Automated Web Service Availability and Recovery System",
    status: "Backend is running successfully",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    status: "Healthy",
  });
});

// Start server after connecting to DB
const startServer = async () => {
  if (!DB_URI) {
    throw new Error("Missing MONGO_URI environment variable");
  }

  await connectDB(DB_URI);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (typeof startMonitoring === "function") {
      startMonitoring();
    }
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
