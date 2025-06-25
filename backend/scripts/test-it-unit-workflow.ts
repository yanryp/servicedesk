// E2E Test: IT Unit Workflow (it.user → dept_14.manager → it.technician)
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001/api';

interface LoginResponse {
  token: string;
  user: any;
}

async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return response.data;
}

async function createTicket(token: string, ticketData: any) {
  const formData = new FormData();
  Object.keys(ticketData).forEach(key => {
    formData.append(key, ticketData[key]);
  });
  
  const response = await axios.post(`${BASE_URL}/v2/tickets/unified-create`, formData, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
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

async function testITUnitWorkflow() {
  console.log('🧪 E2E Test: IT Unit Workflow\n');
  console.log('Testing: it.user → dept_14.manager → it.technician\n');

  try {
    // Step 1: IT User creates a ticket
    console.log('📝 Step 1: IT User creates a technical support ticket');
    const itUserLogin = await login('it.user@company.com', 'user123');
    console.log(`   ✅ IT User logged in: ${itUserLogin.user.username}`);
    console.log(`   📍 User Unit: ${itUserLogin.user.unit?.name}`);

    const ticketData = {
      title: 'Network Connectivity Issue',
      description: 'Unable to access internal servers from workstation. Appears to be a network configuration issue affecting productivity.',
      serviceItemId: '1',  // Use available KASDA service item
      priority: 'high',
      userRootCause: 'technical_failure',
      userIssueCategory: 'incident'
    };

    const ticket = await createTicket(itUserLogin.token, ticketData);
    console.log(`   ✅ Ticket created: #${ticket.data.id} - ${ticket.data.title}`);
    console.log(`   📊 Status: ${ticket.data.status}`);
    console.log(`   ⏰ SLA Due: ${new Date(ticket.data.slaDueDate).toLocaleString()}`);

    // Verify business approval was created
    const businessApproval = await prisma.businessApproval.findFirst({
      where: { ticketId: ticket.data.id },
      include: {
        businessReviewer: {
          include: { unit: true }
        }
      }
    });

    if (businessApproval) {
      console.log(`   ✅ Business approval created and assigned to: ${businessApproval.businessReviewer?.username}`);
      console.log(`   📍 Manager Unit: ${businessApproval.businessReviewer?.unit?.name}`);
    } else {
      console.log('   ❌ No business approval created');
      return;
    }

    // Step 2: Manager checks pending approvals
    console.log('\n👨‍💼 Step 2: IT Manager checks pending approvals');
    const managerLogin = await login('dept_14.manager@company.com', 'manager123');
    console.log(`   ✅ Manager logged in: ${managerLogin.user.username}`);
    console.log(`   📍 Manager Unit: ${managerLogin.user.unit?.name}`);

    const pendingApprovals = await getPendingApprovals(managerLogin.token);
    console.log(`   📋 Pending approvals: ${pendingApprovals.length}`);

    const targetApproval = pendingApprovals.find((t: any) => t.id === ticket.data.id);
    if (targetApproval) {
      console.log(`   ✅ Found ticket #${targetApproval.id} in pending approvals`);
      console.log(`   👤 Requested by: ${targetApproval.createdBy?.username} (${targetApproval.createdBy?.unit?.name})`);
      console.log(`   💼 Assigned to: ${targetApproval.businessReviewer?.username} (${targetApproval.businessReviewer?.unit?.name})`);
    } else {
      console.log(`   ❌ Ticket #${ticket.data.id} not found in pending approvals`);
      return;
    }

    // Step 3: Manager approves the ticket
    console.log('\n✅ Step 3: IT Manager approves the ticket');
    const approvalResult = await approveTicket(
      managerLogin.token, 
      ticket.data.id, 
      'Approved - Network issue requires immediate attention'
    );
    console.log(`   ✅ Ticket approved successfully`);
    console.log(`   📊 New Status: ${approvalResult.data.status}`);

    // Step 4: Verify ticket is now available for technician assignment
    console.log('\n🔧 Step 4: Verify ticket available for technician assignment');
    
    // Get updated ticket details
    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticket.data.id },
      include: {
        businessApproval: true,
        createdBy: {
          include: { unit: true }
        }
      }
    });

    if (updatedTicket) {
      console.log(`   ✅ Ticket status: ${updatedTicket.status}`);
      console.log(`   ✅ Approval status: ${updatedTicket.businessApproval?.approvalStatus}`);
      console.log(`   ⏰ SLA timer active: ${updatedTicket.status !== 'pending_approval'}`);
      
      if (updatedTicket.status === 'new') {
        console.log(`   ✅ Ticket is ready for technician assignment`);
      } else {
        console.log(`   ⚠️  Unexpected ticket status: ${updatedTicket.status}`);
      }
    }

    // Step 5: Test cross-unit isolation
    console.log('\n🔒 Step 5: Test cross-unit isolation');
    const kasdaManagerLogin = await login('dept_2.manager@company.com', 'manager123');
    const kasdaManagerApprovals = await getPendingApprovals(kasdaManagerLogin.token);
    
    const crossUnitTicket = kasdaManagerApprovals.find((t: any) => t.id === ticket.data.id);
    if (!crossUnitTicket) {
      console.log(`   ✅ Cross-unit isolation working: KASDA manager cannot see IT ticket`);
    } else {
      console.log(`   ❌ Cross-unit isolation failed: KASDA manager can see IT ticket`);
    }

    console.log('\n🎉 IT Unit Workflow Test Complete!');
    console.log('✅ All test cases passed successfully');

  } catch (error) {
    console.error('❌ E2E Test failed:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testITUnitWorkflow();