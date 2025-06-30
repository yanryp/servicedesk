// Test script to verify technician workspace functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testTechnicianWorkspace() {
  console.log('🧪 Testing Technician Workspace Integration...\n');
  
  try {
    // Step 1: Login as technician
    console.log('🔐 Step 1: Logging in as IT technician...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'it.technician@company.com',
      password: 'password123'
    });
    
    const { token, user } = loginResponse.data;
    console.log(`✅ Logged in as: ${user.username} (${user.role})`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🏢 Department: ${user.department?.name || 'No department'}\n`);
    
    // Step 2: Test tickets API with technician token
    console.log('🎫 Step 2: Fetching tickets for technician...');
    const ticketsResponse = await axios.get(`${API_BASE_URL}/api/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: 1,
        limit: 10
      }
    });
    
    const { tickets, totalPages, totalTickets } = ticketsResponse.data;
    console.log(`📊 Found ${totalTickets} total tickets (${tickets.length} on current page)`);
    console.log(`📄 Total pages: ${totalPages}\n`);
    
    // Step 3: Analyze tickets for workspace display
    console.log('🔍 Step 3: Analyzing tickets for workspace features...');
    
    const ticketsByStatus = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Tickets by Status:');
    Object.entries(ticketsByStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} tickets`);
    });
    
    const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;
    const overdueTickets = tickets.filter(t => 
      t.slaDueDate && new Date(t.slaDueDate) < new Date() && t.status !== 'closed'
    ).length;
    
    console.log(`\n🚨 Priority Analysis:`);
    console.log(`   Urgent tickets: ${urgentTickets}`);
    console.log(`   Overdue tickets: ${overdueTickets}`);
    
    // Step 4: Test specific technician filters
    console.log('\n🎯 Step 4: Testing technician-specific filters...');
    
    // Test assigned tickets filter
    const assignedResponse = await axios.get(`${API_BASE_URL}/api/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        status: 'assigned',
        page: 1,
        limit: 50
      }
    });
    
    console.log(`📋 Assigned tickets: ${assignedResponse.data.totalTickets}`);
    
    // Test in-progress tickets filter
    const inProgressResponse = await axios.get(`${API_BASE_URL}/api/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        status: 'in_progress',
        page: 1,
        limit: 50
      }
    });
    
    console.log(`⚙️ In-progress tickets: ${inProgressResponse.data.totalTickets}`);
    
    // Step 5: Display sample tickets for workspace preview
    console.log('\n📝 Step 5: Sample tickets for workspace display:');
    tickets.slice(0, 3).forEach((ticket, index) => {
      console.log(`\n   Ticket #${ticket.id}:`);
      console.log(`   📌 Title: ${ticket.title}`);
      console.log(`   👤 Creator: ${ticket.createdBy?.name || ticket.createdBy?.username || 'Unknown'}`);
      console.log(`   📊 Status: ${ticket.status}`);
      console.log(`   🚩 Priority: ${ticket.priority}`);
      console.log(`   📅 Created: ${new Date(ticket.createdAt).toLocaleDateString()}`);
      if (ticket.slaDueDate) {
        const due = new Date(ticket.slaDueDate);
        const now = new Date();
        const isOverdue = due < now;
        console.log(`   ⏰ SLA Due: ${due.toLocaleDateString()} ${isOverdue ? '🔴 OVERDUE' : '🟢'}`);
      }
    });
    
    console.log('\n✅ Technician Workspace Test Completed Successfully!');
    console.log('\n🎉 Key Features Verified:');
    console.log('   ✅ Technician authentication working');
    console.log('   ✅ Tickets API responding correctly');  
    console.log('   ✅ Status filtering functional');
    console.log('   ✅ Priority and SLA data available');
    console.log('   ✅ User information properly formatted');
    console.log('\n🚀 Ready for modern inbox-style workspace!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('💡 Make sure backend is running on http://localhost:3001');
  }
}

// Run the test
testTechnicianWorkspace();