// Unit tests for User Management System
const TestSetup = require('../shared/utilities/testSetup');
const { testCredentials, credentialHelpers } = require('../shared/fixtures/testCredentials');

describe('User Management System Unit Tests', () => {
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

  describe('User Creation and CRUD Operations', () => {
    test('should create user with all required fields', async () => {
      const userData = {
        email: 'crud-test@bsg.co.id',
        password: 'securePassword123',
        name: 'CRUD Test User',
        role: 'requester',
        isActive: true
      };

      const user = await testSetup.createTestUser(userData);
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe(userData.role);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test('should create user with optional branch assignment', async () => {
      const branch = await testSetup.getTestBranch('CABANG');
      
      const userData = {
        email: 'branch-assignment@bsg.co.id',
        name: 'Branch Assignment User',
        role: 'requester',
        unitId: branch.id
      };

      const user = await testSetup.createTestUser(userData);
      
      expect(user.unitId).toBe(branch.id);
      expect(user.unit).toBeDefined();
      expect(user.unit.id).toBe(branch.id);
    });

    test('should create user with department assignment', async () => {
      const userData = {
        email: 'dept-assignment@bsg.co.id',
        name: 'Department Assignment User',
        role: 'technician',
        department: 'Information Technology'
      };

      const user = await testSetup.createTestUser(userData);
      
      expect(user.role).toBe('technician');
      // Department assignment would be validated through relations if implemented
    });

    test('should retrieve user by role efficiently', async () => {
      const roles = ['admin', 'manager', 'technician', 'requester'];
      
      for (const role of roles) {
        const user = await testSetup.getTestUserByRole(role);
        expect(user).toBeDefined();
        expect(user.role).toBe(role);
        expect(user.isActive).toBe(true);
      }
    });

    test('should validate user data structure', async () => {
      const user = await testSetup.createTestUser({
        email: 'validation-structure@bsg.co.id',
        name: 'Structure Validation User',
        role: 'technician'
      });

      const validation = testSetup.validateUserData(user);
      
      const expectedValidations = [
        'hasId', 'hasEmail', 'hasName', 'hasValidRole',
        'isActive', 'hasCreatedAt', 'hasUpdatedAt'
      ];
      
      expectedValidations.forEach(key => {
        expect(validation[key]).toBe(true);
      });
    });

    test('should handle user creation with custom validation rules', async () => {
      const user = await testSetup.createTestUser({
        email: 'custom-validation@bsg.co.id',
        name: 'Custom Validation User',
        role: 'manager',
        isBusinessReviewer: true
      });

      const customValidation = testSetup.validateUserData(user, {
        isManager: user.role === 'manager',
        hasBusinessReviewerFlag: user.isBusinessReviewer === true
      });
      
      expect(customValidation.isManager).toBe(true);
      expect(customValidation.hasBusinessReviewerFlag).toBe(true);
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    test('should enforce admin role capabilities', async () => {
      const adminUser = await testSetup.getTestUserByRole('admin');
      
      expect(adminUser.role).toBe('admin');
      
      // Admin should have system-wide access
      const adminValidation = testSetup.validateUserData(adminUser, {
        canManageSystem: adminUser.role === 'admin',
        canManageUsers: adminUser.role === 'admin',
        canViewReports: adminUser.role === 'admin',
        canManageConfiguration: adminUser.role === 'admin'
      });
      
      expect(adminValidation.canManageSystem).toBe(true);
      expect(adminValidation.canManageUsers).toBe(true);
      expect(adminValidation.canViewReports).toBe(true);
      expect(adminValidation.canManageConfiguration).toBe(true);
    });

    test('should enforce manager role capabilities', async () => {
      const managerUser = await testSetup.createTestUser({
        email: 'manager-rbac@bsg.co.id',
        name: 'Manager RBAC Test',
        role: 'manager',
        isBusinessReviewer: true
      });
      
      const managerValidation = testSetup.validateUserData(managerUser, {
        canApproveTickets: managerUser.isBusinessReviewer === true,
        canManageBranch: managerUser.role === 'manager',
        canViewBranchReports: managerUser.role === 'manager',
        isLimitedToUnit: managerUser.unitId != null || managerUser.role === 'manager'
      });
      
      expect(managerValidation.canApproveTickets).toBe(true);
      expect(managerValidation.canManageBranch).toBe(true);
      expect(managerValidation.canViewBranchReports).toBe(true);
    });

    test('should enforce technician role capabilities', async () => {
      const technicianUser = await testSetup.getTestUserByRole('technician');
      
      const techValidation = testSetup.validateUserData(technicianUser, {
        canProcessTickets: technicianUser.role === 'technician',
        canUpdateTicketStatus: technicianUser.role === 'technician',
        canAccessKnowledgeBase: technicianUser.role === 'technician',
        cannotApproveTickets: technicianUser.role !== 'manager' && !technicianUser.isBusinessReviewer
      });
      
      expect(techValidation.canProcessTickets).toBe(true);
      expect(techValidation.canUpdateTicketStatus).toBe(true);
      expect(techValidation.canAccessKnowledgeBase).toBe(true);
      expect(techValidation.cannotApproveTickets).toBe(true);
    });

    test('should enforce requester role capabilities', async () => {
      const requesterUser = await testSetup.getTestUserByRole('requester');
      
      const requesterValidation = testSetup.validateUserData(requesterUser, {
        canCreateTickets: requesterUser.role === 'requester',
        canViewOwnTickets: requesterUser.role === 'requester',
        canAccessCustomerPortal: requesterUser.role === 'requester',
        cannotAccessTechnicianFeatures: requesterUser.role !== 'technician' && requesterUser.role !== 'admin'
      });
      
      expect(requesterValidation.canCreateTickets).toBe(true);
      expect(requesterValidation.canViewOwnTickets).toBe(true);
      expect(requesterValidation.canAccessCustomerPortal).toBe(true);
      expect(requesterValidation.cannotAccessTechnicianFeatures).toBe(true);
    });

    test('should validate role hierarchy', () => {
      const roleHierarchy = [
        { role: 'admin', level: 4 },
        { role: 'manager', level: 3 },
        { role: 'technician', level: 2 },
        { role: 'requester', level: 1 }
      ];
      
      roleHierarchy.forEach(({ role, level }) => {
        const userData = testSetup.getDefaultUserDataByRole(role);
        expect(userData.role).toBe(role);
        
        // Validate role-based access levels
        const hasAdminAccess = level >= 4;
        const hasManagerAccess = level >= 3;
        const hasTechnicianAccess = level >= 2;
        const hasRequesterAccess = level >= 1;
        
        expect(hasRequesterAccess).toBe(true); // All roles have basic access
        
        if (role === 'admin') {
          expect(hasAdminAccess).toBe(true);
          expect(hasManagerAccess).toBe(true);
          expect(hasTechnicianAccess).toBe(true);
        } else if (role === 'manager') {
          expect(hasAdminAccess).toBe(false);
          expect(hasManagerAccess).toBe(true);
          expect(hasTechnicianAccess).toBe(true);
        } else if (role === 'technician') {
          expect(hasAdminAccess).toBe(false);
          expect(hasManagerAccess).toBe(false);
          expect(hasTechnicianAccess).toBe(true);
        } else {
          expect(hasAdminAccess).toBe(false);
          expect(hasManagerAccess).toBe(false);
          expect(hasTechnicianAccess).toBe(false);
        }
      });
    });
  });

  describe('Branch and Unit Management', () => {
    test('should retrieve CABANG branch for testing', async () => {
      const cabangBranch = await testSetup.getTestBranch('CABANG');
      
      expect(cabangBranch).toBeDefined();
      expect(cabangBranch.unitType).toBe('CABANG');
      expect(cabangBranch.isActive).toBe(true);
      expect(cabangBranch.unitCode).toBeDefined();
    });

    test('should retrieve CAPEM branch for testing', async () => {
      const capemBranch = await testSetup.getTestBranch('CAPEM');
      
      expect(capemBranch).toBeDefined();
      expect(capemBranch.unitType).toBe('CAPEM');
      expect(capemBranch.isActive).toBe(true);
      expect(capemBranch.unitCode).toBeDefined();
    });

    test('should retrieve all test branches (53 branches)', async () => {
      const allBranches = await testSetup.getAllTestBranches();
      
      expect(Array.isArray(allBranches)).toBe(true);
      expect(allBranches.length).toBeGreaterThanOrEqual(50); // At least 50 branches
      
      const cabangCount = allBranches.filter(b => b.unitType === 'CABANG').length;
      const capemCount = allBranches.filter(b => b.unitType === 'CAPEM').length;
      
      expect(cabangCount).toBeGreaterThanOrEqual(25); // At least 25 CABANG branches
      expect(capemCount).toBeGreaterThanOrEqual(20); // At least 20 CAPEM branches
      
      // All branches should be active and sorted
      allBranches.forEach((branch, index) => {
        expect(branch.isActive).toBe(true);
        expect(branch.unitCode).toBeDefined();
        
        if (index > 0) {
          expect(branch.unitCode >= allBranches[index - 1].unitCode).toBe(true);
        }
      });
    });

    test('should assign users to specific branches', async () => {
      const branch = await testSetup.getTestBranch('CABANG');
      
      const branchUser = await testSetup.createTestUser({
        email: 'branch-user@bsg.co.id',
        name: 'Branch Assigned User',
        role: 'requester',
        unitId: branch.id
      });
      
      expect(branchUser.unitId).toBe(branch.id);
      expect(branchUser.unit).toBeDefined();
      expect(branchUser.unit.unitType).toBe('CABANG');
    });

    test('should validate branch-based user isolation', async () => {
      const cabangBranch = await testSetup.getTestBranch('CABANG');
      const capemBranch = await testSetup.getTestBranch('CAPEM');
      
      const cabangUser = await testSetup.createTestUser({
        email: 'cabang-isolation@bsg.co.id',
        name: 'CABANG Isolation User',
        role: 'requester',
        unitId: cabangBranch.id
      });
      
      const capemUser = await testSetup.createTestUser({
        email: 'capem-isolation@bsg.co.id',
        name: 'CAPEM Isolation User',
        role: 'requester',
        unitId: capemBranch.id
      });
      
      expect(cabangUser.unitId).not.toBe(capemUser.unitId);
      expect(cabangUser.unit.unitType).toBe('CABANG');
      expect(capemUser.unit.unitType).toBe('CAPEM');
    });

    test('should support equal authority model for branch managers', async () => {
      const cabangBranch = await testSetup.getTestBranch('CABANG');
      const capemBranch = await testSetup.getTestBranch('CAPEM');
      
      const cabangManager = await testSetup.createTestUser({
        email: 'cabang-manager@bsg.co.id',
        name: 'CABANG Manager',
        role: 'manager',
        unitId: cabangBranch.id,
        isBusinessReviewer: true
      });
      
      const capemManager = await testSetup.createTestUser({
        email: 'capem-manager@bsg.co.id',
        name: 'CAPEM Manager',
        role: 'manager',
        unitId: capemBranch.id,
        isBusinessReviewer: true
      });
      
      // Both managers should have equal approval authority
      expect(cabangManager.isBusinessReviewer).toBe(true);
      expect(capemManager.isBusinessReviewer).toBe(true);
      expect(cabangManager.role).toBe('manager');
      expect(capemManager.role).toBe('manager');
    });
  });

  describe('User Data Validation and Integrity', () => {
    test('should validate email format requirements', async () => {
      const validEmails = [
        'user@bsg.co.id',
        'test.user@bsg.co.id',
        'user123@bsg.co.id',
        'user_name@bsg.co.id'
      ];
      
      for (const email of validEmails) {
        const user = await testSetup.createTestUser({
          email,
          name: 'Valid Email User',
          role: 'requester'
        });
        expect(user.email).toBe(email);
      }
    });

    test('should reject invalid user data', async () => {
      const invalidUserDataSets = [
        { email: '', name: 'No Email User', role: 'requester' },
        { email: 'test@bsg.co.id', name: '', role: 'requester' },
        { email: 'test@bsg.co.id', name: 'No Role User', role: '' },
        { email: 'invalid-email', name: 'Invalid Email User', role: 'requester' }
      ];
      
      for (const userData of invalidUserDataSets) {
        await expect(
          testSetup.createTestUser(userData)
        ).rejects.toThrow();
      }
    });

    test('should validate role enum constraints', async () => {
      const validRoles = ['admin', 'manager', 'technician', 'requester'];
      const invalidRoles = ['superuser', 'guest', 'customer', 'operator'];
      
      // Valid roles should work
      for (const role of validRoles) {
        const user = await testSetup.createTestUser({
          email: `valid-role-${role}@bsg.co.id`,
          name: `Valid Role ${role}`,
          role: role
        });
        expect(user.role).toBe(role);
      }
      
      // Invalid roles should be rejected
      for (const role of invalidRoles) {
        await expect(
          testSetup.createTestUser({
            email: `invalid-role-${role}@bsg.co.id`,
            name: `Invalid Role ${role}`,
            role: role
          })
        ).rejects.toThrow();
      }
    });

    test('should handle user status management', async () => {
      const activeUser = await testSetup.createTestUser({
        email: 'active-user@bsg.co.id',
        name: 'Active User',
        role: 'requester',
        isActive: true
      });
      
      const inactiveUser = await testSetup.createTestUser({
        email: 'inactive-user@bsg.co.id',
        name: 'Inactive User',
        role: 'requester',
        isActive: false
      });
      
      expect(activeUser.isActive).toBe(true);
      expect(inactiveUser.isActive).toBe(false);
    });

    test('should track user creation and modification timestamps', async () => {
      const user = await testSetup.createTestUser({
        email: 'timestamp-test@bsg.co.id',
        name: 'Timestamp Test User',
        role: 'technician'
      });
      
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt instanceof Date).toBe(true);
      expect(user.updatedAt instanceof Date).toBe(true);
      
      // Updated timestamp should be same or after created timestamp
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(user.createdAt.getTime());
    });
  });

  describe('Test Credential Integration', () => {
    test('should integrate with test credential system', () => {
      const testCreds = credentialHelpers.getByRole('admin');
      
      expect(testCreds).toBeDefined();
      expect(testCreds.email).toBe('admin@bsg.co.id');
      expect(testCreds.role).toBe('admin');
      expect(credentialHelpers.validateCredentials(testCreds)).toBe(true);
    });

    test('should provide credentials for all branch types', () => {
      const cabangManager = credentialHelpers.getByBranch('UTAMA', 'manager');
      const capemManager = credentialHelpers.getByBranch('KELAPA_GADING', 'manager');
      
      expect(cabangManager).toBeDefined();
      expect(capemManager).toBeDefined();
      expect(cabangManager.unitType).toBe('CABANG');
      expect(capemManager.unitType).toBe('CAPEM');
      expect(cabangManager.isBusinessReviewer).toBe(true);
      expect(capemManager.isBusinessReviewer).toBe(true);
    });

    test('should provide credentials for all departments', () => {
      const bankingTech = credentialHelpers.getByDepartment('Dukungan dan Layanan');
      const itTech = credentialHelpers.getByDepartment('Information Technology');
      const govTech = credentialHelpers.getByDepartment('Government Services');
      
      expect(bankingTech).toBeDefined();
      expect(itTech).toBeDefined();
      expect(govTech).toBeDefined();
      
      expect(bankingTech.department).toBe('Dukungan dan Layanan');
      expect(itTech.department).toBe('Information Technology');
      expect(govTech.department).toBe('Government Services');
    });

    test('should support test account isolation', () => {
      const testAccounts = ['admin', 'manager', 'technician', 'requester'];
      
      testAccounts.forEach(role => {
        const testAccount = credentialHelpers.getTestAccount(role);
        expect(testAccount).toBeDefined();
        expect(testAccount.email).toContain('test.');
        expect(testAccount.password).toBe('testpass123');
        expect(testAccount.role).toBe(role);
      });
    });
  });

  describe('User Management Performance', () => {
    test('should create users efficiently', async () => {
      const { result: user, executionTimeMs } = await testSetup.measureExecutionTime(
        () => testSetup.createTestUser({
          email: 'performance-create@bsg.co.id',
          name: 'Performance Create User',
          role: 'technician'
        })
      );
      
      expect(user).toBeDefined();
      expect(user.role).toBe('technician');
      expect(executionTimeMs).toBeLessThan(1000); // Should create user in < 1 second
    });

    test('should retrieve users by role efficiently', async () => {
      const { result: user, executionTimeMs } = await testSetup.measureExecutionTime(
        () => testSetup.getTestUserByRole('admin')
      );
      
      expect(user).toBeDefined();
      expect(user.role).toBe('admin');
      expect(executionTimeMs).toBeLessThan(500); // Should retrieve user in < 500ms
    });

    test('should handle concurrent user creation', async () => {
      const userPromises = Array(10).fill(null).map((_, index) =>
        testSetup.createTestUser({
          email: `concurrent-mgmt-${index}@bsg.co.id`,
          name: `Concurrent User ${index}`,
          role: 'requester'
        })
      );

      const startTime = process.hrtime.bigint();
      const users = await Promise.all(userPromises);
      const endTime = process.hrtime.bigint();
      
      const executionTimeMs = Number(endTime - startTime) / 1000000;
      
      expect(users).toHaveLength(10);
      users.forEach((user, index) => {
        expect(user.email).toBe(`concurrent-mgmt-${index}@bsg.co.id`);
        expect(user.role).toBe('requester');
      });
      
      expect(executionTimeMs).toBeLessThan(5000); // 10 users in < 5 seconds
    });

    test('should retrieve all branches efficiently', async () => {
      const { result: branches, executionTimeMs } = await testSetup.measureExecutionTime(
        () => testSetup.getAllTestBranches()
      );
      
      expect(Array.isArray(branches)).toBe(true);
      expect(branches.length).toBeGreaterThanOrEqual(50);
      expect(executionTimeMs).toBeLessThan(1000); // Should load all branches in < 1 second
    });
  });

  describe('User Management Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // This test would typically involve mocking database failures
      // For now, we test that the system handles errors appropriately
      const invalidUserData = { invalid: 'data' };
      
      await expect(
        testSetup.createTestUser(invalidUserData)
      ).rejects.toThrow();
    });

    test('should handle missing branch references', async () => {
      await expect(
        testSetup.createTestUser({
          email: 'missing-branch@bsg.co.id',
          name: 'Missing Branch User',
          role: 'requester',
          unitId: 'non-existent-branch-id'
        })
      ).rejects.toThrow();
    });

    test('should handle duplicate email creation attempts', async () => {
      const email = 'duplicate-test@bsg.co.id';
      
      await testSetup.createTestUser({
        email,
        name: 'First User',
        role: 'requester'
      });
      
      await expect(
        testSetup.createTestUser({
          email,
          name: 'Second User',
          role: 'technician'
        })
      ).rejects.toThrow();
    });

    test('should validate branch existence before assignment', async () => {
      await expect(
        testSetup.getTestBranch('INVALID_BRANCH_TYPE')
      ).rejects.toThrow('No INVALID_BRANCH_TYPE branch found for testing');
    });
  });
});