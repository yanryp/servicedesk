const fetch = require('node-fetch');

async function testServiceItemFields() {
  try {
    console.log('=== Testing ServiceItem Custom Fields CRUD ===\n');
    
    // Login first
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@company.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful\n');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test with an existing service item that has custom fields (ATM Templates = ID 20)
    const serviceItemId = 20;
    
    // Test 1: Get existing custom fields
    console.log(`1. Testing GET /items/${serviceItemId}/custom-fields`);
    const getResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/items/${serviceItemId}/custom-fields`, { headers });
    const getResult = await getResponse.json();
    console.log(`   ✅ Found ${getResult.data.length} existing custom fields`);
    if (getResult.data.length > 0) {
      console.log(`   📋 First field: "${getResult.data[0].fieldLabel}" (${getResult.data[0].fieldType})`);
    }
    console.log('');
    
    // Test 2: Create a new custom field
    console.log('2. Testing POST (Create new custom field)');
    const createData = {
      fieldName: 'test_field_' + Date.now(),
      fieldLabel: 'Test Field',
      fieldType: 'text',
      isRequired: true,
      isVisible: true,
      sortOrder: 100,
      placeholder: 'Enter test value',
      defaultValue: '',
      isKasdaSpecific: false
    };
    
    const createResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/items/${serviceItemId}/custom-fields`, {
      method: 'POST',
      headers,
      body: JSON.stringify(createData)
    });
    
    if (createResponse.ok) {
      const createdField = await createResponse.json();
      console.log(`   ✅ Created field: "${createdField.data.fieldLabel}" (ID: ${createdField.data.id})`);
      const fieldId = createdField.data.id;
      
      // Test 3: Update the field
      console.log(`3. Testing PUT (Update field ${fieldId})`);
      const updateResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/items/custom-fields/${fieldId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          fieldLabel: 'Updated Test Field',
          isRequired: false,
          placeholder: 'Updated placeholder'
        })
      });
      
      if (updateResponse.ok) {
        const updatedField = await updateResponse.json();
        console.log(`   ✅ Updated field: "${updatedField.data.fieldLabel}"`);
      } else {
        const error = await updateResponse.json();
        console.log(`   ❌ Failed to update field: ${updateResponse.status} - ${error.message}`);
      }
      
      // Test 4: Delete the field
      console.log(`4. Testing DELETE (Delete field ${fieldId})`);
      const deleteResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/items/custom-fields/${fieldId}`, {
        method: 'DELETE',
        headers
      });
      
      if (deleteResponse.ok) {
        console.log(`   ✅ Deleted field successfully`);
      } else {
        const error = await deleteResponse.json();
        console.log(`   ❌ Failed to delete field: ${deleteResponse.status} - ${error.message}`);
      }
      
    } else {
      const error = await createResponse.json();
      console.log(`   ❌ Failed to create field: ${createResponse.status} - ${error.message}`);
    }
    
    // Test 5: Get fields again to verify final state
    console.log(`5. Testing final GET to verify state`);
    const finalGetResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/items/${serviceItemId}/custom-fields`, { headers });
    const finalResult = await finalGetResponse.json();
    console.log(`   ✅ Final count: ${finalResult.data.length} custom fields`);
    console.log(`   📊 Meta: ${finalResult.meta.requiredFields} required, ${finalResult.meta.visibleFields} visible`);
    
    console.log('\n=== ServiceItem Custom Fields CRUD Testing Complete ===');
    
  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

testServiceItemFields();