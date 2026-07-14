module.exports = {
  apps: [
    {
      name: 'vichar-bhandar',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000', // Assuming port 3000, adjust if needed via environment variables
      instances: 'max', // Use max CPUs for Next.js in production or a specific number like 1 or 2
      exec_mode: 'cluster', // Enables cluster mode for better performance and zero-downtime reloads
      env: {
        NODE_ENV: 'production',
      },
      // Automatically restart if it crashes
      autorestart: true,
      // Wait time before restarting a crashed app
      restart_delay: 3000,
      // Maximum memory before restarting
      max_memory_restart: '1G',
    },
  ],
};
