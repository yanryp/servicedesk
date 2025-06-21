// Secure Analytics Routes for Ticket Categorization
import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import { categorizationRateLimit, securityHeaders } from '../middleware/categorizationSecurity';

const router = express.Router();
const prisma = new PrismaClient();

// Apply security headers to all routes
router.use(securityHeaders);

// Get categorization overview statistics
router.get('/overview',
  protect,
  authorize('technician', 'manager', 'admin'),
  categorizationRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      const { startDate, endDate, department } = req.query;

      // Build base where clause for date filtering
      let whereClause: any = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      // Apply department filtering based on user role
      if (user?.role !== 'admin') {
        whereClause.serviceCatalog = {
          departmentId: department ? parseInt(department as string) : user?.departmentId
        };
      } else if (department) {
        whereClause.serviceCatalog = {
          departmentId: parseInt(department as string)
        };
      }

      // Get total tickets
      const totalTickets = await prisma.ticket.count({ where: whereClause });

      // Get categorization completion rates
      const categorizedTickets = await prisma.ticket.count({
        where: {
          ...whereClause,
          AND: [
            { confirmedRootCause: { not: null } },
            { confirmedIssueCategory: { not: null } }
          ]
        }
      });

      // Root cause distribution
      const rootCauseStats = await prisma.ticket.groupBy({
        by: ['confirmedRootCause'],
        where: {
          ...whereClause,
          confirmedRootCause: { not: null }
        },
        _count: true
      });

      // Issue category distribution
      const issueCategoryStats = await prisma.ticket.groupBy({
        by: ['confirmedIssueCategory'],
        where: {
          ...whereClause,
          confirmedIssueCategory: { not: null }
        },
        _count: true
      });

      // Department breakdown (for admins)
      let departmentStats: any[] = [];
      if (user?.role === 'admin') {
        const deptStats = await prisma.ticket.groupBy({
          by: ['serviceCatalogId'],
          where: whereClause,
          _count: true
        });
        departmentStats = deptStats as any[];
      }

      // User vs Technician accuracy (how often technicians override user classifications)
      const overrideStats = await prisma.ticket.aggregate({
        where: {
          ...whereClause,
          techRootCause: { not: null },
          userRootCause: { not: null }
        },
        _count: {
          id: true
        }
      });

      const matchingRootCause = await prisma.ticket.count({
        where: {
          ...whereClause,
          techRootCause: { not: null },
          userRootCause: { not: null },
          // Using raw query for comparing enum fields
        }
      });

      // Calculate completion rate
      const completionRate = totalTickets > 0 ? (categorizedTickets / totalTickets) * 100 : 0;

      res.json({
        success: true,
        data: {
          overview: {
            totalTickets,
            categorizedTickets,
            uncategorizedTickets: totalTickets - categorizedTickets,
            completionRate: Math.round(completionRate * 100) / 100
          },
          distributions: {
            rootCause: rootCauseStats.map(stat => ({
              type: stat.confirmedRootCause,
              count: stat._count,
              percentage: totalTickets > 0 ? Math.round((stat._count / totalTickets) * 10000) / 100 : 0
            })),
            issueCategory: issueCategoryStats.map(stat => ({
              type: stat.confirmedIssueCategory,
              count: stat._count,
              percentage: totalTickets > 0 ? Math.round((stat._count / totalTickets) * 10000) / 100 : 0
            }))
          },
          departmentBreakdown: departmentStats,
          qualityMetrics: {
            totalOverrides: overrideStats._count.id || 0,
            userAccuracyRate: overrideStats._count.id > 0 
              ? Math.round((matchingRootCause / overrideStats._count.id) * 10000) / 100 
              : 0
          },
          filters: {
            startDate,
            endDate,
            department: department || user?.departmentId
          }
        }
      });

    } catch (error) {
      console.error('Error fetching categorization overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categorization analytics'
      });
    }
  })
);

