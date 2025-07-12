#!/usr/bin/env node

/**
 * Test SOC Alert Ingestion System
 * This script demonstrates how external SIEM systems can send alerts to the BSG SOC
 */

const axios = require('axios');

// Configuration
const SOC_API_BASE = 'http://localhost:3001/api/soc-alerts';
const WEBHOOK_TOKEN = 'soc-alert-webhook-token-2025'; // Default token for testing

// Sample SOC Alert Payloads
const sampleAlerts = [
    {
        alertType: 'Network Intrusion Detection',
        severity: 'critical',
        title: 'Suspicious Network Activity - Potential APT Attack',
        description: 'Multiple failed login attempts followed by successful login from IP 192.168.1.100. Lateral movement detected across domain controllers.',
        sourceSystem: 'FortiGate IDS',
        detectionTimestamp: new Date().toISOString(),
        affectedSystems: ['DC01.bsg.local', 'DC02.bsg.local', '192.168.1.100'],
        ruleId: 'FG_APT_LATERAL_001',
        threatIndicators: ['192.168.1.100', 'malicious-domain.com', 'c8d4e3f2a1b0'],
        attackVector: 'network',
        threatActor: 'APT29 (Cozy Bear)',
        businessImpact: 'high',
        requiresRegulatoryNotification: true,
        evidence: 'Network logs captured, memory dumps collected from affected systems'
    },
    {
        alertType: 'Malware Detection Alert',
        severity: 'high',
        title: 'Banking Trojan Detected on Teller Workstation',
        description: 'CrowdStrike detected Zeus banking trojan variant on teller workstation TELLER-05. Process terminated automatically.',
        sourceSystem: 'CrowdStrike Falcon',
        detectionTimestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        affectedSystems: ['TELLER-05.bsg.local'],
        ruleId: 'CS_MALWARE_ZEUS_001',
        threatIndicators: ['zeus_variant.exe', 'c2-server.malicious.com', '45.123.45.67'],
        attackVector: 'email',
        threatActor: 'Unknown',
        businessImpact: 'high',
        requiresRegulatoryNotification: true,
        evidence: 'Binary sample quarantined, endpoint forensics initiated'
    },
    {
        alertType: 'Suspicious Login Activity',
        severity: 'medium',
        title: 'Anomalous Login Pattern - After Hours Access',
        description: 'User account "manager.cabang" logged in from unusual location at 02:30 AM, outside normal business hours.',
        sourceSystem: 'Microsoft Sentinel',
        detectionTimestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        affectedSystems: ['OLIBS-PROD', 'BSG-AD-01'],
        ruleId: 'MS_LOGIN_ANOMALY_002',
        threatIndicators: ['203.45.67.89'],
        attackVector: 'insider',
        businessImpact: 'medium',
        requiresRegulatoryNotification: false,
        evidence: 'Login logs and session activity recorded'
    },
    {
        alertType: 'DDoS Attack Detection',
        severity: 'high',
        title: 'Volumetric DDoS Attack on Internet Banking Portal',
        description: 'Cloudflare detected volumetric DDoS attack targeting BSG internet banking portal. Traffic volume: 50 Gbps.',
        sourceSystem: 'Cloudflare Security',
        detectionTimestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        affectedSystems: ['ibsg.co.id', 'BSG-WEB-LB01', 'BSG-WEB-LB02'],
        ruleId: 'CF_DDOS_VOL_001',
        threatIndicators: ['botnet-c2.darknet', '185.220.101.x/24'],
        attackVector: 'network',
        businessImpact: 'critical',
        requiresRegulatoryNotification: false,
        evidence: 'Traffic analysis logs, packet captures available'
    },
    {
        alertType: 'Phishing Campaign Alert',
        severity: 'medium',
        title: 'Targeted Phishing Campaign Against BSG Employees',
        description: 'Microsoft Defender detected phishing emails targeting BSG employees with fake BSG login pages.',
        sourceSystem: 'Microsoft Defender',
        detectionTimestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        affectedSystems: ['Exchange Online', 'BSG Email Gateway'],
        ruleId: 'MD_PHISH_TARGETED_001',
        threatIndicators: ['fake-bsg-portal.com', 'phishing@attacker.com'],
        attackVector: 'email',
        businessImpact: 'medium',
        requiresRegulatoryNotification: false,
        evidence: 'Email samples collected, URLs analyzed'
    }
];

