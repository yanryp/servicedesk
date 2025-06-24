#!/usr/bin/env node

/**
 * Test Authentication Token Generation
 * 
 * This script generates a test JWT token to verify the API endpoints
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-for-development-only';

function generateTestToken() {
  console.log('🔐 Generating Test Authentication Token\n');

  try {
    // Create a test user payload (similar to what would be in a real login)
    const testUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      role: 'admin',
      departmentId: 1,
      isKasdaUser: false,
      isBusinessReviewer: false
    };

    // Generate JWT token
    const token = jwt.sign(
      testUser,
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Test token generated successfully');
    console.log('📝 Token:', token);
    console.log('👤 User payload:', testUser);

    // Verify the token works
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verification successful');
    console.log('🔍 Decoded payload:', decoded);

    // Save token to file for testing
    const fs = require('fs');
    fs.writeFileSync('scripts/test-token.txt', token);
    console.log('💾 Token saved to scripts/test-token.txt');

    console.log('\n🧪 You can now test the API with:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/bsg-templates/master-data/branch`);

  } catch (error) {
    console.error('❌ Error generating test token:', error);
  }
}

generateTestToken();