const path = require("node:path");

const logsDir = path.join(__dirname, "logs");

module.exports = {
  apps: [
    {
      name: "red-date-api",
      script: "./dist/index.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: path.join(logsDir, "error.log"),
      out_file: path.join(logsDir, "out.log"),
      log_file: path.join(logsDir, "combined.log"),
      time: true,
    },
  ],
};
