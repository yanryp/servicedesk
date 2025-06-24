// Enhanced Service Catalog Routes - ITIL Integration with BSG Templates
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// --- Multer Setup for File Uploads ---

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer with file size limit and file type validation
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Skip validation for empty files
    if (!file || !file.originalname || file.originalname === '') {
      return cb(null, false); // Reject empty files silently
    }

    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      console.log(`File rejected: ${file.originalname}, mimetype: ${file.mimetype}`);
      cb(new Error('Invalid file type. Only images, PDFs, and office documents are allowed.'));
    }
  }
});

// Transform BSG Template Categories to Service Catalog Categories
const transformBSGCategoriesToServiceCatalog = (bsgCategories: any[]) => {
  return bsgCategories.map(category => ({
    id: `bsg_${category.id}`,
    name: category.displayName || category.name,
    description: category.description || `${category.displayName} services and support`,
    icon: category.icon || getIconForCategory(category.name),
    serviceCount: category._count?.templates || 0,
    type: 'bsg_category'
  }));
};

// Get appropriate icon for BSG category
const getIconForCategory = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    'OLIBS': 'users',
    'XCARD': 'credit-card',
    'QRIS': 'qr-code',
    'KLAIM': 'receipt',
    'ATM': 'credit-card',
    'KASDA': 'building-office',
    'SWITCHING': 'wifi',
    'HARDWARE': 'hard-drive',
    'SOFTWARE': 'computer-desktop'
  };
  return iconMap[categoryName.toUpperCase()] || 'document-text';
};

// Transform BSG Templates to Services
const transformBSGTemplatesToServices = (bsgTemplates: any[]) => {
  return bsgTemplates.map(template => ({
    id: `bsg_template_${template.id}`,
    name: template.displayName || template.name,
    description: template.description || `${template.name} service request`,
    categoryId: `bsg_${template.categoryId}`,
    templateId: template.id,
    popularity: template.popularityScore || 0,
    usageCount: template.usageCount || 0,
    hasFields: template._count?.fields > 0,
    fieldCount: template._count?.fields || 0,
    type: 'bsg_service'
  }));
};

// @route   GET /api/service-catalog/categories
// @desc    Get all service catalog categories (from BSG templates + static)
// @access  Private
router.get('/categories', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get BSG template categories
    const bsgCategories = await prisma.bSGTemplateCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            templates: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    // Transform BSG categories to service catalog format
    const serviceCatalogCategories = transformBSGCategoriesToServiceCatalog(bsgCategories);

    // Add static categories for non-BSG services
    const staticCategories = [
      {
        id: 'hardware_software',
        name: 'Hardware & Software',
        description: 'Computer hardware, software installation, and maintenance requests',
        icon: 'hard-drive',
        serviceCount: 3,
        type: 'static_category'
      },
      {
        id: 'network_connectivity',
        name: 'Network & Connectivity',
        description: 'Network issues, internet connectivity, and infrastructure problems',
        icon: 'wifi',
        serviceCount: 4,
        type: 'static_category'
      },
      {
        id: 'general_requests',
        name: 'General Requests',
        description: 'Other requests and administrative tasks',
        icon: 'document-text',
        serviceCount: 2,
        type: 'static_category'
      }
    ];

    const allCategories = [...serviceCatalogCategories, ...staticCategories];

    res.json({
      success: true,
      data: allCategories,
      userContext: {
        isKasdaUser: req.user?.isKasdaUser || false,
        department: req.user?.departmentId,
        role: req.user?.role
      }
    });
  } catch (error) {
    console.error('Error fetching service catalog categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch service catalog categories' 
    });
  }
}));

// @route   GET /api/service-catalog/category/:categoryId/services
// @desc    Get services for a specific category
// @access  Private
router.get('/category/:categoryId/services', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { categoryId } = req.params;
    
    // Check if it's a BSG category
    if (categoryId.startsWith('bsg_')) {
      const bsgCategoryId = parseInt(categoryId.replace('bsg_', ''));
      
      // Get BSG templates for this category
      const bsgTemplates = await prisma.bSGTemplate.findMany({
        where: {
          categoryId: bsgCategoryId,
          isActive: true
        },
        include: {
          category: {
            select: {
              name: true,
              displayName: true
            }
          },
          _count: {
            select: {
              fields: true
            }
          }
        },
        orderBy: [
          { popularityScore: 'desc' },
          { name: 'asc' }
        ]
      });

      const services = transformBSGTemplatesToServices(bsgTemplates);
      
      res.json({
        success: true,
        data: services
      });
    } else {
      // Handle static categories
      const staticServices = getStaticServices(categoryId);
      res.json({
        success: true,
        data: staticServices
      });
    }
  } catch (error) {
    console.error('Error fetching services for category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch services' 
    });
  }
}));

