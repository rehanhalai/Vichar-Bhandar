#!/bin/bash
set -e

# This script is meant to be run on the VPS by the GitHub Action

echo "Starting deployment..."

# Pull latest changes
echo "Pulling latest code from origin..."
git pull origin main

# Install dependencies using pnpm
echo "Installing dependencies..."
pnpm install

# Build the Next.js application
echo "Building the application..."
pnpm run build

# Apply database migrations (Uncomment if needed)
# echo "Applying database migrations..."
# pnpm dlx drizzle-kit push

# Restart PM2 process
echo "Restarting application via PM2..."
pm2 start ecosystem.config.js || pm2 reload ecosystem.config.js

echo "Deployment completed successfully!"
