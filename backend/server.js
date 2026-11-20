
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const serviceRoutes = require("./routes/serviceRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");
const connectDB = require("./config/db");
const { startMonitoring } = require("./services/scheduler");
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();

// Define PORT here
const PORT = process.env.MONGO_URI || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/services", serviceRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/notifications", notificationRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Automated Web Service Availability and Recovery System",
        status: "Backend is running successfully"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        status: "Healthy"
    });
});

// Start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);

        startMonitoring();
    });
};

startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
});
