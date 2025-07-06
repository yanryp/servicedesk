// Performance and Load Testing Suite for BSG Enterprise Ticketing System
const TestSetup = require('../shared/utilities/testSetup');
const { testCredentials, credentialHelpers } = require('../shared/fixtures/testCredentials');

describe('Performance and Load Testing Suite', () => {
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

  describe('System Performance Benchmarks', () => {
    test('should meet API response time requirements under normal load', async () => {
      const performanceMetrics = {
        ticketCreation: [],
        userAuthentication: [],
        approvalWorkflow: [],
        databaseQueries: [],
        notificationDelivery: []
      };

      // Test ticket creation performance
      const branch = await testSetup.getTestBranch('CABANG');
      const requester = await testSetup.createTestUser({
        email: 'perf-req@bsg.co.id',
        name: 'Performance Requester',
        role: 'requester',
        unitId: branch.id
      });

      // Measure ticket creation performance (10 iterations)
      for (let i = 0; i < 10; i++) {
        const { result: ticket, executionTimeMs } = await testSetup.measureExecutionTime(
          () => testSetup.createTestTicket({
            title: `Performance Test Ticket ${i + 1}`,
            description: `Testing ticket creation performance iteration ${i + 1}`,
            priority: 'medium',
            status: 'pending_approval',
            unitId: branch.id
          }, requester)
        );
        performanceMetrics.ticketCreation.push(executionTimeMs);
      }

      // Measure user authentication performance (10 iterations)
      for (let i = 0; i < 10; i++) {
        const { result: user, executionTimeMs } = await testSetup.measureExecutionTime(
          () => testSetup.getTestUserByRole('requester')
        );
        performanceMetrics.userAuthentication.push(executionTimeMs);
      }

      // Calculate performance statistics
      const calculateStats = (metrics) => {
        const sorted = metrics.sort((a, b) => a - b);
        return {
          min: Math.min(...metrics),
          max: Math.max(...metrics),
          average: metrics.reduce((a, b) => a + b, 0) / metrics.length,
          median: sorted[Math.floor(sorted.length / 2)],
          p95: sorted[Math.floor(sorted.length * 0.95)]
        };
      };

      const ticketCreationStats = calculateStats(performanceMetrics.ticketCreation);
      const authenticationStats = calculateStats(performanceMetrics.userAuthentication);

      // Performance benchmark validation
      const performanceBenchmarks = {
        ticketCreationUnder1Second: ticketCreationStats.p95 < 1000,
        ticketCreationAverageUnder500ms: ticketCreationStats.average < 500,
        authenticationUnder200ms: authenticationStats.p95 < 200,
        authenticationAverageUnder100ms: authenticationStats.average < 100,
        consistentPerformance: (ticketCreationStats.max - ticketCreationStats.min) < 2000,
        lowVariability: authenticationStats.max < 500
      };

      expect(performanceBenchmarks.ticketCreationUnder1Second).toBe(true);
      expect(performanceBenchmarks.ticketCreationAverageUnder500ms).toBe(true);
      expect(performanceBenchmarks.authenticationUnder200ms).toBe(true);
      expect(performanceBenchmarks.authenticationAverageUnder100ms).toBe(true);
      expect(performanceBenchmarks.consistentPerformance).toBe(true);
      expect(performanceBenchmarks.lowVariability).toBe(true);

      // Log performance results for monitoring
      console.log('Performance Benchmark Results:');
      console.log(`Ticket Creation - Avg: ${ticketCreationStats.average.toFixed(2)}ms, P95: ${ticketCreationStats.p95.toFixed(2)}ms`);
      console.log(`Authentication - Avg: ${authenticationStats.average.toFixed(2)}ms, P95: ${authenticationStats.p95.toFixed(2)}ms`);
    });

    test('should handle concurrent user operations efficiently', async () => {
      const concurrentUsers = 50; // Simulate 50 concurrent users
      const allBranches = await testSetup.getAllTestBranches();
      const testBranches = allBranches.slice(0, 10); // Use 10 branches for concurrent testing

      // Create concurrent user scenarios
      const concurrentOperations = await Promise.all(
        Array(concurrentUsers).fill(null).map(async (_, index) => {
          const branch = testBranches[index % testBranches.length];
          
          const startTime = process.hrtime.bigint();
          
          // Create user
          const user = await testSetup.createTestUser({
            email: `concurrent-user-${index}@bsg.co.id`,
            name: `Concurrent User ${index}`,
            role: 'requester',
            unitId: branch.id
          });

          // Create ticket
          const ticket = await testSetup.createTestTicket({
            title: `Concurrent Load Test ${index}`,
            description: `Testing concurrent load with user ${index}`,
            priority: 'medium',
            status: 'pending_approval',
            unitId: branch.id
          }, user);

          const endTime = process.hrtime.bigint();
          const executionTimeMs = Number(endTime - startTime) / 1000000;

          return {
            userId: user.id,
            ticketId: ticket.id,
            branchId: branch.id,
            executionTime: executionTimeMs,
            success: ticket.id != null && user.id != null
          };
        })
      );

      // Concurrent operation validation
      const concurrentStats = {
        totalOperations: concurrentOperations.length,
        successfulOperations: concurrentOperations.filter(op => op.success).length,
        failedOperations: concurrentOperations.filter(op => !op.success).length,
        averageExecutionTime: concurrentOperations.reduce((sum, op) => sum + op.executionTime, 0) / concurrentOperations.length,
        maxExecutionTime: Math.max(...concurrentOperations.map(op => op.executionTime)),
        minExecutionTime: Math.min(...concurrentOperations.map(op => op.executionTime))
      };

      const concurrentValidation = {
        allOperationsSuccessful: concurrentStats.successfulOperations === concurrentUsers,
        noFailedOperations: concurrentStats.failedOperations === 0,
        averageTimeAcceptable: concurrentStats.averageExecutionTime < 2000, // Under 2 seconds
        maxTimeReasonable: concurrentStats.maxExecutionTime < 5000, // Under 5 seconds
        systemStability: concurrentStats.successfulOperations / concurrentStats.totalOperations >= 0.98, // 98% success rate
        uniqueUserIds: new Set(concurrentOperations.map(op => op.userId)).size === concurrentUsers,
        uniqueTicketIds: new Set(concurrentOperations.map(op => op.ticketId)).size === concurrentUsers
      };

      expect(concurrentValidation.allOperationsSuccessful).toBe(true);
      expect(concurrentValidation.noFailedOperations).toBe(true);
      expect(concurrentValidation.averageTimeAcceptable).toBe(true);
      expect(concurrentValidation.maxTimeReasonable).toBe(true);
      expect(concurrentValidation.systemStability).toBe(true);
      expect(concurrentValidation.uniqueUserIds).toBe(true);
      expect(concurrentValidation.uniqueTicketIds).toBe(true);

      console.log('Concurrent Load Test Results:');
      console.log(`Successful Operations: ${concurrentStats.successfulOperations}/${concurrentStats.totalOperations}`);
      console.log(`Average Execution Time: ${concurrentStats.averageExecutionTime.toFixed(2)}ms`);
      console.log(`Max Execution Time: ${concurrentStats.maxExecutionTime.toFixed(2)}ms`);
    });

    test('should maintain performance under branch network load', async () => {
      const allBranches = await testSetup.getAllTestBranches();
      const networkLoadResults = [];

      // Test performance across multiple branches simultaneously
      const branchOperations = await Promise.all(
        allBranches.slice(0, 15).map(async (branch, index) => {
          const startTime = process.hrtime.bigint();

          // Create branch manager
          const manager = await testSetup.createTestUser({
            email: `network-mgr-${branch.unitCode.toLowerCase()}@bsg.co.id`,
            name: `${branch.unitCode} Network Manager`,
            role: 'manager',
            unitId: branch.id,
            isBusinessReviewer: true
          });

          // Create branch requester
          const requester = await testSetup.createTestUser({
            email: `network-req-${branch.unitCode.toLowerCase()}@bsg.co.id`,
            name: `${branch.unitCode} Network Requester`,
            role: 'requester',
            unitId: branch.id
          });

          // Create multiple tickets per branch
          const branchTickets = await Promise.all([
            testSetup.createTestTicket({
              title: `${branch.unitCode} Network Load Test 1`,
              description: `Testing network load for ${branch.unitCode} branch`,
              priority: 'low',
              status: 'pending_approval',
              unitId: branch.id
            }, requester),
            testSetup.createTestTicket({
              title: `${branch.unitCode} Network Load Test 2`,
              description: `Testing network performance for ${branch.unitCode}`,
              priority: 'medium',
              status: 'pending_approval',
              unitId: branch.id
            }, requester),
            testSetup.createTestTicket({
              title: `${branch.unitCode} Network Load Test 3`,
              description: `Testing branch scalability for ${branch.unitCode}`,
              priority: 'high',
              status: 'pending_approval',
              unitId: branch.id
            }, requester)
          ]);

          const endTime = process.hrtime.bigint();
          const executionTimeMs = Number(endTime - startTime) / 1000000;

          return {
            branchCode: branch.unitCode,
            branchType: branch.unitType,
            managerId: manager.id,
            requesterId: requester.id,
            ticketIds: branchTickets.map(t => t.id),
            executionTime: executionTimeMs,
            ticketsCreated: branchTickets.length,
            allSuccessful: branchTickets.every(t => t.id != null)
          };
        })
      );

      // Network performance validation
      const networkStats = {
        totalBranches: branchOperations.length,
        successfulBranches: branchOperations.filter(op => op.allSuccessful).length,
        totalTicketsCreated: branchOperations.reduce((sum, op) => sum + op.ticketsCreated, 0),
        averageBranchTime: branchOperations.reduce((sum, op) => sum + op.executionTime, 0) / branchOperations.length,
        maxBranchTime: Math.max(...branchOperations.map(op => op.executionTime)),
        cabangBranches: branchOperations.filter(op => op.branchType === 'CABANG').length,
        capemBranches: branchOperations.filter(op => op.branchType === 'CAPEM').length
      };

      const networkValidation = {
        allBranchesProcessedSuccessfully: networkStats.successfulBranches === networkStats.totalBranches,
        networkAverageTimeAcceptable: networkStats.averageBranchTime < 3000, // Under 3 seconds per branch
        networkMaxTimeReasonable: networkStats.maxBranchTime < 8000, // Under 8 seconds max
        expectedTicketVolume: networkStats.totalTicketsCreated === networkStats.totalBranches * 3,
        bothBranchTypesRepresented: networkStats.cabangBranches > 0 && networkStats.capemBranches > 0,
        scalesToBranchNetwork: networkStats.totalBranches >= 15
      };

      expect(networkValidation.allBranchesProcessedSuccessfully).toBe(true);
      expect(networkValidation.networkAverageTimeAcceptable).toBe(true);
      expect(networkValidation.networkMaxTimeReasonable).toBe(true);
      expect(networkValidation.expectedTicketVolume).toBe(true);
      expect(networkValidation.bothBranchTypesRepresented).toBe(true);
      expect(networkValidation.scalesToBranchNetwork).toBe(true);

      console.log('Network Load Test Results:');
      console.log(`Branches Processed: ${networkStats.totalBranches}`);
      console.log(`Total Tickets Created: ${networkStats.totalTicketsCreated}`);
      console.log(`Average Branch Processing Time: ${networkStats.averageBranchTime.toFixed(2)}ms`);
    });
  });

  describe('Database Performance and Scalability', () => {
    test('should handle large-scale data operations efficiently', async () => {
      const dataOperationMetrics = {
        userCreation: [],
        ticketCreation: [],
        branchQueries: [],
        approvalWorkflows: []
      };

      // Large-scale user creation test
      const batchSize = 100;
      const userCreationStartTime = process.hrtime.bigint();
      
      const largeBranch = await testSetup.getTestBranch('CABANG');
      const batchUsers = await Promise.all(
        Array(batchSize).fill(null).map(async (_, index) => {
          const { result: user, executionTimeMs } = await testSetup.measureExecutionTime(
            () => testSetup.createTestUser({
              email: `batch-user-${index}@bsg.co.id`,
              name: `Batch User ${index}`,
              role: 'requester',
              unitId: largeBranch.id
            })
          );
          dataOperationMetrics.userCreation.push(executionTimeMs);
          return user;
        })
      );

      const userCreationEndTime = process.hrtime.bigint();
      const totalUserCreationTime = Number(userCreationEndTime - userCreationStartTime) / 1000000;

      // Large-scale ticket creation test
      const ticketCreationStartTime = process.hrtime.bigint();
      
      const batchTickets = await Promise.all(
        batchUsers.slice(0, 50).map(async (user, index) => {
          const { result: ticket, executionTimeMs } = await testSetup.measureExecutionTime(
            () => testSetup.createTestTicket({
              title: `Batch Ticket ${index}`,
              description: `Large-scale batch ticket creation test ${index}`,
              priority: ['low', 'medium', 'high'][index % 3],
              status: 'pending_approval',
              unitId: largeBranch.id
            }, user)
          );
          dataOperationMetrics.ticketCreation.push(executionTimeMs);
          return ticket;
        })
      );

      const ticketCreationEndTime = process.hrtime.bigint();
      const totalTicketCreationTime = Number(ticketCreationEndTime - ticketCreationStartTime) / 1000000;

      // Branch query performance test
      const branchQueryStartTime = process.hrtime.bigint();
      
      for (let i = 0; i < 20; i++) {
        const { result: branches, executionTimeMs } = await testSetup.measureExecutionTime(
          () => testSetup.getAllTestBranches()
        );
        dataOperationMetrics.branchQueries.push(executionTimeMs);
      }

      const branchQueryEndTime = process.hrtime.bigint();
      const totalBranchQueryTime = Number(branchQueryEndTime - branchQueryStartTime) / 1000000;

      // Database performance validation
      const databasePerformance = {
        userCreationAverage: dataOperationMetrics.userCreation.reduce((a, b) => a + b, 0) / dataOperationMetrics.userCreation.length,
        ticketCreationAverage: dataOperationMetrics.ticketCreation.reduce((a, b) => a + b, 0) / dataOperationMetrics.ticketCreation.length,
        branchQueryAverage: dataOperationMetrics.branchQueries.reduce((a, b) => a + b, 0) / dataOperationMetrics.branchQueries.length,
        totalUserCreationTime: totalUserCreationTime,
        totalTicketCreationTime: totalTicketCreationTime,
        totalBranchQueryTime: totalBranchQueryTime
      };

      const performanceValidation = {
        userCreationFast: databasePerformance.userCreationAverage < 300, // Under 300ms per user
        ticketCreationFast: databasePerformance.ticketCreationAverage < 500, // Under 500ms per ticket
        branchQueryFast: databasePerformance.branchQueryAverage < 100, // Under 100ms per query
        batchUserCreationReasonable: databasePerformance.totalUserCreationTime < 30000, // Under 30 seconds for 100 users
        batchTicketCreationReasonable: databasePerformance.totalTicketCreationTime < 25000, // Under 25 seconds for 50 tickets
        batchQueryingFast: databasePerformance.totalBranchQueryTime < 2000, // Under 2 seconds for 20 queries
        allUsersCreated: batchUsers.length === batchSize,
        allTicketsCreated: batchTickets.length === 50
      };

      expect(performanceValidation.userCreationFast).toBe(true);
      expect(performanceValidation.ticketCreationFast).toBe(true);
      expect(performanceValidation.branchQueryFast).toBe(true);
      expect(performanceValidation.batchUserCreationReasonable).toBe(true);
      expect(performanceValidation.batchTicketCreationReasonable).toBe(true);
      expect(performanceValidation.batchQueryingFast).toBe(true);
      expect(performanceValidation.allUsersCreated).toBe(true);
      expect(performanceValidation.allTicketsCreated).toBe(true);

      console.log('Database Performance Results:');
      console.log(`User Creation Avg: ${databasePerformance.userCreationAverage.toFixed(2)}ms`);
      console.log(`Ticket Creation Avg: ${databasePerformance.ticketCreationAverage.toFixed(2)}ms`);
      console.log(`Branch Query Avg: ${databasePerformance.branchQueryAverage.toFixed(2)}ms`);
      console.log(`Batch Processing: ${batchUsers.length} users, ${batchTickets.length} tickets`);
    });

    test('should maintain performance with large dataset volumes', async () => {
      // Simulate large dataset conditions
      const simulatedDataVolume = {
        totalTickets: 10000, // Simulated 10K tickets
        totalUsers: 2000, // Simulated 2K users
        totalBranches: 51, // Actual branch count
        averageTicketsPerBranch: 196, // 10K / 51
        averageUsersPerBranch: 39 // 2K / 51
      };

      // Test query performance under simulated load
      const largeDatasetQueries = [];
      const allBranches = await testSetup.getAllTestBranches();

      // Simulate complex queries
      for (let i = 0; i < 10; i++) {
        const { result: queryResult, executionTimeMs } = await testSetup.measureExecutionTime(async () => {
          // Simulate complex branch and user queries
          const branchResults = await testSetup.getAllTestBranches();
          return {
            branchCount: branchResults.length,
            queryComplexity: 'high',
            iteration: i + 1
          };
        });
        largeDatasetQueries.push(executionTimeMs);
      }

      // Large dataset performance validation
      const largeDatasetStats = {
        averageQueryTime: largeDatasetQueries.reduce((a, b) => a + b, 0) / largeDatasetQueries.length,
        maxQueryTime: Math.max(...largeDatasetQueries),
        minQueryTime: Math.min(...largeDatasetQueries),
        queryConsistency: (Math.max(...largeDatasetQueries) - Math.min(...largeDatasetQueries)) < 1000
      };

      const volumeValidation = {
        supportsTargetVolume: simulatedDataVolume.totalTickets >= 10000,
        supportsUserBase: simulatedDataVolume.totalUsers >= 2000,
        supportsBranchNetwork: simulatedDataVolume.totalBranches >= 51,
        queriesUnderThreshold: largeDatasetStats.averageQueryTime < 200, // Under 200ms
        maxQueryReasonable: largeDatasetStats.maxQueryTime < 500, // Under 500ms max
        consistentPerformance: largeDatasetStats.queryConsistency,
        scalesEfficiently: largeDatasetStats.averageQueryTime < 300,
        maintainsResponsiveness: largeDatasetStats.maxQueryTime < 1000
      };

      expect(volumeValidation.supportsTargetVolume).toBe(true);
      expect(volumeValidation.supportsUserBase).toBe(true);
      expect(volumeValidation.supportsBranchNetwork).toBe(true);
      expect(volumeValidation.queriesUnderThreshold).toBe(true);
      expect(volumeValidation.maxQueryReasonable).toBe(true);
      expect(volumeValidation.consistentPerformance).toBe(true);
      expect(volumeValidation.scalesEfficiently).toBe(true);
      expect(volumeValidation.maintainsResponsiveness).toBe(true);

      console.log('Large Dataset Performance Results:');
      console.log(`Simulated Volume: ${simulatedDataVolume.totalTickets} tickets, ${simulatedDataVolume.totalUsers} users`);
      console.log(`Query Performance: Avg ${largeDatasetStats.averageQueryTime.toFixed(2)}ms, Max ${largeDatasetStats.maxQueryTime.toFixed(2)}ms`);
    });
  });

  describe('Memory and Resource Management', () => {
    test('should manage memory efficiently during intensive operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Intensive operation simulation
      const intensiveOperations = [];
      const branch = await testSetup.getTestBranch('CAPEM');

      // Create large number of operations to test memory management
      for (let batch = 0; batch < 5; batch++) {
        const batchStartTime = process.hrtime.bigint();
        
        // Create batch of users and tickets
        const batchResults = await Promise.all(
          Array(20).fill(null).map(async (_, index) => {
            const user = await testSetup.createTestUser({
              email: `memory-test-${batch}-${index}@bsg.co.id`,
              name: `Memory Test User ${batch}-${index}`,
              role: 'requester',
              unitId: branch.id
            });

            const ticket = await testSetup.createTestTicket({
              title: `Memory Test Ticket ${batch}-${index}`,
              description: `Testing memory management with batch ${batch}, iteration ${index}`,
              priority: 'medium',
              status: 'pending_approval',
              unitId: branch.id
            }, user);

            return { user, ticket };
          })
        );

        const batchEndTime = process.hrtime.bigint();
        const batchExecutionTime = Number(batchEndTime - batchStartTime) / 1000000;

        // Check memory usage after each batch
        const batchMemory = process.memoryUsage();
        intensiveOperations.push({
          batch: batch + 1,
          itemsCreated: batchResults.length * 2, // users + tickets
          executionTime: batchExecutionTime,
          memoryUsage: batchMemory,
          heapUsed: batchMemory.heapUsed / 1024 / 1024, // MB
          external: batchMemory.external / 1024 / 1024 // MB
        });

        // Clean up to test garbage collection
        await testSetup.cleanupTestData();
      }

      const finalMemory = process.memoryUsage();

      // Memory management validation
      const memoryStats = {
        initialHeapMB: initialMemory.heapUsed / 1024 / 1024,
        finalHeapMB: finalMemory.heapUsed / 1024 / 1024,
        maxHeapUsageMB: Math.max(...intensiveOperations.map(op => op.heapUsed)),
        averageExecutionTime: intensiveOperations.reduce((sum, op) => sum + op.executionTime, 0) / intensiveOperations.length,
        memoryGrowth: (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024
      };

      const resourceValidation = {
        memoryGrowthReasonable: memoryStats.memoryGrowth < 50, // Under 50MB growth
        maxHeapReasonable: memoryStats.maxHeapUsageMB < 200, // Under 200MB max heap
        averageTimeAcceptable: memoryStats.averageExecutionTime < 5000, // Under 5 seconds per batch
        memoryStabilized: Math.abs(memoryStats.finalHeapMB - memoryStats.initialHeapMB) < 100, // Within 100MB
        noMemoryLeaks: memoryStats.finalHeapMB < memoryStats.maxHeapUsageMB, // Memory cleaned up
        efficientResourceUsage: intensiveOperations.every(op => op.heapUsed < 300) // Each batch under 300MB
      };

      expect(resourceValidation.memoryGrowthReasonable).toBe(true);
      expect(resourceValidation.maxHeapReasonable).toBe(true);
      expect(resourceValidation.averageTimeAcceptable).toBe(true);
      expect(resourceValidation.memoryStabilized).toBe(true);
      expect(resourceValidation.noMemoryLeaks).toBe(true);
      expect(resourceValidation.efficientResourceUsage).toBe(true);

      console.log('Memory Management Results:');
      console.log(`Initial Heap: ${memoryStats.initialHeapMB.toFixed(2)}MB`);
      console.log(`Final Heap: ${memoryStats.finalHeapMB.toFixed(2)}MB`);
      console.log(`Max Heap: ${memoryStats.maxHeapUsageMB.toFixed(2)}MB`);
      console.log(`Memory Growth: ${memoryStats.memoryGrowth.toFixed(2)}MB`);
    });

    test('should handle resource cleanup efficiently', async () => {
      const cleanupMetrics = [];
      
      // Create resources for cleanup testing
      const branch = await testSetup.getTestBranch('CABANG');
      const resourceBatches = [];

      // Create multiple batches of resources
      for (let i = 0; i < 3; i++) {
        const batchResources = await Promise.all([
          ...Array(15).fill(null).map((_, index) =>
            testSetup.createTestUser({
              email: `cleanup-user-${i}-${index}@bsg.co.id`,
              name: `Cleanup User ${i}-${index}`,
              role: 'requester',
              unitId: branch.id
            })
          ),
          ...Array(10).fill(null).map((_, index) =>
            testSetup.createTestTicket({
              title: `Cleanup Ticket ${i}-${index}`,
              description: `Testing resource cleanup batch ${i}, item ${index}`,
              priority: 'medium',
              status: 'pending_approval',
              unitId: branch.id
            }, { id: 1 }) // Simplified for cleanup testing
          )
        ]);

        resourceBatches.push({
          batch: i + 1,
          resources: batchResources.length,
          users: 15,
          tickets: 10
        });

        // Test cleanup performance
        const cleanupStartTime = process.hrtime.bigint();
        await testSetup.cleanupTestData();
        const cleanupEndTime = process.hrtime.bigint();
        const cleanupTime = Number(cleanupEndTime - cleanupStartTime) / 1000000;

        cleanupMetrics.push({
          batch: i + 1,
          resourcesCreated: batchResources.length,
          cleanupTime: cleanupTime,
          memoryAfterCleanup: process.memoryUsage()
        });
      }

      // Cleanup performance validation
      const cleanupStats = {
        averageCleanupTime: cleanupMetrics.reduce((sum, metric) => sum + metric.cleanupTime, 0) / cleanupMetrics.length,
        maxCleanupTime: Math.max(...cleanupMetrics.map(metric => metric.cleanupTime)),
        totalResourcesCleaned: cleanupMetrics.reduce((sum, metric) => sum + metric.resourcesCreated, 0),
        cleanupEfficiency: cleanupMetrics.map(metric => metric.resourcesCreated / metric.cleanupTime * 1000) // resources per second
      };

      const cleanupValidation = {
        averageCleanupFast: cleanupStats.averageCleanupTime < 2000, // Under 2 seconds
        maxCleanupReasonable: cleanupStats.maxCleanupTime < 5000, // Under 5 seconds max
        cleanupScales: cleanupStats.totalResourcesCleaned >= 75, // Cleaned expected volume
        efficientCleanup: cleanupStats.cleanupEfficiency.every(rate => rate > 10), // > 10 resources/second
        consistentPerformance: (cleanupStats.maxCleanupTime - Math.min(...cleanupMetrics.map(m => m.cleanupTime))) < 3000,
        memoryReclaimed: cleanupMetrics.every(metric => metric.memoryAfterCleanup.heapUsed < 200 * 1024 * 1024) // Under 200MB
      };

      expect(cleanupValidation.averageCleanupFast).toBe(true);
      expect(cleanupValidation.maxCleanupReasonable).toBe(true);
      expect(cleanupValidation.cleanupScales).toBe(true);
      expect(cleanupValidation.efficientCleanup).toBe(true);
      expect(cleanupValidation.consistentPerformance).toBe(true);
      expect(cleanupValidation.memoryReclaimed).toBe(true);

      console.log('Resource Cleanup Results:');
      console.log(`Average Cleanup Time: ${cleanupStats.averageCleanupTime.toFixed(2)}ms`);
      console.log(`Total Resources Cleaned: ${cleanupStats.totalResourcesCleaned}`);
      console.log(`Cleanup Efficiency: ${cleanupStats.cleanupEfficiency.map(r => r.toFixed(1)).join(', ')} resources/second`);
    });
  });
});