// Get static services for non-BSG categories
const getStaticServices = (categoryId: string) => {
  const staticServicesMap: Record<string, any[]> = {
    'hardware_software': [
      {
        id: 'hw_install_os',
        name: 'Instalasi Sistem Operasi (Hardening)',
        description: 'Request a fresh and secure installation of a Windows or Linux operating system',
        fields: []
      },
      {
        id: 'hw_install_sw',
        name: 'Instalasi Perangkat Lunak',
        description: 'Request the installation of approved software on your computer',
        fields: []
      },
      {
        id: 'hw_maintenance',
        name: 'Maintenance Komputer/Printer',
        description: 'Schedule maintenance or repair for your computer or printer',
        fields: []
      }
    ],
    'network_connectivity': [
      {
        id: 'net_lan_issue',
        name: 'Gangguan Jaringan LAN',
        description: 'Report a problem with the local area network',
        fields: []
      },
      {
        id: 'net_internet_issue',
        name: 'Gangguan Jaringan Internet',
        description: 'Report slow or no internet access',
        fields: []
      },
      {
        id: 'net_wifi_issue',
        name: 'Masalah WiFi',
        description: 'WiFi connectivity and access point issues',
        fields: []
      },
      {
        id: 'net_vpn_issue',
        name: 'Masalah VPN',
        description: 'VPN connection and access issues',
        fields: []
      }
    ],
    'general_requests': [
      {
        id: 'req_data',
        name: 'Permintaan Data/Report',
        description: 'Request for specific data logs or reports',
        fields: []
      },
      {
        id: 'req_other',
        name: 'Permintaan Lainnya',
        description: 'Other general requests not covered by specific categories',
        fields: []
      }
    ]
  };

  return staticServicesMap[categoryId] || [];
};

// @route   GET /api/service-catalog/service/:serviceId/template
// @desc    Get template details and fields for a specific service
// @access  Private
router.get('/service/:serviceId/template', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serviceId } = req.params;
    
    // Check if it's a BSG service
    if (serviceId.startsWith('bsg_template_')) {
      const templateId = parseInt(serviceId.replace('bsg_template_', ''));
      
      // Get BSG template with fields
      const template = await prisma.bSGTemplate.findUnique({
        where: { id: templateId },
        include: {
          category: {
            select: {
              name: true,
              displayName: true,
              description: true
            }
          },
          fields: {
            where: { 
              // Only include active fields if there's an isActive field
            },
            include: {
              fieldType: {
                select: {
                  name: true,
                  displayName: true,
                  htmlInputType: true,
                  validationPattern: true
                }
              },
              options: {
                orderBy: { sortOrder: 'asc' }
              }
            },
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // Transform template fields to service catalog format
      const transformedFields = template.fields.map(field => ({
        id: field.id,
        name: field.fieldName,
        label: field.fieldLabel,
        type: field.fieldType.htmlInputType || field.fieldType.name,
        required: field.isRequired,
        description: field.fieldDescription,
        placeholder: field.placeholderText,
        helpText: field.helpText,
        maxLength: field.maxLength,
        validationRules: field.validationRules,
        options: field.options.map(opt => ({
          value: opt.optionValue,
          label: opt.optionLabel,
          isDefault: opt.isDefault
        })),
        // Preserve original field type information for frontend
        originalFieldType: field.fieldType.name,
        isDropdownField: field.fieldType.name.startsWith('dropdown_'),
        masterDataType: field.fieldType.name.startsWith('dropdown_') 
          ? field.fieldType.name.replace('dropdown_', '') 
          : null
      }));

      res.json({
        success: true,
        data: {
          id: serviceId,
          templateId: template.id,
          name: template.displayName || template.name,
          description: template.description,
          category: template.category,
          fields: transformedFields,
          type: 'bsg_template'
        }
      });
    } else {
      // Handle static services (no dynamic fields)
      const staticService = getStaticServiceDetails(serviceId);
      if (!staticService) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
      
      res.json({
        success: true,
        data: staticService
      });
    }
  } catch (error) {
    console.error('Error fetching service template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch service template' 
    });
  }
}));

// Get static service details
const getStaticServiceDetails = (serviceId: string) => {
  const staticServices: Record<string, any> = {
    'hw_install_os': {
      id: 'hw_install_os',
      name: 'Instalasi Sistem Operasi (Hardening)',
      description: 'Request a fresh and secure installation of a Windows or Linux operating system',
      fields: [],
      type: 'static_service'
    },
    'hw_install_sw': {
      id: 'hw_install_sw',
      name: 'Instalasi Perangkat Lunak',
      description: 'Request the installation of approved software on your computer',
      fields: [],
      type: 'static_service'
    },
    'hw_maintenance': {
      id: 'hw_maintenance',
      name: 'Maintenance Komputer/Printer',
      description: 'Schedule maintenance or repair for your computer or printer',
      fields: [],
      type: 'static_service'
    },
    'net_lan_issue': {
      id: 'net_lan_issue',
      name: 'Gangguan Jaringan LAN',
      description: 'Report a problem with the local area network',
      fields: [],
      type: 'static_service'
    },
    'net_internet_issue': {
      id: 'net_internet_issue',
      name: 'Gangguan Jaringan Internet',
      description: 'Report slow or no internet access',
      fields: [],
      type: 'static_service'
    },
    'net_wifi_issue': {
      id: 'net_wifi_issue',
      name: 'Masalah WiFi',
      description: 'WiFi connectivity and access point issues',
      fields: [],
      type: 'static_service'
    },
    'net_vpn_issue': {
      id: 'net_vpn_issue',
      name: 'Masalah VPN',
      description: 'VPN connection and access issues',
      fields: [],
      type: 'static_service'
    },
    'req_data': {
      id: 'req_data',
      name: 'Permintaan Data/Report',
      description: 'Request for specific data logs or reports',
      fields: [],
      type: 'static_service'
    },
    'req_other': {
      id: 'req_other',
      name: 'Permintaan Lainnya',
      description: 'Other general requests not covered by specific categories',
      fields: [],
      type: 'static_service'
    }
  };

  return staticServices[serviceId];
};

