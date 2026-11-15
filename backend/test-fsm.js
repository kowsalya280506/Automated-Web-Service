
const {
    getNextState,
    classifyInput
} = require("./services/stateMachine");

console.log("===== FSM COMPLETE TESTING =====");

const testCases = [
    ["Healthy", "I0", "Healthy"],
    ["Healthy", "I1", "Slow"],
    ["Healthy", "I2", "Unavailable"],

    ["Slow", "I0", "Healthy"],
    ["Slow", "I1", "Slow"],
    ["Slow", "I2", "Unavailable"],

    ["Unavailable", "I0", "Recovering"],
    ["Unavailable", "I1", "Recovering"],
    ["Unavailable", "I2", "Unavailable"],

    ["Recovering", "I0", "Restored"],
    ["Recovering", "I1", "Recovering"],
    ["Recovering", "I2", "Unavailable"],

    ["Restored", "I0", "Healthy"],
    ["Restored", "I1", "Slow"],
    ["Restored", "I2", "Unavailable"]
];

let passed = 0;
let failed = 0;

testCases.forEach(([current, input, expected]) => {

    const actual = getNextState(current, input);

    if (actual === expected) {
        console.log(
            `PASS: ${current} + ${input} = ${actual}`
        );
        passed++;
    } else {
        console.log(
            `FAIL: ${current} + ${input} | Expected: ${expected}, Got: ${actual}`
        );
        failed++;
    }
});

console.log("\n===== CLASSIFICATION TESTING =====");

const classificationTests = [
    [200, 500, "I0"],
    [200, 2500, "I1"],
    [500, 300, "I2"],
    [null, 0, "I2"]
];

classificationTests.forEach(([status, time, expected]) => {

    const actual = classifyInput(status, time);

    console.log(
        `${actual === expected ? "PASS" : "FAIL"}: HTTP ${status}, ${time}ms => ${actual}`
    );

    if (actual === expected) passed++;
    else failed++;
});

console.log("\n===== FINAL RESULT =====");
console.log("Total Passed:", passed);
console.log("Total Failed:", failed);
console.log(
    failed === 0 ? "ALL TESTS PASSED!" : "SOME TESTS FAILED!"
);
