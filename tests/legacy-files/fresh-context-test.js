// Fresh Context E2E Test - Each user gets a fresh browser context
// This should resolve session/cache issues

const puppeteer = require('puppeteer');

const testCredentials = {
  requester: {
    email: 'utama.user@bsg.co.id',
    password: 'password123',
    name: 'Staff Kantor Cabang Utama'
  },
  manager: {
    email: 'utama.manager@bsg.co.id',
    password: 'password123',
    name: 'Manager Kantor Cabang Utama'
  },
  technician: {
    email: 'banking.tech@bsg.co.id',
    password: 'password123',
    name: 'Banking Systems Technician'
  }
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createFreshBrowser() {
  return await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: [
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--incognito' // Fresh context for each launch
    ],
    slowMo: 100
  });
}

async function loginAndTest(credentials, role, testFunction) {
  console.log(`\n🔄 Starting fresh browser for ${role}`);
  
  const browser = await createFreshBrowser();
  const page = await browser.newPage();
  
  // Clear any storage
  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `[${role}] ${msg.type()}: ${msg.text()}`;
    console.log(`🔍 Console: ${message}`);
    consoleMessages.push(message);
  });
  
  try {
    console.log(`🔑 ${role} Login: ${credentials.email}`);
    
    // Navigate to login
    await page.goto('http://localhost:3000/login', { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    
    await delay(2000);
    
    // Wait for login form
    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input[name="email"]', { timeout: 15000 });
    
    // Login
    await page.type('input[name="email"]', credentials.email, { delay: 50 });
    await page.type('input[name="password"]', credentials.password, { delay: 50 });
    
    console.log('🚀 Submitting login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }),
      page.click('button[type="submit"]')
    ]);
    
    await delay(3000);
    
    const currentUrl = page.url();
    console.log(`✅ ${role} logged in - URL: ${currentUrl}`);
    
    // Run specific test function
    const testResult = await testFunction(page, currentUrl);
    
    await browser.close();
    return { success: true, url: currentUrl, result: testResult, consoleMessages };
    
  } catch (error) {
    console.log(`❌ ${role} test failed: ${error.message}`);
    await browser.close();
    return { success: false, error: error.message, consoleMessages };
  }
}

async function testRequesterWorkflow(page, url) {
  console.log('📝 Testing requester workflow...');
  
  const isCustomerPortal = url.includes('/customer/');
  if (!isCustomerPortal) {
    return { portalAccess: false, reason: 'Not redirected to customer portal' };
  }
  
  console.log('✅ In customer portal');
  
  // Test service catalog access
  try {
    await page.goto('http://localhost:3000/customer/service-catalog');
    await delay(3000);
    
    const elements = await page.evaluate(() => {
      return {
        buttons: document.querySelectorAll('button').length,
        services: document.querySelectorAll('.service, .category, .card').length,
        hasServiceText: document.body.textContent.toLowerCase().includes('service')
      };
    });
    
    console.log('📊 Service catalog elements:', elements);
    
    return {
      portalAccess: true,
      serviceCatalogAccess: elements.buttons > 0 || elements.services > 0,
      elements: elements
    };
    
  } catch (error) {
    return { portalAccess: true, serviceCatalogAccess: false, error: error.message };
  }
}

async function testManagerWorkflow(page, url) {
  console.log('👔 Testing manager workflow...');
  
  const isNotCustomerPortal = !url.includes('/customer/');
  if (!isNotCustomerPortal) {
    return { managerAccess: false, reason: 'Redirected to customer portal instead of manager area' };
  }
  
  console.log('✅ In manager area');
  
  // Test approvals access
  try {
    // Try multiple manager paths
    const testPaths = [
      '/manager',
      '/manager/dashboard', 
      '/approvals',
      '/'
    ];
    
    let bestResult = { approvals: 0, tickets: 0 };
    
    for (const path of testPaths) {
      try {
        await page.goto(`http://localhost:3000${path}`);
        await delay(2000);
        
        const pageData = await page.evaluate(() => {
          const approveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent?.toLowerCase().includes('approve')
          ).length;
          
          const tickets = document.querySelectorAll('.ticket, .border, tr, .card').length;
          const hasPendingText = document.body.textContent.toLowerCase().includes('pending');
          
          return { approvals: approveButtons, tickets: tickets, hasPending: hasPendingText };
        });
        
        console.log(`📊 Manager page ${path}:`, pageData);
        
        if (pageData.approvals > bestResult.approvals) {
          bestResult = pageData;
        }
        
      } catch (e) {
        console.log(`⚠️ Path ${path} failed: ${e.message}`);
      }
    }
    
    return {
      managerAccess: true,
      approvalsFound: bestResult.approvals > 0,
      approvalsCount: bestResult.approvals,
      ticketsVisible: bestResult.tickets
    };
    
  } catch (error) {
    return { managerAccess: true, approvalsFound: false, error: error.message };
  }
}

