// Test API endpoints for ATM-Transfer ATM Bank Lain service
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Get auth token - use test credentials
const getAuthToken = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test.requester@bsg.co.id',
      password: 'password123'
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Failed to get auth token:', error.response?.data || error.message);
    throw error;
  }
};

// Test the API endpoints that the customer portal uses
const testATMServiceEndpoints = async () => {
  console.log('🔍 Testing ATM-Transfer ATM Bank Lain service API endpoints...\n');

  try {
    const token = await getAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Get all categories
    console.log('📋 Step 1: Getting all service categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/service-catalog/categories`, { headers });
    console.log(`   Found ${categoriesResponse.data.data.length} categories`);
    
    // Find Claims & Disputes category
    const claimsCategory = categoriesResponse.data.data.find(cat => 
      cat.name.includes('Claims') || cat.name.includes('Disputes')
    );
    
    if (!claimsCategory) {
      console.log('❌ Claims & Disputes category not found');
      console.log('Available categories:', categoriesResponse.data.data.map(c => c.name));
      return;
    }
    
    console.log(`✅ Found Claims & Disputes category: ${claimsCategory.name} (ID: ${claimsCategory.id})`);

    // 2. Get services for Claims & Disputes category
    console.log('\n📋 Step 2: Getting services for Claims & Disputes category...');
    const servicesResponse = await axios.get(`${BASE_URL}/service-catalog/category/${claimsCategory.id}/services`, { headers });
    console.log(`   Found ${servicesResponse.data.data.length} services`);
    
    // Find ATM-Transfer ATM Bank Lain service
    const atmService = servicesResponse.data.data.find(service => 
      service.name.includes('ATM-Transfer ATM Bank Lain')
    );
    
    if (!atmService) {
      console.log('❌ ATM-Transfer ATM Bank Lain service not found');
      console.log('Available services:', servicesResponse.data.data.map(s => s.name));
      return;
    }
    
    console.log(`✅ Found ATM-Transfer ATM Bank Lain service:`);
    console.log(`   ID: ${atmService.id}`);
    console.log(`   Name: ${atmService.name}`);
    console.log(`   Description: ${atmService.description}`);
    console.log(`   Has Fields: ${atmService.hasFields}`);
    console.log(`   Field Count: ${atmService.fieldCount}`);
    console.log(`   Template ID: ${atmService.templateId}`);
    console.log(`   Type: ${atmService.type}`);

    // 3. Get template details for the service
    console.log('\n📋 Step 3: Getting template details for ATM service...');
    try {
      const templateResponse = await axios.get(`${BASE_URL}/service-catalog/service/${atmService.id}/template`, { headers });
      console.log(`✅ Template response received:`);
      console.log(`   Template ID: ${templateResponse.data.data.templateId}`);
      console.log(`   Name: ${templateResponse.data.data.name}`);
      console.log(`   Description: ${templateResponse.data.data.description}`);
      console.log(`   Fields Count: ${templateResponse.data.data.fields.length}`);
      
      if (templateResponse.data.data.fields.length > 0) {
        console.log(`   Fields:`);
        templateResponse.data.data.fields.forEach((field, index) => {
          console.log(`     ${index + 1}. ${field.label} (${field.name}) - Type: ${field.type}, Required: ${field.required}`);
        });
      } else {
        console.log(`   ❌ NO FIELDS DEFINED FOR THIS SERVICE`);
      }
    } catch (templateError) {
      console.log(`❌ Error getting template: ${templateError.response?.data?.message || templateError.message}`);
    }

    // 4. Check what customer portal would see
    console.log('\n👥 Step 4: Customer Portal Analysis...');
    console.log('The customer portal would receive:');
    console.log(`   Service hasFields: ${atmService.hasFields}`);
    console.log(`   Service fieldCount: ${atmService.fieldCount}`);
    console.log(`   Service templateId: ${atmService.templateId}`);
    
    if (!atmService.hasFields || atmService.fieldCount === 0) {
      console.log('❌ PROBLEM IDENTIFIED: Service indicates no fields available');
      console.log('   This explains why the customer portal doesn\'t show dynamic fields');
    } else {
      console.log('✅ Service indicates fields are available');
    }

    // 5. Check if this is a BSG template or Service item
    console.log('\n🔍 Step 5: Service Type Analysis...');
    if (atmService.type === 'bsg_service' || atmService.id.startsWith('bsg_template_')) {
      console.log('📝 This is a BSG template service');
      console.log('   BSG templates should have fields if properly configured');
    } else if (atmService.type === 'service_template' || atmService.id.startsWith('template_')) {
      console.log('📝 This is a ServiceCatalog template service');
      console.log('   ServiceCatalog templates should have customFieldDefinitions');
    } else {
      console.log('📝 This is a static/legacy service');
      console.log('   Static services typically don\'t have dynamic fields');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Run the test
testATMServiceEndpoints();