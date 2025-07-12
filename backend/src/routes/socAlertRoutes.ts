// SOC Alert Management Routes - Security Operations Center
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';
import { UnifiedTicketService, UnifiedTicketCreation } from './enhancedTicketRoutes';

const router = express.Router();
const prisma = new PrismaClient();

// SOC Alert Severity Levels
export enum AlertSeverity {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
    INFORMATIONAL = 'informational'
}

// SOC Alert Types
export enum AlertType {
    NETWORK_INTRUSION = 'Network Intrusion Detection',
    MALWARE_DETECTION = 'Malware Detection Alert',
    DATA_BREACH = 'Data Breach Incident',
    SUSPICIOUS_LOGIN = 'Suspicious Login Activity',
    DDOS_ATTACK = 'DDoS Attack Detection',
    PHISHING_CAMPAIGN = 'Phishing Campaign Alert',
    INSIDER_THREAT = 'Insider Threat Detection',
    VULNERABILITY_ASSESSMENT = 'Vulnerability Assessment Alert',
    COMPLIANCE_VIOLATION = 'Compliance Violation Alert',
    SECURITY_TOOL_FAILURE = 'Security Tool Failure'
}

// SOC Alert Ingestion Interface
interface SOCAlertPayload {
    alertType: AlertType;
    severity: AlertSeverity;
    title: string;
    description: string;
    sourceSystem: string;
    detectionTimestamp: string;
    affectedSystems: string[];
    ruleId?: string;
    threatIndicators?: string[];
    attackVector?: string;
    threatActor?: string;
    businessImpact?: string;
    requiresRegulatoryNotification?: boolean;
    evidence?: string;
    customFields?: Record<string, any>;
}

// Webhook Authentication Middleware
const validateWebhookToken = (req: Request, res: Response, next: express.NextFunction): void => {
    const authHeader = req.headers.authorization;
    const webhookToken = process.env.SOC_WEBHOOK_TOKEN || 'soc-alert-webhook-token-2025';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Webhook token required'
        });
        return;
    }
    
    const token = authHeader.substring(7);
    if (token !== webhookToken) {
        res.status(401).json({
            success: false,
            message: 'Invalid webhook token'
        });
        return;
    }
    
    next();
};

