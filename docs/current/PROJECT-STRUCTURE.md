# BSG Ticketing System - Project Structure

## 📁 Directory Organization

The project has been reorganized for better maintainability and clarity. Here's the complete structure:

### 🏗️ Core Application

```
ticketing-system/
├── frontend/                    # React TypeScript Application
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── ui/             # Design system components
│   │   │   ├── admin/          # Admin-specific components
│   │   │   └── technician/     # Technician workspace
│   │   ├── pages/              # Route-based page components
│   │   ├── services/           # API service layers
│   │   ├── types/              # TypeScript type definitions
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Utility functions
│   ├── public/                 # Static assets
│   ├── build/                  # Production build output
│   └── package.json            # Frontend dependencies
│
├── backend/                     # Node.js TypeScript Backend
│   ├── src/
│   │   ├── routes/             # API endpoint handlers
│   │   ├── services/           # Business logic services
│   │   ├── middleware/         # Auth, validation, security
│   │   ├── utils/              # Backend utilities
│   │   └── types/              # Backend type definitions
│   ├── prisma/                 # Database schema and migrations
│   │   ├── schema.prisma       # Main database schema
│   │   └── migrations/         # Database migration files
│   ├── scripts/                # Database seed and utility scripts
│   │   ├── seed-bsg-complete.ts # Main BSG seed script
│   │   └── [various scripts]   # Additional utility scripts
│   ├── uploads/                # File upload storage
│   └── package.json            # Backend dependencies
│
└── package.json                # Root workspace configuration
```

### 📚 Documentation

```
docs/                           # Organized Documentation
├── current/                    # Active project documentation
│   ├── CLAUDE.md              # Main project guide
│   ├── PROJECT-STRUCTURE.md   # This file
│   └── README.md              # Project overview
├── guides/                     # Setup and deployment guides
│   ├── DATABASE-SETUP.md      # Database configuration guide
│   ├── DEPLOYMENT-GUIDE.md    # Production deployment
│   └── WSL-DEPLOYMENT.md      # Windows/WSL specific setup
└── specifications/             # Technical specifications
    ├── API-DOCUMENTATION.md   # API reference
    ├── API-ENDPOINTS.md       # Endpoint details
    └── DATABASE-SCHEMA.md     # Database design
```

### 🧪 Testing Infrastructure

```
e2e-tests/                      # End-to-End Test Suite
├── bsg-template-workflow.spec.ts    # BSG template testing
├── bsg-ticket-workflow.spec.ts      # Ticket workflow testing
├── fixtures/                        # Test data and fixtures
└── test-report/                     # Generated test reports
```

### 🗄️ Archive (Organized Legacy Files)

```
archive/                        # Legacy Files and Scripts
├── analysis-scripts/          # Analysis and debugging scripts
│   ├── analyze-*.js          # System analysis utilities
│   ├── check-*.js            # System check scripts
│   ├── debug-*.js            # Debugging utilities
│   └── validate-*.js         # Validation scripts
├── migration-scripts/         # Data migration utilities
│   ├── create-*.js           # Data creation scripts
│   ├── fix-*.js              # Data fix utilities
│   ├── import-*.js           # Data import scripts
│   ├── setup-*.js            # System setup scripts
│   └── *.sql                 # SQL migration files
├── test-scripts/              # Test files and results
│   ├── test-*.js             # Various test scripts
│   ├── *.spec.js             # Test specifications
│   ├── test-results/         # Test execution results
│   └── test-data/            # Test data files
├── development-logs/          # Development log files
│   └── *.log                 # System and development logs
├── legacy-documentation/      # Outdated documentation
│   ├── ARCHITECTURE_ANALYSIS.md
│   ├── AI-CODING-GUIDE.md
│   ├── CLEAN-REBUILD-SPEC.md
│   └── [many legacy .md files]
└── csv-data/                  # CSV import files
    ├── branch.csv             # Branch data
    ├── branch_address.csv     # Branch address data
    ├── cat_hd.csv            # Category data
    └── [other CSV files]
```

### 🐳 Deployment

```
deployment/                     # Deployment configurations
├── wsl-windows/               # Windows/WSL deployment package
│   ├── docker-compose.wsl.yml
│   ├── deploy-wsl.bat
│   └── [deployment files]
└── create-wsl-deployment.sh   # WSL deployment creation script
```

## 🔄 File Organization Principles

### ✅ Active Files (Keep in Root/Main Directories)
- **Core application code**: `frontend/src/`, `backend/src/`
- **Current documentation**: `docs/current/`
- **Active configuration**: `package.json`, `docker-compose.yml`
- **Database schema**: `backend/prisma/schema.prisma`
- **Production scripts**: `backend/scripts/seed-bsg-complete.ts`

### 🗄️ Archived Files (Moved to Archive)
- **Analysis scripts**: One-time analysis and debugging utilities
- **Migration scripts**: Data migration and setup utilities used during development
- **Legacy documentation**: Outdated or superseded documentation
- **Test artifacts**: Test results, logs, and development test scripts
- **CSV data**: Import data files used for initial setup
- **Development logs**: Historical development and debugging logs

## 🎯 Benefits of This Organization

### 📈 Improved Maintainability
- **Clear separation** between active and legacy code
- **Organized documentation** with clear hierarchy
- **Easy navigation** for new developers
- **Reduced clutter** in main directories

### 🔍 Better Development Experience
- **Faster file searches** with organized structure
- **Clear file purposes** with logical grouping
- **Easier deployment** with clean main directories
- **Better version control** with organized git structure

### 📚 Enhanced Documentation
- **Current docs** easily accessible in `docs/current/`
- **Setup guides** in dedicated `docs/guides/` folder
- **Technical specs** in `docs/specifications/`
- **Legacy information** preserved in `archive/`

## 🚀 Usage Guidelines

### For Development
1. **Active work**: Use files in main directories (`frontend/`, `backend/`, `docs/current/`)
2. **Reference**: Check `docs/guides/` for setup instructions
3. **Debugging**: Look in `archive/analysis-scripts/` for diagnostic tools
4. **Historical context**: Check `archive/legacy-documentation/` if needed

### For Deployment
1. **Production**: Use main `package.json` and `docker-compose.yml`
2. **WSL/Windows**: Use `deployment/wsl-windows/` package
3. **Database**: Use `backend/scripts/seed-bsg-complete.ts`
4. **Documentation**: Reference `docs/guides/`

### For New Team Members
1. **Start with**: `README.md` and `docs/current/CLAUDE.md`
2. **Setup**: Follow `docs/guides/DATABASE-SETUP.md`
3. **Architecture**: Read `docs/specifications/`
4. **Historical context**: Browse `archive/` if needed

## 🔧 Maintenance Notes

### Regular Cleanup
- Move completed development scripts to `archive/`
- Update documentation in `docs/current/`
- Clean up temporary files and logs
- Organize new test files appropriately

### Archive Management
- Keep archive organized by file type
- Document significant archived items
- Periodically review for obsolete files
- Maintain clear naming conventions

This organization provides a clean, maintainable structure while preserving all historical development work for reference and debugging purposes.