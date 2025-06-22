#!/bin/bash

# Install necessary dependencies
echo "Installing dependencies..."
cd backend && npm install && cd ..

# Start the frontend and backend servers if they're not already running
echo "Starting development servers..."
npm run dev &
DEV_PID=$!

# Wait for servers to start
echo "Waiting for servers to start..."
sleep 10

# Run the Playwright tests
echo "Running BSG workflow tests..."
npx playwright test --config=e2e-tests/playwright.bsg-workflow.config.js

# Capture the test result
TEST_RESULT=$?

# Stop the development servers
echo "Stopping development servers..."
kill $DEV_PID

# Exit with the test result
exit $TEST_RESULT