module.exports = {
  apps: [
    {
      name: "red-date-api",
      script: "./dist/index.js",
      cwd: "/var/www/admin/server",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/www/admin/server/logs/error.log",
      out_file: "/var/www/admin/server/logs/out.log",
      log_file: "/var/www/admin/server/logs/combined.log",
      time: true,
    },
  ],
};
