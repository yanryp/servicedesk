import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import ExcelJS from 'exceljs';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
    departmentId?: number;
    unitId?: number;
  };
}

// @route   GET /api/analytics/service-performance
// @desc    Get comprehensive service performance analytics
// @access  Private (Admin/Manager)
router.get('/service-performance', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Manager role required.'
      });
    }

    const { period = '30', category, format } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get tickets for the period with service information
    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        serviceCatalog: true,
        serviceItem: true,
        createdBy: {
          include: {
            unit: true,
            department: true
          }
        },
        bsgFieldValues: {
          include: {
            field: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Analyze by service categories
    const servicePerformance = tickets.reduce((acc: any, ticket) => {
      const serviceKey = ticket.serviceCatalog?.name || 'Unknown Service';
      const serviceType = ticket.serviceCatalog?.serviceType || 'unknown';
      
      if (!acc[serviceKey]) {
        acc[serviceKey] = {
          serviceName: serviceKey,
          serviceType: serviceType,
          totalRequests: 0,
          pendingApproval: 0,
          inProgress: 0,
          resolved: 0,
          avgResolutionTime: 0,
          branches: new Set(),
          departments: new Set(),
          applicationTypes: new Set(),
          priorities: { low: 0, medium: 0, high: 0, urgent: 0 }
        };
      }

      acc[serviceKey].totalRequests++;
      
      // Count by status
      switch (ticket.status) {
        case 'pending_approval':
          acc[serviceKey].pendingApproval++;
          break;
        case 'open':
        case 'assigned':
        case 'in_progress':
          acc[serviceKey].inProgress++;
          break;
        case 'resolved':
        case 'closed':
          acc[serviceKey].resolved++;
          break;
      }

      // Count by priority
      if (ticket.priority && acc[serviceKey].priorities[ticket.priority] !== undefined) {
        acc[serviceKey].priorities[ticket.priority]++;
      }

      // Track organizational data
      if (ticket.createdBy.unit?.name) {
        acc[serviceKey].branches.add(ticket.createdBy.unit.name);
      }
      if (ticket.createdBy.department?.name) {
        acc[serviceKey].departments.add(ticket.createdBy.department.name);
      }

      // Track application types for user management services
      const appField = ticket.bsgFieldValues.find(fv => fv.field.fieldName === 'tanggal_berlaku');
      if (appField?.fieldValue) {
        acc[serviceKey].applicationTypes.add(appField.fieldValue);
      }

      return acc;
    }, {});

    // Transform and calculate metrics
    const performanceData = Object.values(servicePerformance).map((service: any) => ({
      ...service,
      branches: Array.from(service.branches),
      departments: Array.from(service.departments),
      applicationTypes: Array.from(service.applicationTypes),
      resolutionRate: service.totalRequests > 0 ? 
        ((service.resolved / service.totalRequests) * 100).toFixed(1) : '0',
      pendingRate: service.totalRequests > 0 ? 
        ((service.pendingApproval / service.totalRequests) * 100).toFixed(1) : '0',
      avgBranchesPerService: service.branches.length,
      hasUserManagement: service.applicationTypes.length > 0
    }));

    // Sort by total requests
    performanceData.sort((a: any, b: any) => b.totalRequests - a.totalRequests);

    // Calculate overall metrics
    const totalTickets = tickets.length;
    const totalResolved = tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;
    const totalPending = tickets.filter(t => t.status === 'pending_approval').length;
    const overallResolutionRate = totalTickets > 0 ? ((totalResolved / totalTickets) * 100).toFixed(1) : '0';

    // Top performing services
    const topServices = performanceData.slice(0, 5);
    const userMgmtServices = performanceData.filter((s: any) => s.hasUserManagement);

    // Handle Excel export
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Service Performance');

      // Add title
      worksheet.mergeCells('A1:K1');
      worksheet.getCell('A1').value = `BSG Service Performance Report - Last ${days} Days`;
      worksheet.getCell('A1').font = { bold: true, size: 14 };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      // Add summary
      worksheet.getRow(3).values = [
        'Total Tickets:', totalTickets,
        'Resolution Rate:', `${overallResolutionRate}%`,
        'Active Services:', performanceData.length,
        'Generated:', new Date().toLocaleDateString()
      ];

      // Add headers
      worksheet.getRow(5).values = [
        'Service Name',
        'Type',
        'Total Requests',
        'Resolved',
        'Pending Approval',
        'In Progress',
        'Resolution Rate %',
        'Priority Breakdown',
        'Branches Count',
        'Applications',
        'User Mgmt Service'
      ];
      worksheet.getRow(5).font = { bold: true };

      // Add data
      let rowIndex = 6;
      performanceData.forEach((service: any) => {
        worksheet.getRow(rowIndex).values = [
          service.serviceName,
          service.serviceType,
          service.totalRequests,
          service.resolved,
          service.pendingApproval,
          service.inProgress,
          service.resolutionRate,
          `H:${service.priorities.high} M:${service.priorities.medium} L:${service.priorities.low}`,
          service.avgBranchesPerService,
          service.applicationTypes.join(', '),
          service.hasUserManagement ? 'Yes' : 'No'
        ];
        rowIndex++;
      });

      // Set column widths
      worksheet.columns.forEach((column, index) => {
        const widths = [25, 15, 12, 10, 12, 12, 12, 20, 12, 30, 15];
        column.width = widths[index] || 15;
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=service-performance-${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      return;
    }

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        summary: {
          totalServices: performanceData.length,
          totalTickets: totalTickets,
          overallResolutionRate: parseFloat(overallResolutionRate),
          totalPending: totalPending,
          avgTicketsPerService: (totalTickets / Math.max(performanceData.length, 1)).toFixed(1),
          userManagementServices: userMgmtServices.length
        },
        topPerformingServices: topServices,
        userManagementServices: userMgmtServices,
        allServiceMetrics: performanceData,
        filters: { period, category }
      }
    });

  } catch (error) {
    console.error('Error generating service performance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate service performance report'
    });
  }
}));