// @route   POST /api/soc-alerts/ingest
// @desc    Ingest security alerts from SIEM systems and security tools
// @access  Webhook (Token Required)
router.post('/ingest', validateWebhookToken, asyncHandler(async (req: Request, res: Response) => {
    try {
        const alertData = req.body as SOCAlertPayload;
        
        // Validate required fields
        if (!alertData.alertType || !alertData.severity || !alertData.title || !alertData.sourceSystem) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: alertType, severity, title, sourceSystem'
            });
        }

        console.log('🚨 SOC Alert Ingestion:', {
            type: alertData.alertType,
            severity: alertData.severity,
            source: alertData.sourceSystem,
            timestamp: alertData.detectionTimestamp
        });

        // Find the appropriate service item for this alert type
        const serviceItem = await prisma.serviceItem.findFirst({
            where: {
                name: alertData.alertType,
                serviceCatalog: {
                    name: 'Security Operations Center'
                }
            },
            include: {
                serviceCatalog: true,
                templates: {
                    where: { isVisible: true },
                    include: {
                        customFieldDefinitions: true
                    }
                }
            }
        });

        if (!serviceItem) {
            return res.status(404).json({
                success: false,
                message: `Alert type ${alertData.alertType} not found in SOC catalog`
            });
        }

        // Get SOC analyst user (default assignee for automated alerts)
        const socAnalyst = await prisma.user.findFirst({
            where: {
                username: 'soc.analyst.l1',
                department: {
                    name: 'Security & Compliance'
                }
            }
        });

        // Prepare custom field values for SOC alert
        const socFieldValues: Record<string, any> = {
            alert_severity: alertData.severity,
            alert_source: alertData.sourceSystem,
            detection_timestamp: alertData.detectionTimestamp || new Date().toISOString(),
            affected_systems: Array.isArray(alertData.affectedSystems) 
                ? alertData.affectedSystems.join(', ') 
                : alertData.affectedSystems || '',
            alert_rule_id: alertData.ruleId || '',
            threat_indicators: Array.isArray(alertData.threatIndicators)
                ? alertData.threatIndicators.join(', ')
                : alertData.threatIndicators || '',
            attack_vector: alertData.attackVector || '',
            threat_actor: alertData.threatActor || '',
            business_impact: alertData.businessImpact || 'none',
            regulatory_notification: alertData.requiresRegulatoryNotification ? 'yes' : 'no',
            response_team: 'soc_l1',
            evidence_collected: alertData.evidence || '',
            remediation_actions: '',
            containment_status: 'not_contained',
            false_positive_likelihood: 'low',
            ...alertData.customFields
        };

        // Determine priority based on severity
        const priorityMapping: Record<AlertSeverity, 'low' | 'medium' | 'high' | 'urgent'> = {
            [AlertSeverity.CRITICAL]: 'urgent',
            [AlertSeverity.HIGH]: 'high',
            [AlertSeverity.MEDIUM]: 'medium',
            [AlertSeverity.LOW]: 'low',
            [AlertSeverity.INFORMATIONAL]: 'low'
        };

        // Create unified ticket for SOC alert
        const unifiedData: UnifiedTicketCreation = {
            title: `[${alertData.severity.toUpperCase()}] ${alertData.title}`,
            description: `${alertData.description}\n\n--- SOC Alert Details ---\nSource: ${alertData.sourceSystem}\nDetected: ${alertData.detectionTimestamp}\nSeverity: ${alertData.severity}\nAlert Type: ${alertData.alertType}`,
            priority: priorityMapping[alertData.severity],
            serviceItemId: serviceItem.id,
            customFieldValues: socFieldValues,
            isKasdaTicket: alertData.requiresRegulatoryNotification || false
        };

        // Create ticket via unified service
        const ticket = await UnifiedTicketService.createUnifiedTicket(
            unifiedData,
            socAnalyst || { 
                id: 1, 
                role: 'technician', 
                email: 'soc@bsg.co.id',
                departmentId: 8,
                unitId: null 
            }
        );

        // Log alert ingestion for monitoring
        console.log('✅ SOC Alert Ticket Created:', {
            ticketId: ticket.id,
            alertType: alertData.alertType,
            severity: alertData.severity,
            sourceSystem: alertData.sourceSystem,
            assignedTo: socAnalyst?.username || 'unassigned'
        });

        res.json({
            success: true,
            data: {
                ticketId: ticket.id,
                alertType: alertData.alertType,
                severity: alertData.severity,
                status: ticket.status,
                assignedTo: socAnalyst?.username || 'unassigned',
                requiresApproval: ticket.requiresBusinessApproval,
                isKasdaTicket: ticket.isKasdaTicket,
                estimatedResolutionTime: serviceItem.templates[0]?.estimatedResolutionTime || 60
            },
            message: `SOC alert ticket created successfully. Ticket ID: ${ticket.id}`
        });

    } catch (error) {
        console.error('❌ Error ingesting SOC alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to ingest SOC alert',
            error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
    }
}));

