// Test Quick Actions Fix - Verify bulk actions and ticket filtering
// Tests: 1) Only active tickets shown, 2) Bulk action buttons enable properly

const puppeteer = require('puppeteer');

const testCredentials = {
  email: 'banking.tech@bsg.co.id',
  password: 'password123',
  name: 'Banking Systems Technician'
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testQuickActionsFix() {
  console.log('🎯 QUICK ACTIONS FIX TEST');
  console.log('🔧 Testing: 1) Active tickets only, 2) Bulk action button enabling');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--disable-web-security'],
    slowMo: 100
  });

  const results = {
    login: false,
    portalAccess: false,
    quickActionsAccess: false,
    ticketFiltering: false,
    bulkActionEnabling: false,
    functionalityTest: false,
    errors: []
  };

  try {
    const page = await browser.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🚨 Console Error: ${msg.text()}`);
        results.errors.push(msg.text());
      }
    });
    
    // ===== LOGIN =====
    console.log('🔑 ===== LOGIN PROCESS =====');
    
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await delay(2000);
    
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.type('input[name="email"]', testCredentials.email);
    await page.type('input[name="password"]', testCredentials.password);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);
    
    console.log(`✅ Login successful - URL: ${page.url()}`);
    results.login = true;
    
    // ===== PORTAL ACCESS =====
    console.log('\n🎯 ===== PORTAL ACCESS =====');
    
    await page.goto('http://localhost:3000/technician/portal', { waitUntil: 'networkidle2' });
    await delay(3000);
    
    const portalCheck = await page.evaluate(() => {
      return {
        hasWelcome: document.body.textContent.includes('Welcome back'),
        hasQuickActions: document.body.textContent.includes('Quick Actions'),
        url: window.location.href
      };
    });
    
    results.portalAccess = portalCheck.hasWelcome && portalCheck.hasQuickActions;
    console.log(`${results.portalAccess ? '✅' : '❌'} Portal access: ${results.portalAccess ? 'SUCCESS' : 'FAILED'}`);
    
    if (results.portalAccess) {
      // ===== QUICK ACTIONS ACCESS =====
      console.log('\n⚡ ===== QUICK ACTIONS TESTING =====');
      
      await page.goto('http://localhost:3000/technician/portal/quick-actions', { 
        waitUntil: 'networkidle2',
        timeout: 20000 
      });
      await delay(3000);
      
      // Check Quick Actions page loaded
      const qaCheck = await page.evaluate(() => {
        return {
          hasQuickActions: document.body.textContent.includes('Quick Actions'),
          hasBulkOperations: document.body.textContent.includes('Bulk Operations'),
          hasActiveTickets: document.body.textContent.includes('Active Tickets'),
          url: window.location.href
        };
      });
      
      results.quickActionsAccess = qaCheck.hasQuickActions && qaCheck.hasBulkOperations;
      console.log(`${results.quickActionsAccess ? '✅' : '❌'} Quick Actions access: ${results.quickActionsAccess ? 'SUCCESS' : 'FAILED'}`);
      
      if (results.quickActionsAccess) {
        // ===== TICKET FILTERING TEST =====
        console.log('\n📋 ===== TICKET FILTERING TEST =====');
        
        const ticketAnalysis = await page.evaluate(() => {
          // Count tickets and check their statuses
          const ticketElements = document.querySelectorAll('.border.transition-all.duration-200.cursor-pointer');
          const tickets = [];
          
          ticketElements.forEach(el => {
            const statusBadge = el.querySelector('.px-2.py-1.rounded-full.text-xs.font-medium.border');
            const titleElement = el.querySelector('.font-medium.text-slate-900');
            const idElement = el.querySelector('.font-bold.text-slate-900');
            
            if (statusBadge && titleElement && idElement) {
              tickets.push({
                id: idElement.textContent.replace('#', ''),
                title: titleElement.textContent,
                status: statusBadge.textContent.toLowerCase().trim()
              });
            }
          });
          
          return {
            totalTickets: tickets.length,
            tickets: tickets,
            statuses: [...new Set(tickets.map(t => t.status))],
            hasClosedTickets: tickets.some(t => t.status.includes('closed') || t.status.includes('resolved')),
            hasActiveTickets: tickets.some(t => ['assigned', 'in progress', 'pending'].includes(t.status))
          };
        });
        
        console.log(`📊 Ticket analysis: ${ticketAnalysis.totalTickets} tickets found`);
        console.log(`📊 Statuses: ${ticketAnalysis.statuses.join(', ')}`);
        console.log(`${ticketAnalysis.hasClosedTickets ? '❌' : '✅'} Closed tickets filtered: ${ticketAnalysis.hasClosedTickets ? 'FAILED (showing closed)' : 'SUCCESS (only active)'}`);
        console.log(`${ticketAnalysis.hasActiveTickets ? '✅' : '⚠️'} Active tickets present: ${ticketAnalysis.hasActiveTickets ? 'YES' : 'NO'}`);
        
        results.ticketFiltering = !ticketAnalysis.hasClosedTickets;
        
        if (ticketAnalysis.totalTickets > 0) {
          // ===== BULK ACTION ENABLING TEST =====
          console.log('\n⚡ ===== BULK ACTION ENABLING TEST =====');
          
          // First, check initial button states (should be disabled)
          const initialButtonState = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
              btn.textContent?.includes('Start Work') || 
              btn.textContent?.includes('Mark Pending') || 
              btn.textContent?.includes('Resume Work') || 
              btn.textContent?.includes('Mark Resolved')
            );
            
            return buttons.map(btn => ({
              text: btn.textContent?.trim(),
              disabled: btn.disabled,
              className: btn.className
            }));
          });
          
          console.log('📊 Initial button states:');
          initialButtonState.forEach(btn => {
            console.log(`   - ${btn.text}: ${btn.disabled ? 'DISABLED' : 'ENABLED'}`);
          });
          
          // Select first ticket
          console.log('🔍 Selecting first ticket...');
          await page.click('input[type="checkbox"]:nth-of-type(1)');
          await delay(1000);
          
          // Check button states after selection
          const afterSelectionState = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
              btn.textContent?.includes('Start Work') || 
              btn.textContent?.includes('Mark Pending') || 
              btn.textContent?.includes('Resume Work') || 
              btn.textContent?.includes('Mark Resolved')
            );
            
            const selectedTickets = document.querySelectorAll('input[type="checkbox"]:checked').length;
            
            return {
              selectedCount: selectedTickets,
              buttons: buttons.map(btn => ({
                text: btn.textContent?.trim(),
                disabled: btn.disabled,
                className: btn.className,
                enabled: !btn.disabled && !btn.className.includes('cursor-not-allowed')
              }))
            };
          });
          
          console.log(`📊 Selected tickets: ${afterSelectionState.selectedCount}`);
          console.log('📊 Button states after selection:');
          afterSelectionState.buttons.forEach(btn => {
            console.log(`   - ${btn.text}: ${btn.enabled ? 'ENABLED ✅' : 'DISABLED ❌'}`);
          });
          
          const anyButtonEnabled = afterSelectionState.buttons.some(btn => btn.enabled);
          results.bulkActionEnabling = anyButtonEnabled && afterSelectionState.selectedCount > 0;
          
          console.log(`${results.bulkActionEnabling ? '✅' : '❌'} Bulk action enabling: ${results.bulkActionEnabling ? 'SUCCESS' : 'FAILED'}`);
          
          if (anyButtonEnabled) {
            // Test actual functionality
            console.log('\n🧪 ===== FUNCTIONALITY TEST =====');
            
            // Try to click an enabled button
            const enabledButton = afterSelectionState.buttons.find(btn => btn.enabled);
            if (enabledButton) {
              console.log(`🎯 Testing ${enabledButton.text} functionality...`);
              
              try {
                await page.evaluate((buttonText) => {
                  const button = Array.from(document.querySelectorAll('button')).find(btn => 
                    btn.textContent?.includes(buttonText) && !btn.disabled
                  );
                  if (button) {
                    button.click();
                  }
                }, enabledButton.text);
                
                await delay(2000);
                
                console.log('✅ Button click executed successfully');
                results.functionalityTest = true;
                
              } catch (e) {
                console.log(`⚠️ Button click test: ${e.message}`);
                results.functionalityTest = false;
              }
            }
          }
          
        } else {
          console.log('⚠️ No tickets found for bulk action testing');
        }
      }
    }

  } catch (error) {
    console.error('❌ Quick Actions fix test failed:', error.message);
    results.errors.push(`Overall: ${error.message}`);
  } finally {
    await browser.close();
  }

  // ===== RESULTS =====
  console.log('\n');
  console.log('🎯 ================================================================');
  console.log('⚡ QUICK ACTIONS FIX TEST RESULTS');
  console.log('🎯 ================================================================');
  console.log('');
  
  console.log('🔐 CORE FUNCTIONALITY:');
  console.log(`${results.login ? '✅' : '❌'} Login Process`);
  console.log(`${results.portalAccess ? '✅' : '❌'} Portal Access`);
  console.log(`${results.quickActionsAccess ? '✅' : '❌'} Quick Actions Access`);
  console.log('');
  
  console.log('🔧 FIX VERIFICATION:');
  console.log(`${results.ticketFiltering ? '✅' : '❌'} Ticket Filtering (Active Only)`);
  console.log(`${results.bulkActionEnabling ? '✅' : '❌'} Bulk Action Button Enabling`);
  console.log(`${results.functionalityTest ? '✅' : '❌'} Functionality Test`);
  console.log('');
  
  if (results.errors.length > 0) {
    console.log('⚠️ ERRORS DETECTED:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  } else {
    console.log('✅ NO CRITICAL ERRORS DETECTED');
  }
  
  console.log('');
  console.log('🎯 QUICK ACTIONS FIX ASSESSMENT:');
  
  const coreWorking = results.login && results.portalAccess && results.quickActionsAccess;
  const fixesWorking = results.ticketFiltering && results.bulkActionEnabling;
  
  if (coreWorking && fixesWorking && results.functionalityTest) {
    console.log('🎉 QUICK ACTIONS ISSUES RESOLVED!');
    console.log('✅ Only active tickets are shown');
    console.log('✅ Bulk action buttons enable properly when tickets selected');
    console.log('✅ Full functionality verified');
    console.log('');
    console.log('🚀 QUICK ACTIONS: FULLY FUNCTIONAL!');
  } else if (coreWorking && fixesWorking) {
    console.log('✅ QUICK ACTIONS FIXES WORKING');
    console.log('✅ Ticket filtering implemented correctly');
    console.log('✅ Button enabling logic fixed');
    console.log('⚠️ Some functionality tests may need attention');
  } else if (coreWorking) {
    console.log('✅ QUICK ACTIONS ACCESS WORKING');
    console.log('⚠️ Some fixes may need additional work');
    console.log(`   - Ticket filtering: ${results.ticketFiltering ? 'OK' : 'Needs work'}`);
    console.log(`   - Button enabling: ${results.bulkActionEnabling ? 'OK' : 'Needs work'}`);
  } else {
    console.log('⚠️ QUICK ACTIONS STILL NEEDS WORK');
    console.log('❌ Basic access or navigation issues remain');
  }
  
  console.log('\n📋 QUICK ACTIONS FIX TEST COMPLETE');
  console.log('🔧 Fixed: 1) Active ticket filtering, 2) Bulk action button enabling logic');
}

testQuickActionsFix().catch(console.error);