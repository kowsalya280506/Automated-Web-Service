
const STATES = {
    HEALTHY: "Healthy",
    SLOW: "Slow",
    UNAVAILABLE: "Unavailable",
    RECOVERING: "Recovering",
    RESTORED: "Restored"
};

const INPUTS = {
    NORMAL: "I0",
    SLOW: "I1",
    FAILURE: "I2"
};

function getNextState(currentState, input) {

    const transitions = {
        Healthy: {
            I0: "Healthy",
            I1: "Slow",
            I2: "Unavailable"
        },

        Slow: {
            I0: "Healthy",
            I1: "Slow",
            I2: "Unavailable"
        },

        Unavailable: {
            I0: "Recovering",
            I1: "Recovering",
            I2: "Unavailable"
        },

        Recovering: {
            I0: "Restored",
            I1: "Recovering",
            I2: "Unavailable"
        },

        Restored: {
            I0: "Healthy",
            I1: "Slow",
            I2: "Unavailable"
        }
    };

    if (!transitions[currentState] ||
        !transitions[currentState][input]) {
        throw new Error("Invalid state or input");
    }

    return transitions[currentState][input];
}

function classifyInput(statusCode, responseTime) {

    if (
        statusCode === null ||
        statusCode < 200 ||
        statusCode >= 400
    ) {
        return INPUTS.FAILURE;
    }

    if (responseTime > 2000) {
        return INPUTS.SLOW;
    }

    return INPUTS.NORMAL;
}

module.exports = {
    STATES,
    INPUTS,
    getNextState,
    classifyInput
};
