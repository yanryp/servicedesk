# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Enterprise Ticketing System (ETS) designed to replace ManageEngine ServiceDesk Plus Free Edition. The system removes the 5-technician limit and provides advanced ticketing features, approval workflows, and comprehensive reporting capabilities.

## Development Commands

Once the project is implemented, the following commands will be available:

```bash
# Development
npm run dev                 # Start development servers
npm run dev:backend        # Start backend only  
npm run dev:frontend       # Start frontend only

# Database
npm run db:migrate         # Run Prisma migrations
npm run db:seed           # Seed database with initial data
npm run db:reset          # Reset database completely
npm run db:studio         # Open Prisma Studio

# Testing
npm test                  # Run all tests
npm run test:unit        # Run unit tests only
npm run test:e2e         # Run E2E tests with Cypress
npm run test:coverage    # Generate test coverage report

# Building & Deployment
npm run build            # Build for production
npm run build:docker     # Build Docker images
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues automatically
npm run format           # Format code with Prettier

# Docker Development
docker-compose up -d     # Start all services (PostgreSQL, Redis, etc.)
docker-compose down      # Stop all services
```

## Architecture Overview

The system follows a **microservices architecture** with the following key components:

### Technology Stack
- **Frontend**: React 18+ with TypeScript, Tailwind CSS, and Vite
- **Backend**: Node.js with Express/Fastify and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session management and caching
- **Search**: Elasticsearch for full-text search capabilities
- **Queue**: RabbitMQ/Redis Queue for background jobs
- **Authentication**: JWT with access and refresh tokens
- **Real-time**: WebSocket (Socket.io) for notifications
- **Container**: Docker with Kubernetes orchestration

### Core System Components

1. **User Management**: Unlimited technician accounts with RBAC (Admin, Manager, Technician, Requester)
2. **Ticket Approval Workflow**: Requesters submit tickets → Manager approval → Active ticket assignment
3. **Ticket Engine**: Full CRUD with workflow states (Pending Approval → New → Assigned → In Progress → Pending → Resolved → Closed)
4. **SLA Management**: Business hours calculation, breach detection (SLA starts after manager approval)
5. **Escalation Engine**: Multi-level, time-based escalations after ticket approval
6. **Notification System**: Real-time WebSocket + email notifications for approvals and updates
7. **Knowledge Base**: Article management with versioning and approval workflows
8. **Reporting Dashboard**: Real-time analytics with Chart.js/Recharts
9. **API Gateway**: RESTful API with comprehensive documentation and webhooks

### Ticket Approval Workflow

**Critical Implementation Detail**: The escalation system works as follows:

1. **Requester submits ticket** → Status: "Pending Approval"
2. **Manager receives approval notification** → Manager can Approve/Reject/Request More Info
3. **Upon approval** → Status changes to "New" and SLA timer starts
4. **Ticket assignment** → Status changes to "Assigned" 
5. **Normal workflow continues** → In Progress → Pending → Resolved → Closed

**Key Points**:
- SLA calculations only begin AFTER manager approval
- Approval notifications are high priority (email + in-app)
- Managers can delegate approval authority
- Approval history is fully audited
- Rejected tickets can be revised and resubmitted

### Database Schema Structure

The system uses a hierarchical service catalog structure:
- **Services** → **Categories** → **Subcategories**
- Each level can have different approval rules and SLA policies
- Dynamic form fields based on category selection

Key entities:
- Users (roles, skills, availability, manager relationships)
- Tickets (full audit trail, approval status, time tracking, attachments)
- Approvals (approval chains, delegation rules, approval history)
- SLA Policies (business hours, response/resolution times, approval exclusions)
- Escalation Rules (post-approval escalations only)
- Knowledge Articles (versioned with approval process)

## Development Guidelines

### File Structure
```
ticketing-system/
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Route-based page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layers
│   │   ├── store/         # State management (Redux/Zustand)
│   │   └── types/         # TypeScript type definitions
├── backend/               # Node.js TypeScript backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Prisma models
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── jobs/          # Background job processors (approval reminders)
│   │   └── utils/         # Utility functions
├── prisma/               # Database schema and migrations
├── docker/               # Docker configurations
└── docs/                 # API documentation
```

### Key Development Patterns

1. **Clean Architecture**: Separate concerns with controllers, services, and repositories
2. **API-First Design**: All features accessible via RESTful API
3. **Event-Driven**: Use events for approval notifications and workflow transitions
4. **CQRS Pattern**: Separate read/write models for complex approval queries
5. **Circuit Breaker**: Resilience patterns for external service calls

### Critical Features Implementation Notes

**Approval Workflow Engine**: 
- Support parallel and sequential approval chains
- Handle delegation when managers are out of office
- Implement approval via email functionality
- Track approval response times and send reminders

**SLA Engine**: 
- Must exclude approval time from SLA calculations
- SLA timer starts only when ticket status changes from "Pending Approval" to "New"
- Account for business hours, holidays, and pause/resume functionality
- Calculate remaining time in real-time with WebSocket updates

**Escalation System**: 
- Process in background jobs, not synchronously
- Only escalate tickets that have been approved (status != "Pending Approval")
- Support time-based escalations (e.g., "after 2 hours of no response")
- Support condition-based escalations (e.g., "high priority + network category")

**Notification System**:
- High-priority notifications for pending approvals
- Approval reminder emails (daily for pending approvals)
- Real-time updates when approvals are granted/denied
- Approval delegation notifications

**Security**: 
- Implement OWASP Top 10 compliance
- Approval audit trails with digital signatures
- Rate limiting on approval requests
- Input validation and comprehensive audit logging

## Migration Strategy

The system must migrate data from ManageEngine ServiceDesk Plus:
- User accounts, roles, and manager relationships
- Historical ticket data with approval status mapping
- Categories and service catalog structure
- SLA policies (adjusted for approval workflow)
- Approval rules and delegation settings
- Knowledge base articles

Use the migration tools in `/scripts/migration/` for data transformation and validation.

## Performance Requirements

- Page load time < 3 seconds
- Support 10,000+ concurrent users
- Handle 100,000+ tickets in database
- API response time < 500ms for 95% of requests
- Real-time approval notifications with <1 second latency
- Approval dashboard updates in real-time

## Testing Strategy

- Unit tests for approval workflow logic (80% coverage target)
- Integration tests for approval API endpoints
- E2E tests for complete approval workflows
- Load testing for approval notification performance
- Security testing for approval authorization

## Deployment Architecture

Production deployment uses Kubernetes with:
- Horizontal pod autoscaling
- SSL/TLS termination
- Database connection pooling
- Redis cluster for approval session management
- Background job processing for approval reminders
- Monitoring with Prometheus/Grafana
- Centralized logging with ELK stack

## VS Code Setup

The repository includes comprehensive VS Code configuration in `.vscode/` directory with:
- Debugging configurations for backend and frontend
- Code snippets for approval workflow patterns
- Recommended extensions for optimal development experience
- Tasks for common development operations