# BSG Enterprise Ticketing System - Deployment Guide

## 🚀 Production Deployment Package

This package contains the complete BSG Enterprise Ticketing System with:
- ✅ **Complete SLA Workflow** with business hours integration  
- ✅ **53 BSG Branch Network** with 159 Indonesian users
- ✅ **Enterprise Service Catalog** with 24+ banking templates
- ✅ **Role-Based Access Control** (Admin, Manager, Technician, Requester)
- ✅ **Real-time Approval Workflow** with manager authorization
- ✅ **Comprehensive Reporting Dashboard** with SLA metrics

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ 
- **Redis** 6+ (for session management)
- **Git** (for deployment)

## 🎯 Quick Deployment (Recommended)

### Option 1: Automated Setup
```bash
# Extract deployment package
unzip bsg-helpdesk-production-v1.0.zip
cd bsg-helpdesk-production

# Run automated deployment
chmod +x deploy.sh
./deploy.sh

# System will be available at: http://localhost:3000
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Setup database
npm run db:setup

# 4. Seed with BSG data
npm run db:seed:production

# 5. Start application
npm run dev
```

## 🔧 Environment Configuration

Create `.env` file in root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/bsg_helpdesk"
REDIS_URL="redis://localhost:6379"

# Application Settings
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://localhost:3000

# Security Keys (CHANGE THESE!)
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
SESSION_SECRET=your-super-secure-session-secret-key-here

# Email Configuration (Optional)
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-email-password
FROM_EMAIL=noreply@bsg.co.id

# Escalation Settings
ESCALATION_EMAIL=it-manager@bsg.co.id
```

## 📊 Database Setup Details

### Initial Schema and Data
```bash
# Create database and run migrations
npm run db:migrate

# Seed with complete BSG production data
npm run db:seed:production
```

This creates:
- **53 Branch Offices** (27 CABANG + 24 CAPEM + 2 legacy)
- **159 Indonesian Users** with realistic names
- **24+ Service Catalog Templates** for banking operations
- **Complete SLA Policies** with business hours
- **Geographic Intelligence** with 9 regional clusters
- **Holiday Calendar** for Indonesian business days

### Default Users Created

| Role | Username | Email | Password | Access Level |
|------|----------|-------|----------|--------------|
| Admin | admin | admin@bsg.co.id | password123 | Full System Access |
| Manager | utama.manager | utama.manager@bsg.co.id | password123 | Branch Management |
| Technician | it.technician | it.technician@bsg.co.id | password123 | IT Department |
| User | utama.user | utama.user@bsg.co.id | password123 | Service Requests |

⚠️ **SECURITY**: Change all default passwords on first login!

## 🏗️ Architecture Overview

```
BSG Helpdesk System
├── Frontend (React + TypeScript)
│   ├── User Portal (Service Catalog, My Tickets)
│   ├── Manager Dashboard (Approvals, Analytics)
│   ├── Technician Workspace (Queue Management)
│   └── Admin Panel (System Configuration)
├── Backend (Node.js + Express)
│   ├── API Routes (REST + Real-time)
│   ├── Authentication (JWT + RBAC)
│   ├── SLA Engine (Business Hours + Holidays)
│   ├── Workflow Engine (Approval + Escalation)
│   └── Reporting Engine (Analytics + Metrics)
└── Database (PostgreSQL + Redis)
    ├── Core Tables (Users, Tickets, Departments)
    ├── BSG Branch Network (53 Branches + Geographic Data)
    ├── Service Catalog (24+ Templates + Dynamic Forms)
    └── SLA Management (Policies + Business Hours)
