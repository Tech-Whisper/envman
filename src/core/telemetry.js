const fs = require("fs-extra");
const path = require("path");

const TELEMETRY_PATH = path.join(process.cwd(), ".envman-telemetry.json");

async function trackUsage(commandName) {
  try {
    const exists = await fs.pathExists(TELEMETRY_PATH);
    if (!exists) return;
    
    const data = await fs.readJson(TELEMETRY_PATH);
    if (!data.enabled) return;
    
    // Simulate sending telemetry data
    data.events = data.events || [];
    data.events.push({ command: commandName, timestamp: new Date().toISOString() });
    await fs.writeJson(TELEMETRY_PATH, data);
  } catch (e) {
    // Fail silently, telemetry should never break the app
  }
}

async function enableTelemetry() {
  await fs.writeJson(TELEMETRY_PATH, { enabled: true, events: [] });
}

module.exports = {
  trackUsage,
  enableTelemetry
};
