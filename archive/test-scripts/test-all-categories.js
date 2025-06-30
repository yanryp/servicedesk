#!/usr/bin/env node

/**
 * Test All Categories for Ticket Creation
 * 
 * This script tests that every category → subcategory → item path
 * is complete and can be used for ticket creation.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAllCategories() {
  console.log('🧪 TESTING ALL CATEGORIES FOR TICKET CREATION\n');

  try {
    // 1. Login as branch user
    console.log('1️⃣ Logging in as branch user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'branch.user@branch.com',
      password: 'user123'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful');

    // 2. Get all categories
    console.log('\n2️⃣ Testing all categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`, { headers });
    const categories = categoriesResponse.data;
    
    console.log(`📊 Found ${categories.length} categories\n`);

    let totalSubcategories = 0;
    let totalItems = 0;
    let categoriesWithIssues = [];

    // 3. Test each category
    for (const category of categories) {
      console.log(`📁 Testing category: ${category.name}`);
      
      try {
        // Get subcategories
        const subcategoriesResponse = await axios.get(`${BASE_URL}/categories/${category.id}/subcategories`, { headers });
        const subcategories = subcategoriesResponse.data;
        
        if (subcategories.length === 0) {
          console.log(`   ⚠️  No subcategories found`);
          categoriesWithIssues.push(`${category.name}: No subcategories`);
          continue;
        }

        totalSubcategories += subcategories.length;
        console.log(`   📂 ${subcategories.length} subcategories`);

        // Test each subcategory
        for (const subcategory of subcategories) {
          try {
            const itemsResponse = await axios.get(`${BASE_URL}/categories/items-by-subcategory/${subcategory.id}`, { headers });
            const items = itemsResponse.data;
            
            if (items.length === 0) {
              console.log(`     ❌ ${subcategory.name}: No items`);
              categoriesWithIssues.push(`${category.name} → ${subcategory.name}: No items`);
            } else {
              console.log(`     ✅ ${subcategory.name}: ${items.length} items`);
              totalItems += items.length;
            }
          } catch (error) {
            console.log(`     ❌ ${subcategory.name}: Error loading items - ${error.message}`);
            categoriesWithIssues.push(`${category.name} → ${subcategory.name}: API error`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error loading subcategories: ${error.message}`);
        categoriesWithIssues.push(`${category.name}: API error`);
      }
      
      console.log(); // Empty line for readability
    }

    // 4. Summary
    console.log('📊 SUMMARY:');
    console.log(`   Categories tested: ${categories.length}`);
    console.log(`   Total subcategories: ${totalSubcategories}`);
    console.log(`   Total items: ${totalItems}`);
    console.log(`   Issues found: ${categoriesWithIssues.length}`);

    if (categoriesWithIssues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      categoriesWithIssues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
    } else {
      console.log('\n✅ ALL CATEGORIES WORKING CORRECTLY!');
    }

    // 5. Test specific KASDA path
    console.log('\n5️⃣ Testing KASDA User Management path...');
    const kasdaCategory = categories.find(cat => cat.name === 'KASDA');
    if (kasdaCategory) {
      const kasdaSubcatsResponse = await axios.get(`${BASE_URL}/categories/${kasdaCategory.id}/subcategories`, { headers });
      const kasdaSubcats = kasdaSubcatsResponse.data;
      
      const userMgmtSubcat = kasdaSubcats.find(sub => sub.name === 'User Management');
      if (userMgmtSubcat) {
        const userMgmtItemsResponse = await axios.get(`${BASE_URL}/categories/items-by-subcategory/${userMgmtSubcat.id}`, { headers });
        const userMgmtItems = userMgmtItemsResponse.data;
        
        console.log(`✅ KASDA → User Management → ${userMgmtItems.length} items:`);
        userMgmtItems.forEach(item => {
          console.log(`   - ${item.name}`);
        });
      }
    }

    console.log('\n🎯 CATEGORY TESTING COMPLETE!');
    console.log(categoriesWithIssues.length === 0 ? 
      '✅ All categories ready for ticket creation!' : 
      `⚠️  ${categoriesWithIssues.length} issues need attention`);

  } catch (error) {
    console.error('\n❌ Category testing failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testAllCategories();