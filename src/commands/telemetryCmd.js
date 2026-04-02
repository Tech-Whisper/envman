const { enableTelemetry } = require("../core/telemetry");
const chalk = require("chalk");

async function telemetryCmd() {
  await enableTelemetry();
  console.log(chalk.green("Telemetry enabled. Thank you for your support!"));
}

module.exports = {
  telemetryCmd
};
