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

// @route   GET /api/reports/user-access-summary
// @desc    Get comprehensive user access summary across all applications
// @access  Private (Admin/Manager)
router.get('/user-access-summary', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user has admin or manager role
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Manager role required.'
      });
    }

    const { application, branch, status, startDate, endDate, format } = req.query;

    // Build dynamic where clause
    const whereClause: any = {
      bsgFieldValues: {
        some: {
          field: {
            fieldName: 'tanggal_berlaku' // Application name stored here
          }
        }
      }
    };

    // Add filters
    if (application) {
      whereClause.bsgFieldValues.some.fieldValue = application;
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    // Get tickets with user access data
    const userAccessTickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
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

    // Transform data for report
    const reportData = userAccessTickets.map(ticket => {
      const fieldValues: Record<string, string> = {};
      ticket.bsgFieldValues.forEach(fv => {
        fieldValues[fv.field.fieldName] = fv.fieldValue || '';
      });

      return {
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        applicationName: fieldValues.tanggal_berlaku || 'Unknown',
        kodeUser: fieldValues.cabang___capem || '',
        namaUser: fieldValues.kantor_kas || '',
        requesterEmail: ticket.createdBy.email,
        requesterName: ticket.createdBy.name || 'Unknown User',
        branch: ticket.createdBy.unit?.name || 'Unknown Branch',
        department: ticket.createdBy.department?.name || 'Unknown Department',
        status: ticket.status,
        priority: ticket.priority,
        requestDate: ticket.createdAt,
        approvalStatus: ticket.status === 'pending_approval' ? 'Pending' : 
                       ticket.status === 'open' ? 'Approved' : 'Processed'
      };
    });

    // Group by application for summary
    const applicationSummary = reportData.reduce((acc: any, item) => {
      const app = item.applicationName;
      if (!acc[app]) {
        acc[app] = {
          applicationName: app,
          totalUsers: 0,
          activeRequests: 0,
          pendingApprovals: 0,
          users: []
        };
      }
      acc[app].totalUsers++;
      if (item.status === 'pending_approval') acc[app].pendingApprovals++;
      if (['open', 'assigned', 'in_progress'].includes(item.status)) acc[app].activeRequests++;
      acc[app].users.push(item);
      return acc;
    }, {});

    // Handle Excel export
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('User Access Summary');

      // Add headers
      worksheet.columns = [
        { header: 'Application', key: 'applicationName', width: 20 },
        { header: 'User Code', key: 'kodeUser', width: 15 },
        { header: 'User Name', key: 'namaUser', width: 25 },
        { header: 'Requester', key: 'requesterName', width: 25 },
        { header: 'Branch', key: 'branch', width: 20 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Priority', key: 'priority', width: 12 },
        { header: 'Request Date', key: 'requestDate', width: 15 },
        { header: 'Approval Status', key: 'approvalStatus', width: 15 }
      ];

      // Add data
      reportData.forEach(row => {
        worksheet.addRow(row);
      });

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      };

      // Set response headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=user-access-summary-${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      return;
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalApplications: Object.keys(applicationSummary).length,
          totalUserRequests: reportData.length,
          pendingApprovals: reportData.filter(r => r.status === 'pending_approval').length,
          activeRequests: reportData.filter(r => ['open', 'assigned', 'in_progress'].includes(r.status)).length
        },
        applicationBreakdown: Object.values(applicationSummary),
        detailedData: reportData,
        filters: { application, branch, status, startDate, endDate }
      }
    });

  } catch (error) {
    console.error('Error generating user access summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate user access summary report'
    });
  }
}));

