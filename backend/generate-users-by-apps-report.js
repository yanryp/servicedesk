#!/usr/bin/env node

/**
 * BSG Users Report by Applications
 * Generates comprehensive user access report organized by BSG applications
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const baseURL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'VERY_VERY_VERY_SECRET_KEY';

// Create admin token
function createAdminToken() {
    const payload = {
        id: 1,
        role: 'admin',
        email: 'admin@bsg.co.id',
        departmentId: 1,
        unitId: 1,
        username: 'admin',
        isBusinessReviewer: true
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// Generate User Access Summary Report
async function generateUserAccessSummary() {
    console.log('📊 Generating BSG Users by Applications Report');
    console.log('===============================================\n');
    
    const token = createAdminToken();
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    try {
        // Get user access summary
        console.log('🔍 Fetching user access data...');
        const response = await axios.get(`${baseURL}/api/reports/user-access-summary`, { headers });
        
        if (response.status === 200 && response.data.success) {
            const reportData = response.data.data;
            
            console.log('📈 BSG USER ACCESS SUMMARY REPORT');
            console.log('Generated:', new Date().toLocaleString());
            console.log('====================================\n');
            
            // Overall summary
            console.log('📊 OVERALL SUMMARY:');
            console.log(`   • Total Applications: ${reportData.summary.totalApplications}`);
            console.log(`   • Total User Requests: ${reportData.summary.totalUserRequests}`);
            console.log(`   • Pending Approvals: ${reportData.summary.pendingApprovals}`);
            console.log(`   • Active Requests: ${reportData.summary.activeRequests}\n`);
            
            // Application breakdown
            if (reportData.applicationBreakdown && reportData.applicationBreakdown.length > 0) {
                console.log('🏦 APPLICATIONS BREAKDOWN:');
                reportData.applicationBreakdown.forEach((app, index) => {
                    console.log(`   ${index + 1}. ${app.applicationName}`);
                    console.log(`      • Total Users: ${app.totalUsers}`);
                    console.log(`      • Active Requests: ${app.activeRequests}`);
                    console.log(`      • Pending Approvals: ${app.pendingApprovals}`);
                    console.log('');
                });
            } else {
                console.log('📝 No application-specific user access data found.');
                console.log('   This might indicate:');
                console.log('   • No tickets have been created with BSG application fields');
                console.log('   • User management tickets haven\'t been processed yet');
                console.log('   • System is ready but waiting for real user access requests\n');
            }
            
            // Detailed user data
            if (reportData.detailedData && reportData.detailedData.length > 0) {
                console.log('👥 USER ACCESS DETAILS:');
                reportData.detailedData.slice(0, 10).forEach((user, index) => {
                    console.log(`   ${index + 1}. User: ${user.namaUser || 'N/A'} (${user.kodeUser || 'N/A'})`);
                    console.log(`      • Application: ${user.applicationName}`);
                    console.log(`      • Branch: ${user.branch}`);
                    console.log(`      • Status: ${user.status}`);
                    console.log(`      • Request Date: ${new Date(user.requestDate).toLocaleDateString()}`);
                    console.log('');
                });
                
                if (reportData.detailedData.length > 10) {
                    console.log(`   ... and ${reportData.detailedData.length - 10} more users\n`);
                }
            }
            
        } else {
            console.log('❌ Failed to retrieve user access data');
        }
        
    } catch (error) {
        if (error.response) {
            console.log(`❌ API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        } else {
            console.log(`❌ Network Error: ${error.message}`);
        }
    }
}

// Generate Application-Specific Reports
async function generateApplicationReports() {
    console.log('\n🔍 CHECKING INDIVIDUAL BSG APPLICATIONS');
    console.log('=====================================\n');
    
    const token = createAdminToken();
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    // List of BSG applications to check
    const bsgApplications = [
        'OLIBS',
        'XCARD', 
        'BSG QRIS',
        'BSGTouch',
        'TellerApp/Reporting',
        'SMS BANKING',
        'KLAIM',
        'ATM',
        'Operational Extensions'
    ];
    
    for (const app of bsgApplications) {
        try {
            console.log(`📱 Checking application: ${app}`);
            const response = await axios.get(`${baseURL}/api/reports/application-users/${encodeURIComponent(app)}`, { headers });
            
            if (response.status === 200 && response.data.success) {
                const appData = response.data.data;
                console.log(`   ✅ Application found in system`);
                console.log(`   • Total Users: ${appData.summary.totalUsers}`);
                console.log(`   • Active Users: ${appData.summary.activeUsers}`);
                console.log(`   • Pending Users: ${appData.summary.pendingUsers}`);
                console.log(`   • Branches Using: ${appData.summary.branches}`);
            } else {
                console.log(`   ⚠️  No data available`);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`   📝 No users found for ${app}`);
            } else {
                console.log(`   ❌ Error checking ${app}: ${error.message}`);
            }
        }
        console.log('');
    }
}

// Generate Excel Report
async function generateExcelReport() {
    console.log('📄 GENERATING EXCEL REPORT');
    console.log('==========================\n');
    
    const token = createAdminToken();
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    try {
        console.log('🔄 Requesting Excel export...');
        const response = await axios.get(`${baseURL}/api/reports/user-access-summary?format=excel`, { 
            headers,
            responseType: 'arraybuffer'
        });
        
        if (response.status === 200) {
            const filename = `bsg-users-by-applications-${new Date().toISOString().split('T')[0]}.xlsx`;
            const filepath = `/Users/yanrypangouw/Documents/Projects/Web/ticketing-system/backend/${filename}`;
            
            fs.writeFileSync(filepath, response.data);
            
            console.log('✅ Excel report generated successfully!');
            console.log(`📁 File saved: ${filepath}`);
            console.log(`💾 File size: ${response.data.length} bytes`);
            console.log(`📊 Content-Type: ${response.headers['content-type']}`);
            
            return filepath;
        } else {
            console.log(`❌ Excel generation failed: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Excel generation error: ${error.message}`);
    }
}

// Generate Branch Analytics Report
async function generateBranchAnalytics() {
    console.log('\n🏢 BSG BRANCH ANALYTICS');
    console.log('=====================\n');
    
    const token = createAdminToken();
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    try {
        const response = await axios.get(`${baseURL}/api/reports/branch-access-analytics?period=30`, { headers });
        
        if (response.status === 200 && response.data.success) {
            const branchData = response.data.data;
            
            console.log('📊 BRANCH SUMMARY:');
            console.log(`   • Total Branches: ${branchData.summary.totalBranches}`);
            console.log(`   • CABANG Branches: ${branchData.summary.cabangBranches}`);
            console.log(`   • CAPEM Branches: ${branchData.summary.capemBranches}`);
            console.log(`   • Total Requests: ${branchData.summary.totalRequests}`);
            console.log(`   • Avg Requests per Branch: ${branchData.summary.avgRequestsPerBranch}\n`);
            
            if (branchData.branchMetrics && branchData.branchMetrics.length > 0) {
                console.log('🏦 TOP BRANCHES BY ACTIVITY:');
                branchData.branchMetrics.slice(0, 5).forEach((branch, index) => {
                    console.log(`   ${index + 1}. ${branch.branchName} (${branch.branchType})`);
                    console.log(`      • Total Requests: ${branch.totalRequests}`);
                    console.log(`      • User Management: ${branch.userManagementRequests} (${branch.userMgmtPercentage}%)`);
                    console.log(`      • Approval Rate: ${branch.approvalRate}%`);
                    console.log('');
                });
            }
        }
    } catch (error) {
        console.log(`❌ Branch analytics error: ${error.message}`);
    }
}

// Main execution
async function main() {
    await generateUserAccessSummary();
    await generateApplicationReports();
    const excelFile = await generateExcelReport();
    await generateBranchAnalytics();
    
    console.log('\n🎯 REPORT GENERATION COMPLETE');
    console.log('============================');
    console.log('✅ User access summary generated');
    console.log('✅ Application-specific reports checked');
    console.log('✅ Branch analytics generated');
    if (excelFile) {
        console.log(`✅ Excel report saved: ${excelFile}`);
    }
    console.log('\n💡 To populate the system with user data:');
    console.log('   1. Create tickets using BSG service templates');
    console.log('   2. Fill in application name and user details');
    console.log('   3. Process approval workflows');
    console.log('   4. Re-run this report to see user access tracking');
}

main().catch(error => {
    console.error('❌ Report generation failed:', error.message);
    process.exit(1);
});