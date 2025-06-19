# BSG Helpdesk - Enterprise Ticketing System

## 🎯 Project Overview

BSG Helpdesk is a comprehensive enterprise ticketing system designed to replace ManageEngine ServiceDesk Plus Free Edition. The system eliminates the 5-technician limitation while providing advanced ticketing capabilities, department-based access control, approval workflows, and enterprise-grade reporting.

## 🏢 Key Features

### ✅ **Department-Based Access Control**
- **IT Department**: Hardware, Software, Network support
- **HR Department**: Employee onboarding, HR services  
- **Business Department**: Financial reporting, process improvement
- **Technician Isolation**: Each technician only sees tickets from their department
- **Manager Oversight**: Department managers approve tickets from their staff
- **Admin Control**: Full system access across all departments

### 🔐 **Advanced Authentication & Authorization**
- **Role-Based Access Control (RBAC)**: Admin, Manager, Technician, Requester
- **JWT Authentication**: Secure token-based authentication
- **Department Segregation**: Users assigned to specific departments
- **Manager Hierarchy**: Approval workflows through department managers

### 🎫 **Comprehensive Ticket Management**
- **Multi-Status Workflow**: Pending Approval → Open → Assigned → In Progress → Resolved → Closed
- **Priority Management**: Low, Medium, High, Urgent with SLA tracking
- **Custom Fields**: Dynamic form fields based on category templates
- **File Attachments**: Support for multiple file types per ticket
- **Category Structure**: Hierarchical organization (Category → SubCategory → Item → Template)

### ⚡ **Modern Technology Stack**

#### Frontend (React 18+ TypeScript)
- **UI Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with glassmorphism design
- **State Management**: Context API with custom hooks
- **Form Management**: React Hook Form with validation
- **API Communication**: Axios with centralized error handling

#### Backend (Node.js TypeScript)
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Prisma with PostgreSQL
- **Authentication**: JWT with refresh token support
- **File Upload**: Multer with configurable storage
- **Email Service**: Nodemailer for notifications
- **Background Jobs**: Node-cron for SLA escalations

### 📊 **Enterprise Features**
- **SLA Management**: Automatic breach detection and escalation
- **Email Notifications**: Manager approval requests and status updates
- **Audit Trail**: Complete ticket history and user actions
- **Reporting Dashboard**: Real-time analytics and metrics
- **Search & Filtering**: Advanced ticket search capabilities
- **Pagination**: Efficient data loading for large datasets

## 🏗️ **Architecture Overview**

### Database Schema
```
departments (IT, HR, Business)
├── users (role-based, department-assigned)
├── categories (department-specific)
│   └── sub_categories
│       └── items
│           └── ticket_templates
│               └── custom_field_definitions
└── tickets
    ├── ticket_attachments
    └── ticket_custom_field_values
```

### API Structure
```
/api/auth          - Authentication endpoints
/api/users         - User management
/api/departments   - Department CRUD operations
/api/categories    - Category hierarchy management
/api/templates     - Ticket template management
/api/tickets       - Core ticket operations
/api/reports       - Analytics and reporting
```

### Frontend Architecture
```
src/
├── components/    - Reusable UI components
├── pages/        - Route-based page components
├── context/      - Global state management
├── services/     - API service layers
├── hooks/        - Custom React hooks
├── types/        - TypeScript definitions
└── utils/        - Utility functions
```

## 🔧 **Configuration & Deployment**

### Environment Configuration
- **Backend**: Database, JWT, SMTP, file upload settings
- **Frontend**: API URLs, branding, feature flags
- **Docker**: Complete containerized deployment setup

### Deployment Options
1. **Direct Installation**: Manual setup on server
2. **Docker Compose**: Containerized with PostgreSQL and Redis
3. **Production**: Nginx/Apache reverse proxy with SSL

### Security Features
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Prisma ORM protection
- **CORS Configuration**: Restricted origin access
- **Rate Limiting**: API request throttling
- **File Upload Security**: Type and size restrictions

