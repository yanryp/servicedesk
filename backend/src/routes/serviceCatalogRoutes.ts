// Enhanced Service Catalog Routes - ITIL Integration with BSG Templates
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Import unified ticket creation service
import { UnifiedTicketService, UnifiedTicketCreation } from './enhancedTicketRoutes';

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

    // Allowed file extensions
    const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    
    // Allowed MIME types
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    const validMimetype = allowedMimeTypes.includes(file.mimetype);

    console.log(`🔍 File validation debug: ${file.originalname}`);
    console.log(`   Extension check: ${extname} (${path.extname(file.originalname).toLowerCase()})`);
    console.log(`   MIME type: ${file.mimetype}`);
    console.log(`   MIME type valid: ${validMimetype}`);
    console.log(`   Both valid: ${validMimetype && extname}`);

    if (validMimetype && extname) {
      console.log(`✅ File accepted: ${file.originalname}`);
      return cb(null, true);
    } else {
      console.log(`❌ File rejected: ${file.originalname}, mimetype: ${file.mimetype}, ext: ${extname}, mime_valid: ${validMimetype}`);
      cb(new Error('Invalid file type. Only images, PDFs, office documents, and text files are allowed.'));
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

// Get appropriate icon for ServiceCatalog
const getIconForServiceCatalog = (catalogName: string): string => {
  const iconMap: Record<string, string> = {
    'OLIBS System': 'users',
    'BSG Applications': 'device-phone-mobile',
    'ATM Management': 'credit-card',
    'Core Banking': 'building-library',
    'Network & Infrastructure': 'wifi',
    'Security & Access': 'shield-check',
    'Claims & Transactions': 'receipt',
    'Hardware & Software': 'hard-drive',
    'KASDA Services': 'building-office',
    'IT Services': 'computer-desktop'
  };
  return iconMap[catalogName] || 'document-text';
};

// Extract application name from service name based on template.csv patterns
const extractApplicationName = (serviceName: string, categoryName: string): string => {
  const name = serviceName.toLowerCase();
  const category = categoryName.toLowerCase();
  
  // Direct application matches from template.csv
  if (name.includes('olibs') || category.includes('olibs')) return 'OLIBS';
  if (name.includes('xcard') || category.includes('xcard')) return 'XCARD';
  if (name.includes('bsg qris') || name.includes('qris') || category.includes('qris')) return 'BSG QRIS';
  if (name.includes('bsgtouch') || name.includes('bsg touch') || category.includes('bsgtouch')) return 'BSGTouch';
  if (name.includes('tellerapp') || name.includes('teller app') || name.includes('reporting') || category.includes('teller')) return 'TellerApp/Reporting';
  if (name.includes('sms banking') || name.includes('sms bank') || category.includes('sms')) return 'SMS BANKING';
  if (name.includes('klaim') || category.includes('klaim')) return 'KLAIM';
  if (name.includes('atm') || category.includes('atm')) return 'ATM';
  if (name.includes('perpanjangan operasional') || name.includes('operasional')) return 'Permintaan Perpanjangan operasional';
  
  // Fallback to category name
  return categoryName || 'Unknown Application';
};

// Transform BSG Templates to Services
const transformBSGTemplatesToServices = (bsgTemplates: any[]) => {
  return bsgTemplates.map(template => {
    // Extract application name for user access tracking
    const applicationName = extractApplicationName(
      template.displayName || template.name, 
      template.category?.displayName || template.category?.name || ''
    );
    
    // Transform template fields to service catalog format
    const transformedFields = template.fields?.map((field: any) => ({
      id: field.id,
      name: field.fieldName,
      label: field.fieldLabel,
      type: field.fieldType?.name || field.fieldType,
      required: field.isRequired,
      description: field.fieldDescription,
      placeholder: field.placeholderText,
      helpText: field.helpText,
      maxLength: field.maxLength,
      validationRules: field.validationRules,
      options: field.options?.map((opt: any) => ({
        value: opt.optionValue,
        label: opt.optionLabel,
        isDefault: opt.isDefault
      })) || [],
      originalFieldType: field.fieldType?.name || field.fieldType,
      isDropdownField: (field.fieldType?.name || field.fieldType)?.includes('dropdown')
    })) || [];
    
    // Add application name field for user access tracking
    const applicationNameField = {
      id: -1, // Special ID for generated field
      name: 'applicationName',
      label: 'Aplikasi/Application',
      type: 'dropdown',
      required: true,
      description: 'Nama aplikasi terkait untuk tracking akses user',
      placeholder: 'Pilih aplikasi',
      helpText: 'Aplikasi yang terkait dengan permintaan ini',
      maxLength: null,
      validationRules: null,
      options: [
        { value: 'OLIBS', label: 'OLIBS', isDefault: applicationName === 'OLIBS' },
        { value: 'XCARD', label: 'XCARD', isDefault: applicationName === 'XCARD' },
        { value: 'BSG QRIS', label: 'BSG QRIS', isDefault: applicationName === 'BSG QRIS' },
        { value: 'BSGTouch', label: 'BSGTouch', isDefault: applicationName === 'BSGTouch' },
        { value: 'TellerApp/Reporting', label: 'TellerApp/Reporting', isDefault: applicationName === 'TellerApp/Reporting' },
        { value: 'SMS BANKING', label: 'SMS BANKING', isDefault: applicationName === 'SMS BANKING' },
        { value: 'KLAIM', label: 'KLAIM', isDefault: applicationName === 'KLAIM' },
        { value: 'ATM', label: 'ATM', isDefault: applicationName === 'ATM' },
        { value: 'Permintaan Perpanjangan operasional', label: 'Permintaan Perpanjangan operasional', isDefault: applicationName === 'Permintaan Perpanjangan operasional' }
      ],
      originalFieldType: 'dropdown',
      isDropdownField: true
    };
    
    // Add user identification fields for tracking (if not already present)
    const hasUserCodeField = transformedFields.some((f: any) => f.name.toLowerCase().includes('kode user') || f.name.toLowerCase().includes('usercode'));
    const hasUserNameField = transformedFields.some((f: any) => f.name.toLowerCase().includes('nama user') || f.name.toLowerCase().includes('username'));
    
    const additionalFields = [];
    
    if (!hasUserCodeField) {
      additionalFields.push({
        id: -2,
        name: 'kodeUser',
        label: 'Kode User',
        type: 'text',
        required: true,
        description: 'Kode user untuk tracking akses aplikasi',
        placeholder: 'Maksimal 5 karakter',
        helpText: 'Kode user yang akan digunakan untuk akses aplikasi',
        maxLength: 5,
        validationRules: null,
        options: [],
        originalFieldType: 'text',
        isDropdownField: false
      });
    }
    
    if (!hasUserNameField) {
      additionalFields.push({
        id: -3,
        name: 'namaUser',
        label: 'Nama User',
        type: 'text',
        required: true,
        description: 'Nama lengkap user untuk tracking akses aplikasi',
        placeholder: 'Nama lengkap user',
        helpText: 'Nama lengkap user yang akan menggunakan aplikasi',
        maxLength: 100,
        validationRules: null,
        options: [],
        originalFieldType: 'text',
        isDropdownField: false
      });
    }
    
    // Combine all fields: application name first, then user fields, then original fields
    const allFields = [applicationNameField, ...additionalFields, ...transformedFields];

    return {
      id: `bsg_template_${template.id}`,
      name: template.displayName || template.name,
      description: template.description || `${template.name} service request`,
      categoryId: `bsg_${template.categoryId}`,
      templateId: template.id,
      popularity: template.popularityScore || 0,
      usageCount: template.usageCount || 0,
      hasFields: allFields.length > 0,
      fieldCount: allFields.length,
      hasTemplate: allFields.length > 0, // Customer portal checks this
      fields: allFields, // Include application name, user fields, and original fields
      type: 'bsg_service'
    };
  });
};

// @route   GET /api/service-catalog/categories
// @desc    Get all service catalog categories (from imported CSV templates)
// @access  Private
router.get('/categories', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // PRIORITY: Get BSG categories first (they have working dynamic fields)
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
        { displayName: 'asc' }
      ]
    });

    // Transform BSG categories to frontend format (PRIORITY - these have fields!)
    const bsgCategoryData = bsgCategories.map(category => ({
      id: `bsg_${category.id}`,
      name: category.displayName || category.name,
      description: category.description || `${category.displayName} services with dynamic fields`,
      icon: category.icon || getIconForCategory(category.name),
      serviceCount: category._count?.templates || 0,
      type: 'bsg_category',
      priority: 1000 // High priority for BSG categories
    }));

    // Get ServiceCatalog data with service item counts (secondary)
    const serviceCatalogs = await prisma.serviceCatalog.findMany({
      where: { isActive: true },
      include: {
        serviceItems: {
          where: { isActive: true }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    // Transform ServiceCatalogs to frontend format
    const serviceCatalogCategories = serviceCatalogs.map(catalog => {
      // Count actual service items instead of templates
      const serviceItemCount = catalog.serviceItems.length;
      
      return {
        id: `catalog_${catalog.id}`,
        name: catalog.name,
        description: catalog.description || `${catalog.name} services and support`,
        icon: getIconForServiceCatalog(catalog.name),
        serviceCount: serviceItemCount,
        type: 'service_catalog',
        priority: 100 // Lower priority
      };
    });

    // Combine categories with BSG categories first
    const allCategories = [...bsgCategoryData, ...serviceCatalogCategories];

    // Sort by priority (BSG categories first) then by name
    allCategories.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.name.localeCompare(b.name);
    });

    console.log('📂 Categories returned to customer portal:');
    allCategories.forEach(cat => {
      console.log(`  - ${cat.id}: ${cat.name} (${cat.serviceCount} services, Type: ${cat.type})`);
    });

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
    
    // Check if it's a ServiceCatalog category
    if (categoryId.startsWith('catalog_')) {
      const serviceCatalogId = parseInt(categoryId.replace('catalog_', ''));
      
      // Get all service items for this catalog with their field definitions
      const serviceItems = await prisma.serviceItem.findMany({
        where: {
          serviceCatalogId: serviceCatalogId,
          isActive: true
        },
        include: {
          templates: {
            where: { isVisible: true },
            include: {
              customFieldDefinitions: {
                orderBy: { sortOrder: 'asc' }
              }
            },
            orderBy: { sortOrder: 'asc' }
          },
          service_field_definitions: {
            orderBy: { sortOrder: 'asc' }
          },
          serviceCatalog: {
            select: {
              name: true,
              description: true
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      });

      // Transform to services format
      const services: any[] = [];
      for (const item of serviceItems) {
        // Count total fields from both templates and service field definitions
        const templateFieldCount = item.templates.reduce((sum, t) => sum + t.customFieldDefinitions.length, 0);
        const serviceFieldCount = item.service_field_definitions.length;
        const totalFieldCount = templateFieldCount + serviceFieldCount;
        
        // Always create a single entry per service item
        // Prefer template with fields if available, otherwise use service item directly
        const templatesWithFields = item.templates.filter(t => t.customFieldDefinitions.length > 0);
        
        if (templatesWithFields.length > 0) {
          // Use the template with the most fields
          const bestTemplate = templatesWithFields.reduce((best, current) => 
            current.customFieldDefinitions.length > best.customFieldDefinitions.length ? current : best
          );
          
          services.push({
            id: `template_${bestTemplate.id}`,
            name: item.name, // Use service item name, not template name
            description: item.description || bestTemplate.description || `${item.name} service request`,
            categoryId: categoryId,
            templateId: bestTemplate.id,
            serviceItemId: item.id,
            popularity: 0,
            usageCount: 0,
            hasTemplate: true, // Add hasTemplate for customer portal compatibility
            hasFields: bestTemplate.customFieldDefinitions.length > 0 || serviceFieldCount > 0,
            fieldCount: bestTemplate.customFieldDefinitions.length + serviceFieldCount,
            type: 'service_template',
            estimatedResolutionTime: bestTemplate.estimatedResolutionTime,
            // Add fields for customer portal
            fields: bestTemplate.customFieldDefinitions.map(field => ({
              id: field.id,
              name: field.fieldName,
              label: field.fieldLabel,
              type: field.fieldType,
              required: field.isRequired,
              description: null,
              placeholder: field.placeholder,
              helpText: null,
              originalFieldType: field.fieldType,
              isDropdownField: field.fieldType.includes('dropdown'),
              options: field.options || [] // Include options for checkbox and radio fields
            }))
          });
        } else {
          // No templates with fields, use service item directly
          services.push({
            id: `service_${item.id}`,
            name: item.name,
            description: item.description || `${item.name} service request`,
            categoryId: categoryId,
            templateId: null,
            serviceItemId: item.id,
            popularity: 0,
            usageCount: 0,
            hasTemplate: serviceFieldCount > 0, // Set hasTemplate to true if there are fields
            hasFields: serviceFieldCount > 0,
            fieldCount: serviceFieldCount,
            type: 'service_item',
            estimatedResolutionTime: null,
            // Add fields for customer portal
            fields: item.service_field_definitions.map(field => ({
              id: field.id,
              name: field.fieldName,
              label: field.fieldLabel,
              type: field.fieldType,
              required: field.isRequired,
              description: null,
              placeholder: field.placeholder,
              helpText: null,
              originalFieldType: field.fieldType,
              isDropdownField: field.fieldType.includes('dropdown'),
              options: field.options || [] // Include options for checkbox and radio fields
            }))
          });
        }
      }
      
      res.json({
        success: true,
        data: services
      });
    } else if (categoryId.startsWith('bsg_')) {
      // Handle legacy BSG categories
      const bsgCategoryId = parseInt(categoryId.replace('bsg_', ''));
      
      // Get BSG templates for this category with field data
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
          fields: {
            include: {
              fieldType: {
                select: {
                  name: true,
                  displayName: true,
                  htmlInputType: true
                }
              },
              options: {
                orderBy: { sortOrder: 'asc' }
              }
            },
            orderBy: { sortOrder: 'asc' }
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
        fields: [],
        category: 'Hardware & Software'
      },
      {
        id: 'hw_install_sw',
        name: 'Instalasi Perangkat Lunak',
        description: 'Request the installation of approved software on your computer',
        fields: [],
        category: 'Hardware & Software'
      },
      {
        id: 'hw_maintenance',
        name: 'Maintenance Komputer/Printer',
        description: 'Schedule maintenance or repair for your computer or printer',
        fields: [],
        category: 'Hardware & Software'
      }
    ],
    'network_connectivity': [
      {
        id: 'net_lan_issue',
        name: 'Gangguan Jaringan LAN',
        description: 'Report a problem with the local area network',
        fields: [],
        category: 'Network & Infrastructure'
      },
      {
        id: 'net_internet_issue',
        name: 'Gangguan Jaringan Internet',
        description: 'Report slow or no internet access',
        fields: [],
        category: 'Network & Infrastructure'
      },
      {
        id: 'net_wifi_issue',
        name: 'Masalah WiFi',
        description: 'WiFi connectivity and access point issues',
        fields: [],
        category: 'Network & Infrastructure'
      },
      {
        id: 'net_vpn_issue',
        name: 'Masalah VPN',
        description: 'VPN connection and access issues',
        fields: [],
        category: 'Network & Infrastructure'
      }
    ],
    'general_requests': [
      {
        id: 'req_data',
        name: 'Permintaan Data/Report',
        description: 'Request for specific data logs or reports',
        fields: [],
        category: 'General Support'
      },
      {
        id: 'req_other',
        name: 'Permintaan Lainnya',
        description: 'Other general requests not covered by specific categories',
        fields: [],
        category: 'General Support'
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
    
    // Check if it's a ServiceTemplate
    if (serviceId.startsWith('template_')) {
      const templateId = parseInt(serviceId.replace('template_', ''));
      
      // Get ServiceTemplate with fields
      const template = await prisma.serviceTemplate.findUnique({
        where: { id: templateId },
        include: {
          serviceItem: {
            include: {
              serviceCatalog: {
                select: {
                  name: true,
                  description: true
                }
              }
            }
          },
          customFieldDefinitions: {
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
      const transformedFields = template.customFieldDefinitions.map((field: any) => ({
        id: field.id,
        name: field.fieldName,
        label: field.fieldLabel,
        type: field.fieldType,
        required: field.isRequired,
        description: field.placeholder,
        placeholder: field.placeholder,
        helpText: '',
        maxLength: field.validationRules?.maxLength || null,
        validationRules: field.validationRules,
        options: [], // ServiceFieldDefinitions don't have options yet
        originalFieldType: field.fieldType,
        isDropdownField: field.fieldType === 'dropdown',
        masterDataType: null
      }));

      res.json({
        success: true,
        data: {
          id: serviceId,
          templateId: template.id,
          serviceItemId: template.serviceItemId,
          name: template.name,
          description: template.description,
          category: template.serviceItem.serviceCatalog,
          fields: transformedFields,
          type: 'service_template',
          estimatedResolutionTime: template.estimatedResolutionTime,
          defaultRootCause: template.defaultRootCause,
          defaultIssueType: template.defaultIssueType
        }
      });
    } else if (serviceId.startsWith('service_')) {
      // Handle direct service items (without templates)
      const serviceItemId = parseInt(serviceId.replace('service_', ''));
      
      // Get ServiceItem with field definitions
      const serviceItem = await prisma.serviceItem.findUnique({
        where: { id: serviceItemId },
        include: {
          serviceCatalog: {
            select: {
              name: true,
              description: true
            }
          },
          service_field_definitions: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      if (!serviceItem) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      // Transform service field definitions to service catalog format
      const transformedFields = serviceItem.service_field_definitions.map((field: any) => ({
        id: field.id,
        name: field.fieldName,
        label: field.fieldLabel,
        type: field.fieldType,
        required: field.isRequired,
        description: field.placeholder,
        placeholder: field.placeholder,
        helpText: '',
        maxLength: field.validationRules?.maxLength || null,
        validationRules: field.validationRules,
        options: field.validationRules?.options || [],
        originalFieldType: field.fieldType,
        isDropdownField: field.fieldType === 'dropdown',
        masterDataType: null
      }));

      res.json({
        success: true,
        data: {
          id: serviceId,
          templateId: null,
          serviceItemId: serviceItem.id,
          name: serviceItem.name,
          description: serviceItem.description,
          category: serviceItem.serviceCatalog,
          fields: transformedFields,
          type: 'service_item',
          estimatedResolutionTime: null,
          defaultRootCause: null,
          defaultIssueType: null
        }
      });
    } else if (serviceId.startsWith('bsg_template_')) {
      // Handle legacy BSG services
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
  const { serviceId, title, description, priority = 'medium', rootCause, issueCategory } = req.body;
  const user = req.user!;
  
  try {
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

    // Map service catalog request to unified format
    const unifiedData: UnifiedTicketCreation = {
      title,
      description,
      priority: priority as any,
      userRootCause: rootCause,
      userIssueCategory: issueCategory,
      customFieldValues: fieldValues,
      attachments: uploadedFiles,
    };

    // Detect service type and add appropriate fields
    if (serviceId.startsWith('template_')) {
      // ServiceTemplate ID format
      const templateId = parseInt(serviceId.replace('template_', ''));
      
      // Get the template to determine service item
      const template = await prisma.serviceTemplate.findUnique({
        where: { id: templateId },
        include: {
          serviceItem: {
            include: {
              serviceCatalog: true
            }
          }
        }
      });
      
      if (template) {
        unifiedData.serviceItemId = template.serviceItemId;
        // ServiceCatalog templates are not KASDA tickets (those come from BSG)
        unifiedData.isKasdaTicket = false;
      }
    } else if (serviceId.startsWith('bsg_template_')) {
      const templateId = parseInt(serviceId.replace('bsg_template_', ''));
      unifiedData.bsgTemplateId = templateId;
      
      // Check if this BSG template is KASDA-related
      const bsgTemplate = await prisma.bSGTemplate.findUnique({
        where: { id: templateId },
        include: { category: true }
      });
      
      // Only mark as KASDA ticket if it's in KASDA category
      unifiedData.isKasdaTicket = bsgTemplate?.category?.name === 'KASDA';
    } else if (serviceId.startsWith('service_')) {
      const itemId = parseInt(serviceId.replace('service_', ''));
      unifiedData.serviceItemId = itemId;
    } else {
      // Legacy service ID format
      const itemId = parseInt(serviceId);
      unifiedData.serviceItemId = itemId;
    }

    console.log('Service Catalog - Creating ticket via unified service:', {
      serviceId,
      type: unifiedData.bsgTemplateId ? 'bsg' : 'service_catalog',
      isKasda: unifiedData.isKasdaTicket
    });

    // Use unified ticket creation service
    const ticket = await UnifiedTicketService.createUnifiedTicket(unifiedData, user);

    res.json({
      success: true,
      data: {
        ticketId: ticket.id,
        title: ticket.title,
        status: ticket.status,
        createdAt: ticket.createdAt,
        attachmentCount: uploadedFiles ? uploadedFiles.length : 0,
        requiresApproval: ticket.requiresBusinessApproval,
        isKasdaTicket: ticket.isKasdaTicket
      },
      message: `Ticket created successfully${ticket.requiresBusinessApproval ? ' and is pending manager approval' : ''}${uploadedFiles && uploadedFiles.length > 0 ? ` with ${uploadedFiles.length} attachment(s)` : ''}`
    });

  } catch (error) {
    console.error('Error creating ticket from service catalog:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      serviceId: serviceId,
      requestBody: req.body,
      userId: user.id
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create ticket',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}));

// @route   GET /api/service-catalog/search
// @desc    Search services across all categories (ServiceCatalog + BSG + Static)
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

    const searchQuery = query.toLowerCase();
    const searchTerms = searchQuery.split(/\s+/).filter(term => term.length > 0);
    const allResults: any[] = [];

    // Create flexible search conditions for multiple terms
    const createMultiTermSearchConditions = (searchTerms: string[]) => {
      const conditions: any[] = [];
      
      // For each search term, create OR conditions across all searchable fields
      searchTerms.forEach(term => {
        conditions.push(
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          // Search in service item names
          { serviceItem: { name: { contains: term, mode: 'insensitive' } } },
          // Search in service catalog names (application names)
          { serviceItem: { serviceCatalog: { name: { contains: term, mode: 'insensitive' } } } }
        );
      });
      
      return conditions;
    };

    // 1. Search ServiceCatalog templates (our main 271 services)
    const serviceTemplates = await prisma.serviceTemplate.findMany({
      where: {
        isVisible: true,
        OR: createMultiTermSearchConditions(searchTerms)
      },
      include: {
        serviceItem: {
          include: {
            serviceCatalog: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        },
        customFieldDefinitions: true
      },
      take: 30
    });

    // Transform ServiceTemplates to search results
    for (const template of serviceTemplates) {
      allResults.push({
        id: `template_${template.id}`,
        name: template.name,
        description: template.description || `${template.name} service request`,
        categoryId: `catalog_${template.serviceItem.serviceCatalog.id}`,
        categoryName: template.serviceItem.serviceCatalog.name,
        templateId: template.id,
        serviceItemId: template.serviceItem.id,
        popularity: 0,
        usageCount: 0,
        hasFields: template.customFieldDefinitions.length > 0,
        fieldCount: template.customFieldDefinitions.length,
        type: 'service_template',
        estimatedResolutionTime: template.estimatedResolutionTime,
        // Add search context for better UX
        searchContext: `${template.serviceItem.serviceCatalog.name} - ${template.name}`
      });
    }

    // 2. Search BSG templates (legacy support)
    const createBSGSearchConditions = (searchTerms: string[]) => {
      const conditions: any[] = [];
      
      searchTerms.forEach(term => {
        conditions.push(
          { name: { contains: term, mode: 'insensitive' } },
          { displayName: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          // Search in category names (application names)
          { category: { name: { contains: term, mode: 'insensitive' } } },
          { category: { displayName: { contains: term, mode: 'insensitive' } } }
        );
      });
      
      return conditions;
    };

    const bsgTemplates = await prisma.bSGTemplate.findMany({
      where: {
        isActive: true,
        OR: createBSGSearchConditions(searchTerms)
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
    // Add search context to BSG services
    bsgServices.forEach((service: any) => {
      const template = bsgTemplates.find(t => t.id === parseInt(service.templateId));
      if (template) {
        service.searchContext = `${template.category.displayName || template.category.name} - ${service.name}`;
        service.categoryName = template.category.displayName || template.category.name;
      }
    });

    // 3. Search static services
    const allStaticServices = [
      ...getStaticServices('hardware_software'),
      ...getStaticServices('network_connectivity'),
      ...getStaticServices('general_requests')
    ];

    const matchingStaticServices = allStaticServices.filter((service: any) => {
      const serviceName = service.name.toLowerCase();
      const serviceDescription = service.description.toLowerCase();
      const serviceCategory = (service.category || '').toLowerCase();
      
      // Check if all search terms are found in the service (name, description, or category)
      return searchTerms.every(term => 
        serviceName.includes(term) ||
        serviceDescription.includes(term) ||
        serviceCategory.includes(term)
      );
    }).map((service: any) => ({
      ...service,
      searchContext: `${service.category || 'General'} - ${service.name}`,
      categoryName: service.category || 'General'
    }));

    // 4. Combine all results
    allResults.push(...bsgServices, ...matchingStaticServices);

    // 5. Enhanced sorting for multi-term search results
    const calculateRelevanceScore = (item: any) => {
      const itemName = item.name.toLowerCase();
      const itemDescription = (item.description || '').toLowerCase();
      const itemCategory = (item.categoryName || '').toLowerCase();
      const itemSearchContext = (item.searchContext || '').toLowerCase();
      
      let score = 0;
      
      // PRIORITY BOOST: Services with dynamic fields get massive boost
      if (item.hasFields && item.fieldCount > 0) {
        score += 1000; // Huge boost for services with actual fields
        console.log(`🚀 Field boost for ${item.name}: +1000 (${item.fieldCount} fields)`);
      }
      
      // PRIORITY BOOST: BSG templates get extra boost (they have working fields)
      if (item.type === 'bsg_service' || item.id?.startsWith('bsg_template_')) {
        score += 500; // Extra boost for BSG templates
        console.log(`🔥 BSG template boost for ${item.name}: +500`);
      }
      
      // PENALTY: ServiceTemplates with no fields get penalized
      if (item.type === 'service_template' && (!item.hasFields || item.fieldCount === 0)) {
        score -= 200; // Penalty for empty ServiceTemplates
        console.log(`⬇️ Empty ServiceTemplate penalty for ${item.name}: -200`);
      }
      
      // Check how many search terms are found and where
      searchTerms.forEach(term => {
        // Exact name match gets highest score
        if (itemName === term) score += 100;
        // Name contains term
        else if (itemName.includes(term)) score += 50;
        // Description contains term
        else if (itemDescription.includes(term)) score += 20;
        // Category contains term
        else if (itemCategory.includes(term)) score += 30;
        // Search context contains term
        else if (itemSearchContext.includes(term)) score += 15;
      });
      
      // Bonus for exact phrase match
      if (itemName.includes(searchQuery)) score += 25;
      if (itemDescription.includes(searchQuery)) score += 10;
      
      // Bonus for shorter names (more specific matches)
      score += Math.max(0, 20 - itemName.length * 0.5);
      
      return score;
    };

    // Sort results by relevance score (highest first)
    const sortedResults = allResults.sort((a, b) => {
      const scoreA = calculateRelevanceScore(a);
      const scoreB = calculateRelevanceScore(b);
      
      // Primary sort by relevance score
      if (scoreA !== scoreB) return scoreB - scoreA;
      
      // Secondary sort by name length (shorter first for same score)
      if (a.name.length !== b.name.length) return a.name.length - b.name.length;
      
      // Tertiary sort alphabetically
      return a.name.localeCompare(b.name);
    });

    res.json({
      success: true,
      data: sortedResults.slice(0, 50), // Limit to top 50 results
      query,
      resultCount: sortedResults.length,
      searchTip: 'Try searching by application + service type (e.g., "OLIBS user", "XCARD password", "BSG reset") or just application names (e.g., "OLIBS", "XCARD")'
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