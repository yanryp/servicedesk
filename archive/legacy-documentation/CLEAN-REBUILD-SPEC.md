# Enterprise Ticketing System - Clean Rebuild Specification

## 🎯 Project Overview

A complete rebuild of the Enterprise Ticketing System (ETS) with clean architecture, consistent API design, and streamlined workflows. This specification addresses the current system's complexity and provides a blueprint for a maintainable, scalable solution.

## 🏗️ System Architecture

### Core Principles
1. **Domain-Driven Design (DDD)** - Clear separation of business domains
2. **Clean Architecture** - Dependency inversion and layered structure
3. **API-First Design** - RESTful APIs with consistent patterns
4. **Event-Driven Architecture** - Loose coupling through domain events
5. **Single Responsibility** - Each component has one clear purpose

### Technology Stack

#### Backend
```
├── Runtime: Node.js 18+ with TypeScript
├── Framework: Fastify (faster than Express, better TypeScript support)
├── Database: PostgreSQL 15+ with connection pooling
├── ORM: Prisma (type-safe, great migrations)
├── Cache: Redis (sessions, real-time data)
├── Queue: BullMQ (background jobs, notifications)
├── Auth: JWT with refresh tokens
├── Validation: Zod (runtime type checking)
├── Testing: Jest + Supertest
└── API Docs: OpenAPI 3.0 + Swagger UI
```

#### Frontend
```
├── Framework: React 18 with TypeScript
├── Build Tool: Vite (fast dev server, HMR)
├── Styling: Tailwind CSS + Headless UI
├── State: Zustand (lightweight, no boilerplate)
├── Forms: React Hook Form + Zod validation
├── API Client: TanStack Query (caching, sync)
├── Testing: Vitest + Testing Library
└── E2E: Playwright
```

## 🎯 Domain Model

### Core Domains

#### 1. **Identity & Access Management (IAM)**
```typescript
// Users, roles, permissions, authentication
├── User
├── Role
├── Permission
├── Unit (organizational structure)
└── Session
```

#### 2. **Service Catalog**
```typescript
// Service definitions and templates
├── ServiceCategory
├── ServiceItem
├── ServiceTemplate
├── CustomField
└── ServiceLevel
```

#### 3. **Ticket Management**
```typescript
// Core ticketing functionality
├── Ticket
├── TicketStatus
├── Priority
├── Assignment
└── TicketHistory
```

#### 4. **Approval Workflow**
```typescript
// Business approval processes
├── ApprovalRule
├── ApprovalRequest
├── ApprovalDecision
└── ApprovalChain
```

#### 5. **Notification System**
```typescript
// Communication and alerts
├── NotificationTemplate
├── NotificationChannel
├── NotificationRule
└── NotificationHistory
```

## 📊 Database Schema Design

### Clean Entity Relationships

```sql
-- Core entities with clear relationships
Users (id, email, role, unit_id, is_active)
Units (id, name, type, parent_id, department_id)
Departments (id, name, type, is_service_owner)

-- Service catalog
ServiceCategories (id, name, department_id, parent_id)
ServiceItems (id, name, category_id, sla_hours, requires_approval)
ServiceTemplates (id, service_item_id, form_schema)

-- Tickets
Tickets (id, title, description, status, priority, created_by, assigned_to, service_item_id)
TicketComments (id, ticket_id, user_id, content, type)
TicketAttachments (id, ticket_id, filename, file_path, size)

-- Approvals
ApprovalRequests (id, ticket_id, approver_id, status, created_at, decided_at)
ApprovalRules (id, service_item_id, approver_role, unit_type, is_required)

-- Audit
AuditLogs (id, entity_type, entity_id, action, user_id, changes, timestamp)
```

## 🔄 API Design Standards

### RESTful API Structure

```typescript
// Base URL: /api/v1
// Consistent resource naming

// Authentication
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

// Users & Organizations
GET    /users                    // List users (with filters)
GET    /users/:id               // Get user details
POST   /users                   // Create user
PUT    /users/:id               // Update user
DELETE /users/:id               // Deactivate user

GET    /units                   // List organizational units
GET    /units/:id/users         // Users in unit
GET    /units/:id/managers      // Managers of unit

// Service Catalog
GET    /service-catalog         // List categories and items
GET    /service-items/:id       // Service item details
GET    /service-items/:id/template // Form template

// Tickets
GET    /tickets                 // List tickets (with filters)
POST   /tickets                 // Create ticket
GET    /tickets/:id             // Ticket details
PUT    /tickets/:id             // Update ticket
POST   /tickets/:id/comments    // Add comment
POST   /tickets/:id/attachments // Upload attachment

// Approvals
GET    /approvals/pending       // My pending approvals
POST   /approvals/:id/approve   // Approve request
POST   /approvals/:id/reject    // Reject request

// Notifications
GET    /notifications           // My notifications
PUT    /notifications/:id/read  // Mark as read
```

