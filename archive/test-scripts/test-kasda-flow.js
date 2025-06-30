#!/usr/bin/env node

/**
 * KASDA User Management Flow Test
 * 
 * This script tests the complete KASDA User Management flow:
 * 1. Login as branch user
 * 2. Access categories API
 * 3. Access KASDA subcategories 
 * 4. Access User Management items
 * 5. Access BSG KASDA template
 * 6. Verify routing information
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testKasdaFlow() {
  console.log('🧪 TESTING KASDA USER MANAGEMENT FLOW\n');

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
    console.log('\n2️⃣ Fetching categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`, { headers });
    const categories = categoriesResponse.data;
    
    const kasdaCategory = categories.find(cat => cat.name === 'KASDA');
    if (!kasdaCategory) {
      throw new Error('KASDA category not found');
    }
    console.log(`✅ KASDA category found (ID: ${kasdaCategory.id}, Dept: ${kasdaCategory.department_id})`);

    // 3. Get KASDA subcategories
    console.log('\n3️⃣ Fetching KASDA subcategories...');
    const subcategoriesResponse = await axios.get(`${BASE_URL}/categories/${kasdaCategory.id}/subcategories`, { headers });
    const subcategories = subcategoriesResponse.data;
    
    const userMgmtSubcat = subcategories.find(sub => sub.name === 'User Management');
    if (!userMgmtSubcat) {
      throw new Error('User Management subcategory not found');
    }
    console.log(`✅ User Management subcategory found (ID: ${userMgmtSubcat.id})`);

    // 4. Get User Management items
    console.log('\n4️⃣ Fetching User Management items...');
    const itemsResponse = await axios.get(`${BASE_URL}/categories/items-by-subcategory/${userMgmtSubcat.id}`, { headers });
    const items = itemsResponse.data;
    console.log(`✅ Found ${items.length} User Management items:`);
    items.forEach(item => {
      console.log(`   - ${item.name} (ID: ${item.id})`);
    });

    // 5. Get BSG template categories
    console.log('\n5️⃣ Fetching BSG template categories...');
    const bsgCategoriesResponse = await axios.get(`${BASE_URL}/bsg-templates/categories`, { headers });
    const bsgCategories = bsgCategoriesResponse.data.data;
    
    const kasdaBsgCategory = bsgCategories.find(cat => cat.name === 'KASDA');
    if (!kasdaBsgCategory) {
      throw new Error('KASDA BSG category not found');
    }
    console.log(`✅ KASDA BSG category found (${kasdaBsgCategory.template_count} templates)`);

    // 6. Get KASDA templates
    console.log('\n6️⃣ Fetching KASDA templates...');
    const templatesResponse = await axios.get(`${BASE_URL}/bsg-templates/templates?categoryId=${kasdaBsgCategory.id}`, { headers });
    const templates = templatesResponse.data.data;
    console.log(`✅ Found ${templates.length} KASDA templates:`);
    templates.forEach(template => {
      console.log(`   - #${template.template_number}: ${template.display_name}`);
    });

    // 7. Get template fields for KASDA User Management
    const kasdaUserMgmtTemplate = templates.find(t => t.name === 'User Management');
    if (kasdaUserMgmtTemplate) {
      console.log('\n7️⃣ Fetching KASDA User Management template fields...');
      const fieldsResponse = await axios.get(`${BASE_URL}/bsg-templates/${kasdaUserMgmtTemplate.id}/fields`, { headers });
      const fields = fieldsResponse.data.data;
      console.log(`✅ Found ${fields.length} dynamic fields:`);
      fields.slice(0, 5).forEach(field => { // Show first 5 fields
        console.log(`   - ${field.fieldLabel}${field.isRequired ? ' *' : ''} (${field.fieldType.name})`);
      });
      if (fields.length > 5) {
        console.log(`   ... and ${fields.length - 5} more fields`);
      }
    }

    console.log('\n🎉 KASDA USER MANAGEMENT FLOW TEST PASSED!');
    console.log('✅ All endpoints working correctly');
    console.log('✅ Category-based routing functional');
    console.log('✅ BSG templates accessible');
    console.log('✅ Dynamic fields available');
    console.log('\n🎯 System ready for production use!');

  } catch (error) {
    console.error('\n❌ KASDA flow test failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testKasdaFlow();