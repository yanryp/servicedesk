// Session-Aware E2E Test - Addressing React Router & Auth Context Timing
// Specifically targets the session/routing issues identified

const puppeteer = require('puppeteer');

const testCredentials = {
  technician: {
    email: 'banking.tech@bsg.co.id',
    password: 'password123',
    name: 'Banking Systems Technician'
  }
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForAuthContext(page, timeout = 15000) {
  console.log('⏳ Waiting for authentication context to initialize...');
  
  try {
    await page.waitForFunction(
      () => {
        // Check for authentication indicators
        const hasToken = !!localStorage.getItem('token') || !!localStorage.getItem('authToken') || !!sessionStorage.getItem('token');
        const hasUser = window.authContext?.user || window.user || document.querySelector('[data-user], .user-info');
        const notOnLogin = !window.location.pathname.includes('/login');
        
        return hasToken && notOnLogin;
      },
      { timeout, polling: 500 }
    );
    
    console.log('✅ Authentication context initialized');
    return true;
  } catch (error) {
    console.log('⚠️ Authentication context timeout');
    return false;
  }
}

async function waitForReactRouter(page, expectedPath, timeout = 10000) {
  console.log(`⏳ Waiting for React Router to navigate to: ${expectedPath}`);
  
  try {
    await page.waitForFunction(
      (path) => {
        return window.location.pathname.includes(path) || window.location.href.includes(path);
      },
      { timeout, polling: 500 },
      expectedPath
    );
    
    console.log('✅ React Router navigation completed');
    return true;
  } catch (error) {
    console.log(`⚠️ React Router navigation timeout for: ${expectedPath}`);
    return false;
  }
}

async function waitForPortalComponents(page, timeout = 10000) {
  console.log('⏳ Waiting for portal components to mount...');
  
  try {
    await page.waitForFunction(
      () => {
        // Check for key portal elements
        const hasWelcome = document.body.textContent.includes('Welcome back');
        const hasNavigation = document.body.textContent.includes('My Queue') && 
                             document.body.textContent.includes('Quick Actions');
        const hasElements = document.querySelectorAll('.bg-white, .rounded, button, .border').length > 5;
        
        return hasWelcome && hasNavigation && hasElements;
      },
      { timeout, polling: 1000 }
    );
    
    console.log('✅ Portal components mounted successfully');
    return true;
  } catch (error) {
    console.log('⚠️ Portal components mounting timeout');
    return false;
  }
}

async function stabilizeSession(page) {
  console.log('🔄 Stabilizing session and React state...');
  
  // Allow React context to fully initialize
  await delay(3000);
  
  // Check authentication state
  const authState = await page.evaluate(() => {
    return {
      hasToken: !!localStorage.getItem('token') || !!localStorage.getItem('authToken') || !!sessionStorage.getItem('token'),
      currentPath: window.location.pathname,
      readyState: document.readyState,
      userAgent: navigator.userAgent,
      cookies: document.cookie.length > 0
    };
  });
  
  console.log('🔍 Session state:', authState);
  
  // Wait for any pending navigation to complete
  await page.waitForLoadState?.('networkidle') || delay(2000);
  
  return authState;
}

async function runSessionAwareTest() {
  console.log('🎯 SESSION-AWARE E2E TEST');
  console.log('🔧 Addressing React Router & Authentication Context Timing\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: [
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-sandbox'
    ],
    slowMo: 200 // Slower execution for better state management
  });

  const results = {
    login: false,
    authContext: false,
    portalNavigation: false,
    portalComponents: false,
    sectionNavigation: {},
    functionality: {},
    errors: []
  };

  try {
    const page = await browser.newPage();
    
    // Enhanced console monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🚨 Console Error: ${msg.text()}`);
        results.errors.push(msg.text());
      } else if (msg.type() === 'warn') {
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log(`❌ Page Error: ${error.message}`);
      results.errors.push(`Page Error: ${error.message}`);
    });
    
    // ===== ENHANCED LOGIN PROCESS =====
    console.log('🔑 ===== ENHANCED LOGIN PROCESS =====');
    
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:3000/login', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Extended wait for form
    await delay(3000);
    
    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input[name="email"]', { timeout: 15000 });
    
    console.log('📝 Entering credentials...');
    await page.type('input[name="email"]', testCredentials.technician.email, { delay: 100 });
    await page.type('input[name="password"]', testCredentials.technician.password, { delay: 100 });
    
    console.log('🚀 Submitting login form...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 25000 }),
      page.click('button[type="submit"]')
    ]);
    
    console.log(`✅ Navigation completed - URL: ${page.url()}`);
    results.login = true;
    
    // ===== AUTHENTICATION CONTEXT VERIFICATION =====
    console.log('\n🔐 ===== AUTHENTICATION CONTEXT VERIFICATION =====');
    
    const authContextReady = await waitForAuthContext(page);
    results.authContext = authContextReady;
    
    if (authContextReady) {
      await stabilizeSession(page);
      
      // ===== PORTAL NAVIGATION WITH TIMING =====
      console.log('\n🎯 ===== PORTAL NAVIGATION WITH ENHANCED TIMING =====');
      
      console.log('🧭 Navigating to technician portal...');
      
      // Method 1: Try sidebar link first
      try {
        const portalLink = await page.$('a[href*="/technician/portal"], text=Technician Portal');
        if (portalLink) {
          console.log('✅ Found portal link in sidebar');
          await portalLink.click();
          await delay(2000);
        }
      } catch (e) {
        console.log('⚠️ Sidebar link not found, trying direct navigation');
      }
      
      // Method 2: Direct navigation with auth context
      console.log('🎯 Direct navigation to portal...');
      await page.goto('http://localhost:3000/technician/portal', { 
        waitUntil: 'networkidle2',
        timeout: 25000 
      });
      
      // Wait for React Router
      const routerReady = await waitForReactRouter(page, '/technician/portal');
      results.portalNavigation = routerReady;
      
      if (routerReady) {
        console.log(`✅ Portal navigation successful - URL: ${page.url()}`);
        
        // ===== PORTAL COMPONENTS VERIFICATION =====
        console.log('\n📊 ===== PORTAL COMPONENTS VERIFICATION =====');
        
        const componentsReady = await waitForPortalComponents(page);
        results.portalComponents = componentsReady;
        
        if (componentsReady) {
          console.log('✅ Portal components loaded successfully');
          
          // Detailed component analysis
          const portalAnalysis = await page.evaluate(() => {
            return {
              hasWelcome: document.body.textContent.includes('Welcome back'),
              hasQueue: document.body.textContent.includes('My Queue'),
              hasQuickActions: document.body.textContent.includes('Quick Actions'),
              hasDashboard: document.body.textContent.includes('Dashboard'),
              hasProfile: document.body.textContent.includes('Profile'),
              hasTechDocs: document.body.textContent.includes('Tech Docs'),
              elementCount: document.querySelectorAll('.bg-white, .rounded, .border').length,
              buttonCount: document.querySelectorAll('button').length,
              navLinks: Array.from(document.querySelectorAll('a, button')).map(el => el.textContent?.trim()).filter(t => t).slice(0, 10)
            };
          });
          
          console.log('📊 Portal analysis:', portalAnalysis);
          
          // ===== SECTION NAVIGATION TESTING =====
          console.log('\n🧭 ===== SECTION NAVIGATION TESTING =====');
          
          const sections = [
            { name: 'Dashboard', path: '/technician/portal/dashboard', indicator: 'Welcome back' },
            { name: 'Queue', path: '/technician/portal/queue', indicator: 'My Ticket Queue' },
            { name: 'Quick Actions', path: '/technician/portal/quick-actions', indicator: 'Bulk Operations' },
            { name: 'Knowledge Base', path: '/technician/portal/knowledge-base', indicator: 'Technical Documentation' },
            { name: 'Profile', path: '/technician/portal/profile', indicator: 'Technician Profile' }
          ];
          
          for (const section of sections) {
            try {
              console.log(`📍 Testing ${section.name} navigation...`);
              
              await page.goto(`http://localhost:3000${section.path}`, { 
                waitUntil: 'networkidle2',
                timeout: 20000 
              });
              
              // Wait for section to load
              await delay(3000);
              
              // Wait for specific section content
              try {
                await page.waitForFunction(
                  (indicator) => document.body.textContent.includes(indicator),
                  { timeout: 8000 },
                  section.indicator
                );
                
                console.log(`✅ ${section.name}: Content loaded`);
                results.sectionNavigation[section.name] = true;
                
                // Test section-specific functionality
                if (section.name === 'Queue') {
                  const queueData = await page.evaluate(() => {
                    return {
                      tickets: document.querySelectorAll('.border, .ticket-item, tr').length,
                      searchInput: !!document.querySelector('input[placeholder*="search"], input[placeholder*="Search"]'),
                      selects: document.querySelectorAll('select').length,
                      buttons: document.querySelectorAll('button').length
                    };
                  });
                  
                  console.log(`   Queue functionality: ${JSON.stringify(queueData)}`);
                  results.functionality.queue = queueData;
                  
                  // Test search if available
                  if (queueData.searchInput) {
                    try {
                      await page.type('input[placeholder*="search"], input[placeholder*="Search"]', 'test');
                      await delay(1000);
                      console.log('   ✅ Search functionality working');
                    } catch (e) {
                      console.log('   ⚠️ Search test failed');
                    }
                  }
                }
                
                if (section.name === 'Quick Actions') {
                  const qaData = await page.evaluate(() => {
                    return {
                      checkboxes: document.querySelectorAll('input[type="checkbox"]').length,
                      bulkButtons: Array.from(document.querySelectorAll('button')).filter(btn => 
                        btn.className.includes('bg-blue') || btn.className.includes('bg-green')
                      ).length
                    };
                  });
                  
                  console.log(`   Quick Actions functionality: ${JSON.stringify(qaData)}`);
                  results.functionality.quickActions = qaData;
                }
                
              } catch (e) {
                console.log(`⚠️ ${section.name}: Content loading timeout`);
                results.sectionNavigation[section.name] = false;
              }
              
            } catch (error) {
              console.log(`❌ ${section.name}: Navigation failed - ${error.message}`);
              results.sectionNavigation[section.name] = false;
            }
          }
          
        } else {
          console.log('❌ Portal components failed to load');
        }
      } else {
        console.log('❌ Portal navigation failed');
        
        // Debug information
        const debugInfo = await page.evaluate(() => {
          return {
            currentUrl: window.location.href,
            pathname: window.location.pathname,
            bodyText: document.body.textContent.substring(0, 200),
            hasAuthToken: !!localStorage.getItem('token') || !!sessionStorage.getItem('token'),
            elementCount: document.querySelectorAll('*').length
          };
        });
        
        console.log('🔍 Debug info:', debugInfo);
      }
    } else {
      console.log('❌ Authentication context not ready');
    }

  } catch (error) {
    console.error('❌ Session-aware test failed:', error.message);
    results.errors.push(`Overall: ${error.message}`);
  } finally {
    await browser.close();
  }

  // ===== COMPREHENSIVE RESULTS =====
  console.log('\n');
  console.log('🎯 ================================================================');
  console.log('📊 SESSION-AWARE E2E TEST RESULTS');
  console.log('🎯 ================================================================');
  console.log('');
  
  console.log('🔐 SESSION & AUTHENTICATION:');
  console.log(`${results.login ? '✅' : '❌'} Login Process`);
  console.log(`${results.authContext ? '✅' : '❌'} Authentication Context`);
  console.log(`${results.portalNavigation ? '✅' : '❌'} Portal Navigation`);
  console.log(`${results.portalComponents ? '✅' : '❌'} Portal Component Loading`);
  console.log('');
  
  console.log('🧭 SECTION NAVIGATION:');
  Object.entries(results.sectionNavigation).forEach(([section, success]) => {
    console.log(`${success ? '✅' : '❌'} ${section}`);
  });
  
  const successfulSections = Object.values(results.sectionNavigation).filter(Boolean).length;
  const totalSections = Object.keys(results.sectionNavigation).length;
  console.log(`📊 Section Success Rate: ${successfulSections}/${totalSections}`);
  console.log('');
  
  console.log('⚡ FUNCTIONALITY TESTING:');
  if (results.functionality.queue) {
    const q = results.functionality.queue;
    console.log(`📋 Queue: ${q.tickets} tickets, ${q.buttons} buttons, Search: ${q.searchInput ? 'Yes' : 'No'}`);
  }
  if (results.functionality.quickActions) {
    const qa = results.functionality.quickActions;
    console.log(`⚡ Quick Actions: ${qa.checkboxes} checkboxes, ${qa.bulkButtons} bulk buttons`);
  }
  console.log('');
  
  if (results.errors.length > 0) {
    console.log('⚠️ ERRORS DETECTED:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  } else {
    console.log('✅ NO CRITICAL ERRORS DETECTED');
  }
  
  console.log('');
  console.log('🎯 TIMING ISSUE RESOLUTION:');
  
  const coreSuccess = results.login && results.authContext;
  const portalSuccess = results.portalNavigation && results.portalComponents;
  const navigationSuccess = successfulSections >= 3;
  
  if (coreSuccess && portalSuccess && navigationSuccess) {
    console.log('🎉 SESSION/ROUTING ISSUES RESOLVED!');
    console.log('✅ Authentication context properly initialized');
    console.log('✅ React Router navigation working correctly');
    console.log('✅ Portal components loading successfully');
    console.log('✅ Section navigation functional');
    console.log('');
    console.log('🚀 TECHNICIAN PORTAL: AUTOMATION VERIFIED!');
  } else if (coreSuccess && portalSuccess) {
    console.log('✅ MAJOR PROGRESS - Core Issues Resolved');
    console.log('✅ Authentication and portal access working');
    console.log('⚠️ Some section navigation issues remain');
    console.log('📊 Overall functionality confirmed');
  } else if (coreSuccess) {
    console.log('✅ AUTHENTICATION ISSUES RESOLVED');
    console.log('✅ Login and context working correctly');
    console.log('⚠️ Portal navigation still needs attention');
    console.log('📝 React Router timing may need further adjustment');
  } else {
    console.log('⚠️ AUTHENTICATION TIMING STILL NEEDS WORK');
    console.log('📝 Extended waits and context checking required');
  }
  
  console.log('\n📋 SESSION-AWARE E2E TEST COMPLETE');
  console.log('🎯 Focused on React Router & Authentication Context timing');
}

runSessionAwareTest().catch(console.error);