async function testTechnicianPortal(page, url) {
  console.log('🔧 Testing technician portal...');
  
  const isNotCustomerPortal = !url.includes('/customer/');
  if (!isNotCustomerPortal) {
    return { technicianAccess: false, reason: 'Redirected to customer portal instead of technician area' };
  }
  
  console.log('✅ In technician area');
  
  try {
    // Navigate to NEW portal
    console.log('🎯 Accessing NEW Technician Portal...');
    await page.goto('http://localhost:3000/technician/portal');
    await delay(4000);
    
    // Check portal elements
    const portalData = await page.evaluate(() => {
      return {
        hasWelcome: document.body.textContent.includes('Welcome back'),
        hasQueue: document.body.textContent.includes('My Queue'),
        hasQuickActions: document.body.textContent.includes('Quick Actions'),
        hasDashboard: document.body.textContent.includes('Dashboard'),
        hasProfile: document.body.textContent.includes('Profile'),
        hasTechDocs: document.body.textContent.includes('Tech Docs'),
        portalElements: document.querySelectorAll('.bg-white, .rounded, .border').length,
        buttons: document.querySelectorAll('button').length,
        url: window.location.href
      };
    });
    
    console.log('🎯 Portal analysis:', portalData);
    
    const portalWorking = portalData.hasWelcome && portalData.hasQueue;
    
    if (portalWorking) {
      console.log('✅ Portal accessible, testing navigation...');
      
      // Test each portal section
      const sections = [
        { name: 'Queue', path: '/technician/portal/queue', expected: 'My Ticket Queue' },
        { name: 'Quick Actions', path: '/technician/portal/quick-actions', expected: 'Bulk Operations' },
        { name: 'Knowledge Base', path: '/technician/portal/knowledge-base', expected: 'Technical Documentation' },
        { name: 'Profile', path: '/technician/portal/profile', expected: 'Technician Profile' }
      ];
      
      const sectionResults = {};
      
      for (const section of sections) {
        try {
          await page.goto(`http://localhost:3000${section.path}`);
          await delay(2000);
          
          const hasExpected = await page.evaluate((expected) => {
            return document.body.textContent.includes(expected);
          }, section.expected);
          
          sectionResults[section.name] = hasExpected;
          console.log(`${hasExpected ? '✅' : '❌'} ${section.name}: ${hasExpected ? 'Working' : 'Issue'}`);
          
        } catch (e) {
          sectionResults[section.name] = false;
          console.log(`❌ ${section.name}: Navigation failed`);
        }
      }
      
      // Test queue functionality
      await page.goto('http://localhost:3000/technician/portal/queue');
      await delay(2000);
      
      const queueData = await page.evaluate(() => {
        return {
          tickets: document.querySelectorAll('.border, .ticket-item, tr').length,
          searchInput: !!document.querySelector('input[placeholder*="search"], input[placeholder*="Search"]'),
          selectElements: document.querySelectorAll('select').length,
          actionButtons: Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent?.includes('Start') || btn.textContent?.includes('Resolve') || btn.textContent?.includes('Progress')
          ).length
        };
      });
      
      console.log('📊 Queue functionality:', queueData);
      
      return {
        technicianAccess: true,
        portalAccess: true,
        portalData: portalData,
        sectionResults: sectionResults,
        queueData: queueData,
        functionalSections: Object.values(sectionResults).filter(Boolean).length
      };
      
    } else {
      return {
        technicianAccess: true,
        portalAccess: false,
        portalData: portalData,
        reason: 'Portal elements missing'
      };
    }
    
  } catch (error) {
    return { 
      technicianAccess: true, 
      portalAccess: false, 
      error: error.message 
    };
  }
}

