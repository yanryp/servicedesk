// Secure Ticket Categorization Routes
import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import {
  categorizationRateLimit,
  bulkCategorizationRateLimit,
  validateCategorization,
  validateBulkCategorization,
  canCategorize,
  validateCategorizationRules,
  logClassificationChange,
  securityHeaders
} from '../middleware/categorizationSecurity';

const router = express.Router();
const prisma = new PrismaClient();

// Apply security headers to all routes
router.use(securityHeaders);

// Get categorization suggestions based on service type
router.get('/suggestions/:itemId', 
  protect, 
  categorizationRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { itemId } = req.params;
      
      const item = await prisma.item.findUnique({
        where: { id: parseInt(itemId) },
        include: {
          subCategory: {
            include: {
              category: {
                include: {
                  department: true
                }
              }
            }
          }
        }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Generate intelligent suggestions based on category and item type
      let suggestedIssueCategory = 'request'; // Default
      let suggestedRootCause = 'undetermined'; // Default

      // KASDA-related items are typically requests
      const isKasdaRelated = item.subCategory?.category?.name === 'KASDA' || 
                            item.subCategory?.category?.name === 'KASDA Support' ||
                            item.subCategory?.category?.name === 'BSGDirect Support';

      if (isKasdaRelated) {
        suggestedIssueCategory = 'request';
        if (item.name.toLowerCase().includes('user') || item.name.toLowerCase().includes('account')) {
          suggestedRootCause = 'human_error';
        }
      }

      // Technical categories often involve problems
      const technicalCategories = ['Error Surrounding', 'Error User Aplikasi', 'Hardware & Infrastructure', 'Network Issues'];
      if (technicalCategories.includes(item.subCategory?.category?.name || '')) {
        suggestedIssueCategory = 'problem';
        suggestedRootCause = 'system_error';
      }

      // Service-specific suggestions
      if (item.name.toLowerCase().includes('password') || item.name.toLowerCase().includes('reset')) {
        suggestedRootCause = 'human_error';
      }

      if (item.name.toLowerCase().includes('error') || item.name.toLowerCase().includes('gangguan')) {
        suggestedIssueCategory = 'problem';
        suggestedRootCause = 'system_error';
      }

      res.json({
        success: true,
        data: {
          item: {
            id: item.id,
            name: item.name,
            categoryName: item.subCategory?.category?.name,
            subcategoryName: item.subCategory?.name,
            departmentName: item.subCategory?.category?.department?.name,
            isKasdaRelated
          },
          suggestions: {
            issueCategory: suggestedIssueCategory,
            rootCause: suggestedRootCause,
            confidence: 'medium' // Could be enhanced with ML in future
          },
          options: {
            issueCategories: [
              { value: 'request', label: 'Service Request', description: 'Need new service or changes to existing service' },
              { value: 'complaint', label: 'Service Complaint', description: 'Dissatisfied with service quality or delivery' },
              { value: 'problem', label: 'Technical Problem', description: 'Something is broken or not working properly' }
            ],
            rootCauses: [
              { value: 'human_error', label: 'User/Process Error', description: 'Wrong procedure, user mistake, or process issue' },
              { value: 'system_error', label: 'Technical/System Error', description: 'Software bug, hardware failure, or system issue' },
              { value: 'external_factor', label: 'External Issue', description: 'Vendor, network, or environmental factors' },
              { value: 'undetermined', label: 'Needs Investigation', description: 'Root cause requires further analysis' }
            ]
          }
        }
      });

    } catch (error) {
      console.error('Error fetching categorization suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categorization suggestions'
      });
    }
  })
);

