import { PrismaClient, ticket_priority } from '@prisma/client';
import { calculateSLADueDate } from '../utils/slaCalculator';

const prisma = new PrismaClient();

export interface SLAPolicyContext {
  priority: string;
  departmentId?: number;
  serviceCatalogId?: number;
  serviceItemId?: number;
  createdByUserId: number;
  isKasdaTicket?: boolean;
  requestType?: string;
}

export interface SLAResult {
  policy: any;
  dueDate: Date;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  businessHoursOnly: boolean;
  source: 'policy' | 'fallback';
}

/**
 * Advanced SLA Policy Resolution Service
 * Finds the most specific applicable SLA policy and calculates due dates
 */
export class SLAPolicyService {
  
  /**
   * Find the most applicable SLA policy for a ticket
   * Priority order: Service Item > Service Catalog > Department + Priority > Priority > Department > Global
   */
  async findApplicablePolicy(context: SLAPolicyContext): Promise<any> {
    const policies = await prisma.slaPolicy.findMany({
      where: {
        isActive: true,
        OR: [
          // Exact service item match with priority
          {
            serviceItemId: context.serviceItemId,
            priority: context.priority as ticket_priority
          },
          // Service item match without priority
          {
            serviceItemId: context.serviceItemId,
            priority: null
          },
          // Service catalog match with priority
          {
            serviceCatalogId: context.serviceCatalogId,
            serviceItemId: null,
            priority: context.priority as ticket_priority
          },
          // Service catalog match without priority
          {
            serviceCatalogId: context.serviceCatalogId,
            serviceItemId: null,
            priority: null
          },
          // Department + Priority match
          {
            departmentId: context.departmentId,
            serviceCatalogId: null,
            serviceItemId: null,
            priority: context.priority as ticket_priority
          },
          // Department only match
          {
            departmentId: context.departmentId,
            serviceCatalogId: null,
            serviceItemId: null,
            priority: null
          },
          // Priority only match
          {
            departmentId: null,
            serviceCatalogId: null,
            serviceItemId: null,
            priority: context.priority as ticket_priority
          },
          // Global policy (fallback)
          {
            departmentId: null,
            serviceCatalogId: null,
            serviceItemId: null,
            priority: null
          }
        ]
      },
      orderBy: [
        // Most specific first
        { serviceItemId: { sort: 'desc', nulls: 'last' } },
        { serviceCatalogId: { sort: 'desc', nulls: 'last' } },
        { departmentId: { sort: 'desc', nulls: 'last' } },
        { priority: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' }
      ],
      include: {
        serviceCatalog: { select: { name: true } },
        serviceItem: { select: { name: true } },
        department: { select: { name: true } }
      }
    });

    return policies[0] || null;
  }

  /**
   * Calculate SLA due date using policy or fallback rules
   */
  async calculateSLAForTicket(context: SLAPolicyContext): Promise<SLAResult> {
    // Try to find an applicable policy
    const policy = await this.findApplicablePolicy(context);
    
    if (policy) {
      // Use policy-based calculation
      const dueDate = await calculateSLADueDate(
        new Date(), 
        policy.resolutionTimeMinutes,
        {
          departmentId: context.departmentId,
          businessHoursOnly: policy.businessHoursOnly
        }
      );

      return {
        policy,
        dueDate: dueDate.dueDate,
        responseTimeMinutes: policy.responseTimeMinutes,
        resolutionTimeMinutes: policy.resolutionTimeMinutes,
        businessHoursOnly: policy.businessHoursOnly,
        source: 'policy'
      };
    } else {
      // Fall back to hardcoded rules
      const fallbackSLA = this.getFallbackSLA(context);
      const dueDate = new Date(Date.now() + (fallbackSLA.resolutionTimeMinutes * 60 * 1000));

      return {
        policy: null,
        dueDate,
        responseTimeMinutes: fallbackSLA.responseTimeMinutes,
        resolutionTimeMinutes: fallbackSLA.resolutionTimeMinutes,
        businessHoursOnly: false,
        source: 'fallback'
      };
    }
  }

  /**
   * Fallback SLA rules (enhanced version of original hardcoded logic)
   */
  private getFallbackSLA(context: SLAPolicyContext): { responseTimeMinutes: number; resolutionTimeMinutes: number } {
    const isGovernmentTicket = context.isKasdaTicket;
    let responseMinutes = 60; // Default 1 hour
    let resolutionMinutes = 480; // Default 8 hours

    if (isGovernmentTicket) {
      // Government/KASDA tickets have longer SLAs
      switch (context.priority) {
        case 'urgent':
          responseMinutes = 240; // 4 hours
          resolutionMinutes = 480; // 8 hours
          break;
        case 'high':
          responseMinutes = 480; // 8 hours
          resolutionMinutes = 1440; // 1 day
          break;
        case 'medium':
          responseMinutes = 720; // 12 hours
          resolutionMinutes = 2880; // 2 days
          break;
        case 'low':
          responseMinutes = 1440; // 1 day
          resolutionMinutes = 4320; // 3 days
          break;
      }
    } else {
      // Technical services have faster SLAs
      switch (context.priority) {
        case 'urgent':
          responseMinutes = 15; // 15 minutes
          resolutionMinutes = 120; // 2 hours
          break;
        case 'high':
          responseMinutes = 60; // 1 hour
          resolutionMinutes = 240; // 4 hours
          break;
        case 'medium':
          responseMinutes = 120; // 2 hours
          resolutionMinutes = 480; // 8 hours
          break;
        case 'low':
          responseMinutes = 240; // 4 hours
          resolutionMinutes = 1440; // 24 hours
          break;
      }
    }

    return { responseTimeMinutes: responseMinutes, resolutionTimeMinutes: resolutionMinutes };
  }

  /**
   * Get user's department for SLA context
   */
  async getUserDepartment(userId: number): Promise<number | undefined> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true }
    });
    return user?.departmentId || undefined;
  }

  /**
   * Calculate remaining SLA time for an existing ticket
   */
  async calculateRemainingTime(ticketId: number): Promise<any> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        slaDueDate: true,
        status: true,
        resolvedAt: true
      }
    });

    if (!ticket || !ticket.slaDueDate) {
      return null;
    }

    const now = new Date();
    const dueDate = new Date(ticket.slaDueDate);
    const remainingMs = dueDate.getTime() - now.getTime();
    const remainingMinutes = Math.max(0, Math.ceil(remainingMs / (60 * 1000)));

    return {
      dueDate: ticket.slaDueDate,
      remainingMinutes,
      remainingHours: Math.ceil(remainingMinutes / 60),
      isOverdue: remainingMs < 0,
      status: ticket.status,
      isResolved: !!ticket.resolvedAt
    };
  }
}

export const slaPolicyService = new SLAPolicyService();