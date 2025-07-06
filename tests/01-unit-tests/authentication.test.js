// Unit tests for Authentication System
const TestSetup = require('../shared/utilities/testSetup');
const { testCredentials, credentialHelpers } = require('../shared/fixtures/testCredentials');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

describe('Authentication System Unit Tests', () => {
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

  describe('JWT Token Management', () => {
    test('should create valid JWT token for user', () => {
      const userData = {
        id: 'test-123',
        email: 'test@bsg.co.id',
        role: 'technician',
        unitId: 'UTAMA'
      };

      const token = testSetup.createTestToken(userData);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should decode JWT token correctly', () => {
      const userData = {
        id: 'test-123',
        email: 'test@bsg.co.id',
        role: 'technician',
        unitId: 'UTAMA'
      };

      const token = testSetup.createTestToken(userData);
      const decoded = jwt.decode(token);
      
      expect(decoded.userId).toBe(userData.id);
      expect(decoded.email).toBe(userData.email);
      expect(decoded.role).toBe(userData.role);
      expect(decoded.unitId).toBe(userData.unitId);
      expect(decoded.exp).toBeDefined(); // Expiration should be set
    });

    test('should verify JWT token with correct secret', () => {
      const userData = {
        id: 'test-123',
        email: 'test@bsg.co.id',
        role: 'admin'
      };

      const token = testSetup.createTestToken(userData);
      const secret = process.env.JWT_SECRET || 'test_secret';
      
      expect(() => {
        jwt.verify(token, secret);
      }).not.toThrow();
    });

    test('should reject JWT token with incorrect secret', () => {
      const userData = {
        id: 'test-123',
        email: 'test@bsg.co.id',
        role: 'admin'
      };

      const token = testSetup.createTestToken(userData);
      
      expect(() => {
        jwt.verify(token, 'wrong_secret');
      }).toThrow();
    });

    test('should handle expired JWT tokens', () => {
      const userData = {
        id: 'test-123',
        email: 'test@bsg.co.id',
        role: 'admin'
      };

      const expiredToken = testSetup.createTestToken(userData, '-1h'); // Already expired
      const secret = process.env.JWT_SECRET || 'test_secret';
      
      expect(() => {
        jwt.verify(expiredToken, secret);
      }).toThrow('jwt expired');
    });
  });

  describe('User Authentication', () => {
    test('should create user with valid authentication data', async () => {
      const userData = {
        email: 'auth-test@bsg.co.id',
        password: 'securePassword123',
        name: 'Authentication Test User',
        role: 'requester'
      };

      const user = await testSetup.createTestUser(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe(userData.role);
      expect(user.isActive).toBe(true);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    test('should validate user authentication data', async () => {
      const user = await testSetup.createTestUser({
        email: 'validation-test@bsg.co.id',
        name: 'Validation Test User',
        role: 'technician'
      });

      const validation = testSetup.validateUserData(user);
      
      expect(validation.hasId).toBe(true);
      expect(validation.hasEmail).toBe(true);
      expect(validation.hasName).toBe(true);
      expect(validation.hasValidRole).toBe(true);
      expect(validation.isActive).toBe(true);
      expect(validation.hasCreatedAt).toBe(true);
      expect(validation.hasUpdatedAt).toBe(true);
    });

    test('should handle invalid email formats', async () => {
      const invalidEmails = [
        'invalid-email',
        'missing@domain',
        '@domain.com',
        'user@',
        ''
      ];

      for (const email of invalidEmails) {
        await expect(
          testSetup.createTestUser({ email, name: 'Test User', role: 'requester' })
        ).rejects.toThrow();
      }
    });

    test('should enforce unique email addresses', async () => {
      const email = 'unique-test@bsg.co.id';
      
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
  });

  describe('Role-Based Authentication', () => {
    test('should create admin user with correct permissions', async () => {
      const adminUser = await testSetup.getTestUserByRole('admin');
      
      expect(adminUser.role).toBe('admin');
      expect(adminUser.isActive).toBe(true);
      
      const token = testSetup.createTestToken(adminUser);
      const decoded = jwt.decode(token);
      expect(decoded.role).toBe('admin');
    });

    test('should create manager user with business reviewer flag', async () => {
      const managerUser = await testSetup.createTestUser({
        email: 'manager-test@bsg.co.id',
        name: 'Test Manager',
        role: 'manager',
        isBusinessReviewer: true
      });
      
      expect(managerUser.role).toBe('manager');
      expect(managerUser.isBusinessReviewer).toBe(true);
    });

    test('should create technician user with department assignment', async () => {
      const technicianUser = await testSetup.createTestUser({
        email: 'technician-test@bsg.co.id',
        name: 'Test Technician',
        role: 'technician',
        department: 'Information Technology'
      });
      
      expect(technicianUser.role).toBe('technician');
    });

    test('should create requester user with unit assignment', async () => {
      const branch = await testSetup.getTestBranch('CABANG');
      const requesterUser = await testSetup.createTestUser({
        email: 'requester-test@bsg.co.id',
        name: 'Test Requester',
        role: 'requester',
        unitId: branch.id
      });
      
      expect(requesterUser.role).toBe('requester');
      expect(requesterUser.unitId).toBe(branch.id);
    });

    test('should validate role hierarchy and permissions', () => {
      const roles = ['admin', 'manager', 'technician', 'requester'];
      
      roles.forEach(role => {
        const userData = testSetup.getDefaultUserDataByRole(role);
        expect(userData.role).toBe(role);
        expect(userData.email).toContain(`test-${role}`);
        expect(userData.name).toContain(`Test ${role.charAt(0).toUpperCase()}${role.slice(1)}`);
      });
    });
  });

  describe('Session Management', () => {
    test('should handle user session data correctly', async () => {
      const user = await testSetup.createTestUser({
        email: 'session-test@bsg.co.id',
        name: 'Session Test User',
        role: 'technician'
      });

      const token = testSetup.createTestToken(user, '2h');
      const decoded = jwt.decode(token);
      
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
      
      // Check token expiration (should be ~2 hours from now)
      const now = Math.floor(Date.now() / 1000);
      const expDiff = decoded.exp - now;
      expect(expDiff).toBeGreaterThan(7000); // More than ~2 hours (7200 seconds)
      expect(expDiff).toBeLessThan(7300); // Less than ~2 hours + 5 minutes
    });

    test('should support different token expiration times', () => {
      const user = { id: 'test-123', email: 'test@bsg.co.id', role: 'admin' };
      
      const shortToken = testSetup.createTestToken(user, '15m');
      const longToken = testSetup.createTestToken(user, '24h');
      
      const shortDecoded = jwt.decode(shortToken);
      const longDecoded = jwt.decode(longToken);
      
      expect(longDecoded.exp).toBeGreaterThan(shortDecoded.exp);
    });

    test('should handle concurrent authentication requests', async () => {
      const userPromises = Array(5).fill(null).map((_, index) =>
        testSetup.createTestUser({
          email: `concurrent-${index}@bsg.co.id`,
          name: `Concurrent User ${index}`,
          role: 'requester'
        })
      );

      const users = await Promise.all(userPromises);
      
      users.forEach((user, index) => {
        expect(user.email).toBe(`concurrent-${index}@bsg.co.id`);
        expect(user.role).toBe('requester');
        expect(user.isActive).toBe(true);
      });
    });
  });

  describe('Test Credentials System', () => {
    test('should provide valid credentials for all roles', () => {
      const roles = ['admin', 'manager', 'technician', 'requester'];
      
      roles.forEach(role => {
        const credentials = credentialHelpers.getByRole(role);
        expect(credentials).toBeDefined();
        expect(credentials.email).toContain('@bsg.co.id');
        expect(credentials.password).toBe('password123');
        expect(credentials.role).toBe(role);
        expect(credentialHelpers.validateCredentials(credentials)).toBe(true);
      });
    });

    test('should provide branch-specific credentials', () => {
      const branches = ['UTAMA', 'JAKARTA', 'GORONTALO'];
      
      branches.forEach(branchCode => {
        const managerCreds = credentialHelpers.getByBranch(branchCode, 'manager');
        const requesterCreds = credentialHelpers.getByBranch(branchCode, 'requester');
        
        expect(managerCreds).toBeDefined();
        expect(requesterCreds).toBeDefined();
        expect(managerCreds.role).toBe('manager');
        expect(requesterCreds.role).toBe('requester');
      });
    });

    test('should provide department-specific technician credentials', () => {
      const departments = [
        'Dukungan dan Layanan',
        'Information Technology',
        'Government Services'
      ];
      
      departments.forEach(department => {
        const techCreds = credentialHelpers.getByDepartment(department);
        expect(techCreds).toBeDefined();
        expect(techCreds.role).toBe('technician');
        expect(techCreds.department).toBeDefined();
      });
    });

    test('should generate authentication headers for API testing', () => {
      const credentials = credentialHelpers.getByRole('admin');
      const headers = credentialHelpers.getAuthHeaders(credentials);
      
      expect(headers).toHaveProperty('Authorization');
      expect(headers).toHaveProperty('Content-Type', 'application/json');
      expect(headers.Authorization).toMatch(/^Bearer /);
    });

    test('should provide test-specific accounts for isolation', () => {
      const testRoles = ['admin', 'manager', 'technician', 'requester'];
      
      testRoles.forEach(role => {
        const testAccount = credentialHelpers.getTestAccount(role);
        expect(testAccount).toBeDefined();
        expect(testAccount.email).toContain('test.');
        expect(testAccount.password).toBe('testpass123');
        expect(testAccount.role).toBe(role);
      });
    });

    test('should retrieve all credentials by role type', () => {
      const adminCreds = credentialHelpers.getAllByRoleType('admin');
      const managerCreds = credentialHelpers.getAllByRoleType('manager');
      const technicianCreds = credentialHelpers.getAllByRoleType('technician');
      const requesterCreds = credentialHelpers.getAllByRoleType('requester');
      
      expect(Array.isArray(adminCreds)).toBe(true);
      expect(Array.isArray(managerCreds)).toBe(true);
      expect(Array.isArray(technicianCreds)).toBe(true);
      expect(Array.isArray(requesterCreds)).toBe(true);
      
      expect(adminCreds.length).toBeGreaterThan(0);
      expect(managerCreds.length).toBeGreaterThan(4); // Multiple branch managers
      expect(technicianCreds.length).toBeGreaterThan(3); // Multiple department technicians
      expect(requesterCreds.length).toBeGreaterThan(5); // Multiple branch requesters
    });
  });

  describe('Authentication Error Handling', () => {
    test('should handle missing required fields', async () => {
      const invalidUserData = [
        { name: 'Test User', role: 'requester' }, // Missing email
        { email: 'test@bsg.co.id', role: 'requester' }, // Missing name
        { email: 'test@bsg.co.id', name: 'Test User' }, // Missing role
      ];

      for (const userData of invalidUserData) {
        await expect(
          testSetup.createTestUser(userData)
        ).rejects.toThrow();
      }
    });

    test('should handle invalid role values', async () => {
      const invalidRoles = ['superuser', 'customer', 'guest', '', null];
      
      for (const role of invalidRoles) {
        await expect(
          testSetup.createTestUser({
            email: 'invalid-role@bsg.co.id',
            name: 'Invalid Role User',
            role: role
          })
        ).rejects.toThrow();
      }
    });

    test('should handle malformed JWT tokens', () => {
      const malformedTokens = [
        'invalid.token',
        'not.a.jwt.token',
        '',
        null,
        undefined
      ];

      const secret = process.env.JWT_SECRET || 'test_secret';
      
      malformedTokens.forEach(token => {
        expect(() => {
          jwt.verify(token, secret);
        }).toThrow();
      });
    });

    test('should validate credentials before authentication', () => {
      const invalidCredentials = [
        { email: 'test@bsg.co.id', name: 'Test User' }, // Missing password and role
        { password: 'password123', role: 'admin' }, // Missing email and name
        { email: '', password: '', name: '', role: '' }, // Empty fields
        null,
        undefined
      ];

      invalidCredentials.forEach(creds => {
        expect(credentialHelpers.validateCredentials(creds)).toBe(false);
      });
    });
  });

  describe('Authentication Performance', () => {
    test('should create tokens quickly', async () => {
      const user = await testSetup.createTestUser({
        email: 'performance-test@bsg.co.id',
        name: 'Performance Test User',
        role: 'technician'
      });

      const startTime = process.hrtime.bigint();
      const token = testSetup.createTestToken(user);
      const endTime = process.hrtime.bigint();
      
      const executionTimeMs = Number(endTime - startTime) / 1000000;
      
      expect(token).toBeDefined();
      expect(executionTimeMs).toBeLessThan(50); // Should be very fast (< 50ms)
    });

    test('should handle bulk token creation efficiently', async () => {
      const user = await testSetup.createTestUser({
        email: 'bulk-token-test@bsg.co.id',
        name: 'Bulk Token Test User',
        role: 'technician'
      });

      const startTime = process.hrtime.bigint();
      
      const tokens = Array(100).fill(null).map(() => 
        testSetup.createTestToken(user)
      );
      
      const endTime = process.hrtime.bigint();
      const executionTimeMs = Number(endTime - startTime) / 1000000;
      
      expect(tokens).toHaveLength(100);
      expect(tokens.every(token => typeof token === 'string')).toBe(true);
      expect(executionTimeMs).toBeLessThan(1000); // Should handle 100 tokens in < 1 second
    });

    test('should verify tokens efficiently', async () => {
      const user = await testSetup.createTestUser({
        email: 'verify-test@bsg.co.id',
        name: 'Verify Test User',
        role: 'admin'
      });

      const token = testSetup.createTestToken(user);
      const secret = process.env.JWT_SECRET || 'test_secret';

      const startTime = process.hrtime.bigint();
      const decoded = jwt.verify(token, secret);
      const endTime = process.hrtime.bigint();
      
      const executionTimeMs = Number(endTime - startTime) / 1000000;
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(user.id);
      expect(executionTimeMs).toBeLessThan(10); // Token verification should be very fast
    });
  });
});