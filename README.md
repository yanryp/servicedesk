# BSG Enterprise Ticketing System

![BSG Banking](https://img.shields.io/badge/BSG-Banking%20System-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-ISC-blue)

## 🏢 Overview

The BSG Enterprise Ticketing System is a comprehensive helpdesk solution designed specifically for BSG Banking network, replacing ManageEngine ServiceDesk Plus Free Edition. It provides unlimited technician accounts, advanced approval workflows, and complete branch network integration across 53 BSG banking locations.

## ✨ Key Features

### 🔐 Role-Based Access Control
- **Admin**: Complete system management and user administration
- **Manager**: Ticket approval authority within their branch unit
- **Technician**: Ticket processing and resolution
- **Requester**: Ticket creation and tracking

### 🏦 BSG Branch Network Integration
- **53 Branch Units**: Complete CABANG (27) and CAPEM (24) network coverage
- **Geographic Distribution**: 4 provinces, 9 regional clusters
- **Unit-Based Approval**: Independent approval authority for each branch
- **Equal Authority Model**: CAPEM managers have same approval rights as CABANG

### 📋 Service Catalog System
- **Modern Service Catalog**: ITIL-aligned service offerings
- **Government Services**: KASDA integration with special approval workflows
- **Banking Services**: OLIBS and BSGDirect support
- **IT Services**: Hardware and network support

### ⚡ Advanced Workflow Engine
- **Approval Workflow**: Manager approval before ticket activation
- **SLA Management**: Post-approval SLA calculations
- **Escalation System**: Time-based and condition-based escalations
- **Real-time Notifications**: WebSocket and email notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm 9+

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd ticketing-system

# Install all dependencies
npm run install:all

# Setup database with BSG data
npm run setup:bsg

# Start development servers
npm run dev
```

### Default Login Credentials

| Role | Email | Password | Authority |
|------|-------|----------|-----------|
| Admin | admin@bsg.co.id | password123 | System administration |
| Manager | utama.manager@bsg.co.id | password123 | Utama branch approval |
| Manager | gorontalo.manager@bsg.co.id | password123 | Gorontalo branch approval |
| Technician | it.technician@bsg.co.id | password123 | IT support |
| Technician | banking.tech@bsg.co.id | password123 | Banking systems |
| Requester | utama.user@bsg.co.id | password123 | General user |
| KASDA User | kasda.user@bsg.co.id | password123 | Government services |

## 📁 Project Structure

```
ticketing-system/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Route-based pages
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript definitions
├── backend/                 # Node.js TypeScript backend
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth & validation
│   │   └── utils/           # Utilities
│   ├── prisma/             # Database schema
│   └── scripts/            # Database seed scripts
├── docs/                   # Current documentation
│   ├── current/            # Active project docs
│   ├── guides/             # Setup and deployment guides
│   └── specifications/     # Technical specifications
├── archive/                # Legacy files and scripts
│   ├── analysis-scripts/   # Analysis and debug scripts
│   ├── migration-scripts/  # Data migration utilities
│   ├── test-scripts/       # Test files and results
│   ├── development-logs/   # Development log files
│   ├── legacy-documentation/ # Outdated documentation
│   └── csv-data/           # CSV import files
└── e2e-tests/             # End-to-end test suite
```

## 🛠️ Development Commands

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run dev:frontend       # Frontend only
npm run dev:backend        # Backend only

# Database
npm run db:migrate         # Run database migrations
npm run db:seed:bsg        # Seed with BSG data
npm run db:studio          # Open Prisma Studio
npm run db:reset           # Reset database

# Testing
npm test                   # Run all tests
npm run test:e2e          # E2E tests with Playwright

# Building
npm run build             # Build for production
npm run lint              # Run linting
```

## 🏦 BSG Branch Network

### CABANG Branches (27 Main Offices)
- Kantor Cabang Utama (UTAMA)
- Kantor Cabang Jakarta (JAKARTA)  
- Kantor Cabang Gorontalo (GORONTALO)
- Kantor Cabang Kotamobagu (KOTAMOBAGU)
- [Additional 23 CABANG branches]

### CAPEM Branches (24 Sub-Offices)
- Kantor Cabang Pembantu Kelapa Gading
- Kantor Cabang Pembantu Tuminting
- Kantor Cabang Pembantu Wenang
- [Additional 21 CAPEM branches]

### Geographic Coverage
- **Sulawesi Utara**: 34 branches
- **Gorontalo**: 13 branches
- **DKI Jakarta**: 4 branches
- **Jawa Timur**: 2 branches

## 📊 System Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access
- **Real-time**: WebSocket notifications
- **Testing**: Playwright E2E, Jest unit tests

### Key Design Patterns
- Clean Architecture with service layers
- CQRS for complex approval queries
- Event-driven workflow transitions
- Circuit breaker for resilience

## 🔧 Configuration

### Database Setup
The system uses PostgreSQL with a comprehensive BSG banking schema. See [Database Setup Guide](docs/guides/DATABASE-SETUP.md) for detailed instructions.

### Environment Variables
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/bsg_helpdesk"
JWT_SECRET="your-jwt-secret"
PORT=5000
NODE_ENV="development"
```

## 📈 Production Deployment

### Docker Deployment
```bash
# Build and start with Docker Compose
docker-compose up -d

# For WSL/Windows environments
npm run build:wsl
```

### Manual Deployment
```bash
# Build the application
npm run build

# Run database migrations
npm run db:migrate

# Seed production data
npm run db:seed:bsg

# Start production server
npm start
```

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
npm run test:e2e:ui        # Interactive mode
npm run test:e2e:debug     # Debug mode
```

### Test Coverage
- Business logic: 80%+ coverage target
- API endpoints: Integration tested
- Approval workflows: Complete E2E coverage

## 📚 Documentation

- **[Project Guide](docs/current/CLAUDE.md)**: Complete development guide
- **[Database Setup](docs/guides/DATABASE-SETUP.md)**: Database configuration
- **[WSL Deployment](docs/guides/WSL-DEPLOYMENT.md)**: Windows deployment guide
- **[API Documentation](docs/specifications/API-DOCUMENTATION.md)**: API reference

## 🤝 Contributing

1. Follow the established code patterns
2. Maintain role-based security boundaries
3. Test approval workflows thoroughly
4. Update documentation as needed

## 📄 License

ISC License - BSG IT Development Team

## 🆘 Support

For technical support or deployment assistance:
- Check the documentation in `docs/`
- Review archived scripts in `archive/`
- Consult the database setup guide for common issues

---

**🌟 Ready for BSG Enterprise Operations!**

This system provides a complete ticketing solution with BSG banking network integration, supporting unlimited technicians and comprehensive approval workflows across all 53 branch locations.