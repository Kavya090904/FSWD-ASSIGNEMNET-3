const os = require("os");
const fs = require("fs");
const path = require("path");

function inspectEnvironment() {
  try {
    // Collect system details
    const systemInfo = {
      username: os.userInfo().username,
      homeDirectory: os.homedir(),
      hostname: os.hostname(),
      networkInterfaces: os.networkInterfaces(),
      environmentVariables: process.env,
    };

    // Display on console
    console.log("👤 Username:", systemInfo.username);
    console.log("🏠 Home Directory:", systemInfo.homeDirectory);
    console.log("💻 Hostname:", systemInfo.hostname);
    console.log("🌐 Network Interfaces:", systemInfo.networkInterfaces);
    console.log("🧾 Environment Variables:");
    console.log(systemInfo.environmentVariables);

    // Create logs folder and file path
    const logsDir = path.join(__dirname, "logs");
    const filePath = path.join(logsDir, "env-details.json");

    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Write system info to env-details.json
    fs.writeFileSync(filePath, JSON.stringify(systemInfo, null, 2), "utf-8");

    console.log(`✅ Environment details saved to ${filePath}`);
  } catch (err) {
    console.error("❌ Failed to inspect environment:", err.message);
  }
}

inspectEnvironment();