// Conditional file upload middleware
const conditionalUpload = (req: any, res: any, next: any) => {
  const contentType = req.get('Content-Type') || '';
  if (contentType.includes('multipart/form-data')) {
    // Use multer for multipart requests
    upload.array('attachments', 5)(req, res, next);
  } else {
    // Skip multer for JSON requests
    next();
  }
};

// @route   POST /api/service-catalog/create-ticket
// @desc    Create ticket from service catalog selection
// @access  Private
router.post('/create-ticket', protect, conditionalUpload, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serviceId, title, description, priority = 'medium', rootCause, issueCategory } = req.body;
    const userId = req.user!.id;
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];

    // Parse fieldValues if it's a JSON string (from FormData)
    let fieldValues: Record<string, any> = {};
    if (req.body.fieldValues) {
      try {
        fieldValues = typeof req.body.fieldValues === 'string' 
          ? JSON.parse(req.body.fieldValues) 
          : req.body.fieldValues;
      } catch (error) {
        console.error('Error parsing fieldValues:', error);
      }
    }

    // Validate required fields
    if (!serviceId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Service ID, title, and description are required'
      });
    }

    // Create the ticket (pending approval workflow)
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority as any,
        status: 'pending_approval',
        createdByUserId: userId,
        // Add Issue Classification fields if provided
        ...(rootCause && { userRootCause: rootCause }),
        ...(issueCategory && { userIssueCategory: issueCategory }),
        // For BSG templates, we'll store additional metadata
        ...(serviceId.startsWith('bsg_template_') && {
          // Store service catalog metadata in the ticket
          // You might want to add a serviceId field to the ticket model
        })
      }
    });

    // If it's a BSG template, save the field values
    if (serviceId.startsWith('bsg_template_')) {
      const templateId = parseInt(serviceId.replace('bsg_template_', ''));
      
      // Get template fields to validate
      const templateFields = await prisma.bSGTemplateField.findMany({
        where: { templateId }
      });

      // Save field values
      const fieldValuePromises = templateFields.map(field => {
        const value = fieldValues[field.fieldName];
        if (value !== undefined && value !== '') {
          return prisma.bSGTicketFieldValue.create({
            data: {
              ticketId: ticket.id,
              fieldId: field.id,
              fieldValue: String(value)
            }
          });
        }
        return null;
      }).filter(Boolean);

      if (fieldValuePromises.length > 0) {
        await Promise.all(fieldValuePromises);
      }
    }

    // Handle file attachments
    if (uploadedFiles && uploadedFiles.length > 0) {
      const attachmentPromises = uploadedFiles.map(file => 
        prisma.ticketAttachment.create({
          data: {
            ticketId: ticket.id,
            fileName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            fileType: file.mimetype,
            uploadedByUserId: userId
          }
        })
      );

      await Promise.all(attachmentPromises);
    }

    res.json({
      success: true,
      data: {
        ticketId: ticket.id,
        title: ticket.title,
        status: ticket.status,
        createdAt: ticket.createdAt,
        attachmentCount: uploadedFiles ? uploadedFiles.length : 0
      },
      message: `Ticket created successfully and is pending manager approval${uploadedFiles && uploadedFiles.length > 0 ? ` with ${uploadedFiles.length} attachment(s)` : ''}`
    });

  } catch (error) {
    console.error('Error creating ticket from service catalog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create ticket' 
    });
  }
}));

// @route   GET /api/service-catalog/search
// @desc    Search services across all categories
// @access  Private
router.get('/search', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q: query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    // Search BSG templates
    const bsgTemplates = await prisma.bSGTemplate.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        category: {
          select: {
            name: true,
            displayName: true
          }
        },
        _count: {
          select: {
            fields: true
          }
        }
      },
      take: 20
    });

    const bsgServices = transformBSGTemplatesToServices(bsgTemplates);

    // Add static services that match the query
    const allStaticServices = [
      ...getStaticServices('hardware_software'),
      ...getStaticServices('network_connectivity'),
      ...getStaticServices('general_requests')
    ];

    const matchingStaticServices = allStaticServices.filter(service =>
      service.name.toLowerCase().includes(query.toLowerCase()) ||
      service.description.toLowerCase().includes(query.toLowerCase())
    );

    const allResults = [...bsgServices, ...matchingStaticServices];

    res.json({
      success: true,
      data: allResults,
      query,
      resultCount: allResults.length
    });

  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search services' 
    });
  }
}));

export default router;