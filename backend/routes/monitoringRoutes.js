
const express = require("express");
const router = express.Router();

const monitorService = require("../services/monitoringService");
const Service = require("../models/Service");
const MonitoringHistory = require("../models/MonitoringHistory");

// Monitor a particular service
router.post("/:id/check", async (req, res) => {
    try {
        const result = await monitorService(req.params.id);

        res.status(200).json({
            success: true,
            message: "Monitoring completed",
            result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get monitoring history
router.get("/:id/history", async (req, res) => {
    try {
        const history = await MonitoringHistory
            .find({ serviceId: req.params.id })
            .sort({ checkedAt: -1 });

        res.json(history);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Monitor all registered services
router.post("/check-all", async (req, res) => {
    try {
        const services = await Service.find();

        const results = await Promise.all(
            services.map(async (service) => {
                try {
                    return await monitorService(service._id);
                } catch (error) {
                    return {
                        service: service.name,
                        error: error.message
                    };
                }
            })
        );

        res.json({
            success: true,
            results
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
