// backend/src/services/autoAssignmentService.ts
import prisma from '../db/prisma';

export interface AssignmentCriteria {
  templateId?: number;
  departmentId?: number;
  priority?: string;
  requiredSkill?: string;
}

export interface AssignmentResult {
  success: boolean;
  assignedUserId?: number;
  assignmentRuleId?: number;
  reason: string;
  assignmentMethod: 'auto' | 'manual';
}

export class AutoAssignmentService {
  /**
   * Automatically assign a ticket to the best available technician
   */
  static async assignTicket(
    ticketId: number,
    criteria: AssignmentCriteria,
    assignedByUserId?: number
  ): Promise<AssignmentResult> {
    try {
      // Get applicable auto-assignment rules
      const rules = await this.getApplicableRules(criteria);
      
      if (rules.length === 0) {
        return {
          success: false,
          reason: 'No applicable auto-assignment rules found',
          assignmentMethod: 'auto'
        };
      }

      // Try each rule in priority order
      for (const rule of rules) {
        const assignmentResult = await this.tryAssignWithRule(ticketId, rule, criteria, assignedByUserId);
        if (assignmentResult.success) {
          return assignmentResult;
        }
      }

      return {
        success: false,
        reason: 'No available technicians match the criteria',
        assignmentMethod: 'auto'
      };

    } catch (error) {
      console.error('Auto-assignment error:', error);
      return {
        success: false,
        reason: `Auto-assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        assignmentMethod: 'auto'
      };
    }
  }

  /**
   * Get auto-assignment rules that match the given criteria
   */
  private static async getApplicableRules(criteria: AssignmentCriteria) {
    return await prisma.autoAssignmentRule.findMany({
      where: {
        isActive: true,
        AND: [
          criteria.templateId ? { templateId: criteria.templateId } : {},
          criteria.departmentId ? { departmentId: criteria.departmentId } : {},
          criteria.priority ? { priority_level: criteria.priority } : {},
          criteria.requiredSkill ? { requiredSkill: criteria.requiredSkill } : {}
        ]
      },
      orderBy: {
        priority: 'desc' // Higher priority first
      },
      include: {
        template: true,
        department: true
      }
    });
  }

  /**
   * Try to assign ticket using a specific rule
   */
  private static async tryAssignWithRule(
    ticketId: number,
    rule: any,
    criteria: AssignmentCriteria,
    assignedByUserId?: number
  ): Promise<AssignmentResult> {
    let candidateTechnicians: any[] = [];

    switch (rule.assignmentStrategy) {
      case 'skill_match':
        candidateTechnicians = await this.getTechniciansBySkill(
          rule.requiredSkill || criteria.requiredSkill,
          rule.departmentId || criteria.departmentId
        );
        break;
      case 'round_robin':
        candidateTechnicians = await this.getTechniciansRoundRobin(
          rule.departmentId || criteria.departmentId
        );
        break;
      case 'least_loaded':
        candidateTechnicians = await this.getTechniciansLeastLoaded(
          rule.departmentId || criteria.departmentId
        );
        break;
      default:
        candidateTechnicians = await this.getTechniciansBySkill(
          rule.requiredSkill || criteria.requiredSkill,
          rule.departmentId || criteria.departmentId
        );
    }

    // Filter by capacity if rule requires it
    if (rule.respectCapacity) {
      candidateTechnicians = candidateTechnicians.filter(tech => {
        const loadPercentage = (tech.currentWorkload / tech.workloadCapacity) * 100;
        return loadPercentage < rule.maxWorkloadPercent;
      });
    }

    // Filter only available technicians
    candidateTechnicians = candidateTechnicians.filter(tech => tech.isAvailable);

    if (candidateTechnicians.length === 0) {
      return {
        success: false,
        reason: `No available technicians found for rule: ${rule.name}`,
        assignmentMethod: 'auto'
      };
    }

    // Select the best candidate (first one for now, can add more sophisticated logic)
    const selectedTechnician = candidateTechnicians[0];

    // Perform the assignment
    const result = await this.performAssignment(
      ticketId,
      selectedTechnician.id,
      rule.id,
      `Auto-assigned via rule: ${rule.name}`,
      assignedByUserId
    );

    return {
      success: true,
      assignedUserId: selectedTechnician.id,
      assignmentRuleId: rule.id,
      reason: `Assigned to ${selectedTechnician.username} via rule: ${rule.name}`,
      assignmentMethod: 'auto'
    };
  }

  /**
   * Get technicians by skill match
   */
  private static async getTechniciansBySkill(requiredSkill?: string, departmentId?: number) {
    if (!requiredSkill) {
      return await this.getAllAvailableTechnicians(departmentId);
    }

    return await prisma.user.findMany({
      where: {
        role: 'technician',
        isAvailable: true,
        ...(departmentId && { departmentId }),
        OR: [
          { primarySkill: requiredSkill },
          { secondarySkills: { contains: requiredSkill } }
        ]
      },
      orderBy: [
        { experienceLevel: 'desc' }, // Senior technicians first
        { currentWorkload: 'asc' }   // Less loaded first
      ]
    });
  }

  /**
   * Get technicians using round-robin strategy
   */
  private static async getTechniciansRoundRobin(departmentId?: number) {
    // For round-robin, we get all technicians and can implement
    // round-robin logic based on last assignment time
    return await prisma.user.findMany({
      where: {
        role: 'technician',
        isAvailable: true,
        ...(departmentId && { departmentId })
      },
      include: {
        assignmentLogsAsAssignee: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { currentWorkload: 'asc' }
      ]
    });
  }

  /**
   * Get technicians by least loaded strategy
   */
  private static async getTechniciansLeastLoaded(departmentId?: number) {
    return await prisma.user.findMany({
      where: {
        role: 'technician',
        isAvailable: true,
        ...(departmentId && { departmentId })
      },
      orderBy: [
        { currentWorkload: 'asc' },  // Least loaded first
        { experienceLevel: 'desc' }  // Senior among equals
      ]
    });
  }

  /**
   * Get all available technicians as fallback
   */
  private static async getAllAvailableTechnicians(departmentId?: number) {
    return await prisma.user.findMany({
      where: {
        role: 'technician',
        isAvailable: true,
        ...(departmentId && { departmentId })
      },
      orderBy: [
        { currentWorkload: 'asc' },
        { experienceLevel: 'desc' }
      ]
    });
  }

  /**
   * Perform the actual assignment in the database
   */
  private static async performAssignment(
    ticketId: number,
    assignedToUserId: number,
    assignmentRuleId?: number,
    assignmentReason?: string,
    assignedByUserId?: number
  ) {
    return await prisma.$transaction(async (tx) => {
      // Update ticket assignment
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          assignedToUserId,
          status: 'assigned'
        }
      });

      // Increment technician workload
      await tx.user.update({
        where: { id: assignedToUserId },
        data: {
          currentWorkload: {
            increment: 1
          }
        }
      });

      // Log the assignment
      await tx.ticketAssignmentLog.create({
        data: {
          ticketId,
          assignedToUserId,
          assignmentRuleId,
          assignmentMethod: 'auto',
          assignmentReason,
          assignedByUserId
        }
      });

      return { success: true };
    });
  }

  /**
   * Manual assignment (for comparison/fallback)
   */
  static async manualAssignment(
    ticketId: number,
    assignedToUserId: number,
    assignedByUserId: number,
    reason?: string
  ): Promise<AssignmentResult> {
    try {
      await this.performAssignment(
        ticketId,
        assignedToUserId,
        undefined,
        reason || 'Manual assignment',
        assignedByUserId
      );

      return {
        success: true,
        assignedUserId: assignedToUserId,
        reason: 'Manual assignment completed',
        assignmentMethod: 'manual'
      };
    } catch (error) {
      console.error('Manual assignment error:', error);
      return {
        success: false,
        reason: `Manual assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        assignmentMethod: 'manual'
      };
    }
  }

  /**
   * Update technician availability
   */
  static async updateTechnicianAvailability(userId: number, isAvailable: boolean) {
    return await prisma.user.update({
      where: { id: userId, role: 'technician' },
      data: { isAvailable }
    });
  }

  /**
   * Get assignment analytics
   */
  static async getAssignmentAnalytics(departmentId?: number, startDate?: Date, endDate?: Date) {
    const whereClause: any = {};
    
    if (departmentId) {
      whereClause.assignedToUser = {
        departmentId
      };
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const [autoAssignments, manualAssignments, totalAssignments] = await Promise.all([
      prisma.ticketAssignmentLog.count({
        where: { ...whereClause, assignmentMethod: 'auto' }
      }),
      prisma.ticketAssignmentLog.count({
        where: { ...whereClause, assignmentMethod: 'manual' }
      }),
      prisma.ticketAssignmentLog.count({
        where: whereClause
      })
    ]);

    const autoAssignmentRate = totalAssignments > 0 ? (autoAssignments / totalAssignments) * 100 : 0;

    return {
      autoAssignments,
      manualAssignments,
      totalAssignments,
      autoAssignmentRate: Math.round(autoAssignmentRate * 100) / 100
    };
  }
}

export default AutoAssignmentService;