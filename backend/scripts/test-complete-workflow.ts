import { PrismaClient } from '@prisma/client';
import { calculateSLADueDate } from '../src/utils/slaCalculator';

const prisma = new PrismaClient();

interface WorkflowTestResult {
  success: boolean;
  step: string;
  data?: any;
  error?: string;
  timestamp: Date;
  slaInfo?: any;
}

class WorkflowTester {
  private results: WorkflowTestResult[] = [];
  private testTicketId: number | null = null;
  private testUsers: any = {};

  async logResult(step: string, success: boolean, data?: any, error?: string, slaInfo?: any) {
    const result: WorkflowTestResult = {
      success,
      step,
      data,
      error,
      timestamp: new Date(),
      slaInfo
    };
    this.results.push(result);
    
    const status = success ? '✅' : '❌';
    const timestamp = result.timestamp.toLocaleTimeString('id-ID');
    console.log(`${status} [${timestamp}] ${step}`);
    
    if (slaInfo) {
      console.log(`   📅 SLA Info: Due ${slaInfo.dueDate?.toLocaleString('id-ID') || 'N/A'} | Business Hours: ${slaInfo.businessHoursOnly ? 'YES' : 'NO'}`);
    }
    
    if (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const keys = Object.keys(data).slice(0, 3); // Show first 3 properties
      if (keys.length > 0) {
        console.log(`   📊 Data: ${keys.map(k => `${k}=${data[k]}`).join(', ')}`);
      }
    }
  }

