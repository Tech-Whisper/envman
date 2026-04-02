module.exports = {
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/test/**/*.test.js",
  ],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/commands/interactive.js",
    "!src/commands/telemetryCmd.js",
    "!src/core/telemetry.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov"],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
};