// @route   GET /api/analytics/application-analytics
// @desc    Get analytics for specific BSG applications
// @access  Private (Admin/Manager)
router.get('/application-analytics', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Manager role required.'
      });
    }

    const { period = '30', format } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get tickets with application data
    const applicationTickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
        bsgFieldValues: {
          some: {
            field: {
              fieldName: 'tanggal_berlaku' // Application name stored here
            }
          }
        }
      },
      include: {
        bsgFieldValues: {
          include: {
            field: true
          }
        },
        createdBy: {
          include: {
            unit: true,
            department: true
          }
        }
      }
    });

    // Analyze by application
    const applicationAnalytics = applicationTickets.reduce((acc: any, ticket) => {
      const fieldValues: Record<string, string> = {};
      ticket.bsgFieldValues.forEach(fv => {
        fieldValues[fv.field.fieldName] = fv.fieldValue || '';
      });

      const appName = fieldValues.tanggal_berlaku || 'Unknown';
      
      if (!acc[appName]) {
        acc[appName] = {
          applicationName: appName,
          totalRequests: 0,
          userRegistrations: 0,
          passwordResets: 0,
          accessChanges: 0,
          branches: new Set(),
          users: new Set(),
          requestTypes: new Set(),
          statuses: { pending: 0, approved: 0, resolved: 0 }
        };
      }

      acc[appName].totalRequests++;

      // Categorize request types
      const title = ticket.title.toLowerCase();
      if (title.includes('pendaftaran') || title.includes('registrasi')) {
        acc[appName].userRegistrations++;
      } else if (title.includes('password') || title.includes('reset')) {
        acc[appName].passwordResets++;
      } else if (title.includes('perubahan') || title.includes('mutasi')) {
        acc[appName].accessChanges++;
      }

      // Track organizational data
      if (ticket.createdBy.unit?.name) {
        acc[appName].branches.add(ticket.createdBy.unit.name);
      }

      // Track users
      if (fieldValues.cabang___capem) {
        acc[appName].users.add(fieldValues.cabang___capem);
      }

      // Track request types
      acc[appName].requestTypes.add(ticket.title);

      // Count statuses
      if (ticket.status === 'pending_approval') {
        acc[appName].statuses.pending++;
      } else if (['open', 'assigned', 'in_progress'].includes(ticket.status)) {
        acc[appName].statuses.approved++;
      } else if (['resolved', 'closed'].includes(ticket.status)) {
        acc[appName].statuses.resolved++;
      }

      return acc;
    }, {});

    // Transform data
    const analyticsData = Object.values(applicationAnalytics).map((app: any) => ({
      ...app,
      branches: Array.from(app.branches),
      users: Array.from(app.users),
      requestTypes: Array.from(app.requestTypes),
      uniqueUsers: app.users.size,
      branchCount: app.branches.length,
      processingRate: app.totalRequests > 0 ? 
        ((app.statuses.resolved / app.totalRequests) * 100).toFixed(1) : '0'
    }));

    // Sort by total requests
    analyticsData.sort((a: any, b: any) => b.totalRequests - a.totalRequests);

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        summary: {
          totalApplications: analyticsData.length,
          totalUserRequests: applicationTickets.length,
          totalUniqueUsers: [...new Set(applicationTickets.flatMap(t => 
            t.bsgFieldValues.filter(fv => fv.field.fieldName === 'cabang___capem').map(fv => fv.fieldValue)
          ))].filter(Boolean).length,
          mostActiveApplication: analyticsData[0]?.applicationName || 'N/A'
        },
        applicationMetrics: analyticsData,
        filters: { period }
      }
    });

  } catch (error) {
    console.error('Error generating application analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate application analytics'
    });
  }
}));

