import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/service-templates/:id/fields
 * Get custom field definitions for a specific service template
 */
router.get('/:id/fields', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid template ID provided'
      });
      return;
    }

    // Verify template exists and user has access
    const template = await prisma.serviceTemplate.findFirst({
      where: {
        id: templateId,
        isVisible: true
      },
      select: {
        id: true,
        name: true,
        serviceItem: {
          select: {
            name: true,
            serviceCatalog: {
              select: {
                name: true,
                departmentId: true
              }
            }
          }
        }
      }
    });

    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Service template not found or not accessible'
      });
      return;
    }

    // Get custom field definitions for this template
    const fieldDefinitions = await prisma.serviceFieldDefinition.findMany({
      where: {
        serviceTemplateId: templateId,
        isVisible: true
      },
      select: {
        id: true,
        fieldName: true,
        fieldLabel: true,
        fieldType: true,
        isRequired: true,
        placeholder: true,
        validationRules: true,
        sortOrder: true,
        defaultValue: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    // Process dropdown fields to include master data options
    const processedFields = await Promise.all(
      fieldDefinitions.map(async (field) => {
        const processedField = { ...field };
        
        // If this is a dropdown field with master data source
        if (field.fieldType === 'dropdown' && field.validationRules) {
          const rules = field.validationRules as any;
          
          if (rules.source === 'master_data' && rules.type) {
            try {
              // Fetch dropdown options from master data
              const masterDataOptions = await prisma.masterDataEntity.findMany({
                where: {
                  type: rules.type,
                  isActive: true
                },
                select: {
                  code: true,
                  name: true,
                  nameIndonesian: true,
                  description: true,
                  metadata: true
                },
                orderBy: {
                  sortOrder: 'asc'
                }
              });

              // Transform to dropdown options format
              const options = masterDataOptions.map(item => ({
                value: item.code,
                label: item.nameIndonesian || item.name,
                description: item.description,
                metadata: item.metadata
              }));

              processedField.validationRules = {
                ...rules,
                options: options
              };
            } catch (error) {
              console.error(`Error loading dropdown options for field ${field.fieldName}:`, error);
              // Keep original validation rules if master data fetch fails
            }
          }
        }
        
        return processedField;
      })
    );

    res.json({
      success: true,
      data: {
        template: {
          id: template.id,
          name: template.name,
          serviceName: template.serviceItem.name,
          catalogName: template.serviceItem.serviceCatalog.name
        },
        fields: processedFields,
        fieldCount: processedFields.length
      }
    });

  } catch (error) {
    console.error('Error fetching template fields:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching template fields'
    });
  }
}));

/**
 * GET /api/service-templates/:id/field-values
 * Get existing custom field values for a ticket using this template
 */
router.get('/:id/field-values/:ticketId', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const templateId = parseInt(req.params.id);
    const ticketId = parseInt(req.params.ticketId);
    
    if (isNaN(templateId) || isNaN(ticketId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid template ID or ticket ID provided'
      });
      return;
    }

    // Verify ticket exists and user has access
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        OR: [
          { createdByUserId: req.user?.id },
          { assignedToUserId: req.user?.id }
        ]
      },
      select: {
        id: true,
        serviceTemplateId: true
      }
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied'
      });
      return;
    }

    if (ticket.serviceTemplateId !== templateId) {
      res.status(400).json({
        success: false,
        message: 'Template ID does not match ticket template'
      });
      return;
    }

    // Get custom field values for this ticket
    const fieldValues = await prisma.ticketServiceFieldValue.findMany({
      where: {
        ticketId: ticketId
      },
      include: {
        fieldDefinition: {
          select: {
            fieldName: true,
            fieldLabel: true,
            fieldType: true
          }
        }
      }
    });

    // Transform to key-value pairs
    const valuesMap = fieldValues.reduce((acc, fieldValue) => {
      acc[fieldValue.fieldDefinition.fieldName] = {
        value: fieldValue.value,
        fieldType: fieldValue.fieldDefinition.fieldType,
        fieldLabel: fieldValue.fieldDefinition.fieldLabel
      };
      return acc;
    }, {} as any);

    res.json({
      success: true,
      data: {
        ticketId: ticketId,
        templateId: templateId,
        fieldValues: valuesMap,
        fieldCount: fieldValues.length
      }
    });

  } catch (error) {
    console.error('Error fetching ticket field values:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching ticket field values'
    });
  }
}));

