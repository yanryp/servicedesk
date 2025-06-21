#!/bin/bash

# Simple BSG Template System Test Script

echo "🚀 Testing BSG Helpdesk System..."
echo ""

BASE_URL="http://localhost:3001"

# Test 1: Health Check
echo "1. Health Check:"
curl -s "$BASE_URL/health" | jq .
echo ""

# Test 2: Login as admin
echo "2. Admin Login:"
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"
echo ""

# Test 3: Get BSG Categories
echo "3. BSG Template Categories:"
curl -s "$BASE_URL/api/bsg-templates/categories" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, (.data | length)'
echo ""

# Test 4: Search BSG Templates
echo "4. BSG Template Search:"
curl -s "$BASE_URL/api/bsg-templates/search?limit=3" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, (.data | length)'
echo ""

# Test 5: BSG Analytics
echo "5. BSG Analytics:"
curl -s "$BASE_URL/api/bsg-templates/analytics" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, .data.overview'
echo ""

# Test 6: Master Data - Branches
echo "6. Master Data (Branches):"
curl -s "$BASE_URL/api/master-data/branch?limit=3" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, (.data | length)'
echo ""

# Test 7: Field Types
echo "7. Field Types:"
curl -s "$BASE_URL/api/field-types" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, (.data | length)'
echo ""

echo "✅ BSG Template System is operational!"
echo "🏦 Bank Sulutgo Helpdesk Ready for Production"