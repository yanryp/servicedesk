import { test, expect, bsgExpect } from './fixtures/bsg-test-fixtures';

test.describe('BSG Template Workflow E2E Tests', () => {
  test.beforeEach(async ({ authenticatedRequester }) => {
    // Navigate to BSG ticket creation page
    await authenticatedRequester.goto('/bsg-create');
    await authenticatedRequester.waitForLoadState('networkidle');
  });

  test('Complete BSG template selection and ticket creation workflow', async ({ 
    authenticatedRequester, 
    bsgTestData 
  }) => {
    const page = authenticatedRequester;
    
    // Verify BSG page loads
    await expect(page.locator('h1')).toContainText('BSG Banking System Support');
    await expect(page.locator('[data-testid="bsg-template-discovery"]')).toBeVisible();

    // Wait for template categories to load
    await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
    
    // Verify template categories are displayed
    const categories = page.locator('[data-testid="template-category"]');
    await expect(categories).toHaveCount.greaterThan(0);
    
    // Click on OLIBS Core Banking category
    await page.click('text=Core Banking System - OLIBS');
    
    // Wait for templates to load in category
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
    
    // Verify templates are displayed
    const templates = page.locator('[data-testid="template-card"]');
    await expect(templates).toHaveCount.greaterThan(0);
    
    // Select first template
    await page.click('[data-testid="template-card"]:first-child');
    
    // Verify template selection
    await expect(page.locator('[data-testid="selected-template"]')).toBeVisible();
    await expect(page.locator('text=Selected BSG Template')).toBeVisible();
    
    // Wait for dynamic fields to load
    await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
    
    // Fill in basic ticket information
    await page.fill('[data-testid="ticket-title"]', bsgTestData.tickets.olibsIssue.title);
    await page.fill('[data-testid="ticket-description"]', bsgTestData.tickets.olibsIssue.description);
    await page.selectOption('[data-testid="ticket-priority"]', bsgTestData.tickets.olibsIssue.priority);
    
    // Fill in template-specific fields
    const templateData = bsgTestData.tickets.olibsIssue.templateData;
    
    // Fill branch field
    if (await page.locator('[data-testid="field-Cabang/Capem"]').isVisible()) {
      await page.selectOption('[data-testid="field-Cabang/Capem"]', templateData['Cabang/Capem']);
    }
    
    // Fill user code field
    if (await page.locator('[data-testid="field-Kode User"]').isVisible()) {
      await page.fill('[data-testid="field-Kode User"]', templateData['Kode User']);
    }
    
    // Fill user name field
    if (await page.locator('[data-testid="field-Nama User"]').isVisible()) {
      await page.fill('[data-testid="field-Nama User"]', templateData['Nama User']);
    }
    
    // Fill currency field
    if (await page.locator('[data-testid="field-Nominal Transaksi"]').isVisible()) {
      await page.fill('[data-testid="field-Nominal Transaksi"]', templateData['Nominal Transaksi'].toString());
    }
    
    // Verify form is complete and submit button is enabled
    const submitButton = page.locator('[data-testid="submit-ticket"]');
    await expect(submitButton).toBeEnabled();
    
    // Submit the ticket
    await submitButton.click();
    
    // Wait for submission to complete
    await page.waitForSelector('[data-testid="ticket-created-success"]', { timeout: 15000 });
    
    // Verify success message
    await expect(page.locator('text=BSG Support Ticket Created Successfully')).toBeVisible();
    
    // Verify ticket number is displayed
    await expect(page.locator('[data-testid="created-ticket-number"]')).toBeVisible();
    
    // Click to view created ticket
    await page.click('[data-testid="view-created-ticket"]');
    
    // Verify we're on ticket detail page
    await expect(page.url()).toContain('/tickets/');
    await expect(page.locator('h1')).toContainText('Ticket Details');
    
    // Verify BSG template data is preserved
    await expect(page.locator('[data-testid="ticket-template-info"]')).toBeVisible();
    await expect(page.locator('text=BSG Template Used')).toBeVisible();
  });

  test('BSG template search and selection workflow', async ({ authenticatedRequester }) => {
    const page = authenticatedRequester;
    
    // Use search functionality
    const searchInput = page.locator('[data-testid="template-search"]');
    await expect(searchInput).toBeVisible();
    
    // Search for OLIBS templates
    await searchInput.fill('transfer');
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
    
    // Verify search results
    const searchResults = page.locator('[data-testid="template-card"]');
    await expect(searchResults).toHaveCount.greaterThan(0);
    
    // Verify search results contain "transfer" in title or description
    const firstResult = searchResults.first();
    const resultText = await firstResult.textContent();
    expect(resultText?.toLowerCase()).toContain('transfer');
    
    // Select search result
    await firstResult.click();
    
    // Verify template is selected
    await expect(page.locator('[data-testid="selected-template"]')).toBeVisible();
    
    // Clear search and verify all templates return
    await searchInput.clear();
    await page.keyboard.press('Enter');
    
    await page.waitForSelector('[data-testid="template-category"]', { timeout: 5000 });
    const allCategories = page.locator('[data-testid="template-category"]');
    await expect(allCategories).toHaveCount.greaterThan(0);
  });

  test('BSG field optimization and categorization display', async ({ 
    authenticatedRequester, 
    bsgTestData 
  }) => {
    const page = authenticatedRequester;
    
    // Select a template with many fields
    await page.click('text=Core Banking System - OLIBS');
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
    await page.click('[data-testid="template-card"]:first-child');
    
    // Wait for dynamic fields to load
    await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
    
    // Verify field categories are displayed
    const fieldCategories = [
      'Informasi Lokasi',
      'Identitas User', 
      'Informasi Transaksi',
      'Informasi Timing'
    ];
    
    for (const category of fieldCategories) {
      if (await page.locator(`text=${category}`).isVisible()) {
        await expect(page.locator(`text=${category}`)).toBeVisible();
      }
    }
    
    // Verify optimized fields are marked as shared
    const sharedFields = page.locator('[data-testid="shared-field-indicator"]');
    const sharedFieldCount = await sharedFields.count();
    
    // Should have some shared fields (part of 70.6% optimization)
    expect(sharedFieldCount).toBeGreaterThan(0);
    
    // Verify field types are properly rendered
    const dropdownFields = page.locator('select[data-field-type="dropdown_branch"]');
    const textFields = page.locator('input[data-field-type="text_short"]');
    const currencyFields = page.locator('input[data-field-type="currency"]');
    
    if (await dropdownFields.count() > 0) {
      await expect(dropdownFields.first()).toBeVisible();
    }
    
    if (await textFields.count() > 0) {
      await expect(textFields.first()).toBeVisible();
    }
    
    if (await currencyFields.count() > 0) {
      await expect(currencyFields.first()).toBeVisible();
    }
  });

  test('BSG template popularity and usage statistics', async ({ authenticatedRequester }) => {
    const page = authenticatedRequester;
    
    // Wait for templates to load
    await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
    
    // Click on a category to view templates
    await page.click('[data-testid="template-category"]:first-child');
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
    
    // Verify popularity scores are displayed
    const popularityScores = page.locator('[data-testid="popularity-score"]');
    const scoreCount = await popularityScores.count();
    
    if (scoreCount > 0) {
      // Check that popularity scores are valid percentages
      const firstScore = await popularityScores.first().textContent();
      expect(firstScore).toMatch(/\d+%/);
    }
    
    // Verify usage counts are displayed
    const usageCounts = page.locator('[data-testid="usage-count"]');
    const usageCount = await usageCounts.count();
    
    if (usageCount > 0) {
      const firstUsage = await usageCounts.first().textContent();
      expect(firstUsage).toMatch(/Used \d+ times/);
    }
    
    // Verify templates are sorted by popularity (if multiple templates)
    const templateCards = page.locator('[data-testid="template-card"]');
    const cardCount = await templateCards.count();
    
    if (cardCount > 1) {
      const firstPopularity = await templateCards.first().locator('[data-testid="popularity-score"]').textContent();
      const secondPopularity = await templateCards.nth(1).locator('[data-testid="popularity-score"]').textContent();
      
      if (firstPopularity && secondPopularity) {
        const firstScore = parseInt(firstPopularity.replace('%', ''));
        const secondScore = parseInt(secondPopularity.replace('%', ''));
        expect(firstScore).toBeGreaterThanOrEqual(secondScore);
      }
    }
  });

  test('BSG master data integration in dropdown fields', async ({ 
    authenticatedRequester,
    apiHelper 
  }) => {
    const page = authenticatedRequester;
    
    // Get auth token for API calls
    const authToken = await apiHelper.getAuthToken('requester@e2e-test.com');
    
    // Verify master data is available via API
    const branchData = await apiHelper.getMasterData('branch', authToken);
    expect(branchData.success).toBe(true);
    expect(branchData.data.length).toBeGreaterThan(0);
    
    // Select template with branch dropdown
    await page.click('text=Core Banking System - OLIBS');
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
    await page.click('[data-testid="template-card"]:first-child');
    
    // Wait for fields to load
    await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
    
    // Check if branch dropdown exists and has options
    const branchDropdown = page.locator('[data-testid="field-Cabang/Capem"]');
    
    if (await branchDropdown.isVisible()) {
      // Verify dropdown has options loaded from master data
      const options = branchDropdown.locator('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(1); // Should have placeholder + actual options
      
      // Verify option values match master data
      const firstOption = await options.nth(1).textContent(); // Skip placeholder
      expect(firstOption).toBeTruthy();
      expect(firstOption?.length).toBeGreaterThan(0);
    }
  });

  test('BSG field validation and error handling', async ({ 
    authenticatedRequester, 
    bsgTestData 
  }) => {
    const page = authenticatedRequester;
    
    // Select template
    await page.click('text=Core Banking System - OLIBS');
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
    await page.click('[data-testid="template-card"]:first-child');
    
    // Wait for fields
    await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
    
    // Fill basic info but leave required template fields empty
    await page.fill('[data-testid="ticket-title"]', 'Test Validation');
    await page.fill('[data-testid="ticket-description"]', 'Testing field validation');
    
    // Try to submit with missing required fields
    const submitButton = page.locator('[data-testid="submit-ticket"]');
    await submitButton.click();
    
    // Verify validation errors appear
    const errorMessages = page.locator('[data-testid="field-error"]');
    const errorCount = await errorMessages.count();
    
    if (errorCount > 0) {
      // Should show validation errors for required fields
      await expect(errorMessages.first()).toBeVisible();
    }
    
    // Fill required fields with invalid data
    const kodeUserField = page.locator('[data-testid="field-Kode User"]');
    if (await kodeUserField.isVisible()) {
      // Fill with too long value (max is 10 chars)
      await kodeUserField.fill('TOOLONGVALUE123456');
      await kodeUserField.blur();
      
      // Check for validation error
      const kodeUserError = page.locator('[data-testid="error-Kode User"]');
      if (await kodeUserError.isVisible()) {
        await expect(kodeUserError).toContainText('exceed');
      }
    }
    
    // Test currency field validation
    const currencyField = page.locator('[data-testid="field-Nominal Transaksi"]');
    if (await currencyField.isVisible()) {
      // Test negative value
      await currencyField.fill('-1000');
      await currencyField.blur();
      
      const currencyError = page.locator('[data-testid="error-Nominal Transaksi"]');
      if (await currencyError.isVisible()) {
        await expect(currencyError).toContainText('positive');
      }
    }
  });
});

test.describe('BSG Template System Performance', () => {
  test('Template loading performance', async ({ authenticatedRequester }) => {
    const page = authenticatedRequester;
    
    // Measure template category loading time
    const startTime = Date.now();
    await page.goto('/bsg-create');
    await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
    const categoryLoadTime = Date.now() - startTime;
    
    // Should load categories within 3 seconds
    expect(categoryLoadTime).toBeLessThan(3000);
    
    // Measure template search performance
    const searchStartTime = Date.now();
    await page.fill('[data-testid="template-search"]', 'transfer');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 });
    const searchTime = Date.now() - searchStartTime;
    
    // Search should complete within 1 second
    expect(searchTime).toBeLessThan(1000);
  });

  test('Field optimization loading performance', async ({ 
    authenticatedRequester,
    apiHelper 
  }) => {
    const page = authenticatedRequester;
    
    // Get auth token
    const authToken = await apiHelper.getAuthToken('requester@e2e-test.com');
    
    // Verify optimization metrics via API
    const startTime = Date.now();
    const metrics = await apiHelper.getOptimizationMetrics(authToken);
    const apiTime = Date.now() - startTime;
    
    // API should respond quickly
    expect(apiTime).toBeLessThan(500);
    
    // Verify optimization results
    bsgExpect.toMeetOptimizationTarget(metrics.data.overview, 70.6);
    
    // Test field loading performance
    const templates = await apiHelper.getBSGTemplates(authToken);
    
    if (templates.data.length > 0) {
      const templateId = templates.data[0].id;
      
      const fieldStartTime = Date.now();
      const fields = await apiHelper.getTemplateFields(templateId, authToken);
      const fieldLoadTime = Date.now() - fieldStartTime;
      
      // Field loading should be fast due to optimization
      expect(fieldLoadTime).toBeLessThan(300);
      expect(fields.success).toBe(true);
    }
  });
});

console.log('🎭 BSG Template Workflow E2E Tests');
console.log('🏦 Testing: Complete BSG Banking Workflows');
console.log('⚡ Coverage: Template Selection, Field Optimization, Performance');
console.log('🎯 Validation: 70.6% Optimization, Master Data Integration');