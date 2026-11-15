
const Service = require("../models/Service");
const monitorService = require("./monitoringService");

let monitoringInterval = null;
let isRunning = false;

const runMonitoringCycle = async () => {

    if (isRunning) {
        console.log("Previous monitoring cycle is still running.");
        return;
    }

    isRunning = true;

    try {
        const services = await Service.find();

        console.log(
            `Starting monitoring cycle for ${services.length} services...`
        );

        for (const service of services) {
            try {
                const result = await monitorService(service._id);
                console.log("Monitoring result:", result);
            } catch (error) {
                console.error(
                    `Monitoring failed for ${service.name}:`,
                    error.message
                );
            }
        }

        console.log("Monitoring cycle completed.");

    } catch (error) {
        console.error("Monitoring cycle error:", error.message);
    } finally {
        isRunning = false;
    }
};

const startMonitoring = () => {

    if (monitoringInterval) {
        console.log("Monitoring scheduler is already running.");
        return;
    }

    console.log("Automatic monitoring started: Every 30 seconds.");

    // Run the first monitoring cycle immediately
    runMonitoringCycle();

    // Repeat every 30 seconds
   monitoringInterval = setInterval(() => {
    runMonitoringCycle();
}, 30000);
};

const stopMonitoring = () => {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
        console.log("Automatic monitoring stopped.");
    }
};

module.exports = {
    startMonitoring,
    stopMonitoring
};