/**
 * POST /api/service-templates/:id/validate-fields
 * Validate custom field values before ticket submission
 */
router.post('/:id/validate-fields', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const templateId = parseInt(req.params.id);
    const { fieldValues } = req.body;
    
    if (isNaN(templateId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid template ID provided'
      });
      return;
    }

    if (!fieldValues || typeof fieldValues !== 'object') {
      res.status(400).json({
        success: false,
        message: 'Field values object is required'
      });
      return;
    }

    // Get field definitions for validation
    const fieldDefinitions = await prisma.serviceFieldDefinition.findMany({
      where: {
        serviceTemplateId: templateId,
        isVisible: true
      },
      select: {
        fieldName: true,
        fieldLabel: true,
        fieldType: true,
        isRequired: true,
        validationRules: true
      }
    });

    const validationErrors: any[] = [];
    const validatedFields: any[] = [];

    // Validate each field
    for (const fieldDef of fieldDefinitions) {
      const fieldValue = fieldValues[fieldDef.fieldName];
      const fieldError = {
        fieldName: fieldDef.fieldName,
        fieldLabel: fieldDef.fieldLabel,
        errors: [] as string[]
      };

      // Required field validation
      if (fieldDef.isRequired && (!fieldValue || fieldValue.trim() === '')) {
        fieldError.errors.push(`${fieldDef.fieldLabel} is required`);
      }

      // Type and format validation
      if (fieldValue && fieldValue.trim() !== '') {
        const rules = fieldDef.validationRules as any;
        
        switch (fieldDef.fieldType) {
          case 'date':
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fieldValue)) {
              fieldError.errors.push(`${fieldDef.fieldLabel} must be a valid date (YYYY-MM-DD)`);
            } else if (rules?.minDate === 'today' && new Date(fieldValue) < new Date()) {
              fieldError.errors.push(`${fieldDef.fieldLabel} cannot be in the past`);
            }
            break;
            
          case 'number':
            if (!/^\d+$/.test(fieldValue)) {
              fieldError.errors.push(`${fieldDef.fieldLabel} must be a valid number`);
            } else if (rules?.minLength && fieldValue.length < rules.minLength) {
              fieldError.errors.push(`${fieldDef.fieldLabel} must be at least ${rules.minLength} digits`);
            } else if (rules?.maxLength && fieldValue.length > rules.maxLength) {
              fieldError.errors.push(`${fieldDef.fieldLabel} must be at most ${rules.maxLength} digits`);
            }
            break;
            
          case 'text':
            if (rules?.maxLength && fieldValue.length > rules.maxLength) {
              fieldError.errors.push(`${fieldDef.fieldLabel} must be at most ${rules.maxLength} characters`);
            }
            if (rules?.pattern && !new RegExp(rules.pattern).test(fieldValue)) {
              fieldError.errors.push(rules.errorMessage || `${fieldDef.fieldLabel} format is invalid`);
            }
            break;
            
          case 'dropdown':
            if (rules?.source === 'master_data' && rules?.type) {
              // Validate against master data options
              const validOption = await prisma.masterDataEntity.findFirst({
                where: {
                  type: rules.type,
                  code: fieldValue,
                  isActive: true
                }
              });
              
              if (!validOption) {
                fieldError.errors.push(`${fieldDef.fieldLabel} contains an invalid option`);
              }
            }
            break;
        }
      }

      if (fieldError.errors.length > 0) {
        validationErrors.push(fieldError);
      } else {
        validatedFields.push({
          fieldName: fieldDef.fieldName,
          fieldLabel: fieldDef.fieldLabel,
          value: fieldValue,
          isValid: true
        });
      }
    }

    const isValid = validationErrors.length === 0;

    res.json({
      success: true,
      data: {
        isValid: isValid,
        validatedFields: validatedFields,
        validationErrors: validationErrors,
        summary: {
          totalFields: fieldDefinitions.length,
          validFields: validatedFields.length,
          invalidFields: validationErrors.length
        }
      }
    });

  } catch (error) {
    console.error('Error validating template fields:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating template fields'
    });
  }
}));

export default router;