  async setupTestUsers() {
    console.log('🔧 Setting up test users...\n');

    try {
      // Get or create test departments
      const itDept = await prisma.department.findFirst({
        where: { name: 'Information Technology' }
      });

      const supportDept = await prisma.department.findFirst({
        where: { name: 'Dukungan dan Layanan' }
      });

      if (!itDept || !supportDept) {
        throw new Error('Required departments not found');
      }

      // Get test branch
      const testBranch = await prisma.unit.findFirst({
        where: { code: { contains: 'UTAMA' } }
      });

      if (!testBranch) {
        throw new Error('Test branch not found');
      }

      // Find existing test users or get available users
      this.testUsers = {
        requester: await prisma.user.findFirst({
          where: { 
            role: 'requester',
            unitId: testBranch.id,
            departmentId: supportDept.id
          }
        }),
        manager: await prisma.user.findFirst({
          where: { 
            role: 'manager',
            unitId: testBranch.id,
            isBusinessReviewer: true
          }
        }),
        technician: await prisma.user.findFirst({
          where: { 
            role: 'technician',
            departmentId: itDept.id
          }
        }),
        departments: { it: itDept, support: supportDept },
        branch: testBranch
      };

      // Validate we have all required users
      if (!this.testUsers.requester || !this.testUsers.manager || !this.testUsers.technician) {
        throw new Error(`Missing test users: ${!this.testUsers.requester ? 'requester ' : ''}${!this.testUsers.manager ? 'manager ' : ''}${!this.testUsers.technician ? 'technician' : ''}`);
      }

      await this.logResult('Setup test users', true, {
        requester: this.testUsers.requester.username,
        manager: this.testUsers.manager.username,
        technician: this.testUsers.technician.username,
        branch: this.testUsers.branch.name
      });

    } catch (error) {
      await this.logResult('Setup test users', false, null, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async createTicket() {
    console.log('\n📝 Step 1: Creating ticket...');

    try {
      // Get a service item for testing
      const serviceItem = await prisma.serviceItem.findFirst({
        where: { 
          isActive: true,
          serviceCatalog: {
            departmentId: this.testUsers.departments.it.id
          }
        },
        include: {
          serviceCatalog: true
        }
      });

      if (!serviceItem) {
        throw new Error('No active service items found for IT department');
      }

      // Create ticket
      const ticket = await prisma.ticket.create({
        data: {
          title: `Test SLA Workflow - ${new Date().toISOString().split('T')[0]}`,
          description: 'This is a test ticket to validate the complete SLA workflow from creation to closure.',
          status: 'pending_approval', // Start with pending approval
          priority: 'high',
          createdByUserId: this.testUsers.requester.id,
          serviceItemId: serviceItem.id,
          serviceCatalogId: serviceItem.serviceCatalogId
        },
        include: {
          createdBy: {
            include: {
              department: true,
              unit: true
            }
          },
          serviceItem: {
            include: {
              serviceCatalog: true
            }
          }
        }
      });

      this.testTicketId = ticket.id;

      await this.logResult('Create ticket', true, {
        ticketId: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        serviceItem: serviceItem.name
      });

      return ticket;

    } catch (error) {
      await this.logResult('Create ticket', false, null, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async checkApplicableSLA() {
    console.log('\n🔍 Step 2: Checking applicable SLA policy...');

    try {
      if (!this.testTicketId) {
        throw new Error('No test ticket created');
      }

      // Find applicable SLA policy
      const ticket = await prisma.ticket.findUnique({
        where: { id: this.testTicketId },
        include: {
          createdBy: {
            include: {
              department: true
            }
          }
        }
      });

      if (!ticket) {
        throw new Error('Test ticket not found');
      }

      // Find most specific applicable SLA policy
      const slaPolicy = await prisma.slaPolicy.findFirst({
        where: {
          isActive: true,
          OR: [
            // Service item match
            {
              serviceItemId: ticket.serviceItemId,
              priority: ticket.priority
            },
            {
              serviceItemId: ticket.serviceItemId,
              priority: null
            },
            // Department match
            {
              departmentId: ticket.createdBy.departmentId,
              serviceCatalogId: null,
              priority: ticket.priority
            },
            {
              departmentId: ticket.createdBy.departmentId,
              serviceCatalogId: null,
              priority: null
            },
            // Priority-only match
            {
              departmentId: null,
              serviceCatalogId: null,
              serviceItemId: null,
              priority: ticket.priority
            },
            // Global policy
            {
              departmentId: null,
              serviceCatalogId: null,
              serviceItemId: null,
              priority: null
            }
          ]
        },
        orderBy: [
          { serviceItemId: { sort: 'desc', nulls: 'last' } },
          { serviceCatalogId: { sort: 'desc', nulls: 'last' } },
          { departmentId: { sort: 'desc', nulls: 'last' } },
          { priority: { sort: 'desc', nulls: 'last' } }
        ]
      });

      if (!slaPolicy) {
        await this.logResult('Check applicable SLA', false, null, 'No applicable SLA policy found');
        return null;
      }

      await this.logResult('Check applicable SLA', true, {
        policyId: slaPolicy.id,
        policyName: slaPolicy.name,
        responseTime: `${slaPolicy.responseTimeMinutes} minutes`,
        resolutionTime: `${slaPolicy.resolutionTimeMinutes} minutes`,
        businessHoursOnly: slaPolicy.businessHoursOnly
      });

      return slaPolicy;

    } catch (error) {
      await this.logResult('Check applicable SLA', false, null, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async managerApproval() {
    console.log('\n✅ Step 3: Manager approval (SLA timer starts)...');

    try {
      if (!this.testTicketId) {
        throw new Error('No test ticket created');
      }

      // Create business approval record
      const businessApproval = await prisma.businessApproval.create({
        data: {
          ticketId: this.testTicketId,
          businessReviewerId: this.testUsers.manager.id,
          approvalStatus: 'approved',
          businessComments: 'Approved for processing - test workflow',
          approvedAt: new Date()
        }
      });

      // Update ticket status to 'new' and set SLA due date
      const approvalTime = new Date();
      
      // Find applicable SLA policy for due date calculation
      const slaPolicy = await this.checkApplicableSLA();
      let slaDueDate = null;
      let slaInfo = null;

      if (slaPolicy) {
        const slaResult = await calculateSLADueDate(approvalTime, slaPolicy.resolutionTimeMinutes, {
          departmentId: this.testUsers.departments.it.id,
          businessHoursOnly: slaPolicy.businessHoursOnly
        });
        
        slaDueDate = slaResult.dueDate;
        slaInfo = {
          dueDate: slaResult.dueDate,
          businessHoursOnly: slaPolicy.businessHoursOnly,
          resolutionTimeMinutes: slaPolicy.resolutionTimeMinutes,
          isCurrentlyInBusinessHours: slaResult.isCurrentlyInBusinessHours,
          holidaysSkipped: slaResult.holidaysSkipped
        };
      }

      // Update ticket
      const updatedTicket = await prisma.ticket.update({
        where: { id: this.testTicketId },
        data: {
          status: 'open', // Changed to 'new' after approval
          slaDueDate: slaDueDate,
          updatedAt: approvalTime
        }
      });

      await this.logResult('Manager approval', true, {
        approvalId: businessApproval.id,
        approvedBy: this.testUsers.manager.username,
        newStatus: updatedTicket.status,
        slaDueDate: slaDueDate?.toLocaleString('id-ID') || 'Not set'
      }, undefined, slaInfo);

      return { businessApproval, updatedTicket, slaInfo };

    } catch (error) {
      await this.logResult('Manager approval', false, null, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async assignToTechnician() {
    console.log('\n👨‍💻 Step 4: Assigning to technician...');

    try {
      if (!this.testTicketId) {
        throw new Error('No test ticket created');
      }

      // Create assignment log
      const assignmentLog = await prisma.ticketAssignmentLog.create({
        data: {
          ticketId: this.testTicketId,
          assignedToUserId: this.testUsers.technician.id,
          assignmentMethod: 'manual',
          assignmentReason: 'Test workflow assignment',
          assignedByUserId: this.testUsers.manager.id
        }
      });

      // Update ticket with assignment
      const updatedTicket = await prisma.ticket.update({
        where: { id: this.testTicketId },
        data: {
          assignedToUserId: this.testUsers.technician.id,
          status: 'assigned',
          updatedAt: new Date()
        }
      });

      await this.logResult('Assign to technician', true, {
        assignedTo: this.testUsers.technician.username,
        assignedBy: this.testUsers.manager.username,
        newStatus: updatedTicket.status,
        assignmentLogId: assignmentLog.id
      });

      return { assignmentLog, updatedTicket };

    } catch (error) {
      await this.logResult('Assign to technician', false, null, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async technicianStartsWork() {
    console.log('\n🔧 Step 5: Technician starts working...');

    try {
      if (!this.testTicketId) {
        throw new Error('No test ticket created');
      }

      // Add a comment from technician
      const comment = await prisma.ticketComment.create({
        data: {
          ticketId: this.testTicketId,
          authorId: this.testUsers.technician.id,
          content: 'Started investigating the issue. Will provide updates shortly.',
          commentType: 'comment',
          isInternal: false
        }
      });

      // Update ticket status to in progress
      const updatedTicket = await prisma.ticket.update({
        where: { id: this.testTicketId },
        data: {
          status: 'in_progress',
          updatedAt: new Date()
        }
      });

      await this.logResult('Technician starts work', true, {
        technicianAction: 'Added comment and changed status',
        newStatus: updatedTicket.status,
        commentId: comment.id
      });

      return { comment, updatedTicket };

    } catch (error) {
      await this.logResult('Technician starts work', false, null, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async checkSLAStatus() {
    console.log('\n📊 Step 6: Checking current SLA status...');

    try {
      if (!this.testTicketId) {
        throw new Error('No test ticket created');
      }

      const ticket = await prisma.ticket.findUnique({
        where: { id: this.testTicketId },
        include: {
          createdBy: {
            include: {
              department: true,
              unit: true
            }
          }
        }
      });

      if (!ticket) {
        throw new Error('Test ticket not found');
      }

      const now = new Date();
      let slaStatus = 'No SLA set';
      let remainingMinutes = 0;
      let isOverdue = false;

      if (ticket.slaDueDate) {
        remainingMinutes = Math.max(0, (ticket.slaDueDate.getTime() - now.getTime()) / (60 * 1000));
        isOverdue = now > ticket.slaDueDate;
        
        if (isOverdue) {
          slaStatus = `OVERDUE by ${Math.abs(remainingMinutes).toFixed(0)} minutes`;
        } else {
          slaStatus = `${remainingMinutes.toFixed(0)} minutes remaining`;
        }
      }

      await this.logResult('Check SLA status', true, {
        currentStatus: ticket.status,
        slaStatus: slaStatus,
        slaDueDate: ticket.slaDueDate?.toLocaleString('id-ID') || 'Not set',
        isOverdue: isOverdue
      });

      return { 
        ticket, 
        slaStatus, 
        remainingMinutes, 
        isOverdue 
      };

    } catch (error) {
      await this.logResult('Check SLA status', false, null, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async resolveTicket() {
    console.log('\n✅ Step 7: Resolving ticket...');

    try {
      if (!this.testTicketId) {
        throw new Error('No test ticket created');
      }

      // Add resolution comment
      const resolutionComment = await prisma.ticketComment.create({
        data: {
          ticketId: this.testTicketId,
          authorId: this.testUsers.technician.id,
          content: 'Issue has been resolved. Applied the recommended solution and verified functionality.',
          commentType: 'resolution',
          isInternal: false
        }
      });

      // Update ticket to resolved
      const resolvedAt = new Date();
      const updatedTicket = await prisma.ticket.update({
        where: { id: this.testTicketId },
        data: {
          status: 'resolved',
          resolvedAt: resolvedAt,
          updatedAt: resolvedAt
        }
      });

      // Calculate resolution time
      const resolutionTime = resolvedAt.getTime() - updatedTicket.createdAt.getTime();
      const resolutionHours = (resolutionTime / (1000 * 60 * 60)).toFixed(2);

      await this.logResult('Resolve ticket', true, {
        resolvedBy: this.testUsers.technician.username,
        resolvedAt: resolvedAt.toLocaleString('id-ID'),
        resolutionTimeHours: resolutionHours,
        resolutionCommentId: resolutionComment.id
      });

      return { resolutionComment, updatedTicket, resolutionHours };

    } catch (error) {
      await this.logResult('Resolve ticket', false, null, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async closeTicket() {
    console.log('\n🔒 Step 8: Closing ticket...');

    try {
      if (!this.testTicketId) {
        throw new Error('No test ticket created');
      }

      // Close the ticket (usually done by requester or automatically after time)
      const updatedTicket = await prisma.ticket.update({
        where: { id: this.testTicketId },
        data: {
          status: 'closed',
          updatedAt: new Date()
        }
      });

      await this.logResult('Close ticket', true, {
        finalStatus: updatedTicket.status,
        closedAt: updatedTicket.updatedAt.toLocaleString('id-ID')
      });

      return updatedTicket;

    } catch (error) {
      await this.logResult('Close ticket', false, null, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async generateReport() {
    console.log('\n📋 Generating workflow test report...');

    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const duration = this.results.length > 0 
      ? (this.results[this.results.length - 1].timestamp.getTime() - this.results[0].timestamp.getTime()) / 1000
      : 0;

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                              WORKFLOW TEST REPORT                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║ Test Ticket ID: ${this.testTicketId?.toString().padEnd(64)} ║
║ Total Steps: ${this.results.length.toString().padEnd(67)} ║
║ Successful: ${successful.toString().padEnd(68)} ║
║ Failed: ${failed.toString().padEnd(72)} ║
║ Duration: ${duration.toFixed(2)}s${' '.repeat(66 - duration.toFixed(2).length)} ║
║ Success Rate: ${((successful / this.results.length) * 100).toFixed(1)}%${' '.repeat(60 - ((successful / this.results.length) * 100).toFixed(1).length)} ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

📊 Step-by-step Results:
`);

    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const time = result.timestamp.toLocaleTimeString('id-ID');
      console.log(`${index + 1}. ${status} [${time}] ${result.step}`);
      
      if (result.slaInfo) {
        console.log(`   📅 SLA: Due ${result.slaInfo.dueDate?.toLocaleString('id-ID') || 'N/A'}`);
      }
      
      if (!result.success && result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }
    });

    const overallSuccess = failed === 0;
    console.log(`\n🏁 Overall Result: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'} - Complete SLA workflow ${overallSuccess ? 'validated successfully' : 'contains errors'}\n`);

    return {
      testTicketId: this.testTicketId,
      totalSteps: this.results.length,
      successful,
      failed,
      duration,
      successRate: (successful / this.results.length) * 100,
      overallSuccess,
      results: this.results
    };
  }
}

async function runCompleteWorkflowTest() {
  console.log('🚀 Starting Complete SLA Workflow Test\n');
  console.log('This test simulates the full ticket lifecycle:');
  console.log('User creates ticket → Manager approves → Technician processes → Resolution → Closure');
  console.log('='.repeat(90) + '\n');

  const tester = new WorkflowTester();

  try {
    // Run the complete workflow
    await tester.setupTestUsers();
    const ticket = await tester.createTicket();
    const slaPolicy = await tester.checkApplicableSLA();
    const approval = await tester.managerApproval();
    const assignment = await tester.assignToTechnician();
    const workStart = await tester.technicianStartsWork();
    const slaCheck = await tester.checkSLAStatus();
    const resolution = await tester.resolveTicket();
    const closure = await tester.closeTicket();

    // Generate final report
    const report = await tester.generateReport();
    
    return report;

  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    await tester.generateReport();
    throw error;

  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  runCompleteWorkflowTest()
    .then((report) => {
      console.log('✅ Workflow test completed successfully');
      process.exit(report.overallSuccess ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Workflow test failed:', error);
      process.exit(1);
    });
}

export { runCompleteWorkflowTest, WorkflowTester };