// @route   POST /api/soc-alerts/bulk-ingest
// @desc    Bulk ingest multiple security alerts
// @access  Webhook (Token Required)
router.post('/bulk-ingest', validateWebhookToken, asyncHandler(async (req: Request, res: Response) => {
    try {
        const alerts = req.body.alerts as SOCAlertPayload[];
        
        if (!Array.isArray(alerts) || alerts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request: alerts array is required'
            });
        }

        if (alerts.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Bulk limit exceeded: maximum 100 alerts per request'
            });
        }

        console.log(`🚨 SOC Bulk Alert Ingestion: ${alerts.length} alerts`);

        const results: any[] = [];
        const errors: any[] = [];

        for (let i = 0; i < alerts.length; i++) {
            try {
                // Create individual alert request
                const alertReq = {
                    body: alerts[i],
                    headers: req.headers
                } as Request;

                const alertRes = {
                    json: (data: any) => data,
                    status: (code: number) => ({ json: (data: any) => ({ statusCode: code, ...data }) })
                } as any;

                // Process individual alert (reuse single alert logic)
                await processSOCAlert(alerts[i], results, errors, i);
                
            } catch (error) {
                errors.push({
                    index: i,
                    alert: alerts[i],
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        console.log(`✅ SOC Bulk Ingestion Complete: ${results.length} created, ${errors.length} errors`);

        res.json({
            success: true,
            data: {
                totalProcessed: alerts.length,
                successfullyCreated: results.length,
                errors: errors.length,
                tickets: results,
                failedAlerts: errors
            },
            message: `Bulk SOC alert ingestion completed. ${results.length}/${alerts.length} alerts processed successfully.`
        });

    } catch (error) {
        console.error('❌ Error in bulk SOC alert ingestion:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process bulk SOC alerts',
            error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
    }
}));

// Helper function to process individual SOC alerts
async function processSOCAlert(alertData: SOCAlertPayload, results: any[], errors: any[], index: number) {
    // Find service item
    const serviceItem = await prisma.serviceItem.findFirst({
        where: {
            name: alertData.alertType,
            serviceCatalog: { name: 'Security Operations Center' }
        },
        include: { templates: { include: { customFieldDefinitions: true } } }
    });

    if (!serviceItem) {
        throw new Error(`Alert type ${alertData.alertType} not found`);
    }

    // Get SOC analyst
    const socAnalyst = await prisma.user.findFirst({
        where: { username: 'soc.analyst.l1' }
    });

    // Prepare field values
    const socFieldValues: Record<string, any> = {
        alert_severity: alertData.severity,
        alert_source: alertData.sourceSystem,
        detection_timestamp: alertData.detectionTimestamp || new Date().toISOString(),
        affected_systems: Array.isArray(alertData.affectedSystems) 
            ? alertData.affectedSystems.join(', ') 
            : alertData.affectedSystems || '',
        alert_rule_id: alertData.ruleId || '',
        threat_indicators: Array.isArray(alertData.threatIndicators)
            ? alertData.threatIndicators.join(', ')
            : alertData.threatIndicators || '',
        attack_vector: alertData.attackVector || '',
        threat_actor: alertData.threatActor || '',
        business_impact: alertData.businessImpact || 'none',
        regulatory_notification: alertData.requiresRegulatoryNotification ? 'yes' : 'no',
        response_team: 'soc_l1',
        evidence_collected: alertData.evidence || '',
        remediation_actions: '',
        containment_status: 'not_contained',
        false_positive_likelihood: 'low',
        ...alertData.customFields
    };

    // Priority mapping
    const priorityMapping: Record<AlertSeverity, 'low' | 'medium' | 'high' | 'urgent'> = {
        [AlertSeverity.CRITICAL]: 'urgent',
        [AlertSeverity.HIGH]: 'high',
        [AlertSeverity.MEDIUM]: 'medium',
        [AlertSeverity.LOW]: 'low',
        [AlertSeverity.INFORMATIONAL]: 'low'
    };

    // Create ticket
    const unifiedData: UnifiedTicketCreation = {
        title: `[${alertData.severity.toUpperCase()}] ${alertData.title}`,
        description: `${alertData.description}\n\n--- SOC Alert Details ---\nSource: ${alertData.sourceSystem}\nDetected: ${alertData.detectionTimestamp}\nSeverity: ${alertData.severity}\nAlert Type: ${alertData.alertType}`,
        priority: priorityMapping[alertData.severity],
        serviceItemId: serviceItem.id,
        customFieldValues: socFieldValues,
        isKasdaTicket: alertData.requiresRegulatoryNotification || false
    };

    const ticket = await UnifiedTicketService.createUnifiedTicket(
        unifiedData,
        socAnalyst || { 
            id: 1, 
            role: 'technician', 
            email: 'soc@bsg.co.id',
            departmentId: 8,
            unitId: null 
        }
    );

    results.push({
        index,
        ticketId: ticket.id,
        alertType: alertData.alertType,
        severity: alertData.severity,
        status: ticket.status
    });
}

// @route   GET /api/soc-alerts/dashboard
// @desc    Get SOC alert dashboard with real-time metrics
// @access  Private (SOC Team)
router.get('/dashboard', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Check if user is SOC team member
        if (!req.user || req.user.departmentId !== 8) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. SOC team access required.'
            });
        }

        const { period = '24' } = req.query;
        const hours = parseInt(period as string);
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - hours);

        // Get SOC alerts for the period
        const socAlerts = await prisma.ticket.findMany({
            where: {
                createdAt: { gte: startDate },
                serviceItem: {
                    serviceCatalog: {
                        name: 'Security Operations Center'
                    }
                }
            },
            include: {
                serviceItem: {
                    include: {
                        serviceCatalog: true
                    }
                },
                assignedTo: {
                    select: { username: true, name: true }
                },
                serviceFieldValues: {
                    include: {
                        fieldDefinition: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Analyze alerts by severity
        const severityStats = socAlerts.reduce((acc: any, ticket) => {
            const severityField = ticket.serviceFieldValues.find(
                (fv: any) => fv.fieldDefinition.fieldName === 'alert_severity'
            );
            const severity = severityField?.value || 'unknown';
            
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
        }, {});

        // Analyze alerts by source system
        const sourceStats = socAlerts.reduce((acc: any, ticket) => {
            const sourceField = ticket.serviceFieldValues.find(
                (fv: any) => fv.fieldDefinition.fieldName === 'alert_source'
            );
            const source = sourceField?.value || 'unknown';
            
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});

        // Analyze alerts by type
        const typeStats = socAlerts.reduce((acc: any, ticket) => {
            const type = ticket.serviceItem?.name || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        // Response time analysis
        const responseTimeStats = socAlerts.filter(t => t.status !== 'pending_approval').map(ticket => {
            const createdAt = new Date(ticket.createdAt);
            const firstResponseAt = ticket.updatedAt; // Simplified - could be first comment
            const responseTimeMinutes = Math.round((firstResponseAt.getTime() - createdAt.getTime()) / (1000 * 60));
            return responseTimeMinutes;
        });

        const avgResponseTime = responseTimeStats.length > 0 
            ? Math.round(responseTimeStats.reduce((a, b) => a + b, 0) / responseTimeStats.length)
            : 0;

        // Recent critical alerts
        const criticalAlerts = socAlerts.filter(ticket => {
            const severityField = ticket.serviceFieldValues.find(
                (fv: any) => fv.fieldDefinition.fieldName === 'alert_severity'
            );
            return severityField?.value === 'critical';
        }).slice(0, 10);

        // Active incidents requiring attention
        const activeIncidents = socAlerts.filter(ticket => 
            ['open', 'assigned', 'in_progress'].includes(ticket.status)
        ).length;

        res.json({
            success: true,
            data: {
                period: `Last ${hours} hours`,
                overview: {
                    totalAlerts: socAlerts.length,
                    activeIncidents,
                    avgResponseTimeMinutes: avgResponseTime,
                    criticalAlerts: severityStats.critical || 0,
                    highAlerts: severityStats.high || 0,
                    resolvedAlerts: socAlerts.filter(t => ['resolved', 'closed'].includes(t.status)).length
                },
                breakdowns: {
                    bySeverity: severityStats,
                    bySourceSystem: sourceStats,
                    byAlertType: typeStats
                },
                recentCriticalAlerts: criticalAlerts.map(ticket => ({
                    id: ticket.id,
                    title: ticket.title,
                    alertType: ticket.serviceItem?.name,
                    status: ticket.status,
                    assignedTo: ticket.assignedTo?.username || 'unassigned',
                    createdAt: ticket.createdAt
                })),
                trends: {
                    hourlyAlertCounts: calculateHourlyTrends(socAlerts, hours)
                }
            }
        });

    } catch (error) {
        console.error('❌ Error fetching SOC dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch SOC dashboard',
            error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
    }
}));

// Helper function to calculate hourly trends
function calculateHourlyTrends(alerts: any[], periodHours: number) {
    const trends = [];
    const now = new Date();
    
    for (let i = periodHours - 1; i >= 0; i--) {
        const hourStart = new Date(now);
        hourStart.setHours(hourStart.getHours() - i, 0, 0, 0);
        
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(hourEnd.getHours() + 1);
        
        const alertsInHour = alerts.filter(alert => {
            const alertTime = new Date(alert.createdAt);
            return alertTime >= hourStart && alertTime < hourEnd;
        });
        
        trends.push({
            hour: hourStart.toISOString(),
            alertCount: alertsInHour.length,
            criticalCount: alertsInHour.filter((a: any) => {
                const severityField = a.serviceFieldValues?.find(
                    (fv: any) => fv.fieldDefinition?.fieldName === 'alert_severity'
                );
                return severityField?.value === 'critical';
            }).length
        });
    }
    
    return trends;
}

// @route   GET /api/soc-alerts/threat-intelligence
// @desc    Get threat intelligence and IOC summary
// @access  Private (SOC Team)
router.get('/threat-intelligence', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Check SOC access
        if (!req.user || req.user.departmentId !== 8) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. SOC team access required.'
            });
        }

        const { days = '7' } = req.query;
        const daysBack = parseInt(days as string);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        // Get threat intelligence from recent alerts
        const threatAlerts = await prisma.ticket.findMany({
            where: {
                createdAt: { gte: startDate },
                serviceItem: {
                    serviceCatalog: { name: 'Security Operations Center' }
                },
                serviceFieldValues: {
                    some: {
                        fieldDefinition: { fieldName: 'threat_indicators' },
                        value: { not: null }
                    }
                }
            },
            include: {
                serviceItem: true,
                serviceFieldValues: {
                    include: { fieldDefinition: true }
                }
            }
        });

        // Extract and analyze threat indicators
        const threatIndicators = new Set<string>();
        const threatActors = new Set<string>();
        const attackVectors = new Set<string>();

        threatAlerts.forEach(alert => {
            alert.serviceFieldValues.forEach((fieldValue: any) => {
                const fieldName = fieldValue.fieldDefinition.fieldName;
                const value = fieldValue.value;

                if (fieldName === 'threat_indicators' && value) {
                    value.split(',').forEach((indicator: string) => {
                        const cleaned = indicator.trim();
                        if (cleaned) threatIndicators.add(cleaned);
                    });
                }

                if (fieldName === 'threat_actor' && value) {
                    threatActors.add(value.trim());
                }

                if (fieldName === 'attack_vector' && value) {
                    attackVectors.add(value.trim());
                }
            });
        });

        // Categorize IOCs
        const iocCategories = {
            ipAddresses: Array.from(threatIndicators).filter(ioc => 
                /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc)
            ),
            domains: Array.from(threatIndicators).filter(ioc => 
                /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(ioc)
            ),
            fileHashes: Array.from(threatIndicators).filter(ioc => 
                /^[a-fA-F0-9]{32,64}$/.test(ioc)
            ),
            other: Array.from(threatIndicators).filter(ioc => 
                !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc) &&
                !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(ioc) &&
                !/^[a-fA-F0-9]{32,64}$/.test(ioc)
            )
        };

        res.json({
            success: true,
            data: {
                period: `Last ${daysBack} days`,
                summary: {
                    totalThreatAlerts: threatAlerts.length,
                    uniqueIOCs: threatIndicators.size,
                    identifiedThreatActors: threatActors.size,
                    attackVectorTypes: attackVectors.size
                },
                indicators: {
                    ipAddresses: iocCategories.ipAddresses,
                    domains: iocCategories.domains,
                    fileHashes: iocCategories.fileHashes,
                    other: iocCategories.other
                },
                threatActors: Array.from(threatActors),
                attackVectors: Array.from(attackVectors),
                recentThreats: threatAlerts.slice(0, 10).map(alert => ({
                    id: alert.id,
                    title: alert.title,
                    alertType: alert.serviceItem?.name,
                    createdAt: alert.createdAt,
                    status: alert.status
                }))
            }
        });

    } catch (error) {
        console.error('❌ Error fetching threat intelligence:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch threat intelligence',
            error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
    }
}));

export default router;