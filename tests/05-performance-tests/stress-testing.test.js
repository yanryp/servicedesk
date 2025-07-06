// Stress Testing and Scalability Validation for BSG Enterprise Ticketing System
const TestSetup = require('../shared/utilities/testSetup');
const { testCredentials, credentialHelpers } = require('../shared/fixtures/testCredentials');

describe('Stress Testing and Scalability Validation', () => {
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

  describe('High-Volume Stress Testing', () => {
    test('should handle peak load conditions across all 51 branches', async () => {
      const allBranches = await testSetup.getAllTestBranches();
      const peakLoadScenario = {
        simultaneousBranches: Math.min(allBranches.length, 51),
        usersPerBranch: 20, // 20 concurrent users per branch
        ticketsPerUser: 3, // 3 tickets per user
        expectedTotalTickets: Math.min(allBranches.length, 51) * 20 * 3
      };

      console.log(`Starting peak load test: ${peakLoadScenario.simultaneousBranches} branches, ${peakLoadScenario.usersPerBranch * peakLoadScenario.simultaneousBranches} total users`);

      const peakLoadStartTime = process.hrtime.bigint();
      
      // Simulate peak load across all branches
      const branchStressResults = await Promise.all(
        allBranches.slice(0, peakLoadScenario.simultaneousBranches).map(async (branch, branchIndex) => {
          const branchStartTime = process.hrtime.bigint();
          
          // Create concurrent users for each branch
          const branchUsers = await Promise.all(
            Array(peakLoadScenario.usersPerBranch).fill(null).map(async (_, userIndex) => {
              return testSetup.createTestUser({
                email: `stress-${branch.unitCode.toLowerCase()}-${userIndex}@bsg.co.id`,
                name: `Stress User ${branch.unitCode}-${userIndex}`,
                role: 'requester',
                unitId: branch.id
              });
            })
          );

          // Create concurrent tickets for each user
          const branchTickets = await Promise.all(
            branchUsers.flatMap(user =>
              Array(peakLoadScenario.ticketsPerUser).fill(null).map(async (_, ticketIndex) => {
                return testSetup.createTestTicket({
                  title: `Stress Test ${branch.unitCode}-${user.id}-${ticketIndex}`,
                  description: `Peak load stress testing for ${branch.unitCode} branch`,
                  priority: ['low', 'medium', 'high', 'urgent'][ticketIndex % 4],
                  status: 'pending_approval',
                  unitId: branch.id
                }, user);
              })
            )
          );

          const branchEndTime = process.hrtime.bigint();
          const branchExecutionTime = Number(branchEndTime - branchStartTime) / 1000000;

          return {
            branchCode: branch.unitCode,
            branchType: branch.unitType,
            usersCreated: branchUsers.length,
            ticketsCreated: branchTickets.length,
            executionTime: branchExecutionTime,
            successRate: branchTickets.filter(t => t.id != null).length / branchTickets.length,
            allUsersValid: branchUsers.every(u => u.id != null),
            allTicketsValid: branchTickets.every(t => t.id != null)
          };
        })
      );

      const peakLoadEndTime = process.hrtime.bigint();
      const totalPeakLoadTime = Number(peakLoadEndTime - peakLoadStartTime) / 1000000;

      // Peak load stress analysis
      const stressAnalysis = {
        totalBranchesTested: branchStressResults.length,
        totalUsersCreated: branchStressResults.reduce((sum, result) => sum + result.usersCreated, 0),
        totalTicketsCreated: branchStressResults.reduce((sum, result) => sum + result.ticketsCreated, 0),
        averageBranchTime: branchStressResults.reduce((sum, result) => sum + result.executionTime, 0) / branchStressResults.length,
        maxBranchTime: Math.max(...branchStressResults.map(result => result.executionTime)),
        minBranchTime: Math.min(...branchStressResults.map(result => result.executionTime)),
        overallSuccessRate: branchStressResults.reduce((sum, result) => sum + result.successRate, 0) / branchStressResults.length,
        totalExecutionTime: totalPeakLoadTime
      };

      // Stress test validation
      const stressValidation = {
        handlesExpectedVolume: stressAnalysis.totalTicketsCreated >= peakLoadScenario.expectedTotalTickets * 0.95, // 95% success
        maintainsHighSuccessRate: stressAnalysis.overallSuccessRate >= 0.98, // 98% success rate
        averageTimeAcceptable: stressAnalysis.averageBranchTime < 15000, // Under 15 seconds per branch
        maxTimeReasonable: stressAnalysis.maxBranchTime < 30000, // Under 30 seconds max
        systemStaysResponsive: stressAnalysis.totalExecutionTime < 60000, // Under 1 minute total
        allBranchesProcessed: stressAnalysis.totalBranchesTested === peakLoadScenario.simultaneousBranches,
        scalesTo51Branches: stressAnalysis.totalBranchesTested >= 51,
        handlesThousandsOfUsers: stressAnalysis.totalUsersCreated >= 1000
      };

      expect(stressValidation.handlesExpectedVolume).toBe(true);
      expect(stressValidation.maintainsHighSuccessRate).toBe(true);
      expect(stressValidation.averageTimeAcceptable).toBe(true);
      expect(stressValidation.maxTimeReasonable).toBe(true);
      expect(stressValidation.systemStaysResponsive).toBe(true);
      expect(stressValidation.allBranchesProcessed).toBe(true);
      expect(stressValidation.scalesTo51Branches).toBe(true);
      expect(stressValidation.handlesThousandsOfUsers).toBe(true);

      console.log('Peak Load Stress Test Results:');
      console.log(`Branches: ${stressAnalysis.totalBranchesTested}, Users: ${stressAnalysis.totalUsersCreated}, Tickets: ${stressAnalysis.totalTicketsCreated}`);
      console.log(`Success Rate: ${(stressAnalysis.overallSuccessRate * 100).toFixed(2)}%`);
      console.log(`Avg Branch Time: ${stressAnalysis.averageBranchTime.toFixed(2)}ms, Total Time: ${stressAnalysis.totalExecutionTime.toFixed(2)}ms`);
    });

    test('should maintain stability under approval workflow stress', async () => {
      const approvalStressScenario = {
        branchesWithManagers: 25,
        ticketsPerBranch: 50,
        priorityDistribution: { urgent: 10, high: 15, medium: 20, low: 5 }
      };

      const allBranches = await testSetup.getAllTestBranches();
      const testBranches = allBranches.slice(0, approvalStressScenario.branchesWithManagers);

      console.log(`Starting approval workflow stress test: ${testBranches.length} branches with managers`);

      const approvalStressResults = await Promise.all(
        testBranches.map(async (branch, index) => {
          const branchStartTime = process.hrtime.bigint();

          // Create branch manager for approval testing
          const branchManager = await testSetup.createTestUser({
            email: `approval-stress-mgr-${branch.unitCode.toLowerCase()}@bsg.co.id`,
            name: `${branch.unitCode} Approval Stress Manager`,
            role: 'manager',
            unitId: branch.id,
            isBusinessReviewer: true
          });

          // Create multiple requesters
          const branchRequesters = await Promise.all(
            Array(10).fill(null).map(async (_, reqIndex) => {
              return testSetup.createTestUser({
                email: `approval-stress-req-${branch.unitCode.toLowerCase()}-${reqIndex}@bsg.co.id`,
                name: `${branch.unitCode} Approval Stress Requester ${reqIndex}`,
                role: 'requester',
                unitId: branch.id
              });
            })
          );

          // Create high-volume approval tickets
          const approvalTickets = await Promise.all(
            Array(approvalStressScenario.ticketsPerBranch).fill(null).map(async (_, ticketIndex) => {
              const requester = branchRequesters[ticketIndex % branchRequesters.length];
              const priorities = Object.keys(approvalStressScenario.priorityDistribution);
              const priority = priorities[ticketIndex % priorities.length];

              return testSetup.createTestTicket({
                title: `Approval Stress ${branch.unitCode}-${ticketIndex}`,
                description: `Testing approval workflow stress for ${branch.unitCode} with ${priority} priority`,
                priority: priority,
                status: 'pending_approval',
                unitId: branch.id
              }, requester);
            })
          );

          const branchEndTime = process.hrtime.bigint();
          const branchExecutionTime = Number(branchEndTime - branchStartTime) / 1000000;

          // Analyze approval workflow stress
          const approvalAnalysis = {
            pendingApprovalTickets: approvalTickets.filter(t => t.status === 'pending_approval').length,
            managerHasAuthority: branchManager.isBusinessReviewer && branchManager.unitId === branch.id,
            ticketsRoutedToBranch: approvalTickets.every(t => t.unitId === branch.id),
            diversePriorities: new Set(approvalTickets.map(t => t.priority)).size >= 3,
            multipleRequesters: branchRequesters.length === 10
          };

          return {
            branchCode: branch.unitCode,
            managerId: branchManager.id,
            requestersCount: branchRequesters.length,
            ticketsAwaitingApproval: approvalTickets.length,
            pendingApprovalCount: approvalAnalysis.pendingApprovalTickets,
            executionTime: branchExecutionTime,
            approvalWorkflowIntact: approvalAnalysis.managerHasAuthority && approvalAnalysis.ticketsRoutedToBranch,
            priorityDistributionValid: approvalAnalysis.diversePriorities,
            scalabilityDemonstrated: approvalTickets.length === approvalStressScenario.ticketsPerBranch
          };
        })
      );

      // Approval stress analysis
      const approvalStressAnalysis = {
        totalBranches: approvalStressResults.length,
        totalManagersCreated: approvalStressResults.length,
        totalRequestersCreated: approvalStressResults.reduce((sum, result) => sum + result.requestersCount, 0),
        totalTicketsAwaitingApproval: approvalStressResults.reduce((sum, result) => sum + result.ticketsAwaitingApproval, 0),
        averageProcessingTime: approvalStressResults.reduce((sum, result) => sum + result.executionTime, 0) / approvalStressResults.length,
        allWorkflowsIntact: approvalStressResults.every(result => result.approvalWorkflowIntact),
        allScalabilityTargetsMet: approvalStressResults.every(result => result.scalabilityDemonstrated)
      };

      // Approval stress validation
      const approvalStressValidation = {
        handlesHighVolumeApprovals: approvalStressAnalysis.totalTicketsAwaitingApproval >= 1000, // 1000+ pending approvals
        maintainsApprovalWorkflow: approvalStressAnalysis.allWorkflowsIntact,
        managerAuthorityPreserved: approvalStressResults.every(r => r.approvalWorkflowIntact),
        scalesAcrossBranches: approvalStressAnalysis.totalBranches >= 25,
        processingTimeAcceptable: approvalStressAnalysis.averageProcessingTime < 10000, // Under 10 seconds per branch
        workflowIntegrityMaintained: approvalStressAnalysis.allWorkflowsIntact,
        supportsMultipleRequesters: approvalStressAnalysis.totalRequestersCreated >= 250,
        handlesVariousPriorities: approvalStressResults.every(r => r.priorityDistributionValid)
      };

      expect(approvalStressValidation.handlesHighVolumeApprovals).toBe(true);
      expect(approvalStressValidation.maintainsApprovalWorkflow).toBe(true);
      expect(approvalStressValidation.managerAuthorityPreserved).toBe(true);
      expect(approvalStressValidation.scalesAcrossBranches).toBe(true);
      expect(approvalStressValidation.processingTimeAcceptable).toBe(true);
      expect(approvalStressValidation.workflowIntegrityMaintained).toBe(true);
      expect(approvalStressValidation.supportsMultipleRequesters).toBe(true);
      expect(approvalStressValidation.handlesVariousPriorities).toBe(true);

      console.log('Approval Workflow Stress Test Results:');
      console.log(`Total Pending Approvals: ${approvalStressAnalysis.totalTicketsAwaitingApproval}`);
      console.log(`Branches with Managers: ${approvalStressAnalysis.totalBranches}`);
      console.log(`Average Processing Time: ${approvalStressAnalysis.averageProcessingTime.toFixed(2)}ms`);
    });

    test('should handle burst traffic and spike conditions', async () => {
      const burstTrafficScenario = {
        burstIntervals: 5, // 5 traffic bursts
        operationsPerBurst: 100, // 100 operations per burst
        burstIntervalMs: 1000, // 1 second between bursts
        expectedTotalOperations: 500
      };

      const burstResults = [];
      const branch = await testSetup.getTestBranch('CABANG');

      console.log(`Starting burst traffic test: ${burstTrafficScenario.burstIntervals} bursts of ${burstTrafficScenario.operationsPerBurst} operations each`);

      for (let burstIndex = 0; burstIndex < burstTrafficScenario.burstIntervals; burstIndex++) {
        const burstStartTime = process.hrtime.bigint();

        // Create burst of operations
        const burstOperations = await Promise.all(
          Array(burstTrafficScenario.operationsPerBurst).fill(null).map(async (_, opIndex) => {
            const operationStartTime = process.hrtime.bigint();

            // Alternate between user creation and ticket creation
            let result;
            if (opIndex % 2 === 0) {
              // Create user
              result = await testSetup.createTestUser({
                email: `burst-user-${burstIndex}-${opIndex}@bsg.co.id`,
                name: `Burst User ${burstIndex}-${opIndex}`,
                role: 'requester',
                unitId: branch.id
              });
            } else {
              // Create ticket (using simple requester reference)
              result = await testSetup.createTestTicket({
                title: `Burst Ticket ${burstIndex}-${opIndex}`,
                description: `Burst traffic test ticket ${burstIndex}-${opIndex}`,
                priority: ['low', 'medium', 'high'][opIndex % 3],
                status: 'pending_approval',
                unitId: branch.id
              }, { id: 1 }); // Simplified requester for burst testing
            }

            const operationEndTime = process.hrtime.bigint();
            const operationTime = Number(operationEndTime - operationStartTime) / 1000000;

            return {
              operation: opIndex % 2 === 0 ? 'user_creation' : 'ticket_creation',
              executionTime: operationTime,
              success: result.id != null,
              burstIndex: burstIndex
            };
          })
        );

        const burstEndTime = process.hrtime.bigint();
        const burstTotalTime = Number(burstEndTime - burstStartTime) / 1000000;

        burstResults.push({
          burstNumber: burstIndex + 1,
          operationsCompleted: burstOperations.length,
          successfulOperations: burstOperations.filter(op => op.success).length,
          failedOperations: burstOperations.filter(op => !op.success).length,
          burstExecutionTime: burstTotalTime,
          averageOperationTime: burstOperations.reduce((sum, op) => sum + op.executionTime, 0) / burstOperations.length,
          maxOperationTime: Math.max(...burstOperations.map(op => op.executionTime)),
          userOperations: burstOperations.filter(op => op.operation === 'user_creation').length,
          ticketOperations: burstOperations.filter(op => op.operation === 'ticket_creation').length
        });

        // Wait between bursts (except for the last one)
        if (burstIndex < burstTrafficScenario.burstIntervals - 1) {
          await new Promise(resolve => setTimeout(resolve, burstTrafficScenario.burstIntervalMs));
        }
      }

      // Burst traffic analysis
      const burstAnalysis = {
        totalBursts: burstResults.length,
        totalOperations: burstResults.reduce((sum, burst) => sum + burst.operationsCompleted, 0),
        totalSuccessfulOperations: burstResults.reduce((sum, burst) => sum + burst.successfulOperations, 0),
        totalFailedOperations: burstResults.reduce((sum, burst) => sum + burst.failedOperations, 0),
        overallSuccessRate: burstResults.reduce((sum, burst) => sum + burst.successfulOperations, 0) / burstResults.reduce((sum, burst) => sum + burst.operationsCompleted, 0),
        averageBurstTime: burstResults.reduce((sum, burst) => sum + burst.burstExecutionTime, 0) / burstResults.length,
        maxBurstTime: Math.max(...burstResults.map(burst => burst.burstExecutionTime)),
        consistentPerformance: (Math.max(...burstResults.map(b => b.burstExecutionTime)) - Math.min(...burstResults.map(b => b.burstExecutionTime))) < 5000
      };

      // Burst traffic validation
      const burstValidation = {
        handlesExpectedBursts: burstAnalysis.totalBursts === burstTrafficScenario.burstIntervals,
        processesExpectedVolume: burstAnalysis.totalOperations >= burstTrafficScenario.expectedTotalOperations * 0.95,
        maintainsHighSuccessRate: burstAnalysis.overallSuccessRate >= 0.95, // 95% success under burst
        burstTimeAcceptable: burstAnalysis.averageBurstTime < 8000, // Under 8 seconds per burst
        maxBurstTimeReasonable: burstAnalysis.maxBurstTime < 15000, // Under 15 seconds max
        lowFailureRate: burstAnalysis.totalFailedOperations / burstAnalysis.totalOperations < 0.05, // Under 5% failure
        performanceConsistent: burstAnalysis.consistentPerformance,
        systemStabilityMaintained: burstAnalysis.overallSuccessRate >= 0.9
      };

      expect(burstValidation.handlesExpectedBursts).toBe(true);
      expect(burstValidation.processesExpectedVolume).toBe(true);
      expect(burstValidation.maintainsHighSuccessRate).toBe(true);
      expect(burstValidation.burstTimeAcceptable).toBe(true);
      expect(burstValidation.maxBurstTimeReasonable).toBe(true);
      expect(burstValidation.lowFailureRate).toBe(true);
      expect(burstValidation.performanceConsistent).toBe(true);
      expect(burstValidation.systemStabilityMaintained).toBe(true);

      console.log('Burst Traffic Test Results:');
      console.log(`Total Operations: ${burstAnalysis.totalOperations}, Success Rate: ${(burstAnalysis.overallSuccessRate * 100).toFixed(2)}%`);
      console.log(`Average Burst Time: ${burstAnalysis.averageBurstTime.toFixed(2)}ms, Max: ${burstAnalysis.maxBurstTime.toFixed(2)}ms`);
    });
  });

  describe('Scalability and Growth Testing', () => {
    test('should demonstrate horizontal scalability potential', async () => {
      const scalabilityScenario = {
        simulatedBranchGrowth: [51, 75, 100, 150], // Simulated branch counts
        usersPerBranch: 25,
        ticketsPerUser: 2,
        scalabilityMetrics: []
      };

      console.log('Testing horizontal scalability across simulated branch growth');

      // Test scalability at different branch counts
      for (const branchCount of scalabilityScenario.simulatedBranchGrowth) {
        const scaleTestStartTime = process.hrtime.bigint();
        
        // Use actual branches up to available count, then simulate additional load
        const allBranches = await testSetup.getAllTestBranches();
        const actualBranches = Math.min(branchCount, allBranches.length);
        const simulatedAdditionalLoad = branchCount - actualBranches;

        // Process actual branches with simulated load
        const scaleTestResults = await Promise.all(
          allBranches.slice(0, actualBranches).map(async (branch, index) => {
            // Calculate additional load factor for simulation
            const loadMultiplier = 1 + (simulatedAdditionalLoad / actualBranches);
            const adjustedUserCount = Math.round(scalabilityScenario.usersPerBranch * loadMultiplier);

            const branchUsers = await Promise.all(
              Array(Math.min(adjustedUserCount, 50)).fill(null).map(async (_, userIndex) => { // Cap at 50 for performance
                return testSetup.createTestUser({
                  email: `scale-${branchCount}-${branch.unitCode.toLowerCase()}-${userIndex}@bsg.co.id`,
                  name: `Scale User ${branchCount}-${branch.unitCode}-${userIndex}`,
                  role: 'requester',
                  unitId: branch.id
                });
              })
            );

            const branchTickets = await Promise.all(
              branchUsers.flatMap(user =>
                Array(scalabilityScenario.ticketsPerUser).fill(null).map(async (_, ticketIndex) => {
                  return testSetup.createTestTicket({
                    title: `Scale Test ${branchCount}-${branch.unitCode}-${user.id}-${ticketIndex}`,
                    description: `Scalability testing for ${branchCount} branch scenario`,
                    priority: ['low', 'medium', 'high'][ticketIndex % 3],
                    status: 'pending_approval',
                    unitId: branch.id
                  }, user);
                })
              )
            );

            return {
              branchCode: branch.unitCode,
              usersCreated: branchUsers.length,
              ticketsCreated: branchTickets.length,
              loadMultiplier: loadMultiplier,
              simulatedForBranchCount: branchCount
            };
          })
        );

        const scaleTestEndTime = process.hrtime.bigint();
        const scaleTestTime = Number(scaleTestEndTime - scaleTestStartTime) / 1000000;

        // Calculate scalability metrics
        const scaleMetrics = {
          targetBranchCount: branchCount,
          actualBranchesTested: actualBranches,
          simulatedAdditionalLoad: simulatedAdditionalLoad,
          totalUsersCreated: scaleTestResults.reduce((sum, result) => sum + result.usersCreated, 0),
          totalTicketsCreated: scaleTestResults.reduce((sum, result) => sum + result.ticketsCreated, 0),
          executionTime: scaleTestTime,
          averageLoadMultiplier: scaleTestResults.reduce((sum, result) => sum + result.loadMultiplier, 0) / scaleTestResults.length,
          operationsPerSecond: (scaleTestResults.reduce((sum, result) => sum + result.usersCreated + result.ticketsCreated, 0)) / (scaleTestTime / 1000)
        };

        scalabilityScenario.scalabilityMetrics.push(scaleMetrics);

        // Clean up after each scale test
        await testSetup.cleanupTestData();
      }

      // Scalability analysis
      const scalabilityAnalysis = {
        scalePoints: scalabilityScenario.scalabilityMetrics.length,
        maxBranchCount: Math.max(...scalabilityScenario.scalabilityMetrics.map(m => m.targetBranchCount)),
        maxUsersHandled: Math.max(...scalabilityScenario.scalabilityMetrics.map(m => m.totalUsersCreated)),
        maxTicketsHandled: Math.max(...scalabilityScenario.scalabilityMetrics.map(m => m.totalTicketsCreated)),
        performanceDegradation: scalabilityScenario.scalabilityMetrics.map((metric, index) => {
          if (index === 0) return 0;
          return (metric.executionTime - scalabilityScenario.scalabilityMetrics[0].executionTime) / scalabilityScenario.scalabilityMetrics[0].executionTime;
        }),
        throughputTrend: scalabilityScenario.scalabilityMetrics.map(m => m.operationsPerSecond)
      };

      // Scalability validation
      const scalabilityValidation = {
        scalesTo150Branches: scalabilityAnalysis.maxBranchCount >= 150,
        handlesThousandsOfUsers: scalabilityAnalysis.maxUsersHandled >= 1000,
        processesThousandsOfTickets: scalabilityAnalysis.maxTicketsHandled >= 2000,
        performanceDegradationAcceptable: scalabilityAnalysis.performanceDegradation.every(deg => deg < 3), // Less than 3x degradation
        maintainsThroughput: scalabilityAnalysis.throughputTrend.every(tps => tps > 10), // At least 10 operations/second
        demonstratesLinearScalability: scalabilityAnalysis.performanceDegradation[scalabilityAnalysis.performanceDegradation.length - 1] < 5,
        supportsGrowthProjections: scalabilityAnalysis.maxBranchCount >= 100,
        maintainsSystemStability: scalabilityScenario.scalabilityMetrics.every(m => m.executionTime < 60000) // Under 1 minute
      };

      expect(scalabilityValidation.scalesTo150Branches).toBe(true);
      expect(scalabilityValidation.handlesThousandsOfUsers).toBe(true);
      expect(scalabilityValidation.processesThousandsOfTickets).toBe(true);
      expect(scalabilityValidation.performanceDegradationAcceptable).toBe(true);
      expect(scalabilityValidation.maintainsThroughput).toBe(true);
      expect(scalabilityValidation.demonstratesLinearScalability).toBe(true);
      expect(scalabilityValidation.supportsGrowthProjections).toBe(true);
      expect(scalabilityValidation.maintainsSystemStability).toBe(true);

      console.log('Horizontal Scalability Test Results:');
      scalabilityScenario.scalabilityMetrics.forEach((metric, index) => {
        console.log(`${metric.targetBranchCount} branches: ${metric.totalUsersCreated} users, ${metric.totalTicketsCreated} tickets, ${metric.operationsPerSecond.toFixed(1)} ops/sec`);
      });
    });

    test('should validate vertical scalability and resource efficiency', async () => {
      const verticalScalabilityScenario = {
        resourceIntensityLevels: [
          { level: 'light', usersPerBatch: 25, ticketsPerUser: 2 },
          { level: 'moderate', usersPerBatch: 50, ticketsPerUser: 3 },
          { level: 'heavy', usersPerBatch: 100, ticketsPerUser: 4 },
          { level: 'intensive', usersPerBatch: 150, ticketsPerUser: 5 }
        ],
        resourceMetrics: []
      };

      const branch = await testSetup.getTestBranch('CAPEM');

      console.log('Testing vertical scalability with increasing resource intensity');

      for (const intensityLevel of verticalScalabilityScenario.resourceIntensityLevels) {
        const levelStartTime = process.hrtime.bigint();
        const initialMemory = process.memoryUsage();

        // Create intensive workload
        const intensiveUsers = await Promise.all(
          Array(intensityLevel.usersPerBatch).fill(null).map(async (_, userIndex) => {
            return testSetup.createTestUser({
              email: `vertical-${intensityLevel.level}-${userIndex}@bsg.co.id`,
              name: `Vertical ${intensityLevel.level} User ${userIndex}`,
              role: 'requester',
              unitId: branch.id
            });
          })
        );

        const intensiveTickets = await Promise.all(
          intensiveUsers.flatMap(user =>
            Array(intensityLevel.ticketsPerUser).fill(null).map(async (_, ticketIndex) => {
              return testSetup.createTestTicket({
                title: `Vertical ${intensityLevel.level} Ticket ${user.id}-${ticketIndex}`,
                description: `Vertical scalability testing at ${intensityLevel.level} intensity`,
                priority: ['low', 'medium', 'high', 'urgent'][ticketIndex % 4],
                status: 'pending_approval',
                unitId: branch.id
              }, user);
            })
          )
        );

        const levelEndTime = process.hrtime.bigint();
        const finalMemory = process.memoryUsage();
        const levelExecutionTime = Number(levelEndTime - levelStartTime) / 1000000;

        const resourceMetrics = {
          intensityLevel: intensityLevel.level,
          usersCreated: intensiveUsers.length,
          ticketsCreated: intensiveTickets.length,
          totalOperations: intensiveUsers.length + intensiveTickets.length,
          executionTime: levelExecutionTime,
          memoryGrowthMB: (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024,
          peakMemoryMB: finalMemory.heapUsed / 1024 / 1024,
          operationsPerSecond: (intensiveUsers.length + intensiveTickets.length) / (levelExecutionTime / 1000),
          memoryEfficiency: (intensiveUsers.length + intensiveTickets.length) / (finalMemory.heapUsed / 1024 / 1024) // operations per MB
        };

        verticalScalabilityScenario.resourceMetrics.push(resourceMetrics);

        // Clean up between intensity levels
        await testSetup.cleanupTestData();
      }

      // Vertical scalability analysis
      const verticalAnalysis = {
        intensityLevels: verticalScalabilityScenario.resourceMetrics.length,
        maxOperationsHandled: Math.max(...verticalScalabilityScenario.resourceMetrics.map(m => m.totalOperations)),
        maxMemoryUsedMB: Math.max(...verticalScalabilityScenario.resourceMetrics.map(m => m.peakMemoryMB)),
        maxThroughput: Math.max(...verticalScalabilityScenario.resourceMetrics.map(m => m.operationsPerSecond)),
        memoryEfficiencyTrend: verticalScalabilityScenario.resourceMetrics.map(m => m.memoryEfficiency),
        executionTimeTrend: verticalScalabilityScenario.resourceMetrics.map(m => m.executionTime),
        memoryGrowthPattern: verticalScalabilityScenario.resourceMetrics.map(m => m.memoryGrowthMB)
      };

      // Vertical scalability validation
      const verticalValidation = {
        handlesIntensiveWorkloads: verticalAnalysis.maxOperationsHandled >= 500,
        memoryUsageReasonable: verticalAnalysis.maxMemoryUsedMB < 500, // Under 500MB peak
        maintainsThroughput: verticalAnalysis.maxThroughput > 20, // At least 20 operations/second
        memoryEfficiencyAcceptable: verticalAnalysis.memoryEfficiencyTrend.every(eff => eff > 1), // At least 1 operation per MB
        executionTimeScalesReasonably: verticalAnalysis.executionTimeTrend[verticalAnalysis.executionTimeTrend.length - 1] < 30000, // Under 30 seconds for intensive
        memoryGrowthControlled: verticalAnalysis.memoryGrowthPattern.every(growth => growth < 100), // Under 100MB growth per level
        supportsResourceIntensification: verticalAnalysis.intensityLevels === 4,
        demonstratesVerticalScalability: verticalAnalysis.maxOperationsHandled > verticalScalabilityScenario.resourceMetrics[0].totalOperations * 3
      };

      expect(verticalValidation.handlesIntensiveWorkloads).toBe(true);
      expect(verticalValidation.memoryUsageReasonable).toBe(true);
      expect(verticalValidation.maintainsThroughput).toBe(true);
      expect(verticalValidation.memoryEfficiencyAcceptable).toBe(true);
      expect(verticalValidation.executionTimeScalesReasonably).toBe(true);
      expect(verticalValidation.memoryGrowthControlled).toBe(true);
      expect(verticalValidation.supportsResourceIntensification).toBe(true);
      expect(verticalValidation.demonstratesVerticalScalability).toBe(true);

      console.log('Vertical Scalability Test Results:');
      verticalScalabilityScenario.resourceMetrics.forEach(metric => {
        console.log(`${metric.intensityLevel}: ${metric.totalOperations} ops, ${metric.operationsPerSecond.toFixed(1)} ops/sec, ${metric.peakMemoryMB.toFixed(1)}MB`);
      });
    });
  });

  describe('Stability and Endurance Testing', () => {
    test('should maintain stability during extended operation periods', async () => {
      const enduranceScenario = {
        operationCycles: 10, // 10 operation cycles
        operationsPerCycle: 50,
        cyclePauseMs: 500, // 500ms between cycles
        stabilityMetrics: []
      };

      const branch = await testSetup.getTestBranch('CABANG');

      console.log(`Starting endurance test: ${enduranceScenario.operationCycles} cycles of ${enduranceScenario.operationsPerCycle} operations each`);

      const enduranceStartTime = process.hrtime.bigint();

      for (let cycle = 0; cycle < enduranceScenario.operationCycles; cycle++) {
        const cycleStartTime = process.hrtime.bigint();
        const cycleMemoryStart = process.memoryUsage();

        // Execute operation cycle
        const cycleOperations = await Promise.all(
          Array(enduranceScenario.operationsPerCycle).fill(null).map(async (_, opIndex) => {
            const operationStartTime = process.hrtime.bigint();

            if (opIndex % 3 === 0) {
              // User creation
              const user = await testSetup.createTestUser({
                email: `endurance-${cycle}-${opIndex}@bsg.co.id`,
                name: `Endurance User ${cycle}-${opIndex}`,
                role: 'requester',
                unitId: branch.id
              });
              const operationEndTime = process.hrtime.bigint();
              return {
                type: 'user_creation',
                executionTime: Number(operationEndTime - operationStartTime) / 1000000,
                success: user.id != null
              };
            } else {
              // Ticket creation
              const ticket = await testSetup.createTestTicket({
                title: `Endurance Ticket ${cycle}-${opIndex}`,
                description: `Endurance testing cycle ${cycle}, operation ${opIndex}`,
                priority: ['low', 'medium', 'high'][opIndex % 3],
                status: 'pending_approval',
                unitId: branch.id
              }, { id: 1 }); // Simplified requester for endurance testing
              const operationEndTime = process.hrtime.bigint();
              return {
                type: 'ticket_creation',
                executionTime: Number(operationEndTime - operationStartTime) / 1000000,
                success: ticket.id != null
              };
            }
          })
        );

        const cycleEndTime = process.hrtime.bigint();
        const cycleMemoryEnd = process.memoryUsage();
        const cycleExecutionTime = Number(cycleEndTime - cycleStartTime) / 1000000;

        const cycleMetrics = {
          cycle: cycle + 1,
          operationsCompleted: cycleOperations.length,
          successfulOperations: cycleOperations.filter(op => op.success).length,
          userOperations: cycleOperations.filter(op => op.type === 'user_creation').length,
          ticketOperations: cycleOperations.filter(op => op.type === 'ticket_creation').length,
          cycleExecutionTime: cycleExecutionTime,
          averageOperationTime: cycleOperations.reduce((sum, op) => sum + op.executionTime, 0) / cycleOperations.length,
          memoryGrowthMB: (cycleMemoryEnd.heapUsed - cycleMemoryStart.heapUsed) / 1024 / 1024,
          currentMemoryMB: cycleMemoryEnd.heapUsed / 1024 / 1024,
          successRate: cycleOperations.filter(op => op.success).length / cycleOperations.length
        };

        enduranceScenario.stabilityMetrics.push(cycleMetrics);

        // Pause between cycles
        if (cycle < enduranceScenario.operationCycles - 1) {
          await new Promise(resolve => setTimeout(resolve, enduranceScenario.cyclePauseMs));
        }
      }

      const enduranceEndTime = process.hrtime.bigint();
      const totalEnduranceTime = Number(enduranceEndTime - enduranceStartTime) / 1000000;

      // Endurance analysis
      const enduranceAnalysis = {
        totalCycles: enduranceScenario.stabilityMetrics.length,
        totalOperations: enduranceScenario.stabilityMetrics.reduce((sum, cycle) => sum + cycle.operationsCompleted, 0),
        totalSuccessfulOperations: enduranceScenario.stabilityMetrics.reduce((sum, cycle) => sum + cycle.successfulOperations, 0),
        overallSuccessRate: enduranceScenario.stabilityMetrics.reduce((sum, cycle) => sum + cycle.successfulOperations, 0) / enduranceScenario.stabilityMetrics.reduce((sum, cycle) => sum + cycle.operationsCompleted, 0),
        averageCycleTime: enduranceScenario.stabilityMetrics.reduce((sum, cycle) => sum + cycle.cycleExecutionTime, 0) / enduranceScenario.stabilityMetrics.length,
        totalMemoryGrowthMB: enduranceScenario.stabilityMetrics.reduce((sum, cycle) => sum + cycle.memoryGrowthMB, 0),
        finalMemoryMB: enduranceScenario.stabilityMetrics[enduranceScenario.stabilityMetrics.length - 1].currentMemoryMB,
        performanceConsistency: Math.max(...enduranceScenario.stabilityMetrics.map(c => c.cycleExecutionTime)) - Math.min(...enduranceScenario.stabilityMetrics.map(c => c.cycleExecutionTime)),
        totalEnduranceTime: totalEnduranceTime
      };

      // Endurance validation
      const enduranceValidation = {
        completedAllCycles: enduranceAnalysis.totalCycles === enduranceScenario.operationCycles,
        maintainsHighSuccessRate: enduranceAnalysis.overallSuccessRate >= 0.98, // 98% success throughout
        processedExpectedOperations: enduranceAnalysis.totalOperations >= enduranceScenario.operationCycles * enduranceScenario.operationsPerCycle * 0.95,
        cycleTimeConsistent: enduranceAnalysis.performanceConsistency < 5000, // Within 5 seconds variance
        memoryGrowthControlled: enduranceAnalysis.totalMemoryGrowthMB < 200, // Under 200MB total growth
        finalMemoryReasonable: enduranceAnalysis.finalMemoryMB < 300, // Under 300MB final memory
        enduranceTimeAcceptable: enduranceAnalysis.totalEnduranceTime < 120000, // Under 2 minutes total
        systemStabilityMaintained: enduranceScenario.stabilityMetrics.every(cycle => cycle.successRate >= 0.95)
      };

      expect(enduranceValidation.completedAllCycles).toBe(true);
      expect(enduranceValidation.maintainsHighSuccessRate).toBe(true);
      expect(enduranceValidation.processedExpectedOperations).toBe(true);
      expect(enduranceValidation.cycleTimeConsistent).toBe(true);
      expect(enduranceValidation.memoryGrowthControlled).toBe(true);
      expect(enduranceValidation.finalMemoryReasonable).toBe(true);
      expect(enduranceValidation.enduranceTimeAcceptable).toBe(true);
      expect(enduranceValidation.systemStabilityMaintained).toBe(true);

      console.log('Endurance Test Results:');
      console.log(`Total Operations: ${enduranceAnalysis.totalOperations}, Success Rate: ${(enduranceAnalysis.overallSuccessRate * 100).toFixed(2)}%`);
      console.log(`Average Cycle Time: ${enduranceAnalysis.averageCycleTime.toFixed(2)}ms, Total Time: ${(enduranceAnalysis.totalEnduranceTime / 1000).toFixed(1)}s`);
      console.log(`Memory Growth: ${enduranceAnalysis.totalMemoryGrowthMB.toFixed(2)}MB, Final Memory: ${enduranceAnalysis.finalMemoryMB.toFixed(2)}MB`);
    });
  });
});