// Update ticket categorization (user or technician)
router.put('/:ticketId', 
  protect,
  categorizationRateLimit,
  validateCategorization,
  canCategorize,
  validateCategorizationRules,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      const { ticketId } = req.params;
      const { rootCause, issueCategory, overrideReason, reason } = req.body;
      const ticket = (req as any).ticket;

      const currentTime = new Date();
      const clientIP = req.ip || req.connection.remoteAddress;

      // Determine if this is a user or technician categorization
      const isTechnician = ['technician', 'manager', 'admin'].includes(user?.role || '');
      const isUser = user?.id === ticket.createdByUserId;

      let updateData: any = {};
      const auditPromises: Promise<any>[] = [];

      if (isTechnician) {
        // Technician categorization (overrides user categorization)
        if (rootCause !== undefined) {
          auditPromises.push(
            logClassificationChange(
              ticket.id,
              user!.id,
              'tech_root_cause',
              ticket.techRootCause,
              rootCause,
              overrideReason || reason,
              req
            )
          );
          updateData.techRootCause = rootCause;
          updateData.confirmedRootCause = rootCause;
        }

        if (issueCategory !== undefined) {
          auditPromises.push(
            logClassificationChange(
              ticket.id,
              user!.id,
              'tech_issue_category',
              ticket.techIssueCategory,
              issueCategory,
              overrideReason || reason,
              req
            )
          );
          updateData.techIssueCategory = issueCategory;
          updateData.confirmedIssueCategory = issueCategory;
        }

        updateData.techCategorizedAt = currentTime;
        updateData.techCategorizedBy = user!.id;
        updateData.techOverrideReason = overrideReason || reason;

      } else if (isUser || user?.isBusinessReviewer) {
        // User categorization (initial classification)
        if (rootCause !== undefined) {
          auditPromises.push(
            logClassificationChange(
              ticket.id,
              user!.id,
              'user_root_cause',
              ticket.userRootCause,
              rootCause,
              reason,
              req
            )
          );
          updateData.userRootCause = rootCause;
          // Set as confirmed if no technician has categorized yet
          if (!ticket.techRootCause) {
            updateData.confirmedRootCause = rootCause;
          }
        }

        if (issueCategory !== undefined) {
          auditPromises.push(
            logClassificationChange(
              ticket.id,
              user!.id,
              'user_issue_category',
              ticket.userIssueCategory,
              issueCategory,
              reason,
              req
            )
          );
          updateData.userIssueCategory = issueCategory;
          // Set as confirmed if no technician has categorized yet
          if (!ticket.techIssueCategory) {
            updateData.confirmedIssueCategory = issueCategory;
          }
        }

        updateData.userCategorizedAt = currentTime;
        updateData.userCategorizedIP = clientIP;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only categorize your own tickets or tickets in your department.'
        });
      }

      // Update ticket with new categorization
      const updatedTicket = await prisma.ticket.update({
        where: { id: parseInt(ticketId) },
        data: updateData,
        include: {
          serviceCatalog: {
            include: {
              department: true
            }
          },
          serviceItem: true,
          techCategorizedByUser: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          },
          classificationAudit: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  role: true
                }
              }
            }
          }
        }
      });

      // Execute audit logging
      await Promise.all(auditPromises);

      res.json({
        success: true,
        message: 'Ticket categorization updated successfully',
        data: {
          ticket: updatedTicket,
          categorization: {
            userRootCause: updatedTicket.userRootCause,
            userIssueCategory: updatedTicket.userIssueCategory,
            techRootCause: updatedTicket.techRootCause,
            techIssueCategory: updatedTicket.techIssueCategory,
            confirmedRootCause: updatedTicket.confirmedRootCause,
            confirmedIssueCategory: updatedTicket.confirmedIssueCategory,
            isLocked: updatedTicket.isClassificationLocked
          },
          auditTrail: updatedTicket.classificationAudit
        }
      });

    } catch (error) {
      console.error('Error updating ticket categorization:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update ticket categorization',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  })
);

