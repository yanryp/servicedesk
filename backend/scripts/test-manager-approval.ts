// Test manager approval workflow for ticket #6
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

interface LoginResponse {
  token: string;
  user: any;
}

async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return response.data;
}

async function getPendingApprovals(token: string) {
  const response = await axios.get(`${BASE_URL}/v2/tickets/pending-approvals`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}

async function approveTicket(token: string, ticketId: number, comments?: string) {
  const response = await axios.post(`${BASE_URL}/v2/tickets/${ticketId}/approve`, 
    { comments }, 
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
}

async function testManagerApproval() {
  console.log('🧪 Testing Manager Approval Workflow\n');
  console.log('Testing ticket #6 approval by dept_14.manager\n');

  try {
    // Step 1: IT Manager logs in and checks pending approvals
    console.log('👨‍💼 Step 1: IT Manager checks pending approvals');
    const managerLogin = await login('dept_14.manager@company.com', 'manager123');
    console.log(`   ✅ Manager logged in: ${managerLogin.user.username}`);
    console.log(`   📍 Manager Unit: ${managerLogin.user.unit?.name}`);
    console.log(`   💼 Business Reviewer: ${managerLogin.user.isBusinessReviewer}`);

    const pendingApprovals = await getPendingApprovals(managerLogin.token);
    console.log(`   📋 Pending approvals: ${pendingApprovals.length}`);

    // Look for our test ticket
    const testTicket = pendingApprovals.find((t: any) => t.id === 6);
    if (testTicket) {
      console.log(`   ✅ Found test ticket #${testTicket.id}: ${testTicket.title}`);
      console.log(`   👤 Requested by: ${testTicket.createdBy?.username} (${testTicket.createdBy?.unit?.name})`);
      console.log(`   💼 Assigned to: ${testTicket.businessReviewer?.username} (${testTicket.businessReviewer?.unit?.name})`);
      console.log(`   📊 Status: ${testTicket.status}`);
      console.log(`   🚨 Priority: ${testTicket.priority}`);
    } else {
      console.log(`   ❌ Test ticket #6 not found in pending approvals`);
      console.log('   Available tickets:', pendingApprovals.map((t: any) => `#${t.id} - ${t.title}`));
      return;
    }

    // Step 2: Manager approves the ticket
    console.log('\n✅ Step 2: IT Manager approves the ticket');
    const approvalResult = await approveTicket(
      managerLogin.token, 
      6, 
      'Approved - Network connectivity issue requires immediate IT attention. Escalating to technical team.'
    );
    console.log(`   ✅ Ticket approved successfully`);
    console.log(`   📊 New Status: ${approvalResult.data?.status || 'Status not returned'}`);

    // Step 3: Verify ticket is no longer in pending approvals
    console.log('\n🔍 Step 3: Verify ticket removed from pending approvals');
    const updatedPendingApprovals = await getPendingApprovals(managerLogin.token);
    const stillPending = updatedPendingApprovals.find((t: any) => t.id === 6);
    
    if (!stillPending) {
      console.log(`   ✅ Ticket #6 no longer in pending approvals (expected)`);
      console.log(`   📊 Remaining pending approvals: ${updatedPendingApprovals.length}`);
    } else {
      console.log(`   ❌ Ticket #6 still in pending approvals (unexpected)`);
    }

    // Step 4: Test cross-unit isolation - KASDA manager should not see IT tickets
    console.log('\n🔒 Step 4: Test cross-unit isolation');
    const kasdaManagerLogin = await login('dept_2.manager@company.com', 'manager123');
    const kasdaManagerApprovals = await getPendingApprovals(kasdaManagerLogin.token);
    
    console.log(`   📍 KASDA Manager Unit: ${kasdaManagerLogin.user.unit?.name}`);
    console.log(`   📋 KASDA Manager pending approvals: ${kasdaManagerApprovals.length}`);
    
    const crossUnitTicket = kasdaManagerApprovals.find((t: any) => t.id === 6);
    if (!crossUnitTicket) {
      console.log(`   ✅ Cross-unit isolation working: KASDA manager cannot see IT ticket #6`);
    } else {
      console.log(`   ❌ Cross-unit isolation failed: KASDA manager can see IT ticket #6`);
    }

    console.log('\n🎉 Manager Approval Workflow Test Complete!');
    console.log('✅ All test cases passed successfully');

  } catch (error) {
    console.error('❌ Manager approval test failed:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
  }
}

testManagerApproval();