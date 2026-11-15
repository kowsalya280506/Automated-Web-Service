
const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

// GET: Display all services
router.get("/", async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Add a new service
router.post("/", async (req, res) => {
    try {
        const { name, url } = req.body;

        if (!name || !url) {
            return res.status(400).json({
                message: "Service name and URL are required"
            });
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            return res.status(400).json({
                message: "Please enter a valid URL"
            });
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).json({
                message: "Only HTTP and HTTPS URLs are allowed"
            });
        }

        const existing = await Service.findOne({ url });

        if (existing) {
            return res.status(409).json({
                message: "This service URL already exists"
            });
        }

        const service = await Service.create({
            name: name.trim(),
            url: parsedUrl.href
        });

        res.status(201).json({
            message: "Service added successfully",
            service
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// PUT: Update an existing service
router.put("/:id", async (req, res) => {
    try {
        const { name, url } = req.body;

        if (!name || !url) {
            return res.status(400).json({
                message: "Service name and URL are required"
            });
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            return res.status(400).json({
                message: "Please enter a valid URL"
            });
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).json({
                message: "Only HTTP and HTTPS URLs are allowed"
            });
        }

        const existing = await Service.findOne({
            url: parsedUrl.href,
            _id: { $ne: req.params.id }
        });

        if (existing) {
            return res.status(409).json({
                message: "This URL is already registered"
            });
        }

        const service = await Service.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                url: parsedUrl.href
            },
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json({
            message: "Service updated successfully",
            service
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});
// DELETE: Remove a service
router.delete("/:id", async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json({ message: "Service deleted successfully" });

    } catch (error) {
        res.status(400).json({ message: "Invalid service ID" });
    }
});

module.exports = router;