// @route   GET /api/reports/deprovisioning-checklist/:userCode
// @desc    Generate deprovisioning checklist for a user
// @access  Private (Admin/Manager)
router.get('/deprovisioning-checklist/:userCode', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Manager role required.'
      });
    }

    const { userCode } = req.params;
    const { format } = req.query;

    // Find all tickets where this user was granted access
    const userAccessTickets = await prisma.ticket.findMany({
      where: {
        bsgFieldValues: {
          some: {
            AND: [
              {
                field: {
                  fieldName: 'kodeUser'
                }
              },
              {
                fieldValue: userCode
              }
            ]
          }
        },
        status: {
          in: ['resolved', 'closed'] // Only completed access grants
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
            unit: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (userAccessTickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No access records found for user code: ${userCode}`
      });
    }

    // Extract user information and applications
    const userApplications: any[] = [];
    let userName = '';
    let userBranch = '';

    userAccessTickets.forEach(ticket => {
      const fieldValues: Record<string, string> = {};
      ticket.bsgFieldValues.forEach(fv => {
        fieldValues[fv.field.fieldName] = fv.fieldValue || '';
      });

      if (!userName && fieldValues.namaUser) {
        userName = fieldValues.namaUser;
      }
      if (!userBranch && ticket.createdBy.unit?.name) {
        userBranch = ticket.createdBy.unit.name;
      }

      if (fieldValues.applicationName) {
        userApplications.push({
          application: fieldValues.applicationName,
          grantedDate: ticket.createdAt,
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          status: 'Active'
        });
      }
    });

    // Remove duplicates and group by application
    const uniqueApplications = Array.from(
      new Map(userApplications.map(app => [app.application, app])).values()
    );

    // Generate checklist
    const deprovisioningChecklist = {
      userInfo: {
        userCode,
        userName,
        branch: userBranch,
        totalApplications: uniqueApplications.length,
        checklistGeneratedDate: new Date(),
        checklistGeneratedBy: req.user.email
      },
      applications: uniqueApplications.map(app => ({
        ...app,
        accessRemoved: false,
        removedBy: '',
        removedDate: null,
        notes: ''
      })),
      summary: {
        totalApplicationsToRemove: uniqueApplications.length,
        completedRemovals: 0,
        pendingRemovals: uniqueApplications.length
      }
    };

    // Handle Excel export for checklist
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Deprovisioning Checklist');

      // Add title and user info
      worksheet.mergeCells('A1:F1');
      worksheet.getCell('A1').value = `EMPLOYEE DEPROVISIONING CHECKLIST - ${userName} (${userCode})`;
      worksheet.getCell('A1').font = { bold: true, size: 14 };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:F2');
      worksheet.getCell('A2').value = `Branch: ${userBranch} | Generated: ${new Date().toLocaleDateString()} | By: ${req.user.email}`;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      // Add headers
      worksheet.getRow(4).values = [
        'Application', 
        'Access Granted Date', 
        'Original Ticket ID', 
        'Access Removed?', 
        'Removed By', 
        'Removal Date',
        'Notes'
      ];
      worksheet.getRow(4).font = { bold: true };
      worksheet.getRow(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF6B6B' }
      };

      // Add application data
      let rowIndex = 5;
      uniqueApplications.forEach(app => {
        worksheet.getRow(rowIndex).values = [
          app.application,
          app.grantedDate.toLocaleDateString(),
          app.ticketId,
          '☐ No', // Checkbox for completion
          '', // To be filled by IT team
          '', // To be filled by IT team
          '' // Notes
        ];
        rowIndex++;
      });

      // Set column widths
      worksheet.columns = [
        { width: 25 }, // Application
        { width: 15 }, // Granted Date
        { width: 15 }, // Ticket ID
        { width: 15 }, // Removed?
        { width: 20 }, // Removed By
        { width: 15 }, // Removal Date
        { width: 30 }  // Notes
      ];

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=deprovisioning-checklist-${userCode}-${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      return;
    }

    res.json({
      success: true,
      data: deprovisioningChecklist
    });

  } catch (error) {
    console.error('Error generating deprovisioning checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate deprovisioning checklist'
    });
  }
}));

// @route   GET /api/reports/application-users/:applicationName
// @desc    Get all users who have access to a specific application
// @access  Private (Admin/Manager)
router.get('/application-users/:applicationName', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Manager role required.'
      });
    }

    const { applicationName } = req.params;
    const { status, branch, format } = req.query;

    // Build where clause
    const whereClause: any = {
      bsgFieldValues: {
        some: {
          AND: [
            {
              field: {
                fieldName: 'tanggal_berlaku' // Application name stored here
              }
            },
            {
              fieldValue: applicationName
            }
          ]
        }
      }
    };

    if (status) {
      whereClause.status = status;
    }

    // Get all users with access to this application
    const applicationTickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
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

    // Transform and deduplicate users
    const usersMap = new Map();
    
    applicationTickets.forEach(ticket => {
      const fieldValues: Record<string, string> = {};
      ticket.bsgFieldValues.forEach(fv => {
        fieldValues[fv.field.fieldName] = fv.fieldValue || '';
      });

      const userKey = fieldValues.kodeUser || ticket.createdBy.email;
      
      if (!usersMap.has(userKey)) {
        usersMap.set(userKey, {
          userCode: fieldValues.kodeUser || '',
          userName: fieldValues.namaUser || ticket.createdBy.name || 'Unknown User',
          email: ticket.createdBy.email,
          branch: ticket.createdBy.unit?.name || 'Unknown Branch',
          department: ticket.createdBy.department?.name || 'Unknown Department',
          firstAccessDate: ticket.createdAt,
          lastRequestDate: ticket.createdAt,
          totalRequests: 1,
          currentStatus: ticket.status,
          ticketIds: [ticket.id]
        });
      } else {
        const user = usersMap.get(userKey);
        user.totalRequests++;
        user.lastRequestDate = ticket.createdAt;
        user.ticketIds.push(ticket.id);
        // Update status to most recent
        user.currentStatus = ticket.status;
      }
    });

    const applicationUsers = Array.from(usersMap.values());

    // Filter by branch if specified
    const filteredUsers = branch ? 
      applicationUsers.filter(user => user.branch.toLowerCase().includes((branch as string).toLowerCase())) : 
      applicationUsers;

    // Sort by last request date
    filteredUsers.sort((a, b) => new Date(b.lastRequestDate).getTime() - new Date(a.lastRequestDate).getTime());

    res.json({
      success: true,
      data: {
        applicationName,
        summary: {
          totalUsers: filteredUsers.length,
          activeUsers: filteredUsers.filter(u => ['resolved', 'closed'].includes(u.currentStatus)).length,
          pendingUsers: filteredUsers.filter(u => u.currentStatus === 'pending-approval').length,
          branches: [...new Set(filteredUsers.map(u => u.branch))].length
        },
        users: filteredUsers,
        filters: { status, branch }
      }
    });

  } catch (error) {
    console.error('Error getting application users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get application users'
    });
  }
}));

// @route   GET /api/reports/branch-access-analytics
// @desc    Get branch operations analytics with user access patterns
// @access  Private (Admin/Manager)
router.get('/branch-access-analytics', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Manager role required.'
      });
    }

    const { period = '30', branchType, format } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get tickets by branch with user access data
    const tickets = await prisma.ticket.findMany({
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

    // Group by branch
    const branchAnalytics = tickets.reduce((acc: any, ticket) => {
      const branchName = ticket.createdBy.unit?.name || 'Unknown Branch';
      const branchCode = ticket.createdBy.unit?.code || 'UNK';
      
      if (!acc[branchName]) {
        acc[branchName] = {
          branchName,
          branchCode,
          branchType: branchName.includes('CABANG') ? 'CABANG' : 
                     branchName.includes('CAPEM') ? 'CAPEM' : 'OTHER',
          totalRequests: 0,
          pendingApprovals: 0,
          approvedRequests: 0,
          userManagementRequests: 0,
          applicationRequests: new Set(),
          serviceCategories: new Set(),
          avgApprovalTime: 0
        };
      }

      acc[branchName].totalRequests++;
      
      if (ticket.status === 'pending_approval') {
        acc[branchName].pendingApprovals++;
      } else {
        acc[branchName].approvedRequests++;
      }

      // Check if it's a user management request
      const hasUserFields = ticket.bsgFieldValues.some(fv => 
        ['tanggal_berlaku', 'cabang___capem', 'kantor_kas'].includes(fv.field.fieldName)
      );
      
      if (hasUserFields) {
        acc[branchName].userManagementRequests++;
        
        // Track applications
        const appField = ticket.bsgFieldValues.find(fv => fv.field.fieldName === 'tanggal_berlaku');
        if (appField?.fieldValue) {
          acc[branchName].applicationRequests.add(appField.fieldValue);
        }
      }

      if (ticket.serviceCatalog?.name) {
        acc[branchName].serviceCategories.add(ticket.serviceCatalog.name);
      }

      return acc;
    }, {});

    // Convert sets to arrays and calculate metrics
    const analyticsData = Object.values(branchAnalytics).map((branch: any) => ({
      ...branch,
      applicationRequests: Array.from(branch.applicationRequests),
      serviceCategories: Array.from(branch.serviceCategories),
      approvalRate: branch.totalRequests > 0 ? 
        ((branch.approvedRequests / branch.totalRequests) * 100).toFixed(1) : '0',
      userMgmtPercentage: branch.totalRequests > 0 ? 
        ((branch.userManagementRequests / branch.totalRequests) * 100).toFixed(1) : '0'
    }));

    // Filter by branch type if specified
    const filteredData = branchType ? 
      analyticsData.filter((branch: any) => branch.branchType === branchType) : 
      analyticsData;

    // Sort by total requests
    filteredData.sort((a: any, b: any) => b.totalRequests - a.totalRequests);

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        summary: {
          totalBranches: filteredData.length,
          cabangBranches: filteredData.filter((b: any) => b.branchType === 'CABANG').length,
          capemBranches: filteredData.filter((b: any) => b.branchType === 'CAPEM').length,
          totalRequests: filteredData.reduce((sum: number, b: any) => sum + b.totalRequests, 0),
          avgRequestsPerBranch: (filteredData.reduce((sum: number, b: any) => sum + b.totalRequests, 0) / Math.max(filteredData.length, 1)).toFixed(1)
        },
        branchMetrics: filteredData,
        filters: { period, branchType }
      }
    });

  } catch (error) {
    console.error('Error generating branch analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate branch analytics'
    });
  }
}));

export default router;