async function testSOCAlertIngestion() {
    console.log('🔒 Testing SOC Alert Ingestion System');
    console.log('=====================================\n');

    try {
        // Test 1: Single Alert Ingestion
        console.log('📡 Testing Single Alert Ingestion...');
        const singleAlert = sampleAlerts[0];
        
        const singleResponse = await axios.post(`${SOC_API_BASE}/ingest`, singleAlert, {
            headers: {
                'Authorization': `Bearer ${WEBHOOK_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Single Alert Response:', {
            success: singleResponse.data.success,
            ticketId: singleResponse.data.data.ticketId,
            severity: singleResponse.data.data.severity,
            assignedTo: singleResponse.data.data.assignedTo
        });

        // Test 2: Bulk Alert Ingestion
        console.log('\n📦 Testing Bulk Alert Ingestion...');
        const bulkResponse = await axios.post(`${SOC_API_BASE}/bulk-ingest`, {
            alerts: sampleAlerts
        }, {
            headers: {
                'Authorization': `Bearer ${WEBHOOK_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Bulk Alert Response:', {
            success: bulkResponse.data.success,
            totalProcessed: bulkResponse.data.data.totalProcessed,
            successfullyCreated: bulkResponse.data.data.successfullyCreated,
            errors: bulkResponse.data.data.errors
        });

        // Test 3: SOC Dashboard (requires authentication)
        console.log('\n📊 Testing SOC Dashboard Access...');
        try {
            // First, try to get an auth token (this would normally be done by SOC analysts)
            const dashboardResponse = await axios.get(`${SOC_API_BASE}/dashboard?period=24`, {
                headers: {
                    'Authorization': 'Bearer your-auth-token-here' // This would be a real JWT token
                }
            });
            console.log('✅ Dashboard Data Available');
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('⚠️  Dashboard requires SOC analyst authentication (expected)');
            } else {
                console.error('❌ Dashboard Error:', error.message);
            }
        }

        // Test 4: Threat Intelligence Endpoint
        console.log('\n🎯 Testing Threat Intelligence Endpoint...');
        try {
            const threatResponse = await axios.get(`${SOC_API_BASE}/threat-intelligence?days=7`, {
                headers: {
                    'Authorization': 'Bearer your-auth-token-here'
                }
            });
            console.log('✅ Threat Intelligence Available');
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('⚠️  Threat Intelligence requires SOC analyst authentication (expected)');
            } else {
                console.error('❌ Threat Intelligence Error:', error.message);
            }
        }

        // Test 5: Invalid Webhook Token
        console.log('\n🔐 Testing Invalid Webhook Token...');
        try {
            await axios.post(`${SOC_API_BASE}/ingest`, sampleAlerts[1], {
                headers: {
                    'Authorization': 'Bearer invalid-token',
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid token properly rejected');
            } else {
                console.error('❌ Unexpected error:', error.message);
            }
        }

        console.log('\n🎉 SOC Alert Ingestion Testing Complete!');
        console.log('\n📋 Integration Guide for SIEM Systems:');
        console.log('=====================================');
        console.log('1. Webhook URL: http://your-bsg-server.com/api/soc-alerts/ingest');
        console.log('2. Authentication: Bearer token in Authorization header');
        console.log('3. Content-Type: application/json');
        console.log('4. Bulk endpoint: /api/soc-alerts/bulk-ingest (up to 100 alerts)');
        console.log('5. Rate limit: Consider implementing rate limiting for production');
        console.log('\n🔧 Supported SIEM Integrations:');
        console.log('- Splunk (webhook/HTTP event collector)');
        console.log('- QRadar (custom action)');
        console.log('- Microsoft Sentinel (playbook/logic app)');
        console.log('- FortiSIEM (notification action)');
        console.log('- CrowdStrike (custom integration)');
        console.log('- Any system supporting HTTP webhooks');

    } catch (error) {
        console.error('❌ SOC Alert Ingestion Test Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

// SIEM Integration Examples
function showSIEMIntegrationExamples() {
    console.log('\n🔗 SIEM Integration Examples');
    console.log('============================\n');

    console.log('1. Splunk HTTP Event Collector:');
    console.log(`
curl -X POST "${SOC_API_BASE}/ingest" \\
  -H "Authorization: Bearer ${WEBHOOK_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "alertType": "Network Intrusion Detection",
    "severity": "high",
    "title": "Splunk Alert: Suspicious Network Activity",
    "description": "Details from Splunk search",
    "sourceSystem": "Splunk Enterprise",
    "detectionTimestamp": "2025-07-10T15:30:00Z",
    "affectedSystems": ["server1", "server2"]
  }'
    `);

    console.log('\n2. Microsoft Sentinel Logic App:');
    console.log(`
// In Azure Logic App HTTP action:
{
  "method": "POST",
  "uri": "${SOC_API_BASE}/ingest",
  "headers": {
    "Authorization": "Bearer ${WEBHOOK_TOKEN}",
    "Content-Type": "application/json"
  },
  "body": {
    "alertType": "@{triggerBody()?['AlertType']}",
    "severity": "@{triggerBody()?['Severity']}",
    "title": "@{triggerBody()?['AlertName']}",
    "description": "@{triggerBody()?['Description']}",
    "sourceSystem": "Microsoft Sentinel",
    "detectionTimestamp": "@{triggerBody()?['TimeGenerated']}",
    "affectedSystems": "@{triggerBody()?['Entities']}"
  }
}
    `);

    console.log('\n3. FortiSIEM Custom Action:');
    console.log(`
# FortiSIEM Notification Action
URL: ${SOC_API_BASE}/ingest
Method: POST
Headers: Authorization: Bearer ${WEBHOOK_TOKEN}
Content-Type: application/json
Body:
{
  "alertType": "Network Intrusion Detection",
  "severity": "%%eventSeverity%%",
  "title": "FortiSIEM Alert: %%ruleName%%",
  "description": "%%eventSummary%%",
  "sourceSystem": "FortiSIEM",
  "detectionTimestamp": "%%receiveTime%%",
  "affectedSystems": ["%%srcIpAddr%%", "%%destIpAddr%%"]
}
    `);
}

// Run the tests
if (require.main === module) {
    testSOCAlertIngestion()
        .then(() => showSIEMIntegrationExamples())
        .catch(console.error);
}