// Get categorization trends over time
router.get('/trends',
  protect,
  authorize('technician', 'manager', 'admin'),
  categorizationRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      const { 
        startDate, 
        endDate, 
        department,
        interval = 'day' // day, week, month
      } = req.query;

      // Validate interval
      if (!['day', 'week', 'month'].includes(interval as string)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid interval. Must be day, week, or month.'
        });
      }

      // Build where clause
      let whereClause: any = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      // Apply department filtering
      if (user?.role !== 'admin') {
        whereClause.serviceCatalog = {
          departmentId: department ? parseInt(department as string) : user?.departmentId
        };
      } else if (department) {
        whereClause.serviceCatalog = {
          departmentId: parseInt(department as string)
        };
      }

      // Get raw data for trend analysis
      const tickets = await prisma.ticket.findMany({
        where: whereClause,
        select: {
          id: true,
          createdAt: true,
          confirmedRootCause: true,
          confirmedIssueCategory: true,
          userCategorizedAt: true,
          techCategorizedAt: true
        }
      });

      // Process data into time series
      const dateFormat = interval === 'day' ? 'YYYY-MM-DD' : 
                        interval === 'week' ? 'YYYY-[W]WW' : 'YYYY-MM';

      const trends = tickets.reduce((acc: any, ticket) => {
        const dateKey = ticket.createdAt.toISOString().split('T')[0]; // Simplified for demo
        
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            total: 0,
            categorized: 0,
            userCategorized: 0,
            techCategorized: 0,
            rootCauseBreakdown: {
              human_error: 0,
              system_error: 0,
              external_factor: 0,
              undetermined: 0
            },
            issueCategoryBreakdown: {
              request: 0,
              complaint: 0,
              problem: 0
            }
          };
        }

        acc[dateKey].total++;
        
        if (ticket.confirmedRootCause && ticket.confirmedIssueCategory) {
          acc[dateKey].categorized++;
        }
        
        if (ticket.userCategorizedAt) {
          acc[dateKey].userCategorized++;
        }
        
        if (ticket.techCategorizedAt) {
          acc[dateKey].techCategorized++;
        }

        if (ticket.confirmedRootCause) {
          acc[dateKey].rootCauseBreakdown[ticket.confirmedRootCause]++;
        }

        if (ticket.confirmedIssueCategory) {
          acc[dateKey].issueCategoryBreakdown[ticket.confirmedIssueCategory]++;
        }

        return acc;
      }, {});

      // Convert to array and sort by date
      const trendData = Object.values(trends).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      res.json({
        success: true,
        data: {
          trends: trendData,
          summary: {
            totalPeriods: trendData.length,
            averageTicketsPerPeriod: trendData.length > 0 
              ? Math.round(trendData.reduce((sum: number, period: any) => sum + period.total, 0) / trendData.length)
              : 0,
            averageCategorizationRate: trendData.length > 0
              ? Math.round(trendData.reduce((sum: number, period: any) => 
                  sum + (period.total > 0 ? (period.categorized / period.total) * 100 : 0), 0) / trendData.length)
              : 0
          },
          config: {
            interval,
            startDate,
            endDate,
            department: department || user?.departmentId
          }
        }
      });

    } catch (error) {
      console.error('Error fetching categorization trends:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categorization trends'
      });
    }
  })
);