### Standard Response Format

```typescript
// Success Response
{
  "success": true,
  "data": T,
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}

// List Response
{
  "success": true,
  "data": T[],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}
```

## 🎫 Simplified Ticket Workflow

### Clear State Machine

```typescript
// Ticket Status Flow
type TicketStatus = 
  | 'draft'           // Being created
  | 'pending_approval' // Waiting for business approval
  | 'open'            // Approved, waiting for assignment
  | 'assigned'        // Assigned to technician
  | 'in_progress'     // Being worked on
  | 'pending_user'    // Waiting for user input
  | 'resolved'        // Fixed, pending user confirmation
  | 'closed'          // Completed
  | 'cancelled';      // Cancelled

// Valid Transitions
const validTransitions = {
  draft: ['pending_approval', 'open'],
  pending_approval: ['open', 'cancelled'],
  open: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'open'],
  in_progress: ['pending_user', 'resolved', 'assigned'],
  pending_user: ['in_progress', 'closed'],
  resolved: ['closed', 'in_progress'],
  closed: [],
  cancelled: []
};
```

### Approval Logic (Simplified)

```typescript
// Single approval rule per service item
interface ApprovalRule {
  serviceItemId: number;
  requiresApproval: boolean;
  approverRole: 'manager' | 'admin' | 'service_owner';
  unitScope: 'same' | 'parent' | 'department' | 'any';
  isRequired: boolean;
}

// Approval assignment logic
function assignApprover(ticket: Ticket, rule: ApprovalRule): User | null {
  const requesterUnit = ticket.createdBy.unit;
  
  switch (rule.unitScope) {
    case 'same':
      return findManagerInUnit(requesterUnit.id);
    case 'parent':
      return findManagerInUnit(requesterUnit.parentId);
    case 'department':
      return findManagerInDepartment(requesterUnit.departmentId);
    case 'any':
      return findAnyAvailableManager();
  }
}
```

## 🏛️ Project Structure

### Backend Structure
```
src/
├── domains/                    # Domain-specific modules
│   ├── auth/
│   │   ├── controllers/       # HTTP handlers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access
│   │   ├── models/           # Domain entities
│   │   └── schemas/          # Validation schemas
│   ├── tickets/
│   ├── approvals/
│   ├── notifications/
│   └── users/
├── shared/                    # Shared utilities
│   ├── middleware/           # Auth, validation, logging
│   ├── types/               # Common TypeScript types
│   ├── utils/               # Helper functions
│   └── events/              # Domain events
├── infrastructure/           # External concerns
│   ├── database/            # Prisma client, migrations
│   ├── queue/               # BullMQ setup
│   ├── cache/               # Redis client
│   └── email/               # Email service
└── app.ts                   # Application bootstrap
```

### Frontend Structure
```
src/
├── pages/                    # Route components
├── components/               # Reusable UI components
│   ├── ui/                  # Basic components (Button, Input)
│   ├── forms/               # Form components
│   └── layout/              # Layout components
├── features/                # Feature-specific components
│   ├── auth/
│   ├── tickets/
│   ├── approvals/
│   └── notifications/
├── stores/                  # Zustand stores
├── services/                # API clients
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript definitions
└── utils/                   # Helper functions
```

## 🔐 Security & Authorization

### Role-Based Access Control (RBAC)

```typescript
// Simple role hierarchy
type Role = 'admin' | 'manager' | 'technician' | 'requester';

// Permission system
interface Permission {
  resource: string;    // 'ticket', 'user', 'approval'
  action: string;      // 'create', 'read', 'update', 'delete'
  scope: string;       // 'own', 'unit', 'department', 'all'
}

// Role permissions
const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { resource: '*', action: '*', scope: 'all' }
  ],
  manager: [
    { resource: 'approval', action: 'create', scope: 'unit' },
    { resource: 'ticket', action: 'read', scope: 'unit' },
    { resource: 'user', action: 'read', scope: 'unit' }
  ],
  technician: [
    { resource: 'ticket', action: 'update', scope: 'assigned' },
    { resource: 'ticket', action: 'create', scope: 'own' }
  ],
  requester: [
    { resource: 'ticket', action: 'create', scope: 'own' },
    { resource: 'ticket', action: 'read', scope: 'own' }
  ]
};
```

## 📱 Frontend Architecture

### State Management Strategy

