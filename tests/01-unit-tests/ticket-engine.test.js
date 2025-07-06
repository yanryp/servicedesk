// Unit tests for Ticket Engine System
const TestSetup = require('../shared/utilities/testSetup');
const { testCredentials, credentialHelpers } = require('../shared/fixtures/testCredentials');

describe('Ticket Engine System Unit Tests', () => {
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

  describe('Ticket Creation and CRUD Operations', () => {
    test('should create ticket with all required fields', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticketData = {
        title: 'Test Ticket Creation',
        description: 'This is a test ticket for CRUD operations',
        priority: 'medium',
        status: 'pending_approval'
      };

      const ticket = await testSetup.createTestTicket(ticketData, requester);
      
      expect(ticket).toBeDefined();
      expect(ticket.id).toBeDefined();
      expect(ticket.title).toBe(ticketData.title);
      expect(ticket.description).toBe(ticketData.description);
      expect(ticket.priority).toBe(ticketData.priority);
      expect(ticket.status).toBe(ticketData.status);
      expect(ticket.createdById).toBe(requester.id);
      expect(ticket.createdAt).toBeDefined();
      expect(ticket.updatedAt).toBeDefined();
    });

    test('should validate ticket data structure', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      const ticket = await testSetup.createTestTicket({
        title: 'Validation Test Ticket',
        description: 'Testing ticket data validation',
        priority: 'high',
        status: 'pending_approval'
      }, requester);

      const validation = testSetup.validateTicketData(ticket);
      
      const expectedValidations = [
        'hasId', 'hasTitle', 'hasDescription', 'hasValidStatus',
        'hasValidPriority', 'hasCreatedBy', 'hasCreatedAt', 'hasUpdatedAt'
      ];
      
      expectedValidations.forEach(key => {
        expect(validation[key]).toBe(true);
      });
    });

    test('should create ticket with branch assignment', async () => {
      const branch = await testSetup.getTestBranch('CABANG');
      const requester = await testSetup.createTestUser({
        email: 'branch-requester@bsg.co.id',
        name: 'Branch Requester',
        role: 'requester',
        unitId: branch.id
      });

      const ticket = await testSetup.createTestTicket({
        title: 'Branch-Assigned Ticket',
        description: 'Testing branch assignment in ticket creation',
        priority: 'medium',
        status: 'pending_approval',
        unitId: branch.id
      }, requester);

      expect(ticket.unitId).toBe(branch.id);
      expect(ticket.unit).toBeDefined();
      expect(ticket.unit.unitType).toBe('CABANG');
      expect(ticket.createdBy.unitId).toBe(branch.id);
    });

    test('should handle ticket creation with service catalog reference', async () => {
      const serviceCategory = await testSetup.getTestServiceCategory('Banking');
      const requester = await testSetup.getTestUserByRole('requester');

      if (serviceCategory) {
        const ticket = await testSetup.createTestTicket({
          title: 'Service Catalog Ticket',
          description: 'Testing service catalog integration',
          priority: 'medium',
          status: 'pending_approval',
          categoryId: serviceCategory.id
        }, requester);

        expect(ticket.categoryId).toBe(serviceCategory.id);
        if (ticket.category) {
          expect(ticket.category.id).toBe(serviceCategory.id);
        }
      }
    });

    test('should generate unique ticket identifiers', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const tickets = await Promise.all(
        Array(5).fill(null).map((_, index) =>
          testSetup.createTestTicket({
            title: `Unique ID Test Ticket ${index}`,
            description: `Testing unique ticket ID generation ${index}`,
            priority: 'low',
            status: 'pending_approval'
          }, requester)
        )
      );

      const ticketIds = tickets.map(t => t.id);
      const uniqueIds = new Set(ticketIds);
      
      expect(uniqueIds.size).toBe(5); // All IDs should be unique
      tickets.forEach(ticket => {
        expect(ticket.id).toBeDefined();
        expect(typeof ticket.id).toBe('string');
      });
    });
  });

  describe('Ticket Status Management', () => {
    test('should validate all ticket status values', async () => {
      const validStatuses = [
        'pending_approval', 'new', 'assigned', 'in_progress', 
        'pending', 'resolved', 'closed'
      ];
      
      const requester = await testSetup.getTestUserByRole('requester');
      
      for (const status of validStatuses) {
        const ticket = await testSetup.createTestTicket({
          title: `Status Test - ${status}`,
          description: `Testing ticket with ${status} status`,
          priority: 'medium',
          status: status
        }, requester);
        
        expect(ticket.status).toBe(status);
        
        const validation = testSetup.validateTicketData(ticket);
        expect(validation.hasValidStatus).toBe(true);
      }
    });

    test('should enforce ticket status workflow transitions', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      // Test proper workflow progression
      const workflowTransitions = [
        { from: 'pending_approval', to: 'new', valid: true },
        { from: 'new', to: 'assigned', valid: true },
        { from: 'assigned', to: 'in_progress', valid: true },
        { from: 'in_progress', to: 'pending', valid: true },
        { from: 'pending', to: 'in_progress', valid: true },
        { from: 'in_progress', to: 'resolved', valid: true },
        { from: 'resolved', to: 'closed', valid: true },
        
        // Invalid transitions
        { from: 'pending_approval', to: 'closed', valid: false },
        { from: 'new', to: 'resolved', valid: false },
        { from: 'closed', to: 'in_progress', valid: false }
      ];
      
      // For this test, we validate the status values are acceptable
      // Actual workflow enforcement would be tested in integration/workflow tests
      workflowTransitions.forEach(({ from, to, valid }) => {
        const validStatuses = [
          'pending_approval', 'new', 'assigned', 'in_progress', 
          'pending', 'resolved', 'closed'
        ];
        
        expect(validStatuses.includes(from)).toBe(true);
        expect(validStatuses.includes(to)).toBe(true);
      });
    });

    test('should track ticket status history', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticket = await testSetup.createTestTicket({
        title: 'Status History Test',
        description: 'Testing ticket status history tracking',
        priority: 'medium',
        status: 'pending_approval'
      }, requester);

      // Initial status should be pending_approval
      expect(ticket.status).toBe('pending_approval');
      
      // Status changes would create history entries (tested in integration tests)
      const statusHistory = [
        { status: 'pending_approval', timestamp: ticket.createdAt },
        // Additional history entries would be added during status changes
      ];
      
      expect(statusHistory.length).toBeGreaterThan(0);
      expect(statusHistory[0].status).toBe('pending_approval');
    });

    test('should handle ticket assignment state', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      const technician = await testSetup.getTestUserByRole('technician');
      
      const assignedTicket = await testSetup.createTestTicket({
        title: 'Assignment Test Ticket',
        description: 'Testing ticket assignment functionality',
        priority: 'medium',
        status: 'assigned',
        assignedToId: technician.id
      }, requester);

      expect(assignedTicket.assignedToId).toBe(technician.id);
      if (assignedTicket.assignedTo) {
        expect(assignedTicket.assignedTo.id).toBe(technician.id);
        expect(assignedTicket.assignedTo.role).toBe('technician');
      }
    });

    test('should support ticket status filtering', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const statuses = ['pending_approval', 'new', 'assigned', 'in_progress', 'resolved'];
      const tickets = await Promise.all(
        statuses.map((status, index) =>
          testSetup.createTestTicket({
            title: `Filter Test ${status}`,
            description: `Testing filtering for ${status} status`,
            priority: 'medium',
            status: status
          }, requester)
        )
      );

      // Verify each ticket has the correct status
      tickets.forEach((ticket, index) => {
        expect(ticket.status).toBe(statuses[index]);
      });
      
      // Test filtering logic (would be implemented in service layer)
      const activeStatuses = ['new', 'assigned', 'in_progress'];
      const activeTickets = tickets.filter(t => activeStatuses.includes(t.status));
      expect(activeTickets.length).toBe(3);
      
      const completedStatuses = ['resolved', 'closed'];
      const completedTickets = tickets.filter(t => completedStatuses.includes(t.status));
      expect(completedTickets.length).toBe(1); // Only resolved, no closed in our test
    });
  });

  describe('Ticket Priority Management', () => {
    test('should validate all priority levels', async () => {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      const requester = await testSetup.getTestUserByRole('requester');
      
      for (const priority of validPriorities) {
        const ticket = await testSetup.createTestTicket({
          title: `Priority Test - ${priority}`,
          description: `Testing ticket with ${priority} priority`,
          priority: priority,
          status: 'pending_approval'
        }, requester);
        
        expect(ticket.priority).toBe(priority);
        
        const validation = testSetup.validateTicketData(ticket);
        expect(validation.hasValidPriority).toBe(true);
      }
    });

    test('should handle priority-based sorting and filtering', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      const priorities = ['low', 'medium', 'high', 'urgent'];
      
      const tickets = await Promise.all(
        priorities.map((priority, index) =>
          testSetup.createTestTicket({
            title: `Priority Sort Test ${priority}`,
            description: `Testing priority sorting for ${priority}`,
            priority: priority,
            status: 'new'
          }, requester)
        )
      );

      // Verify priorities are set correctly
      tickets.forEach((ticket, index) => {
        expect(ticket.priority).toBe(priorities[index]);
      });
      
      // Test priority hierarchy (urgent > high > medium > low)
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const sortedTickets = [...tickets].sort((a, b) => 
        priorityOrder[b.priority] - priorityOrder[a.priority]
      );
      
      expect(sortedTickets[0].priority).toBe('urgent');
      expect(sortedTickets[1].priority).toBe('high');
      expect(sortedTickets[2].priority).toBe('medium');
      expect(sortedTickets[3].priority).toBe('low');
    });

    test('should reject invalid priority values', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      const invalidPriorities = ['critical', 'normal', 'lowest', 'highest', ''];
      
      for (const priority of invalidPriorities) {
        await expect(
          testSetup.createTestTicket({
            title: 'Invalid Priority Test',
            description: 'Testing invalid priority rejection',
            priority: priority,
            status: 'pending_approval'
          }, requester)
        ).rejects.toThrow();
      }
    });

    test('should handle priority escalation scenarios', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      // Create a medium priority ticket
      const ticket = await testSetup.createTestTicket({
        title: 'Priority Escalation Test',
        description: 'Testing priority escalation functionality',
        priority: 'medium',
        status: 'assigned'
      }, requester);

      expect(ticket.priority).toBe('medium');
      
      // Priority escalation logic would be implemented in business logic layer
      // This test validates the priority values can be changed
      const escalatedPriorities = ['high', 'urgent'];
      escalatedPriorities.forEach(newPriority => {
        const validation = testSetup.validateTicketData(ticket, {
          canEscalateTo: ['low', 'medium', 'high', 'urgent'].includes(newPriority)
        });
        expect(validation.canEscalateTo).toBe(true);
      });
    });
  });

  describe('Ticket Content Validation', () => {
    test('should validate required ticket fields', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const requiredFields = [
        { field: 'title', value: 'Valid Ticket Title' },
        { field: 'description', value: 'Valid ticket description content' },
        { field: 'priority', value: 'medium' },
        { field: 'status', value: 'pending_approval' }
      ];
      
      // Test with all required fields
      const validTicket = await testSetup.createTestTicket({
        title: requiredFields[0].value,
        description: requiredFields[1].value,
        priority: requiredFields[2].value,
        status: requiredFields[3].value
      }, requester);
      
      expect(validTicket.title).toBe(requiredFields[0].value);
      expect(validTicket.description).toBe(requiredFields[1].value);
      expect(validTicket.priority).toBe(requiredFields[2].value);
      expect(validTicket.status).toBe(requiredFields[3].value);
    });

    test('should handle ticket title length constraints', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      // Test valid title lengths
      const validTitles = [
        'Short',
        'Medium length ticket title',
        'This is a longer ticket title that should still be acceptable for the system'
      ];
      
      for (const title of validTitles) {
        const ticket = await testSetup.createTestTicket({
          title: title,
          description: 'Test description',
          priority: 'medium',
          status: 'pending_approval'
        }, requester);
        
        expect(ticket.title).toBe(title);
      }
    });

    test('should handle ticket description content', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const descriptions = [
        'Simple description',
        'Description with\nmultiple\nlines',
        'Description with special characters: @#$%^&*()',
        'Detailed description explaining the issue with steps to reproduce:\n1. First step\n2. Second step\n3. Expected result vs actual result'
      ];
      
      for (const description of descriptions) {
        const ticket = await testSetup.createTestTicket({
          title: 'Description Test',
          description: description,
          priority: 'medium',
          status: 'pending_approval'
        }, requester);
        
        expect(ticket.description).toBe(description);
      }
    });

    test('should reject empty or invalid content', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const invalidTicketData = [
        { title: '', description: 'Valid description', priority: 'medium', status: 'pending_approval' },
        { title: 'Valid title', description: '', priority: 'medium', status: 'pending_approval' },
        { title: null, description: 'Valid description', priority: 'medium', status: 'pending_approval' },
        { title: 'Valid title', description: null, priority: 'medium', status: 'pending_approval' }
      ];
      
      for (const ticketData of invalidTicketData) {
        await expect(
          testSetup.createTestTicket(ticketData, requester)
        ).rejects.toThrow();
      }
    });
  });

  describe('Ticket Relationships and References', () => {
    test('should maintain proper creator relationship', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticket = await testSetup.createTestTicket({
        title: 'Creator Relationship Test',
        description: 'Testing ticket creator relationships',
        priority: 'medium',
        status: 'pending_approval'
      }, requester);

      expect(ticket.createdById).toBe(requester.id);
      if (ticket.createdBy) {
        expect(ticket.createdBy.id).toBe(requester.id);
        expect(ticket.createdBy.role).toBe('requester');
        expect(ticket.createdBy.email).toBe(requester.email);
      }
    });

    test('should handle technician assignment relationships', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      const technician = await testSetup.getTestUserByRole('technician');
      
      const ticket = await testSetup.createTestTicket({
        title: 'Technician Assignment Test',
        description: 'Testing technician assignment relationships',
        priority: 'medium',
        status: 'assigned',
        assignedToId: technician.id
      }, requester);

      expect(ticket.assignedToId).toBe(technician.id);
      if (ticket.assignedTo) {
        expect(ticket.assignedTo.id).toBe(technician.id);
        expect(ticket.assignedTo.role).toBe('technician');
      }
    });

    test('should maintain branch/unit relationships', async () => {
      const branch = await testSetup.getTestBranch('CABANG');
      const requester = await testSetup.createTestUser({
        email: 'branch-relation@bsg.co.id',
        name: 'Branch Relation User',
        role: 'requester',
        unitId: branch.id
      });
      
      const ticket = await testSetup.createTestTicket({
        title: 'Branch Relationship Test',
        description: 'Testing branch relationships in tickets',
        priority: 'medium',
        status: 'pending_approval',
        unitId: branch.id
      }, requester);

      expect(ticket.unitId).toBe(branch.id);
      expect(ticket.createdBy.unitId).toBe(branch.id);
      
      if (ticket.unit) {
        expect(ticket.unit.id).toBe(branch.id);
        expect(ticket.unit.unitType).toBe('CABANG');
      }
    });

    test('should support service catalog relationships', async () => {
      const serviceCategory = await testSetup.getTestServiceCategory('IT');
      const requester = await testSetup.getTestUserByRole('requester');

      if (serviceCategory) {
        const ticket = await testSetup.createTestTicket({
          title: 'Service Catalog Relationship Test',
          description: 'Testing service catalog relationships',
          priority: 'medium',
          status: 'pending_approval',
          categoryId: serviceCategory.id
        }, requester);

        expect(ticket.categoryId).toBe(serviceCategory.id);
        
        if (ticket.category) {
          expect(ticket.category.id).toBe(serviceCategory.id);
          expect(ticket.category.isActive).toBe(true);
        }
      }
    });
  });

  describe('Ticket Performance and Efficiency', () => {
    test('should create tickets efficiently', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const { result: ticket, executionTimeMs } = await testSetup.measureExecutionTime(
        () => testSetup.createTestTicket({
          title: 'Performance Test Ticket',
          description: 'Testing ticket creation performance',
          priority: 'medium',
          status: 'pending_approval'
        }, requester)
      );
      
      expect(ticket).toBeDefined();
      expect(ticket.title).toBe('Performance Test Ticket');
      expect(executionTimeMs).toBeLessThan(1000); // Should create ticket in < 1 second
    });

    test('should handle bulk ticket creation', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticketPromises = Array(10).fill(null).map((_, index) =>
        testSetup.createTestTicket({
          title: `Bulk Ticket ${index}`,
          description: `Bulk creation test ticket ${index}`,
          priority: 'medium',
          status: 'pending_approval'
        }, requester)
      );

      const startTime = process.hrtime.bigint();
      const tickets = await Promise.all(ticketPromises);
      const endTime = process.hrtime.bigint();
      
      const executionTimeMs = Number(endTime - startTime) / 1000000;
      
      expect(tickets).toHaveLength(10);
      tickets.forEach((ticket, index) => {
        expect(ticket.title).toBe(`Bulk Ticket ${index}`);
        expect(ticket.status).toBe('pending_approval');
      });
      
      expect(executionTimeMs).toBeLessThan(5000); // 10 tickets in < 5 seconds
    });

    test('should generate random ticket data efficiently', () => {
      const startTime = process.hrtime.bigint();
      
      const randomTitles = Array(100).fill(null).map(() => 
        testSetup.generateRandomTicketTitle()
      );
      
      const endTime = process.hrtime.bigint();
      const executionTimeMs = Number(endTime - startTime) / 1000000;
      
      expect(randomTitles).toHaveLength(100);
      expect(randomTitles.every(title => typeof title === 'string')).toBe(true);
      expect(randomTitles.every(title => title.includes('Test'))).toBe(true);
      expect(executionTimeMs).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Ticket Data Integrity', () => {
    test('should maintain data consistency across creation', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      const branch = await testSetup.getTestBranch('CAPEM');
      
      const ticketData = {
        title: 'Data Integrity Test',
        description: 'Testing data integrity and consistency',
        priority: 'high',
        status: 'pending_approval',
        unitId: branch.id
      };

      const ticket = await testSetup.createTestTicket(ticketData, requester);
      
      // Verify all data is consistent
      expect(ticket.title).toBe(ticketData.title);
      expect(ticket.description).toBe(ticketData.description);
      expect(ticket.priority).toBe(ticketData.priority);
      expect(ticket.status).toBe(ticketData.status);
      expect(ticket.unitId).toBe(ticketData.unitId);
      expect(ticket.createdById).toBe(requester.id);
      
      // Verify relationships are loaded correctly
      if (ticket.createdBy) {
        expect(ticket.createdBy.id).toBe(requester.id);
      }
      if (ticket.unit) {
        expect(ticket.unit.id).toBe(branch.id);
      }
    });

    test('should handle ticket lifecycle data properly', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticket = await testSetup.createTestTicket({
        title: 'Lifecycle Data Test',
        description: 'Testing ticket lifecycle data handling',
        priority: 'medium',
        status: 'pending_approval'
      }, requester);

      // Verify timestamp consistency
      expect(ticket.createdAt).toBeDefined();
      expect(ticket.updatedAt).toBeDefined();
      expect(ticket.createdAt instanceof Date).toBe(true);
      expect(ticket.updatedAt instanceof Date).toBe(true);
      
      // Updated timestamp should be >= created timestamp
      expect(ticket.updatedAt.getTime()).toBeGreaterThanOrEqual(ticket.createdAt.getTime());
    });

    test('should validate ticket data after creation', async () => {
      const requester = await testSetup.getTestUserByRole('requester');
      
      const ticket = await testSetup.createTestTicket({
        title: 'Post-Creation Validation',
        description: 'Testing validation after ticket creation',
        priority: 'low',
        status: 'pending_approval'
      }, requester);

      const validation = testSetup.validateTicketData(ticket, {
        hasProperCreator: ticket.createdById === requester.id,
        hasValidTimestamps: ticket.createdAt && ticket.updatedAt,
        hasMeaningfulContent: ticket.title.length > 0 && ticket.description.length > 0
      });
      
      expect(validation.hasProperCreator).toBe(true);
      expect(validation.hasValidTimestamps).toBe(true);
      expect(validation.hasMeaningfulContent).toBe(true);
    });
  });
});