// @route   GET /api/analytics/dashboard-summary
// @desc    Get comprehensive dashboard summary for all metrics
// @access  Private (Admin/Manager)
router.get('/dashboard-summary', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Manager role required.'
      });
    }

    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all tickets for the period
    const allTickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        createdBy: {
          include: {
            unit: true,
            department: true
          }
        },
        serviceCatalog: true,
        bsgFieldValues: {
          include: {
            field: true
          }
        }
      }
    });

    // Overall statistics
    const totalTickets = allTickets.length;
    const pendingApproval = allTickets.filter(t => t.status === 'pending_approval').length;
    const inProgress = allTickets.filter(t => ['open', 'assigned', 'in_progress'].includes(t.status)).length;
    const resolved = allTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;

    // User management tickets
    const userMgmtTickets = allTickets.filter(t => 
      t.bsgFieldValues.some(fv => fv.field.fieldName === 'applicationName')
    );

    // Branch statistics
    const branchStats = allTickets.reduce((acc: any, ticket) => {
      const branchName = ticket.createdBy.unit?.name || 'Unknown';
      acc[branchName] = (acc[branchName] || 0) + 1;
      return acc;
    }, {});

    const topBranches = Object.entries(branchStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    // Service category statistics
    const categoryStats = allTickets.reduce((acc: any, ticket) => {
      const category = ticket.serviceCatalog?.name || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    // Application statistics (for user management)
    const applicationStats = userMgmtTickets.reduce((acc: any, ticket) => {
      const appField = ticket.bsgFieldValues.find(fv => fv.field.fieldName === 'tanggal_berlaku');
      if (appField?.fieldValue) {
        acc[appField.fieldValue] = (acc[appField.fieldValue] || 0) + 1;
      }
      return acc;
    }, {});

    const topApplications = Object.entries(applicationStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    // Time series data (daily ticket counts)
    const dailyTickets = allTickets.reduce((acc: any, ticket) => {
      const date = ticket.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const timeSeriesData = Object.entries(dailyTickets).map(([date, count]) => ({
      date,
      count: count as number
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        overview: {
          totalTickets,
          pendingApproval,
          inProgress,
          resolved,
          resolutionRate: totalTickets > 0 ? ((resolved / totalTickets) * 100).toFixed(1) : '0',
          userManagementTickets: userMgmtTickets.length,
          userMgmtPercentage: totalTickets > 0 ? ((userMgmtTickets.length / totalTickets) * 100).toFixed(1) : '0'
        },
        topMetrics: {
          topBranches: topBranches.map(([name, count]) => ({ name, count })),
          topServiceCategories: topCategories.map(([name, count]) => ({ name, count })),
          topApplications: topApplications.map(([name, count]) => ({ name, count }))
        },
        trends: {
          dailyTicketCounts: timeSeriesData
        },
        breakdowns: {
          byStatus: {
            pending: pendingApproval,
            inProgress,
            resolved
          },
          byBranchType: {
            cabang: allTickets.filter(t => t.createdBy.unit?.name?.includes('CABANG')).length,
            capem: allTickets.filter(t => t.createdBy.unit?.name?.includes('CAPEM')).length,
            other: allTickets.filter(t => !t.createdBy.unit?.name?.includes('CABANG') && !t.createdBy.unit?.name?.includes('CAPEM')).length
          }
        }
      }
    });

  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard summary'
    });
  }
}));

export default router;