// Bulk categorization for technicians
router.post('/bulk',
  protect,
  bulkCategorizationRateLimit,
  validateBulkCategorization,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      const { ticketIds, rootCause, issueCategory, reason } = req.body;

      // Only technicians, managers, and admins can perform bulk operations
      if (!user || !['technician', 'manager', 'admin'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only technicians, managers, and admins can perform bulk categorization.'
        });
      }

      // Verify all tickets exist and user has access
      const tickets = await prisma.ticket.findMany({
        where: {
          id: { in: ticketIds },
          // Access control - user must have department access or be admin
          ...(user.role === 'admin' ? {} : {
            OR: [
              { serviceCatalog: { departmentId: user.departmentId } },
              { createdByUserId: user.id }
            ]
          })
        },
        include: {
          serviceCatalog: {
            include: {
              department: true
            }
          }
        }
      });

      if (tickets.length !== ticketIds.length) {
        return res.status(404).json({
          success: false,
          message: `Some tickets not found or access denied. Found ${tickets.length} of ${ticketIds.length} tickets.`
        });
      }

      // Check for locked tickets
      const lockedTickets = tickets.filter(t => t.isClassificationLocked);
      if (lockedTickets.length > 0 && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: `Cannot modify ${lockedTickets.length} locked tickets. Contact an administrator.`
        });
      }

      const currentTime = new Date();
      const updatePromises: Promise<any>[] = [];
      const auditPromises: Promise<any>[] = [];

      // Process each ticket
      for (const ticket of tickets) {
        // Skip locked tickets for non-admins
        if (ticket.isClassificationLocked && user.role !== 'admin') {
          continue;
        }

        const updateData: any = {
          techRootCause: rootCause,
          techIssueCategory: issueCategory,
          confirmedRootCause: rootCause,
          confirmedIssueCategory: issueCategory,
          techCategorizedAt: currentTime,
          techCategorizedBy: user.id,
          techOverrideReason: reason
        };

        updatePromises.push(
          prisma.ticket.update({
            where: { id: ticket.id },
            data: updateData
          })
        );

        // Audit logging for each change
        auditPromises.push(
          logClassificationChange(
            ticket.id,
            user.id,
            'tech_root_cause',
            ticket.techRootCause,
            rootCause,
            `BULK: ${reason}`,
            req
          )
        );

        auditPromises.push(
          logClassificationChange(
            ticket.id,
            user.id,
            'tech_issue_category',
            ticket.techIssueCategory,
            issueCategory,
            `BULK: ${reason}`,
            req
          )
        );
      }

      // Execute all updates
      await Promise.all(updatePromises);
      await Promise.all(auditPromises);

      res.json({
        success: true,
        message: `Successfully categorized ${tickets.length} tickets`,
        data: {
          processedTickets: tickets.length,
          skippedTickets: ticketIds.length - tickets.length,
          categorization: {
            rootCause,
            issueCategory,
            reason
          }
        }
      });

    } catch (error) {
      console.error('Error in bulk categorization:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk categorization',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  })
);

// Get uncategorized tickets for technicians
router.get('/uncategorized',
  protect,
  categorizationRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      const { page = 1, limit = 20, department, priority } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      let whereClause: any = {
        OR: [
          { confirmedRootCause: null },
          { confirmedIssueCategory: null }
        ],
        status: { not: 'closed' }, // Don't show closed tickets
        isClassificationLocked: false
      };

      // Role-based filtering
      if (user?.role !== 'admin' && user) {
        whereClause.OR = [
          ...(whereClause.OR || []),
          { serviceCatalog: { departmentId: user.departmentId } },
          { createdByUserId: user.id }
        ];
      }

      // Apply filters
      if (department) {
        whereClause.serviceCatalog = {
          departmentId: parseInt(department as string)
        };
      }

      if (priority) {
        whereClause.priority = priority;
      }

      const tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
          serviceCatalog: {
            include: {
              department: true
            }
          },
          serviceItem: true,
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        skip,
        take
      });

      const totalTickets = await prisma.ticket.count({ where: whereClause });
      const totalPages = Math.ceil(totalTickets / take);

      res.json({
        success: true,
        data: {
          tickets,
          pagination: {
            currentPage: parseInt(page as string),
            totalPages,
            totalTickets,
            hasNextPage: parseInt(page as string) < totalPages,
            hasPrevPage: parseInt(page as string) > 1
          },
          summary: {
            uncategorized: totalTickets,
            requiresRootCause: await prisma.ticket.count({
              where: { ...whereClause, confirmedRootCause: null }
            }),
            requiresIssueCategory: await prisma.ticket.count({
              where: { ...whereClause, confirmedIssueCategory: null }
            })
          }
        }
      });

    } catch (error) {
      console.error('Error fetching uncategorized tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch uncategorized tickets'
      });
    }
  })
);

// Lock/unlock ticket classification (admin only)
router.post('/:ticketId/lock',
  protect,
  categorizationRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      const { ticketId } = req.params;
      const { locked = true, reason } = req.body;

      // Only admins can lock/unlock classifications
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only administrators can lock/unlock ticket classifications.'
        });
      }

      const ticket = await prisma.ticket.update({
        where: { id: parseInt(ticketId) },
        data: { isClassificationLocked: locked }
      });

      // Log the lock/unlock action
      await logClassificationChange(
        ticket.id,
        user.id,
        'classification_lock',
        ticket.isClassificationLocked ? 'locked' : 'unlocked',
        locked ? 'locked' : 'unlocked',
        reason,
        req
      );

      res.json({
        success: true,
        message: `Ticket classification ${locked ? 'locked' : 'unlocked'} successfully`,
        data: {
          ticketId: ticket.id,
          isLocked: ticket.isClassificationLocked
        }
      });

    } catch (error) {
      console.error('Error locking/unlocking ticket classification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update classification lock status'
      });
    }
  })
);

export default router;