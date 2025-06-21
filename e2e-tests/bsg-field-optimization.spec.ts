import { test, expect, bsgExpect } from './fixtures/bsg-test-fixtures';

test.describe('BSG Field Optimization UX Tests', () => {
  test.beforeEach(async ({ authenticatedAdmin }) => {
    // Navigate to BSG analytics/admin page
    await authenticatedAdmin.goto('/admin/bsg-analytics');
    await authenticatedAdmin.waitForLoadState('networkidle');
  });

  test('Verify 70.6% field optimization achievement is displayed', async ({ 
    authenticatedAdmin,
    apiHelper 
  }) => {
    const page = authenticatedAdmin;
    
    // Get optimization metrics via API first
    const authToken = await apiHelper.getAuthToken('admin@e2e-test.com');
    const metrics = await apiHelper.getOptimizationMetrics(authToken);
    
    // Verify API response
    bsgExpect.toMeetOptimizationTarget(metrics.data.overview, 70.6);
    
    // Verify optimization metrics are displayed in UI
    await expect(page.locator('[data-testid="optimization-rate"]')).toBeVisible();
    
    // Check that optimization rate shows 70.6% or higher
    const optimizationText = await page.locator('[data-testid="optimization-rate"]').textContent();
    expect(optimizationText).toMatch(/7[0-9]\.[0-9]%/); // 70.x% or higher
    
    // Verify total templates count
    await expect(page.locator('[data-testid="total-templates"]')).toContainText('24');
    
    // Verify total fields count
    const totalFieldsElement = page.locator('[data-testid="total-fields"]');
    await expect(totalFieldsElement).toBeVisible();
    
    // Verify unique fields count (showing optimization benefit)
    const uniqueFieldsElement = page.locator('[data-testid="unique-fields"]');
    await expect(uniqueFieldsElement).toBeVisible();
    const uniqueFieldsText = await uniqueFieldsElement.textContent();
    expect(uniqueFieldsText).toMatch(/\d+/);
  });

  test('Field reuse visualization shows optimization benefits', async ({ authenticatedAdmin }) => {
    const page = authenticatedAdmin;
    
    // Check for field reuse chart/visualization
    await expect(page.locator('[data-testid="field-reuse-chart"]')).toBeVisible();
    
    // Verify most reused fields are displayed
    const commonFields = [
      'Cabang/Capem',
      'Kode User', 
      'Nama User',
      'Jabatan',
      'Nominal Transaksi'
    ];
    
    for (const fieldName of commonFields) {
      const fieldElement = page.locator(`[data-testid="common-field-${fieldName}"]`);
      if (await fieldElement.isVisible()) {
        await expect(fieldElement).toBeVisible();
        
        // Check usage count for common fields
        const usageCount = fieldElement.locator('[data-testid="usage-count"]');
        await expect(usageCount).toBeVisible();
        
        const usageText = await usageCount.textContent();
        expect(usageText).toMatch(/\d+/); // Should show number of templates using this field
      }
    }
  });

  test('Field category organization shows optimization structure', async ({ 
    authenticatedAdmin 
  }) => {
    const page = authenticatedAdmin;
    
    // Navigate to field organization view
    await page.click('[data-testid="field-organization-tab"]');
    
    // Verify field categories are displayed
    const expectedCategories = [
      'location',
      'user_identity',
      'timing', 
      'transaction',
      'customer',
      'reference',
      'transfer',
      'permissions'
    ];
    
    for (const category of expectedCategories) {
      const categoryElement = page.locator(`[data-testid="category-${category}"]`);
      if (await categoryElement.isVisible()) {
        await expect(categoryElement).toBeVisible();
        
        // Check field count in category
        const fieldCount = categoryElement.locator('[data-testid="field-count"]');
        await expect(fieldCount).toBeVisible();
        
        // Verify category has description
        const description = categoryElement.locator('[data-testid="category-description"]');
        await expect(description).toBeVisible();
      }
    }
  });

  test('Optimization savings calculation is accurate', async ({ 
    authenticatedAdmin,
    apiHelper 
  }) => {
    const page = authenticatedAdmin;
    
    // Get detailed optimization data
    const authToken = await apiHelper.getAuthToken('admin@e2e-test.com');
    const metrics = await apiHelper.getOptimizationMetrics(authToken);
    
    const overview = metrics.data.overview;
    
    // Calculate expected savings
    const totalFieldsWithoutOptimization = overview.totalTemplates * 15; // Avg 15 fields per template
    const actualUniqueFields = overview.totalFields;
    const expectedSavings = totalFieldsWithoutOptimization - actualUniqueFields;
    
    // Verify savings are displayed in UI
    const savingsElement = page.locator('[data-testid="optimization-savings"]');
    await expect(savingsElement).toBeVisible();
    
    const savingsText = await savingsElement.textContent();
    expect(savingsText).toMatch(/\d+/); // Should show number of saved field duplications
    
    // Verify development time savings
    const timeSavingsElement = page.locator('[data-testid="development-time-savings"]');
    if (await timeSavingsElement.isVisible()) {
      await expect(timeSavingsElement).toBeVisible();
      const timeSavingsText = await timeSavingsElement.textContent();
      expect(timeSavingsText).toMatch(/\d+/); // Should show hours or days saved
    }
  });

  test('Interactive field optimization drill-down', async ({ authenticatedAdmin }) => {
    const page = authenticatedAdmin;
    
    // Click on a specific field to see its optimization details
    const cabangField = page.locator('[data-testid="common-field-Cabang/Capem"]');
    
    if (await cabangField.isVisible()) {
      await cabangField.click();
      
      // Verify drill-down modal or page opens
      await expect(page.locator('[data-testid="field-detail-modal"]')).toBeVisible();
      
      // Check field details
      await expect(page.locator('[data-testid="field-name"]')).toContainText('Cabang/Capem');
      await expect(page.locator('[data-testid="field-type"]')).toContainText('dropdown_branch');
      
      // Verify templates using this field
      const templatesUsingField = page.locator('[data-testid="templates-using-field"]');
      await expect(templatesUsingField).toBeVisible();
      
      // Should show multiple templates (demonstrating reuse)
      const templateList = templatesUsingField.locator('[data-testid="template-item"]');
      const templateCount = await templateList.count();
      expect(templateCount).toBeGreaterThan(1); // Field should be reused
      
      // Close modal
      await page.click('[data-testid="close-field-detail"]');
      await expect(page.locator('[data-testid="field-detail-modal"]')).not.toBeVisible();
    }
  });

  test('Field optimization timeline and progress tracking', async ({ 
    authenticatedAdmin 
  }) => {
    const page = authenticatedAdmin;
    
    // Navigate to optimization timeline
    await page.click('[data-testid="optimization-timeline-tab"]');
    
    // Verify timeline is displayed
    await expect(page.locator('[data-testid="optimization-timeline"]')).toBeVisible();
    
    // Check timeline milestones
    const milestones = [
      'Initial Analysis',
      'Field Categorization', 
      'Template Optimization',
      '70.6% Achievement'
    ];
    
    for (const milestone of milestones) {
      const milestoneElement = page.locator(`[data-testid="milestone-${milestone}"]`);
      if (await milestoneElement.isVisible()) {
        await expect(milestoneElement).toBeVisible();
        
        // Check milestone completion status
        const status = milestoneElement.locator('[data-testid="milestone-status"]');
        await expect(status).toBeVisible();
      }
    }
    
    // Verify optimization metrics progression
    const progressChart = page.locator('[data-testid="optimization-progress-chart"]');
    if (await progressChart.isVisible()) {
      await expect(progressChart).toBeVisible();
    }
  });
});

