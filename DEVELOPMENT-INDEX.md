# BSG Helpdesk Development Index

> **Comprehensive codebase navigation and development guide for the BSG Enterprise Ticketing System**

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Directory Structure Guide](#directory-structure-guide)
3. [Key Feature Implementation Maps](#key-feature-implementation-maps)
4. [Database Schema Quick Reference](#database-schema-quick-reference)
5. [API Endpoint Reference](#api-endpoint-reference)
6. [Development Workflows](#development-workflows)
7. [Common Development Patterns](#common-development-patterns)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [File Location Quick Reference](#file-location-quick-reference)
10. [Extension Points](#extension-points)

---

## System Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL with comprehensive BSG banking schema
- **Authentication**: JWT with role-based access control (RBAC)
- **Container**: Docker with docker-compose for development

### Core System Modules
```
BSG Helpdesk System
├── Authentication & Authorization (JWT + RBAC)
├── Ticket Management (Legacy + BSG Templates)
├── BSG Banking Template System
├── Approval Workflow Engine
├── Categorization & Analytics
├── Comment & Notification System
├── Department & User Management
└── Reporting & Dashboard
```

### High-Level Data Flow
```
User Request → Authentication → Template Selection → Custom Fields → 
Approval Workflow → Assignment → Processing → Resolution → Analytics
```

---

## Directory Structure Guide

### Backend Structure (`/backend/`)

#### Core Application (`/src/`)
```
src/
├── index.ts                    # Main application entry point
├── config.ts                   # Environment configuration
├── db.ts                       # Database connection
├── middleware/                 # Authentication & security
│   ├── authMiddleware.ts       # JWT authentication
│   └── categorizationSecurity.ts # Ticket categorization security
├── routes/                     # API endpoint definitions
│   ├── auth.ts                 # Authentication endpoints
│   ├── ticketRoutes.ts         # Core ticket CRUD
│   ├── enhancedTicketRoutes.ts # Advanced ticket features
│   ├── bsgTemplateRoutes.ts    # BSG template system
│   ├── categorizationRoutes.ts # Ticket categorization
│   ├── templateManagementRoutes.ts # Template admin
│   ├── ticketCommentsRoutes.ts # Comment system
│   ├── departmentRoutes.ts     # Department management
│   ├── masterDataRoutes.ts     # Dropdown data
│   └── reportingRoutes.ts      # Analytics & reports
├── services/                   # Business logic
│   ├── bsgTemplateImportService.ts # Template processing
│   ├── emailService.ts         # Email notifications
│   └── escalationService.ts    # Ticket escalation
└── utils/                      # Helper utilities
    └── asyncHandler.ts         # Error handling wrapper
```

#### Database & Scripts (`/prisma/` & `/scripts/`)
```
prisma/
├── schema.prisma              # Complete database schema
└── migrations/                # Database migration history

scripts/
├── seed-itil-service-catalog.js    # Initial service catalog
├── seed-bsg-templates.js           # BSG template seeding
├── create-bsg-test-users.js        # Test user creation
├── importRealBSGTemplates.js       # Template CSV import
└── create-bsg-service-catalog.js   # BSG service setup
```

### Frontend Structure (`/frontend/src/`)

#### Core Application
```
src/
├── App.tsx                     # Main application component
├── index.tsx                   # React application entry
├── context/                    # Global state management
│   └── AuthContext.tsx         # Authentication context
├── components/                 # Reusable UI components
│   ├── BSGTemplateSelector.tsx # BSG template selection
│   ├── BSGDynamicField.tsx     # Dynamic form fields
│   ├── TicketCategorization.tsx # Categorization UI
│   ├── TicketComments.tsx      # Comment system
│   └── CustomFields/           # Custom field components
├── pages/                      # Route-based pages
│   ├── CreateTicketPage.tsx    # Legacy ticket creation
│   ├── BSGCreateTicketPage.tsx # BSG ticket creation
│   ├── ManagerDashboard.tsx    # Manager approval interface
│   ├── TicketDetailPage.tsx    # Ticket detail view
│   └── TicketsPage.tsx         # Ticket listing
├── services/                   # API service layer
│   ├── api.ts                  # Base API configuration
│   ├── auth.ts                 # Authentication services
│   ├── bsgTemplate.ts          # BSG template services
│   ├── tickets.ts              # Ticket services
│   └── categorization.ts       # Categorization services
├── hooks/                      # Custom React hooks
│   ├── useTemplateFields.ts    # Template field management
│   └── useFileDownloader.ts    # File download utility
└── types/                      # TypeScript definitions
    └── index.ts                # Global type definitions
```

---

## Key Feature Implementation Maps

### 1. Ticket Management System

#### Core Ticket CRUD
- **Backend**: `backend/src/routes/ticketRoutes.ts`
  - `GET /api/tickets` - List tickets with filtering
  - `POST /api/tickets` - Create new ticket
  - `GET /api/tickets/:id` - Get ticket details
  - `PUT /api/tickets/:id` - Update ticket
  - `DELETE /api/tickets/:id` - Delete ticket

#### Enhanced Ticket Features
- **Backend**: `backend/src/routes/enhancedTicketRoutes.ts`
  - Advanced filtering and search
  - Bulk operations
  - Status transitions
  - Assignment management

#### Frontend Pages
- **Legacy Creation**: `frontend/src/pages/CreateTicketPage.tsx`
- **BSG Creation**: `frontend/src/pages/BSGCreateTicketPage.tsx`
- **Ticket Detail**: `frontend/src/pages/TicketDetailPage.tsx`
- **Ticket Listing**: `frontend/src/pages/TicketsPage.tsx`

### 2. BSG Template System

#### Template API (Backend)
- **Routes**: `backend/src/routes/bsgTemplateRoutes.ts`
  - `GET /api/bsg-templates/categories` - Template categories
  - `GET /api/bsg-templates/search` - Search templates
  - `GET /api/bsg-templates/:id/fields` - Template custom fields
  - `GET /api/bsg-templates/master-data/:type` - Dropdown data

#### Template Processing (Backend)
- **Service**: `backend/src/services/bsgTemplateImportService.ts`
  - CSV template parsing
  - Field definition creation
  - Master data population

#### Template UI (Frontend)
- **Selector**: `frontend/src/components/BSGTemplateSelector.tsx`
- **Dynamic Fields**: `frontend/src/components/BSGDynamicField.tsx` 
- **Field Renderer**: `frontend/src/components/BSGDynamicFieldRenderer.tsx` ✅ NEW
- **Shared Library**: `frontend/src/components/SharedFieldLibrary.tsx` ✅ NEW
- **Management**: `frontend/src/pages/BSGTemplateManagementPage.tsx`

#### Field Optimization System ✅ NEW
- **Analysis Script**: `backend/scripts/optimizeCommonFields.js`
- **Global Field Definitions**: Reusable field configurations for common fields
- **Category Organization**: Fields grouped by purpose (location, user_identity, timing, etc.)
- **Shared Components**: Pre-built field components with validation
- **70.6% Optimization**: Reduced field definition duplication across 24 templates

### 3. Manager Approval Workflow

#### Approval API (Backend)
- **Routes**: `backend/src/routes/ticketRoutes.ts`
  - `GET /api/tickets/pending-approvals` - Get pending tickets
  - `POST /api/tickets/:id/approve` - Approve ticket
  - `POST /api/tickets/:id/reject` - Reject ticket

#### Approval UI (Frontend)
- **Dashboard**: `frontend/src/pages/ManagerDashboard.tsx`
- **Components**: Manager-specific ticket cards and actions

### 4. Categorization System

#### Categorization API (Backend)
- **Routes**: `backend/src/routes/categorizationRoutes.ts`
- **Security**: `backend/src/middleware/categorizationSecurity.ts`
- **Analytics**: `backend/src/routes/categorizationAnalyticsRoutes.ts`

#### Categorization UI (Frontend)
- **Component**: `frontend/src/components/TicketCategorization.tsx`
- **Analytics**: `frontend/src/components/CategorizationAnalyticsDashboard.tsx`
- **Bulk Operations**: `frontend/src/components/BulkCategorizationModal.tsx`

### 5. Comment System

#### Comment API (Backend)
- **Routes**: `backend/src/routes/ticketCommentsRoutes.ts`
  - `GET /api/tickets/:ticketId/comments` - Get comments
  - `POST /api/tickets/:ticketId/comments` - Add comment
  - `PUT /api/comments/:id` - Edit comment
  - `DELETE /api/comments/:id` - Delete comment

#### Comment UI (Frontend)
- **Component**: `frontend/src/components/TicketComments.tsx`

---

## Database Schema Quick Reference

### Core Entities

#### Users & Authentication
```sql
users                     # User accounts
├── departments          # Department structure
├── kasda_user_profiles  # Government user profiles
└── government_entities  # Government organization data
```

#### Ticket System
```sql
tickets                  # Main ticket records
├── ticket_custom_field_values    # Legacy custom fields
├── ticket_service_field_values   # Service template fields
├── ticket_comments              # Comment system
├── ticket_classification_audit  # Classification history
└── ticket_attachments           # File attachments
```

#### Service Catalog (Legacy)
```sql
service_catalog         # ITIL service structure
├── service_items      # Service catalog items
├── service_templates  # Legacy templates
└── service_field_definitions  # Legacy custom fields
```

#### BSG Template System (✅ Complete with 70.6% Field Optimization)
```sql
bsg_template_categories     # Template categories (OLIBS, KLAIM, etc.)
├── bsg_templates          # Individual templates (24 implemented)
├── bsg_template_fields    # Template custom field definitions (119 fields)
├── bsg_field_types        # Field type definitions (9 types)
├── bsg_master_data        # Dropdown options (branches, menus)
├── bsg_field_options      # Field-specific options
├── bsg_ticket_field_values # BSG ticket field values
├── bsg_template_usage_logs # Usage analytics
├── bsg_global_field_definitions # ✅ NEW: Reusable field configurations
└── bsg_template_field_usage     # ✅ NEW: Field reuse tracking
```

### Key Relationships
- `tickets.createdByUserId` → `users.id`
- `tickets.serviceCatalogId` → `service_catalog.id` (Legacy)
- `tickets.assignedToUserId` → `users.id`
- `bsg_templates.categoryId` → `bsg_template_categories.id`
- `bsg_template_fields.templateId` → `bsg_templates.id`

---

## API Endpoint Reference

### Authentication Endpoints
```
POST /api/auth/login      # User login
POST /api/auth/register   # User registration  
POST /api/auth/logout     # User logout
GET  /api/auth/me         # Get current user
```

### Ticket Management
```
GET    /api/tickets                 # List tickets
POST   /api/tickets                 # Create ticket
GET    /api/tickets/:id             # Get ticket
PUT    /api/tickets/:id             # Update ticket
DELETE /api/tickets/:id             # Delete ticket
GET    /api/tickets/pending-approvals  # Manager pending tickets
POST   /api/tickets/:id/approve     # Approve ticket
POST   /api/tickets/:id/reject      # Reject ticket
```

### BSG Template System
```
GET /api/bsg-templates/categories           # Template categories
GET /api/bsg-templates/search              # Search templates
GET /api/bsg-templates/:id                 # Get template
GET /api/bsg-templates/:id/fields          # Template fields
GET /api/bsg-templates/master-data/:type   # Dropdown data
```

### Comment System
```
GET    /api/tickets/:ticketId/comments  # Get comments
POST   /api/tickets/:ticketId/comments  # Add comment
PUT    /api/comments/:id                # Edit comment
DELETE /api/comments/:id                # Delete comment
```

### Categorization
```
PUT /api/tickets/:id/categorization        # Categorize ticket
POST /api/tickets/bulk-categorization      # Bulk categorization
GET /api/categorization/analytics          # Analytics data
```

---

## Development Workflows

### Adding New Features

#### 1. Backend API Development
1. **Create route**: Add to appropriate `routes/*.ts` file
2. **Add middleware**: Authentication, validation, security
3. **Implement logic**: Business logic in `services/` if complex
4. **Database changes**: Update `prisma/schema.prisma` if needed
5. **Test endpoints**: Use Postman or write tests

#### 2. Frontend Development
1. **Create service**: Add API calls to `services/*.ts`
2. **Create component**: Add UI component to `components/`
3. **Add page**: Create page component in `pages/`
4. **Update routing**: Add route to `App.tsx`
5. **Style with Tailwind**: Use existing design patterns

#### 3. BSG Template Development
1. **Update CSV**: Modify `template.csv` with new fields
2. **Run import script**: Execute BSG template import
3. **Add field types**: Update `bsg_field_types` if needed
4. **Test dynamic fields**: Verify field rendering
5. **Update master data**: Add dropdown options if required

### Database Changes

#### 1. Schema Updates
```bash
# 1. Modify prisma/schema.prisma
# 2. Generate migration
npx prisma migrate dev --name description_of_change
# 3. Apply to database
npx prisma db push
# 4. Regenerate Prisma client
npx prisma generate
```

#### 2. Seeding Data
```bash
# Run specific seeding scripts
node backend/scripts/seed-bsg-templates.js
node backend/scripts/create-bsg-test-users.js
```

### Testing Procedures

#### 1. Backend Testing
```bash
# Run all tests
npm test
# Run specific test suite
npm test -- apiEndpoints.test.js
# Test with coverage
npm run test:coverage
```

#### 2. Frontend Testing
```bash
# Run React tests
npm test
# Build for production (test build)
npm run build
```

#### 3. End-to-End Testing
```bash
# Test complete workflows
node backend/test-workflows.js
# Test BSG system specifically
./test-bsg-simple.sh
```

---

## Common Development Patterns

### 1. Authentication Middleware Usage
```typescript
// Protect routes with authentication
router.get('/protected-route', protect, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = req.user; // User available after authentication
  // Route logic here
}));

// Role-based access control
router.get('/admin-only', protect, requireRole(['admin', 'manager']), asyncHandler(async (req, res) => {
  // Admin/Manager only logic
}));
```

### 2. Error Handling Convention
```typescript
// Use asyncHandler for async routes
import { asyncHandler } from '../utils/asyncHandler';

router.get('/example', asyncHandler(async (req, res) => {
  // Async code here - errors automatically caught
}));

// Return consistent error responses
return res.status(400).json({
  success: false,
  message: 'Descriptive error message',
  errors: validationErrors // Optional detailed errors
});
```

### 3. API Response Formatting
```typescript
// Success responses
res.status(200).json({
  success: true,
  data: responseData,
  message: 'Operation successful' // Optional
});

// Error responses
res.status(400).json({
  success: false,
  message: 'Error description',
  errors: [] // Optional validation errors
});
```

### 4. Frontend Service Pattern
```typescript
// services/api.ts - Base API configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// services/tickets.ts - Specific service
export const ticketService = {
  getTickets: () => api.get('/tickets'),
  createTicket: (data) => api.post('/tickets', data),
  // ... other methods
};
```

### 5. React Component Patterns
```typescript
// Use TypeScript interfaces
interface ComponentProps {
  data: DataType;
  onAction: (id: number) => void;
}

// Use React hooks consistently
const MyComponent: React.FC<ComponentProps> = ({ data, onAction }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Component logic
  
  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  );
};
```

---

## Troubleshooting Guide

### Common Development Issues

#### 1. Database Connection Problems
```bash
# Check database status
docker-compose ps
# Restart database
docker-compose restart postgres
# Check connection in backend
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('Connected')).catch(console.error);"
```

#### 2. Prisma Issues
```bash
# Reset database completely
npx prisma migrate reset
# Regenerate Prisma client
npx prisma generate
# Check database schema
npx prisma db pull
```

#### 3. Authentication Issues
- **Issue**: JWT tokens not working
- **Check**: `JWT_SECRET` in environment variables
- **Solution**: Ensure consistent secret across frontend/backend

#### 4. Template Import Issues
- **Issue**: BSG templates not importing
- **Check**: CSV file format and encoding
- **Solution**: Verify field mappings in import script

#### 5. Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
# Check for TypeScript errors
npm run type-check
```

### API Debugging

#### 1. Backend Debugging
```bash
# Enable debug logging
DEBUG=* npm run dev
# Check specific route
curl -X GET http://localhost:5000/api/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2. Database Query Debugging
```typescript
// Enable Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## File Location Quick Reference

### Configuration Files
```
backend/
├── package.json              # Backend dependencies
├── tsconfig.json            # TypeScript configuration
├── prisma/schema.prisma     # Database schema
└── .env                     # Environment variables

frontend/
├── package.json             # Frontend dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── .env                    # Frontend environment variables

# Root level
├── docker-compose.yml       # Docker services
└── CLAUDE.md               # Claude AI development instructions
```

### Documentation Files
```
├── API-DOCUMENTATION.md          # API endpoint documentation
├── BSG-TEMPLATE-SPECIFICATIONS.md # BSG template system specs
├── DATABASE-SCHEMA.md            # Database design documentation
├── DEPLOYMENT-GUIDE.md           # Production deployment guide
├── FRONTEND-ARCHITECTURE.md      # Frontend structure guide
└── DEVELOPMENT-INDEX.md          # This file
```

### Test Files
```
backend/
├── scripts/test*.js             # Integration test scripts
├── src/tests/                   # Unit tests
└── test-workflows.js           # End-to-end workflow tests

frontend/
├── src/setupTests.ts           # Test configuration
└── test-integration.js         # Frontend integration tests

# Root level
├── test-bsg-simple.sh          # BSG system tests
└── test-frontend-backend.sh    # Full system tests
```

### Data Files
```
├── template.csv                # BSG template field definitions
├── hd_template.csv            # Template mapping data
├── cat_hd.csv                 # Category data
└── hd_categori.csv           # Category mapping
```

---

## Extension Points

### 1. Adding New Departments

#### Backend Changes
```sql
-- Add department via script
INSERT INTO departments (name, department_type, is_service_owner, description)
VALUES ('New Department', 'business', true, 'Department description');
```

#### Template Association
```typescript
// Update BSG template to department mapping
// In backend/scripts/create-bsg-service-catalog.js
const departmentMappings = {
  'OLIBS': 'Departemen Dukungan dan Layanan',
  'NEW_SYSTEM': 'New Department', // Add new mapping
};
```

### 2. Creating New Template Types

#### 1. Update Database Schema
```sql
-- Add new template category
INSERT INTO bsg_template_categories (name, display_name, description)
VALUES ('NEW_CATEGORY', 'New Category Display', 'Description of new category');
```

#### 2. Add Templates and Fields
```typescript
// Use existing import scripts
// Update template.csv with new template data
// Run: node backend/scripts/seed-bsg-templates.js
```

#### 3. Frontend Updates
```typescript
// Update frontend components to handle new category
// Modify BSGTemplateSelector.tsx if needed
// Add new icons or styling for new category
```

### 3. Extending User Roles

#### 1. Update Database Schema
```sql
-- Add new role to enum (requires migration)
ALTER TYPE user_role ADD VALUE 'new_role';
```

#### 2. Update Authentication Middleware
```typescript
// In backend/src/middleware/authMiddleware.ts
export const requireRole = (allowedRoles: string[]) => {
  // Add 'new_role' to role checking logic
};
```

#### 3. Frontend Role Handling
```typescript
// In frontend/src/context/AuthContext.tsx
// Add new role permissions and UI logic
```

### 4. Adding New Approval Workflows

#### 1. Database Schema
```sql
-- Add workflow-specific fields to tickets table
ALTER TABLE tickets ADD COLUMN workflow_type VARCHAR(50);
ALTER TABLE tickets ADD COLUMN workflow_stage INTEGER DEFAULT 1;
```

#### 2. Backend Logic
```typescript
// Create new approval service
// backend/src/services/customApprovalService.ts
export class CustomApprovalService {
  static async processCustomApproval(ticketId: number) {
    // Custom approval logic
  }
}
```

#### 3. Frontend Components
```typescript
// Create workflow-specific UI components
// frontend/src/components/CustomApprovalWorkflow.tsx
```

---

## Quick Development Commands

### Backend Development
```bash
# Start development server
npm run dev

# Database operations
npx prisma migrate dev        # Create and apply migration
npx prisma db push           # Push schema to database
npx prisma studio           # Open database browser
npx prisma generate         # Regenerate Prisma client

# Seeding and testing
node scripts/seed-bsg-templates.js      # Seed BSG templates
node scripts/create-bsg-test-users.js   # Create test users
node test-workflows.js                  # Test complete workflows
```

### Frontend Development
```bash
# Start development server
npm start

# Building and testing
npm run build               # Production build
npm test                   # Run tests
npm run type-check         # TypeScript checking
```

### Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart specific service
docker-compose restart backend
```

---

## Notes for Developers

### Best Practices
1. **Always use TypeScript** - Leverage type safety
2. **Follow naming conventions** - camelCase for JS/TS, kebab-case for files
3. **Use asyncHandler** - For all async route handlers
4. **Validate input** - Always validate and sanitize user input
5. **Handle errors gracefully** - Consistent error response format
6. **Write tests** - Especially for business logic
7. **Document complex logic** - Add comments for complex business rules

### BSG-Specific Considerations
1. **Template CSV structure** - Maintain compatibility with existing CSV format
2. **Banking terminology** - Use proper banking terms in UI and code
3. **Department assignments** - Respect KASDA/BSGDirect department requirements
4. **Field types** - Support all BSG field types (dropdown_branch, dropdown_olibs_menu, etc.)
5. **Master data** - Keep branch and menu data synchronized

### Performance Considerations
1. **Database indexing** - Key indexes on frequently queried fields
2. **API pagination** - Implement pagination for large datasets
3. **Caching** - Consider caching for frequently accessed data
4. **Bundle optimization** - Keep frontend bundle size manageable
5. **Query optimization** - Use Prisma's select and include judiciously

---

*This development index is a living document. Update it as the system evolves and new patterns emerge.*

**Last Updated**: 2025-06-21
**System Version**: BSG Helpdesk v2.0 with complete optimized template system (70.6% field optimization achieved)