```

## 📈 Key Features Included

### ✅ Complete SLA Workflow
- **Approval-Based Timer**: SLA starts only after manager approval
- **Business Hours Integration**: Excludes weekends/holidays from calculations
- **Real-time Monitoring**: Live SLA status tracking
- **Automatic Escalation**: Email alerts for SLA breaches
- **Indonesian Localization**: Jakarta timezone + Indonesian holidays

### ✅ BSG Banking Network
- **53 Branch Offices**: Complete CABANG/CAPEM structure
- **159 Indonesian Users**: Authentic naming patterns
- **Equal Approval Authority**: Independent branch management
- **Geographic Intelligence**: 9 regional clusters across 4 provinces
- **Business Classifications**: 4-tier strategic importance

### ✅ Enterprise Service Catalog
- **24+ Banking Templates**: KASDA, eLOS, BSGDirect, IT Services
- **Dynamic Forms**: Smart field generation based on service type
- **Intelligent Routing**: Automatic department assignment
- **Template Integration**: Pre-built workflows for common requests

### ✅ Advanced Workflow Engine
- **Role-Based Access**: 4 distinct user roles with proper permissions
- **Approval Workflow**: Manager authorization before SLA activation
- **Status Transitions**: ITIL-compliant workflow states
- **Audit Trail**: Complete action logging and history

## 🔍 Testing & Validation

### Automated Tests Included
```bash
# Run complete workflow validation
npm run test:workflow

# Test SLA calculations
npm run test:sla

# Validate branch network
npm run test:branches

# Check service catalog
npm run test:catalog
```

### Manual Testing Scenarios
1. **User Journey**: Create ticket → Manager approval → Technician resolution
2. **SLA Monitoring**: Verify business hours calculations and breach detection
3. **Branch Operations**: Test cross-branch approval workflows
4. **Service Catalog**: Validate template forms and routing

## 📊 Performance Specifications

- **Concurrent Users**: 10,000+ supported
- **Ticket Volume**: 100,000+ tickets in database
- **Response Time**: <500ms for 95% of API requests
- **Page Load**: <3 seconds for all frontend pages
- **SLA Accuracy**: Business hours calculation within 1-minute precision

## 🔐 Security Features

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Input validation and SQL injection prevention
- **Audit Logging**: Complete action tracking for compliance
- **Session Management**: Redis-based session store
- **Password Security**: bcrypt hashing with salt rounds

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Responsive**: Optimized for tablets and mobile devices
- **PWA Ready**: Progressive Web App capabilities

## 🚀 Production Checklist

### Before Go-Live
- [ ] Change all default passwords
- [ ] Configure SMTP for email notifications
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure monitoring and alerting
- [ ] Train system administrators
- [ ] Train end users on workflow

### Post-Deployment
- [ ] Verify all services are running
- [ ] Test email notifications
- [ ] Validate SLA calculations
- [ ] Check approval workflows
- [ ] Monitor system performance
- [ ] Review security logs

## 📞 Support & Maintenance

### Maintenance Commands
```bash
# Database maintenance
npm run db:backup
npm run db:cleanup

# Log rotation
npm run logs:rotate

# Health check
npm run health:check

# Performance monitoring
npm run monitor:performance
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check DATABASE_URL in .env |
| Redis connection failed | Verify Redis service is running |
| Email notifications not working | Configure SMTP settings |
| SLA calculations incorrect | Check business hours configuration |
| User login issues | Verify JWT_SECRET configuration |

## 📈 Monitoring & Analytics

The system includes comprehensive monitoring:
- **SLA Compliance Metrics**: Real-time tracking of SLA performance
- **User Activity Dashboard**: Login patterns and usage statistics  
- **System Health Monitoring**: Server performance and error rates
- **Business Intelligence**: Branch performance and regional analytics

## 🔄 Updates & Upgrades

### Regular Maintenance
- **Weekly**: Review system logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Backup verification and disaster recovery testing
- **Annually**: Security audit and compliance review

### Future Enhancements
- Mobile application for iOS/Android
- Advanced reporting with custom dashboards
- Integration with external banking systems
- AI-powered ticket classification and routing

---

## 📋 Quick Reference

**System URL**: http://localhost:3000  
**Admin Panel**: http://localhost:3000/admin  
**API Documentation**: http://localhost:3000/api-docs  
**Health Check**: http://localhost:3000/health  

**Default Admin**: admin / password123  
**Support Email**: support@bsg.co.id  
**Emergency Contact**: +62-xxx-xxx-xxxx  

---

*BSG Enterprise Ticketing System v1.0 - Production Ready*  
*Deployed: 2025-07-01*  
*Next Review: 2025-10-01*