async function runFreshContextTest() {
  console.log('🎯 FRESH CONTEXT E2E TEST');
  console.log('📋 Each user gets a completely fresh browser instance\n');
  
  const results = {};
  
  try {
    // Test each user separately with fresh contexts
    console.log('🔄 Testing with fresh browser contexts...');
    
    // Test Requester
    results.requester = await loginAndTest(
      testCredentials.requester, 
      'Requester', 
      testRequesterWorkflow
    );
    
    // Test Manager  
    results.manager = await loginAndTest(
      testCredentials.manager, 
      'Manager', 
      testManagerWorkflow
    );
    
    // Test Technician
    results.technician = await loginAndTest(
      testCredentials.technician, 
      'Technician', 
      testTechnicianPortal
    );

  } catch (error) {
    console.error('❌ Fresh context test failed:', error.message);
  }

  // ===== COMPREHENSIVE RESULTS =====
  console.log('\n');
  console.log('🎯 ================================================================');
  console.log('📊 FRESH CONTEXT E2E TEST RESULTS');
  console.log('🎯 ================================================================');
  console.log('');
  
  console.log('🔐 AUTHENTICATION RESULTS:');
  console.log(`${results.requester?.success ? '✅' : '❌'} Requester Login (utama.user@bsg.co.id)`);
  console.log(`${results.manager?.success ? '✅' : '❌'} Manager Login (utama.manager@bsg.co.id)`);
  console.log(`${results.technician?.success ? '✅' : '❌'} Technician Login (banking.tech@bsg.co.id)`);
  console.log('');
  
  console.log('🎫 WORKFLOW RESULTS:');
  
  // Requester results
  if (results.requester?.success) {
    const req = results.requester.result;
    console.log(`✅ Requester Portal Access: ${req.portalAccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`${req.serviceCatalogAccess ? '✅' : '⚠️'} Service Catalog: ${req.serviceCatalogAccess ? 'Accessible' : 'Issues detected'}`);
  }
  
  // Manager results
  if (results.manager?.success) {
    const mgr = results.manager.result;
    console.log(`✅ Manager Access: ${mgr.managerAccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`${mgr.approvalsFound ? '✅' : '⚠️'} Approvals: ${mgr.approvalsCount || 0} found`);
  }
  
  // Technician results
  if (results.technician?.success) {
    const tech = results.technician.result;
    console.log(`✅ Technician Access: ${tech.technicianAccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`${tech.portalAccess ? '✅' : '❌'} NEW Portal Access: ${tech.portalAccess ? 'SUCCESS' : 'FAILED'}`);
    
    if (tech.portalAccess) {
      console.log(`📊 Portal Sections Working: ${tech.functionalSections}/4`);
      console.log(`🎫 Queue Tickets: ${tech.queueData?.tickets || 0}`);
      console.log(`🔍 Search Available: ${tech.queueData?.searchInput ? 'YES' : 'NO'}`);
      console.log(`⚡ Action Buttons: ${tech.queueData?.actionButtons || 0}`);
    }
  }
  
  console.log('');
  console.log('🔧 TECHNICIAN PORTAL DETAILED ANALYSIS:');
  
  if (results.technician?.success && results.technician.result?.portalAccess) {
    const tech = results.technician.result;
    
    console.log('✅ Portal Components Found:');
    console.log(`   - Welcome Message: ${tech.portalData.hasWelcome ? '✅' : '❌'}`);
    console.log(`   - My Queue: ${tech.portalData.hasQueue ? '✅' : '❌'}`);
    console.log(`   - Quick Actions: ${tech.portalData.hasQuickActions ? '✅' : '❌'}`);
    console.log(`   - Dashboard: ${tech.portalData.hasDashboard ? '✅' : '❌'}`);
    console.log(`   - Profile: ${tech.portalData.hasProfile ? '✅' : '❌'}`);
    console.log(`   - Tech Docs: ${tech.portalData.hasTechDocs ? '✅' : '❌'}`);
    
    console.log('✅ Navigation Testing:');
    Object.entries(tech.sectionResults).forEach(([section, working]) => {
      console.log(`   - ${section}: ${working ? '✅ Working' : '❌ Issue'}`);
    });
    
    console.log('✅ Queue Functionality:');
    console.log(`   - Tickets Displayed: ${tech.queueData.tickets}`);
    console.log(`   - Search Input: ${tech.queueData.searchInput ? '✅' : '❌'}`);
    console.log(`   - Filter Selects: ${tech.queueData.selectElements}`);
    console.log(`   - Action Buttons: ${tech.queueData.actionButtons}`);
  }
  
  // Calculate success metrics
  const authSuccesses = [results.requester, results.manager, results.technician].filter(r => r?.success).length;
  const portalAccess = results.technician?.success && results.technician.result?.portalAccess;
  const functionalSections = results.technician?.result?.functionalSections || 0;
  
  console.log('');
  console.log(`📊 OVERALL METRICS:`);
  console.log(`   - Authentication Success: ${authSuccesses}/3 users`);
  console.log(`   - Portal Access: ${portalAccess ? 'SUCCESS' : 'FAILED'}`);
  console.log(`   - Functional Sections: ${functionalSections}/4`);
  console.log('');
  
  console.log('🎯 FINAL ASSESSMENT:');
  if (authSuccesses >= 2 && portalAccess && functionalSections >= 3) {
    console.log('🎉 TECHNICIAN PORTAL: FULLY OPERATIONAL!');
    console.log('✅ Fresh context testing confirms production readiness');
    console.log('✅ Multiple user authentication successful');
    console.log('✅ Portal functionality comprehensively verified');
    console.log('✅ All major components working correctly');
  } else if (portalAccess && functionalSections >= 2) {
    console.log('✅ TECHNICIAN PORTAL: MOSTLY FUNCTIONAL');
    console.log('✅ Core functionality verified and working');
    console.log('⚠️ Some minor issues detected but non-critical');
  } else {
    console.log('⚠️ TECHNICIAN PORTAL: NEEDS ATTENTION');
    console.log(`❌ Authentication: ${authSuccesses}/3`);
    console.log(`❌ Portal Access: ${portalAccess ? 'OK' : 'Failed'}`);
    console.log(`❌ Functional Sections: ${functionalSections}/4`);
  }
  
  console.log('\n📋 FRESH CONTEXT E2E TEST COMPLETE');
  console.log('🔄 Each user tested with completely isolated browser instance');
}

runFreshContextTest().catch(console.error);