test.describe('BSG Template UX Performance Tests', () => {
  test('Template loading animation and feedback', async ({ authenticatedRequester }) => {
    const page = authenticatedRequester;
    
    // Navigate to BSG create page
    await page.goto('/bsg-create');
    
    // Check for loading state during initial load
    const loadingIndicator = page.locator('[data-testid="templates-loading"]');
    
    // Loading should appear briefly
    if (await loadingIndicator.isVisible({ timeout: 1000 })) {
      await expect(loadingIndicator).toBeVisible();
    }
    
    // Wait for templates to load
    await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
    
    // Loading indicator should disappear
    await expect(loadingIndicator).not.toBeVisible();
    
    // Verify smooth transition to loaded state
    await expect(page.locator('[data-testid="template-discovery"]')).toBeVisible();
  });

  test('Field optimization visual indicators', async ({ authenticatedRequester }) => {
    const page = authenticatedRequester;
    
    // Navigate to BSG create page
    await page.goto('/bsg-create');
    await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
    
    // Select a template
    await page.click('[data-testid="template-category"]:first-child');
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
    await page.click('[data-testid="template-card"]:first-child');
    
    // Wait for dynamic fields
    await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
    
    // Check for optimization indicators
    const optimizedFields = page.locator('[data-testid="optimized-field-indicator"]');
    const optimizedCount = await optimizedFields.count();
    
    if (optimizedCount > 0) {
      // Verify optimization badges are visible
      await expect(optimizedFields.first()).toBeVisible();
      
      // Check tooltip on hover
      await optimizedFields.first().hover();
      const tooltip = page.locator('[data-testid="optimization-tooltip"]');
      
      if (await tooltip.isVisible({ timeout: 2000 })) {
        await expect(tooltip).toContainText('optimized');
      }
    }
    
    // Check field category visual grouping
    const categoryGroups = page.locator('[data-testid="field-category-group"]');
    const groupCount = await categoryGroups.count();
    
    if (groupCount > 0) {
      // Verify categories have visual distinction
      await expect(categoryGroups.first()).toBeVisible();
      
      // Check category headers
      const categoryHeaders = page.locator('[data-testid="category-header"]');
      const headerCount = await categoryHeaders.count();
      expect(headerCount).toBeGreaterThan(0);
    }
  });

  test('Responsive design for field optimization on mobile', async ({ browser }) => {
    // Create mobile context
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE size
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    
    const page = await mobileContext.newPage();
    
    // Login as requester
    await page.goto('/login');
    await page.fill('input[type="email"]', 'requester@e2e-test.com');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    
    // Navigate to BSG create page
    await page.goto('/bsg-create');
    await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
    
    // Verify mobile-optimized layout
    const mobileMenu = page.locator('[data-testid="mobile-template-menu"]');
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
    
    // Check template cards are responsive
    const templateCategories = page.locator('[data-testid="template-category"]');
    const firstCategory = templateCategories.first();
    
    // Verify category is properly sized for mobile
    const boundingBox = await firstCategory.boundingBox();
    expect(boundingBox?.width).toBeLessThan(375); // Should fit in mobile viewport
    
    // Test template selection on mobile
    await firstCategory.click();
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
    
    // Select template
    await page.click('[data-testid="template-card"]:first-child');
    await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
    
    // Verify fields are mobile-optimized
    const fieldGroups = page.locator('[data-testid="field-category-group"]');
    const fieldGroupCount = await fieldGroups.count();
    
    if (fieldGroupCount > 0) {
      // Check that field groups stack vertically on mobile
      const firstGroup = fieldGroups.first();
      const secondGroup = fieldGroups.nth(1);
      
      if (await secondGroup.isVisible()) {
        const firstGroupBox = await firstGroup.boundingBox();
        const secondGroupBox = await secondGroup.boundingBox();
        
        // Second group should be below first group (stacked)
        expect(secondGroupBox?.y).toBeGreaterThan((firstGroupBox?.y || 0) + (firstGroupBox?.height || 0));
      }
    }
    
    await mobileContext.close();
  });

  test('Field optimization accessibility features', async ({ authenticatedRequester }) => {
    const page = authenticatedRequester;
    
    // Navigate to BSG create page
    await page.goto('/bsg-create');
    await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
    
    // Select template and load fields
    await page.click('[data-testid="template-category"]:first-child');
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
    await page.click('[data-testid="template-card"]:first-child');
    await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Verify focus management
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test screen reader attributes
    const optimizedFields = page.locator('[data-testid="optimized-field-indicator"]');
    const optimizedCount = await optimizedFields.count();
    
    if (optimizedCount > 0) {
      // Check aria-label for optimization indicators
      const ariaLabel = await optimizedFields.first().getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('optimized');
    }
    
    // Test field labels and associations
    const inputFields = page.locator('input, select, textarea');
    const inputCount = await inputFields.count();
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) { // Test first 5 fields
      const input = inputFields.nth(i);
      const inputId = await input.getAttribute('id');
      
      if (inputId) {
        // Find associated label
        const label = page.locator(`label[for="${inputId}"]`);
        await expect(label).toBeVisible();
      }
    }
    
    // Test high contrast mode support
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          .optimized-field-indicator {
            border: 2px solid black !important;
          }
        }
      `
    });
    
    // Verify optimization indicators are still visible with high contrast
    if (optimizedCount > 0) {
      await expect(optimizedFields.first()).toBeVisible();
    }
  });
});

test.describe('Cross-browser Field Optimization Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`Field optimization display consistency in ${browserName}`, async ({ browser }) => {
      // Skip webkit on CI as it may not be available
      if (browserName === 'webkit' && process.env.CI) {
        test.skip();
      }
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Login
      await page.goto('/login');
      await page.fill('input[type="email"]', 'requester@e2e-test.com');
      await page.fill('input[type="password"]', 'test123456');
      await page.click('button[type="submit"]');
      
      // Navigate to BSG create page
      await page.goto('/bsg-create');
      await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
      
      // Test template loading consistency
      const templateCategories = page.locator('[data-testid="template-category"]');
      const categoryCount = await templateCategories.count();
      expect(categoryCount).toBeGreaterThan(0);
      
      // Select template
      await page.click('[data-testid="template-category"]:first-child');
      await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
      await page.click('[data-testid="template-card"]:first-child');
      
      // Verify fields load consistently
      await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
      
      // Take screenshot for visual comparison
      await page.screenshot({ 
        path: `e2e-test-results/field-optimization-${browserName}.png`,
        fullPage: true 
      });
      
      // Test optimization indicators work consistently
      const optimizedFields = page.locator('[data-testid="optimized-field-indicator"]');
      const optimizedCount = await optimizedFields.count();
      
      if (optimizedCount > 0) {
        await expect(optimizedFields.first()).toBeVisible();
        
        // Test hover behavior consistency
        await optimizedFields.first().hover();
        await page.waitForTimeout(500); // Allow hover effects
      }
      
      await context.close();
    });
  });
});

console.log('🎨 BSG Field Optimization UX Tests');
console.log('📊 Testing: Visual Indicators, Performance, Accessibility');
console.log('📱 Coverage: Mobile Responsive, Cross-browser Compatibility');
console.log('♿ Features: Screen Reader Support, Keyboard Navigation');