```typescript
// Zustand stores - one per domain
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface TicketStore {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  filters: TicketFilters;
  setFilters: (filters: TicketFilters) => void;
  loadTickets: () => Promise<void>;
  createTicket: (data: CreateTicketData) => Promise<Ticket>;
}

// TanStack Query for server state
const useTickets = (filters: TicketFilters) => {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketApi.getTickets(filters),
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};
```

### Component Structure

```typescript
// Feature-based component organization
features/
├── tickets/
│   ├── components/
│   │   ├── TicketList.tsx
│   │   ├── TicketCard.tsx
│   │   ├── TicketDetail.tsx
│   │   └── CreateTicketForm.tsx
│   ├── hooks/
│   │   ├── useTickets.ts
│   │   └── useCreateTicket.ts
│   └── types/
│       └── ticket.types.ts
```

## 🚀 Implementation Phases

### Phase 1: Foundation (2-3 weeks)
- [ ] Project setup and tooling
- [ ] Database schema design and migrations
- [ ] Authentication system
- [ ] Basic API structure
- [ ] User management

### Phase 2: Core Features (3-4 weeks)
- [ ] Service catalog management
- [ ] Ticket creation and management
- [ ] Basic approval workflow
- [ ] Frontend ticket interface

### Phase 3: Advanced Features (2-3 weeks)
- [ ] Complex approval rules
- [ ] Notification system
- [ ] File attachments
- [ ] Reporting dashboard

### Phase 4: Polish & Testing (1-2 weeks)
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

## 🧪 Testing Strategy

### Backend Testing
```typescript
// Unit tests for business logic
describe('TicketService', () => {
  it('should create ticket with approval requirement', async () => {
    const service = new TicketService();
    const ticket = await service.createTicket({
      title: 'Test',
      serviceItemId: 1,
      createdBy: requesterUser
    });
    
    expect(ticket.status).toBe('pending_approval');
    expect(ticket.approvalRequest).toBeDefined();
  });
});

// Integration tests for APIs
describe('POST /tickets', () => {
  it('should create ticket and trigger approval', async () => {
    const response = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send(ticketData)
      .expect(201);
      
    expect(response.body.data.status).toBe('pending_approval');
  });
});
```

### Frontend Testing
```typescript
// Component tests
describe('CreateTicketForm', () => {
  it('should submit valid ticket data', async () => {
    render(<CreateTicketForm />);
    
    await user.type(screen.getByLabelText('Title'), 'Test ticket');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    
    expect(mockCreateTicket).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test ticket' })
    );
  });
});
```

## 📈 Performance Considerations

### Database Optimization
- Proper indexing for common queries
- Connection pooling
- Query optimization
- Pagination for large datasets

### Caching Strategy
- Redis for session storage
- API response caching
- Frontend query caching with TanStack Query

### Real-time Updates
- WebSocket connections for live updates
- Optimistic updates in frontend
- Event-driven notifications

## 🔒 Security Measures

### Authentication & Authorization
- JWT with short expiry + refresh tokens
- Role-based access control
- API rate limiting
- Input validation and sanitization

### Data Protection
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection
- File upload validation

## 📊 Monitoring & Observability

### Logging
- Structured logging with Winston
- Request/response logging
- Error tracking
- Audit trail for sensitive operations

### Metrics
- API response times
- Database query performance
- User activity tracking
- System health monitoring

## 🚀 Deployment Strategy

### Development Environment
```bash
# Docker Compose for local development
docker-compose up -d postgres redis
npm run dev:backend
npm run dev:frontend
```

### Production Deployment
- Container orchestration (Docker + Kubernetes)
- Database migrations in CI/CD
- Environment-based configuration
- Health checks and monitoring

## 📝 Migration Strategy

### Data Migration
1. Export existing data to CSV/JSON
2. Transform data to new schema
3. Validate data integrity
4. Import in batches
5. Verify migration success

### User Training
1. Admin user training
2. Manager workflow training
3. End-user documentation
4. Gradual rollout

## 🎯 Success Metrics

### Technical Metrics
- API response time < 200ms (95th percentile)
- System uptime > 99.9%
- Zero critical security vulnerabilities
- Test coverage > 80%

### Business Metrics
- Ticket resolution time improvement
- User satisfaction scores
- Approval workflow efficiency
- Reduced manual intervention

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 6+
- Docker (optional, for local development)

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd enterprise-ticketing-system-v2

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npm run db:setup
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

### Project Structure
```
enterprise-ticketing-system-v2/
├── backend/           # API server
├── frontend/          # React application
├── shared/            # Shared types and utilities
├── docs/             # Documentation
├── scripts/          # Build and deployment scripts
└── docker/           # Docker configurations
```

This specification provides a comprehensive blueprint for rebuilding the ticketing system with clean architecture, consistent APIs, and maintainable code structure. The new system will be more scalable, secure, and easier to maintain than the current implementation.