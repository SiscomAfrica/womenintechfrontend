#!/bin/bash

echo "🔄 Restarting development server with updated environment..."

# Kill any existing dev server
echo "Stopping existing dev server..."
pkill -f "vite.*dev" || true
sleep 2

# Clear any cached environment
echo "Clearing environment cache..."
rm -rf node_modules/.vite 2>/dev/null || true

# Start fresh dev server
echo "Starting fresh dev server..."
echo "API URL: $(grep VITE_API_URL .env)"
npm run dev