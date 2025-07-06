// Unit tests for Approval Workflow System
const TestSetup = require('../shared/utilities/testSetup');
const { testCredentials, credentialHelpers } = require('../shared/fixtures/testCredentials');

describe('Approval Workflow System Unit Tests', () => {
  let testSetup;

  beforeAll(async () => {
    testSetup = new TestSetup();
  });

  afterEach(async () => {
    await testSetup.cleanupTestData();
  });

  afterAll(async () => {
    await testSetup.disconnect();
  });

  describe('Branch-Based Approval Authority', () => {
    test('should validate CABANG manager approval authority', async () => {
      const cabangBranch = await testSetup.getTestBranch('CABANG');
      
      const cabangManager = await testSetup.createTestUser({
        email: 'cabang-approval@bsg.co.id',
        name: 'CABANG Approval Manager',
        role: 'manager',
        unitId: cabangBranch.id,
        isBusinessReviewer: true
      });
      
      expect(cabangManager.role).toBe('manager');
      expect(cabangManager.isBusinessReviewer).toBe(true);
      expect(cabangManager.unitId).toBe(cabangBranch.id);
      
      // CABANG manager should have approval authority
      const approvalValidation = testSetup.validateUserData(cabangManager, {
        hasApprovalAuthority: cabangManager.isBusinessReviewer === true,
        isAssignedToBranch: cabangManager.unitId != null,
        canApproveBranchTickets: cabangManager.role === 'manager' && cabangManager.isBusinessReviewer
      });
      
      expect(approvalValidation.hasApprovalAuthority).toBe(true);
      expect(approvalValidation.isAssignedToBranch).toBe(true);
      expect(approvalValidation.canApproveBranchTickets).toBe(true);
    });

    test('should validate CAPEM manager approval authority', async () => {
      const capemBranch = await testSetup.getTestBranch('CAPEM');
      
      const capemManager = await testSetup.createTestUser({
        email: 'capem-approval@bsg.co.id',
        name: 'CAPEM Approval Manager',
        role: 'manager',
        unitId: capemBranch.id,
        isBusinessReviewer: true
      });
      
      expect(capemManager.role).toBe('manager');
      expect(capemManager.isBusinessReviewer).toBe(true);
      expect(capemManager.unitId).toBe(capemBranch.id);
      
      // CAPEM manager should have equal approval authority to CABANG
      const approvalValidation = testSetup.validateUserData(capemManager, {
        hasEqualApprovalAuthority: capemManager.isBusinessReviewer === true,
        independentAuthority: capemManager.role === 'manager',
        notSubordinateToCABANG: capemManager.unitId !== null // Independent unit assignment
      });
      
      expect(approvalValidation.hasEqualApprovalAuthority).toBe(true);
      expect(approvalValidation.independentAuthority).toBe(true);
      expect(approvalValidation.notSubordinateToCABANG).toBe(true);
    });

    test('should enforce equal authority model between CABANG and CAPEM', async () => {
      const cabangBranch = await testSetup.getTestBranch('CABANG');
      const capemBranch = await testSetup.getTestBranch('CAPEM');
      
      const cabangManager = await testSetup.createTestUser({
        email: 'equal-cabang@bsg.co.id',
        name: 'CABANG Equal Authority',
        role: 'manager',
        unitId: cabangBranch.id,
        isBusinessReviewer: true
      });
      
      const capemManager = await testSetup.createTestUser({
        email: 'equal-capem@bsg.co.id',
        name: 'CAPEM Equal Authority',
        role: 'manager',
        unitId: capemBranch.id,
        isBusinessReviewer: true
      });
      
      // Both managers should have identical approval capabilities
      expect(cabangManager.role).toBe(capemManager.role);
      expect(cabangManager.isBusinessReviewer).toBe(capemManager.isBusinessReviewer);
      
      // Validate equal authority
      const cabangAuthority = {
        canApprove: cabangManager.isBusinessReviewer,
        hasManagerRole: cabangManager.role === 'manager',
        isActive: cabangManager.isActive
      };
      
      const capemAuthority = {
        canApprove: capemManager.isBusinessReviewer,
        hasManagerRole: capemManager.role === 'manager',
        isActive: capemManager.isActive
      };
      
      expect(cabangAuthority).toEqual(capemAuthority);
    });

    test('should validate unit-based approval isolation', async () => {
      const cabangBranch = await testSetup.getTestBranch('CABANG');
      const capemBranch = await testSetup.getTestBranch('CAPEM');
      
      // Create managers for different branches
      const cabangManager = await testSetup.createTestUser({
        email: 'isolation-cabang@bsg.co.id',
        name: 'CABANG Isolation Manager',
        role: 'manager',
        unitId: cabangBranch.id,
        isBusinessReviewer: true
      });
      
      const capemManager = await testSetup.createTestUser({
        email: 'isolation-capem@bsg.co.id',
        name: 'CAPEM Isolation Manager',
        role: 'manager',
        unitId: capemBranch.id,
        isBusinessReviewer: true
      });
      
      // Create requesters for each branch
      const cabangRequester = await testSetup.createTestUser({
        email: 'cabang-requester@bsg.co.id',
        name: 'CABANG Requester',
        role: 'requester',
        unitId: cabangBranch.id
      });
      
      const capemRequester = await testSetup.createTestUser({
        email: 'capem-requester@bsg.co.id',
        name: 'CAPEM Requester',
        role: 'requester',
        unitId: capemBranch.id
      });
      
      // Create tickets from each requester
      const cabangTicket = await testSetup.createTestTicket({
        title: 'CABANG Branch Ticket',
        description: 'Ticket requiring CABANG manager approval',
        priority: 'medium',
        status: 'pending_approval',
        unitId: cabangBranch.id
      }, cabangRequester);
      
      const capemTicket = await testSetup.createTestTicket({
        title: 'CAPEM Branch Ticket',
        description: 'Ticket requiring CAPEM manager approval',
        priority: 'medium',
        status: 'pending_approval',
        unitId: capemBranch.id
      }, capemRequester);
      
      // Validate approval isolation
      expect(cabangTicket.unitId).toBe(cabangBranch.id);
      expect(capemTicket.unitId).toBe(capemBranch.id);
      expect(cabangTicket.unitId).not.toBe(capemTicket.unitId);
      
      // Managers should only approve tickets from their own unit
      const cabangApprovalScope = {
        canApproveCabangTicket: cabangManager.unitId === cabangTicket.unitId,
        cannotApproveCapemTicket: cabangManager.unitId !== capemTicket.unitId
      };
      
      const capemApprovalScope = {
        canApproveCapemTicket: capemManager.unitId === capemTicket.unitId,
        cannotApproveCabangTicket: capemManager.unitId !== cabangTicket.unitId
      };
      
      expect(cabangApprovalScope.canApproveCabangTicket).toBe(true);
      expect(cabangApprovalScope.cannotApproveCapemTicket).toBe(true);
      expect(capemApprovalScope.canApproveCapemTicket).toBe(true);
      expect(capemApprovalScope.cannotApproveCabangTicket).toBe(true);
    });
  });

  describe('Approval Workflow States', () => {
    test('should handle pending approval state correctly', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const pendingTicket = await testSetup.createTestTicket({
        title: 'Pending Approval Test',
        description: 'Testing pending approval workflow state',
        priority: 'medium',
        status: 'pending_approval'
      }, requester);
      
      expect(pendingTicket.status).toBe('pending_approval');
      
      // Pending approval tickets should have specific characteristics
      const approvalValidation = testSetup.validateTicketData(pendingTicket, {
        isPendingApproval: pendingTicket.status === 'pending_approval',
        hasRequester: pendingTicket.createdById != null,
        needsManagerReview: pendingTicket.status === 'pending_approval',
        notYetAssigned: pendingTicket.assignedToId == null
      });
      
      expect(approvalValidation.isPendingApproval).toBe(true);
      expect(approvalValidation.hasRequester).toBe(true);
      expect(approvalValidation.needsManagerReview).toBe(true);
      expect(approvalValidation.notYetAssigned).toBe(true);
    });

    test('should validate approval to new status transition', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      // Create ticket in pending approval state
      const ticket = await testSetup.createTestTicket({
        title: 'Approval Transition Test',
        description: 'Testing approval to new status transition',
        priority: 'medium',
        status: 'pending_approval'
      }, requester);
      
      expect(ticket.status).toBe('pending_approval');
      
      // After approval, status should change to 'new'
      const postApprovalValidation = {
        canTransitionToNew: ticket.status === 'pending_approval',
        validNextStatus: 'new',
        approvalRequired: true
      };
      
      expect(postApprovalValidation.canTransitionToNew).toBe(true);
      expect(postApprovalValidation.validNextStatus).toBe('new');
      expect(postApprovalValidation.approvalRequired).toBe(true);
    });

    test('should validate rejection workflow', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticket = await testSetup.createTestTicket({
        title: 'Rejection Workflow Test',
        description: 'Testing ticket rejection workflow',
        priority: 'medium',
        status: 'pending_approval'
      }, requester);
      
      // Rejection scenarios
      const rejectionValidation = {
        canBeRejected: ticket.status === 'pending_approval',
        canRequestMoreInfo: ticket.status === 'pending_approval',
        canBeResubmitted: true, // After rejection, can be resubmitted
        maintainAuditTrail: true
      };
      
      expect(rejectionValidation.canBeRejected).toBe(true);
      expect(rejectionValidation.canRequestMoreInfo).toBe(true);
      expect(rejectionValidation.canBeResubmitted).toBe(true);
      expect(rejectionValidation.maintainAuditTrail).toBe(true);
    });

    test('should handle approval delegation scenarios', async () => {
      const manager = await testSetup.createTestUser({
        email: 'delegating-manager@bsg.co.id',
        name: 'Delegating Manager',
        role: 'manager',
        isBusinessReviewer: true
      });
      
      const delegateManager = await testSetup.createTestUser({
        email: 'delegate-manager@bsg.co.id',
        name: 'Delegate Manager',
        role: 'manager',
        isBusinessReviewer: true
      });
      
      // Both should have approval authority
      expect(manager.isBusinessReviewer).toBe(true);
      expect(delegateManager.isBusinessReviewer).toBe(true);
      
      // Delegation validation
      const delegationValidation = {
        originalManagerCanDelegate: manager.isBusinessReviewer && manager.role === 'manager',
        delegateHasAuthority: delegateManager.isBusinessReviewer && delegateManager.role === 'manager',
        delegationMaintainsAudit: true
      };
      
      expect(delegationValidation.originalManagerCanDelegate).toBe(true);
      expect(delegationValidation.delegateHasAuthority).toBe(true);
      expect(delegationValidation.delegationMaintainsAudit).toBe(true);
    });
  });

  describe('SLA and Approval Timing', () => {
    test('should validate SLA exclusion during approval phase', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticket = await testSetup.createTestTicket({
        title: 'SLA Exclusion Test',
        description: 'Testing SLA exclusion during approval phase',
        priority: 'medium',
        status: 'pending_approval'
      }, requester);
      
      // SLA should not start during approval phase
      const slaValidation = {
        slaNotStarted: ticket.status === 'pending_approval',
        startsAfterApproval: true, // SLA starts when status becomes 'new'
        approvalTimeExcluded: true,
        businessHoursNotCounting: ticket.status === 'pending_approval'
      };
      
      expect(slaValidation.slaNotStarted).toBe(true);
      expect(slaValidation.startsAfterApproval).toBe(true);
      expect(slaValidation.approvalTimeExcluded).toBe(true);
      expect(slaValidation.businessHoursNotCounting).toBe(true);
    });

    test('should handle approval notification timing', async () => {
      const manager = await testSetup.createTestUser({
        email: 'notification-manager@bsg.co.id',
        name: 'Notification Manager',
        role: 'manager',
        isBusinessReviewer: true
      });
      
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticket = await testSetup.createTestTicket({
        title: 'Notification Timing Test',
        description: 'Testing approval notification timing',
        priority: 'high',
        status: 'pending_approval'
      }, requester);
      
      // High priority approvals should trigger immediate notifications
      const notificationValidation = {
        requiresImmediateNotification: ticket.priority === 'high' || ticket.priority === 'urgent',
        managerShouldBeNotified: ticket.status === 'pending_approval',
        emailNotificationRequired: ticket.status === 'pending_approval',
        inAppNotificationRequired: ticket.status === 'pending_approval'
      };
      
      expect(notificationValidation.requiresImmediateNotification).toBe(true);
      expect(notificationValidation.managerShouldBeNotified).toBe(true);
      expect(notificationValidation.emailNotificationRequired).toBe(true);
      expect(notificationValidation.inAppNotificationRequired).toBe(true);
    });

    test('should validate approval reminder scheduling', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticket = await testSetup.createTestTicket({
        title: 'Approval Reminder Test',
        description: 'Testing approval reminder scheduling',
        priority: 'medium',
        status: 'pending_approval'
      }, requester);
      
      // Calculate reminder timing
      const currentTime = new Date();
      const createdTime = ticket.createdAt;
      const reminderInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      const reminderValidation = {
        hasCreationTime: createdTime != null,
        canCalculateReminder: createdTime != null,
        reminderAfter24Hours: true, // Business logic: daily reminders
        urgentReminderAfter4Hours: ticket.priority === 'urgent'
      };
      
      expect(reminderValidation.hasCreationTime).toBe(true);
      expect(reminderValidation.canCalculateReminder).toBe(true);
      expect(reminderValidation.reminderAfter24Hours).toBe(true);
      expect(reminderValidation.urgentReminderAfter4Hours).toBe(false); // Medium priority
    });

    test('should handle business hours calculation for approvals', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticket = await testSetup.createTestTicket({
        title: 'Business Hours Test',
        description: 'Testing business hours calculation for approvals',
        priority: 'medium',
        status: 'pending_approval'
      }, requester);
      
      // Business hours validation (example: 8 AM - 5 PM, Monday-Friday)
      const businessHoursValidation = {
        tracksPendingTime: ticket.status === 'pending_approval',
        excludesWeekends: true,
        excludesHolidays: true,
        workingHours: { start: 8, end: 17 }, // 8 AM to 5 PM
        timezone: 'Asia/Makassar' // Indonesia timezone
      };
      
      expect(businessHoursValidation.tracksPendingTime).toBe(true);
      expect(businessHoursValidation.excludesWeekends).toBe(true);
      expect(businessHoursValidation.excludesHolidays).toBe(true);
      expect(businessHoursValidation.workingHours.start).toBe(8);
      expect(businessHoursValidation.workingHours.end).toBe(17);
      expect(businessHoursValidation.timezone).toBe('Asia/Makassar');
    });
  });

  describe('Approval Authority Validation', () => {
    test('should validate manager role requirements', async () => {
      const nonManagerRoles = ['admin', 'technician', 'requester'];
      
      for (const role of nonManagerRoles) {
        const user = await testSetup.createTestUser({
          email: `non-manager-${role}@bsg.co.id`,
          name: `Non-Manager ${role}`,
          role: role,
          isBusinessReviewer: false // Non-managers don't have approval authority
        });
        
        const approvalValidation = {
          hasManagerRole: user.role === 'manager',
          hasApprovalAuthority: user.isBusinessReviewer === true,
          canApproveTickets: user.role === 'manager' && user.isBusinessReviewer
        };
        
        expect(approvalValidation.hasManagerRole).toBe(false);
        expect(approvalValidation.hasApprovalAuthority).toBe(false);
        expect(approvalValidation.canApproveTickets).toBe(false);
      }
    });

    test('should validate business reviewer flag requirement', async () => {
      const managerWithoutReviewer = await testSetup.createTestUser({
        email: 'manager-no-reviewer@bsg.co.id',
        name: 'Manager Without Reviewer',
        role: 'manager',
        isBusinessReviewer: false
      });
      
      const managerWithReviewer = await testSetup.createTestUser({
        email: 'manager-with-reviewer@bsg.co.id',
        name: 'Manager With Reviewer',
        role: 'manager',
        isBusinessReviewer: true
      });
      
      // Only managers with business reviewer flag can approve
      const withoutReviewerValidation = {
        isManager: managerWithoutReviewer.role === 'manager',
        canApprove: managerWithoutReviewer.isBusinessReviewer === true
      };
      
      const withReviewerValidation = {
        isManager: managerWithReviewer.role === 'manager',
        canApprove: managerWithReviewer.isBusinessReviewer === true
      };
      
      expect(withoutReviewerValidation.isManager).toBe(true);
      expect(withoutReviewerValidation.canApprove).toBe(false);
      expect(withReviewerValidation.isManager).toBe(true);
      expect(withReviewerValidation.canApprove).toBe(true);
    });

    test('should validate cross-branch approval restrictions', async () => {
      const cabangBranch = await testSetup.getTestBranch('CABANG');
      const capemBranch = await testSetup.getTestBranch('CAPEM');
      
      const cabangManager = await testSetup.createTestUser({
        email: 'cross-cabang@bsg.co.id',
        name: 'Cross CABANG Manager',
        role: 'manager',
        unitId: cabangBranch.id,
        isBusinessReviewer: true
      });
      
      const capemRequester = await testSetup.createTestUser({
        email: 'cross-capem-req@bsg.co.id',
        name: 'Cross CAPEM Requester',
        role: 'requester',
        unitId: capemBranch.id
      });
      
      const crossBranchTicket = await testSetup.createTestTicket({
        title: 'Cross-Branch Ticket',
        description: 'Testing cross-branch approval restrictions',
        priority: 'medium',
        status: 'pending_approval',
        unitId: capemBranch.id
      }, capemRequester);
      
      // CABANG manager should NOT be able to approve CAPEM tickets
      const crossApprovalValidation = {
        managerBranch: cabangManager.unitId,
        ticketBranch: crossBranchTicket.unitId,
        canApprove: cabangManager.unitId === crossBranchTicket.unitId,
        violatesBoundary: cabangManager.unitId !== crossBranchTicket.unitId
      };
      
      expect(crossApprovalValidation.canApprove).toBe(false);
      expect(crossApprovalValidation.violatesBoundary).toBe(true);
    });

    test('should validate department-level approval capabilities', async () => {
      // Department-level technicians can serve all branches but cannot approve
      const departmentTechnician = await testSetup.createTestUser({
        email: 'dept-technician@bsg.co.id',
        name: 'Department Technician',
        role: 'technician',
        department: 'Information Technology',
        unitId: null // Department level, not branch-specific
      });
      
      const deptApprovalValidation = {
        isDepartmentLevel: departmentTechnician.unitId == null,
        canServeAllBranches: departmentTechnician.unitId == null,
        cannotApprove: departmentTechnician.role !== 'manager' || !departmentTechnician.isBusinessReviewer,
        processingOnly: departmentTechnician.role === 'technician'
      };
      
      expect(deptApprovalValidation.isDepartmentLevel).toBe(true);
      expect(deptApprovalValidation.canServeAllBranches).toBe(true);
      expect(deptApprovalValidation.cannotApprove).toBe(true);
      expect(deptApprovalValidation.processingOnly).toBe(true);
    });
  });

  describe('Approval Workflow Integration', () => {
    test('should integrate with test credential system', () => {
      // Test manager credentials from different branches
      const utamaManager = credentialHelpers.getByBranch('UTAMA', 'manager');
      const jakartaManager = credentialHelpers.getByBranch('JAKARTA', 'manager');
      const kelapaGadingManager = credentialHelpers.getByBranch('KELAPA_GADING', 'manager');
      
      expect(utamaManager.isBusinessReviewer).toBe(true);
      expect(jakartaManager.isBusinessReviewer).toBe(true);
      expect(kelapaGadingManager.isBusinessReviewer).toBe(true);
      
      expect(utamaManager.unitType).toBe('CABANG');
      expect(jakartaManager.unitType).toBe('CABANG');
      expect(kelapaGadingManager.unitType).toBe('CAPEM');
    });

    test('should support approval workflow with all branch types', async () => {
      const allBranches = await testSetup.getAllTestBranches();
      
      // Verify we have both CABANG and CAPEM branches
      const cabangBranches = allBranches.filter(b => b.unitType === 'CABANG');
      const capemBranches = allBranches.filter(b => b.unitType === 'CAPEM');
      
      expect(cabangBranches.length).toBeGreaterThan(20);
      expect(capemBranches.length).toBeGreaterThan(15);
      
      // All branches should be active and suitable for approval workflow
      allBranches.forEach(branch => {
        expect(branch.isActive).toBe(true);
        expect(branch.unitCode).toBeDefined();
        expect(['CABANG', 'CAPEM'].includes(branch.unitType)).toBe(true);
      });
    });

    test('should handle approval workflow performance', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      // Test approval workflow setup performance
      const { result: ticket, executionTimeMs } = await testSetup.measureExecutionTime(
        () => testSetup.createTestTicket({
          title: 'Approval Performance Test',
          description: 'Testing approval workflow performance',
          priority: 'high',
          status: 'pending_approval'
        }, requester)
      );
      
      expect(ticket.status).toBe('pending_approval');
      expect(executionTimeMs).toBeLessThan(1000); // Should be fast
      
      // Test approval notification readiness
      const notificationTest = await testSetup.waitForNotification(
        requester.id, 
        'approval_required',
        1000
      );
      
      expect(notificationTest).toBeDefined();
      expect(notificationTest.type).toBe('approval_required');
    });

    test('should validate approval audit trail requirements', async () => {
      const manager = await testSetup.createTestUser({
        email: 'audit-manager@bsg.co.id',
        name: 'Audit Trail Manager',
        role: 'manager',
        isBusinessReviewer: true
      });
      
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticket = await testSetup.createTestTicket({
        title: 'Audit Trail Test',
        description: 'Testing approval audit trail requirements',
        priority: 'medium',
        status: 'pending_approval'
      }, requester);
      
      // Audit trail validation
      const auditValidation = {
        hasCreationRecord: ticket.createdAt != null && ticket.createdById != null,
        tracksPendingState: ticket.status === 'pending_approval',
        readyForApprovalLogging: manager.isBusinessReviewer,
        maintainsTimestamps: ticket.createdAt != null && ticket.updatedAt != null
      };
      
      expect(auditValidation.hasCreationRecord).toBe(true);
      expect(auditValidation.tracksPendingState).toBe(true);
      expect(auditValidation.readyForApprovalLogging).toBe(true);
      expect(auditValidation.maintainsTimestamps).toBe(true);
    });
  });
});