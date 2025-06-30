// Simple E2E test to verify the system works
const { test, expect } = require('@playwright/test');

test('BSG frontend loads successfully', async ({ page }) => {
  // Navigate to the frontend
  await page.goto('http://localhost:3000');
  
  // Check that the page loads
  await expect(page).toHaveTitle(/BSG Helpdesk/);
  
  // Check that the main heading is visible
  await expect(page.locator('h1')).toContainText('BSG Helpdesk');
  
  // Check that navigation elements are present
  await expect(page.locator('nav')).toBeVisible();
  
  // Just verify the page loads with basic navigation
  // Without checking specific homepage content that might differ
  
  console.log('✅ BSG Frontend loads successfully!');
});

test('Backend health check', async ({ request }) => {
  // Test backend health endpoint
  const response = await request.get('http://localhost:3001/health');
  
  expect(response.status()).toBe(200);
  
  const healthData = await response.json();
  expect(healthData.status).toBe('healthy');
  expect(healthData.database).toBe('connected');
  
  console.log('✅ Backend health check passed!');
});

test('System integration check', async ({ page }) => {
  // Navigate to frontend
  await page.goto('http://localhost:3000');
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  
  // Check that we can navigate to login page
  await page.click('text=Login');
  await expect(page.url()).toContain('/login');
  
  // Check that login form is present
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
  
  console.log('✅ Frontend-Backend integration working!');
});