## 👥 **User Roles & Permissions**

### 🔴 **Admin**
- Full system access across all departments
- User and department management
- System configuration and reporting
- Global ticket visibility and management

### 🟠 **Manager**
- Department-specific user management
- Ticket approval workflows for subordinates
- Department reporting and analytics
- Own ticket creation and management

### 🟡 **Technician**
- Department-specific ticket access only
- Ticket assignment and resolution
- Customer communication and updates
- Time tracking and work logs

### 🟢 **Requester**
- Personal ticket creation and tracking
- Ticket status monitoring
- File attachment upload
- Self-service ticket updates

## 📈 **Business Benefits**

### **Cost Savings**
- ✅ Unlimited technician accounts (vs 5-user limit)
- ✅ No licensing fees or subscription costs
- ✅ Reduced external support dependency

### **Operational Efficiency**
- ✅ Department-based workflow optimization
- ✅ Automated approval and escalation processes
- ✅ Real-time notifications and updates
- ✅ Comprehensive search and reporting

### **Security & Compliance**
- ✅ Department data segregation
- ✅ Role-based access control
- ✅ Complete audit trails
- ✅ Secure file handling

### **Scalability**
- ✅ Microservices-ready architecture
- ✅ Horizontal scaling capabilities
- ✅ Cloud deployment support
- ✅ API-first design for integrations

## 🚀 **Getting Started**

### Quick Start (Development)
```bash
# Clone repository
git clone https://github.com/yanryp/servicedesk.git
cd servicedesk

# Setup backend
cd backend
npm install
cp .env.example .env
# Configure .env file
npx prisma migrate deploy
npm run dev

# Setup frontend
cd ../frontend
npm install
cp .env.example .env
npm start
```

### Docker Deployment
```bash
# Clone and configure
git clone https://github.com/yanryp/servicedesk.git
cd servicedesk
cp .env.example .env
# Edit .env with your settings

# Deploy with Docker
docker-compose up -d
```

## 📚 **Documentation**

- **[Deployment Guide](DEPLOYMENT.md)**: Complete deployment instructions
- **[Department Access Summary](DEPARTMENT-ACCESS-SUMMARY.md)**: Access control details
- **[Development Guide](CLAUDE.md)**: Development workflow and guidelines
- **[API Documentation](backend/docs/)**: RESTful API reference

## 🧪 **Test Credentials**

All test users use password: `password123`

### **Department Managers**
- IT Manager: `it.manager@bsg.com`
- HR Manager: `hr.manager@bsg.com`
- Business Manager: `business.manager@bsg.com`

### **Department Technicians**
- IT Technician: `it.tech1@bsg.com`
- HR Technician: `hr.tech1@bsg.com`
- Business Technician: `business.tech1@bsg.com`

### **System Admin**
- Administrator: `admintest@example.com`

## 🔄 **Development Status**

### ✅ **Completed Features**
- ✅ Department-based access control
- ✅ User authentication and authorization
- ✅ Ticket CRUD operations with custom fields
- ✅ Manager approval workflows
- ✅ File upload and attachment handling
- ✅ Email notification system
- ✅ Modern responsive UI design
- ✅ Docker deployment configuration

### 🔄 **In Progress**
- 🔄 Advanced reporting dashboard
- 🔄 Real-time WebSocket notifications
- 🔄 Mobile-responsive optimizations
- 🔄 API documentation generation

### 📋 **Planned Features**
- 📋 Knowledge base management
- 📋 Advanced escalation rules
- 📋 Integration APIs (REST/GraphQL)
- 📋 Multi-language support
- 📋 Advanced analytics and metrics

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Issues**: [GitHub Issues](https://github.com/yanryp/servicedesk/issues)
- **Documentation**: Check the `/docs` directory
- **Email**: support@company.com

---

**BSG Helpdesk** - Empowering enterprise support teams with unlimited scalability and department-based efficiency.