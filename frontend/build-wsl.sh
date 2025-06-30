#!/bin/bash

# WSL Build Script for BSG Helpdesk Frontend
# This script addresses common WSL build issues

echo "🔧 Starting WSL-optimized build for BSG Helpdesk..."

# Clear npm cache
echo "📦 Clearing npm cache..."
npm cache clean --force

# Remove node_modules and package-lock.json to start fresh
echo "🗑️  Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install dependencies with legacy peer deps flag
echo "⬇️  Installing dependencies with WSL-optimized settings..."
npm install --legacy-peer-deps --no-audit --prefer-offline

# Build the project
echo "🏗️  Building the project..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build files are in the 'build' directory"