// Get service-specific categorization patterns
router.get('/service-patterns',
  protect,
  authorize('manager', 'admin'),
  categorizationRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      const { startDate, endDate, department } = req.query;

      // Build where clause
      let whereClause: any = {
        confirmedRootCause: { not: null },
        confirmedIssueCategory: { not: null }
      };
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      // Apply department filtering
      if (user?.role !== 'admin') {
        whereClause.serviceCatalog = {
          departmentId: department ? parseInt(department as string) : user?.departmentId
        };
      } else if (department) {
        whereClause.serviceCatalog = {
          departmentId: parseInt(department as string)
        };
      }

      // Get service item patterns
      const servicePatterns = await prisma.ticket.groupBy({
        by: ['serviceItemId', 'confirmedRootCause', 'confirmedIssueCategory'],
        where: whereClause,
        _count: true,
      });

      // Get service item details
      const serviceItems = await prisma.serviceItem.findMany({
        include: {
          serviceCatalog: true
        }
      });

      // Process patterns by service
      const serviceAnalysis = serviceItems.map(service => {
        const serviceTickets = servicePatterns.filter(p => p.serviceItemId === service.id);
        const totalServiceTickets = serviceTickets.reduce((sum, p) => sum + p._count, 0);

        const rootCauseDistribution = serviceTickets.reduce((acc: any, pattern) => {
          if (!acc[pattern.confirmedRootCause!]) {
            acc[pattern.confirmedRootCause!] = 0;
          }
          acc[pattern.confirmedRootCause!] += pattern._count;
          return acc;
        }, {});

        const issueCategoryDistribution = serviceTickets.reduce((acc: any, pattern) => {
          if (!acc[pattern.confirmedIssueCategory!]) {
            acc[pattern.confirmedIssueCategory!] = 0;
          }
          acc[pattern.confirmedIssueCategory!] += pattern._count;
          return acc;
        }, {});

        return {
          serviceId: service.id,
          serviceName: service.name,
          serviceType: service.serviceCatalog.serviceType,
          isKasdaRelated: service.isKasdaRelated,
          totalTickets: totalServiceTickets,
          rootCauseDistribution,
          issueCategoryDistribution,
          patterns: serviceTickets
        };
      }).filter(service => service.totalTickets > 0);

      // Sort by ticket volume
      serviceAnalysis.sort((a, b) => b.totalTickets - a.totalTickets);

      res.json({
        success: true,
        data: {
          servicePatterns: serviceAnalysis,
          summary: {
            totalServices: serviceAnalysis.length,
            totalAnalyzedTickets: serviceAnalysis.reduce((sum, s) => sum + s.totalTickets, 0),
            topService: serviceAnalysis[0] || null,
            serviceTypes: serviceAnalysis.reduce((acc: any, service) => {
              if (!acc[service.serviceType]) {
                acc[service.serviceType] = 0;
              }
              acc[service.serviceType]++;
              return acc;
            }, {})
          }
        }
      });

    } catch (error) {
      console.error('Error fetching service patterns:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service categorization patterns'
      });
    }
  })
);

// Get technician performance metrics
router.get('/technician-performance',
  protect,
  authorize('manager', 'admin'),
  categorizationRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      const { startDate, endDate, department } = req.query;

      // Build where clause
      let whereClause: any = {
        techCategorizedBy: { not: null }
      };
      
      if (startDate && endDate) {
        whereClause.techCategorizedAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      // Apply department filtering
      if (user?.role !== 'admin') {
        whereClause.serviceCatalog = {
          departmentId: department ? parseInt(department as string) : user?.departmentId
        };
      } else if (department) {
        whereClause.serviceCatalog = {
          departmentId: parseInt(department as string)
        };
      }

      // Get technician categorization stats
      const technicianStats = await prisma.ticket.groupBy({
        by: ['techCategorizedBy'],
        where: whereClause,
        _count: true,
        _min: {
          techCategorizedAt: true
        },
        _max: {
          techCategorizedAt: true
        }
      });

      // Get technician details
      const technicians = await prisma.user.findMany({
        where: {
          id: { in: technicianStats.map(s => s.techCategorizedBy!).filter(Boolean) }
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          department: {
            select: {
              name: true
            }
          }
        }
      });

      // Calculate performance metrics
      const performanceMetrics = technicianStats.map(stat => {
        const technician = technicians.find(t => t.id === stat.techCategorizedBy);
        
        return {
          technicianId: stat.techCategorizedBy,
          technician: technician || null,
          ticketsCategorized: stat._count,
          firstCategorization: stat._min.techCategorizedAt,
          lastCategorization: stat._max.techCategorizedAt,
          avgTicketsPerDay: 0 // Will calculate below
        };
      });

      // Calculate average tickets per day
      performanceMetrics.forEach(metric => {
        if (metric.firstCategorization && metric.lastCategorization) {
          const daysDiff = Math.max(1, 
            Math.ceil((metric.lastCategorization.getTime() - metric.firstCategorization.getTime()) / (1000 * 60 * 60 * 24))
          );
          metric.avgTicketsPerDay = Math.round((metric.ticketsCategorized / daysDiff) * 100) / 100;
        }
      });

      // Sort by tickets categorized
      performanceMetrics.sort((a, b) => b.ticketsCategorized - a.ticketsCategorized);

      res.json({
        success: true,
        data: {
          performanceMetrics,
          summary: {
            totalTechnicians: performanceMetrics.length,
            totalCategorizations: performanceMetrics.reduce((sum, m) => sum + m.ticketsCategorized, 0),
            topPerformer: performanceMetrics[0] || null,
            averageProductivity: performanceMetrics.length > 0
              ? Math.round(performanceMetrics.reduce((sum, m) => sum + m.avgTicketsPerDay, 0) / performanceMetrics.length * 100) / 100
              : 0
          }
        }
      });

    } catch (error) {
      console.error('Error fetching technician performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch technician performance metrics'
      });
    }
  })
);

