export default {
    transform: {
        "^.+\\.[tj]sx?$": "babel-jest", // Transform JS/TS files using Babel
    },
    verbose: true,
    setupFilesAfterEnv: ["./tests/utils/setupTestDB.js"],
    testEnvironment: "node", // Explicitly set the test environment to Node.js
};
