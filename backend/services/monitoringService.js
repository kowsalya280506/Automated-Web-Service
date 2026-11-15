
const axios = require("axios");

const Service = require("../models/Service");
const MonitoringHistory = require("../models/MonitoringHistory");
const Notification = require("../models/Notification");

const {
    getNextState,
    classifyInput
} = require("./stateMachine");

// Prevent simultaneous checks within this Node.js process
const activeChecks = new Set();

const monitorService = async (serviceId) => {

    const id = serviceId.toString();

    if (activeChecks.has(id)) {
        throw new Error(
            "Monitoring already running for this service"
        );
    }

    activeChecks.add(id);

    try {

        // Find service
        const service = await Service.findById(id);

        if (!service) {
            throw new Error("Service not found");
        }

        let statusCode = null;
        let responseTime = 0;
        let errorMessage = "";

        const startTime = Date.now();

        // Check website availability
        try {

            const response = await axios.get(service.url, {
                timeout: 5000,
                validateStatus: () => true
            });

            responseTime = Date.now() - startTime;
            statusCode = response.status;

        } catch (error) {

            responseTime = Date.now() - startTime;
            errorMessage = error.message;

            if (error.response) {
                statusCode = error.response.status;
            }
        }

        // Classify monitoring result
        const input = classifyInput(
            statusCode,
            responseTime
        );

        // Calculate FSM transition
        const previousState = service.currentStatus;

        const nextState = getNextState(
            previousState,
            input
        );

        console.log("STATE TRANSITION:", {
            service: service.name,
            previousState,
            nextState,
            changed: previousState !== nextState
        });

        // ATOMIC DATABASE UPDATE
        // Only one request can update this particular
        // previous state to the next state.

        const updatedService = await Service.findOneAndUpdate(
            {
                _id: service._id,
                currentStatus: previousState
            },
            {
                $set: {
                    currentStatus: nextState,
                    responseTime: responseTime,
                    lastChecked: new Date()
                }
            },
           {
    returnDocument: "after",
    runValidators: true
}
        );

        // Another request has already changed the state
        if (!updatedService) {

            const latestService = await Service.findById(id);

            console.log(
                "Concurrent state update skipped:",
                service.name
            );

            return {
                service: service.name,
                previousState,
                currentState: latestService
                    ? latestService.currentStatus
                    : null,
                message: "Concurrent state update skipped"
            };
        }

        // Save monitoring history
        await MonitoringHistory.create({
            serviceId: service._id,
            statusCode,
            responseTime,
            state: nextState,
            errorMessage
        });

        // CREATE NOTIFICATION ONLY WHEN STATE CHANGES
        if (nextState !== previousState) {

            let notificationType = null;
            let message = "";

            if (nextState === "Unavailable") {

                notificationType = "Failure";
                message = `${service.name} is unavailable!`;

            } else if (nextState === "Recovering") {

                notificationType = "Recovery";
                message = `${service.name} is recovering.`;

            } else if (nextState === "Restored") {

                notificationType = "Restored";
                message =
                    `${service.name} has been restored successfully!`;
            }

            // Save notification only for actual state transitions
            if (notificationType) {

                await Notification.create({
                    serviceId: service._id,
                    serviceName: service.name,
                    message,
                    type: notificationType
                });

                console.log(
                    "NOTIFICATION CREATED:",
                    service.name,
                    notificationType
                );
            }
        }

        console.log(
            `${service.name}: ${previousState} -> ${nextState} | HTTP: ${statusCode} | ${responseTime}ms`
        );

        return {
            service: service.name,
            statusCode,
            responseTime,
            previousState,
            currentState: nextState,
            errorMessage
        };

    } finally {

        // Always release the service lock
        activeChecks.delete(id);

    }
};

module.exports = monitorService;