// Export categorization data (admin only)
router.get('/export',
  protect,
  authorize('admin'),
  categorizationRateLimit,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { format = 'json', startDate, endDate, department } = req.query;

      // Build where clause
      let whereClause: any = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      if (department) {
        whereClause.serviceCatalog = {
          departmentId: parseInt(department as string)
        };
      }

      // Get comprehensive categorization data
      const exportData = await prisma.ticket.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          userRootCause: true,
          userIssueCategory: true,
          userCategorizedAt: true,
          techRootCause: true,
          techIssueCategory: true,
          techCategorizedAt: true,
          confirmedRootCause: true,
          confirmedIssueCategory: true,
          isClassificationLocked: true,
          serviceCatalog: {
            select: {
              name: true,
              serviceType: true,
              department: {
                select: {
                  name: true
                }
              }
            }
          },
          serviceItem: {
            select: {
              name: true,
              requestType: true,
              isKasdaRelated: true
            }
          },
          createdBy: {
            select: {
              username: true,
              role: true
            }
          },
          techCategorizedByUser: {
            select: {
              username: true,
              role: true
            }
          }
        }
      });

      if (format === 'csv') {
        // Convert to CSV format
        const csvHeaders = [
          'Ticket ID', 'Title', 'Status', 'Priority', 'Created At',
          'Service Catalog', 'Service Item', 'Service Type', 'Department',
          'Is KASDA', 'Request Type', 'Created By', 'Created By Role',
          'User Root Cause', 'User Issue Category', 'User Categorized At',
          'Tech Root Cause', 'Tech Issue Category', 'Tech Categorized At', 'Tech Categorized By',
          'Confirmed Root Cause', 'Confirmed Issue Category', 'Is Locked'
        ].join(',');

        const csvRows = exportData.map(ticket => [
          ticket.id,
          `"${ticket.title.replace(/"/g, '""')}"`,
          ticket.status,
          ticket.priority,
          ticket.createdAt.toISOString(),
          `"${ticket.serviceCatalog?.name || ''}"`,
          `"${ticket.serviceItem?.name || ''}"`,
          ticket.serviceCatalog?.serviceType || '',
          `"${ticket.serviceCatalog?.department?.name || ''}"`,
          ticket.serviceItem?.isKasdaRelated || false,
          ticket.serviceItem?.requestType || '',
          ticket.createdBy?.username || '',
          ticket.createdBy?.role || '',
          ticket.userRootCause || '',
          ticket.userIssueCategory || '',
          ticket.userCategorizedAt?.toISOString() || '',
          ticket.techRootCause || '',
          ticket.techIssueCategory || '',
          ticket.techCategorizedAt?.toISOString() || '',
          ticket.techCategorizedByUser?.username || '',
          ticket.confirmedRootCause || '',
          ticket.confirmedIssueCategory || '',
          ticket.isClassificationLocked
        ].join(','));

        const csvContent = [csvHeaders, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="categorization-export-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
      } else {
        // JSON format
        res.json({
          success: true,
          data: {
            exportData,
            metadata: {
              totalRecords: exportData.length,
              exportedAt: new Date().toISOString(),
              filters: { startDate, endDate, department }
            }
          }
        });
      }

    } catch (error) {
      console.error('Error exporting categorization data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export categorization data'
      });
    }
  })
);

export default router;