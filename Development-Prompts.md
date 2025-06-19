# Development Prompts for Ticketing System

## Project Setup Prompts

### 1. Initial Project Structure
```
Create a full-stack web application structure for a ticketing system using:
- Frontend: React with TypeScript, Tailwind CSS, and Vite
- Backend: Node.js with Express/Fastify and TypeScript
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT with refresh tokens
- File structure should follow clean architecture principles
Include Docker configuration for development environment.
```

### 2. Database Schema Design
```
Design a PostgreSQL database schema for a ticketing system with the following entities:
- Users (with roles: admin, manager, technician, requester)
- Tickets (with status workflow, priority, timestamps)
- Categories (hierarchical: service > category > subcategory)
- SLA policies (with business hours and response/resolution times)
- Comments (ticket conversations)
- Attachments
- Escalation rules
- Approval workflows
- Notification preferences
- Audit logs
Include proper indexes, foreign keys, and constraints. Use Prisma schema format.
```

## Feature Development Prompts

### 3. Authentication System
```
Implement a complete authentication system with:
- JWT authentication with access and refresh tokens
- Role-based access control (RBAC)
- Session management
- Password reset functionality
- Two-factor authentication support
- Account lockout after failed attempts
- Remember me functionality
- Secure password hashing with bcrypt
Include middleware for route protection and role checking.
```

### 4. Ticket Management CRUD
```
Create a ticket management system with:
- CRUD operations for tickets
- Ticket model with fields: title, description, priority, status, category, assignee, requester, SLA, tags
- Status workflow: New → Assigned → In Progress → Pending → Resolved → Closed
- Ticket assignment (manual and auto-assignment based on rules)
- Bulk operations (update status, assign, delete)
- Ticket templates for common issues
- Time tracking on tickets
- Ticket history/audit trail
- File attachment support with virus scanning
Include both API endpoints and React components.
```

### 5. Real-time Notifications
```
Implement a real-time notification system using WebSockets (Socket.io) with:
- In-app notifications for ticket updates
- Email notifications with customizable templates
- Notification preferences per user
- Notification center component in React
- Mark as read/unread functionality
- Notification grouping and batching
- Push notifications support (PWA)
Include both backend events and frontend components.
```

### 6. SLA Management
```
Build an SLA (Service Level Agreement) management system with:
- SLA policy creation (response time, resolution time)
- Business hours configuration
- Holiday calendar integration
- SLA calculation engine considering business hours
- SLA breach warnings and escalations
- SLA pause/resume for pending tickets
- SLA compliance dashboard
- Real-time SLA timer display on tickets
Include automatic escalation when SLA is about to breach.
```

### 7. Advanced Search and Filtering
```
Implement an advanced search system with:
- Full-text search using PostgreSQL's text search or Elasticsearch
- Filter by: status, priority, assignee, category, date range, SLA status, tags
- Saved search filters
- Search suggestions and autocomplete
- Quick filters and smart views
- Export search results to CSV/Excel
- Search API with pagination and sorting
Include both backend search logic and React filter components.
```

### 8. Reporting Dashboard
```
Create a comprehensive reporting dashboard with:
- Ticket volume trends (daily, weekly, monthly)
- Average resolution time by category
- SLA compliance percentage
- Technician performance metrics
- Customer satisfaction scores
- Real-time metrics using WebSockets
- Customizable date ranges
- Export reports to PDF/Excel
- Scheduled report generation
Use Chart.js or Recharts for visualizations.
```

### 9. Escalation Engine
```
Build an escalation system that:
- Defines multi-level escalation rules
- Supports time-based escalations (e.g., escalate if not resolved in 2 hours)
- Supports condition-based escalations (e.g., high priority + specific category)
- Sends notifications to escalation targets
- Logs escalation history
- Allows manual escalation override
- Integrates with SLA breach detection
Include both configuration UI and background job processor.
```

### 10. API Development
```
Create a RESTful API with:
- Comprehensive ticket management endpoints
- User and role management
- Category and service catalog endpoints
- SLA policy endpoints
- Reporting endpoints
- Webhook support for integrations
- API versioning (v1, v2)
- Rate limiting per API key
- OpenAPI/Swagger documentation
- API key authentication for external systems
Follow REST best practices and include error handling.
```

### 11. Email Integration
```
Implement email-to-ticket functionality:
- Email parser to create tickets from emails
- Extract sender, subject, body, attachments
- Auto-reply with ticket number
- Email threading for ticket updates
- Support for multiple email accounts/departments
- Email template management
- HTML and plain text email support
- Bounce handling
Use Node.js email parsing libraries and IMAP/POP3.
```

### 12. Knowledge Base
```
Create a knowledge base system with:
- Article CRUD operations
- Rich text editor with image support
- Category-based organization
- Full-text search
- Article versioning and history
- Approval workflow for publishing
- Article suggestions based on ticket content
- Public and internal articles
- Article feedback and ratings
- Most viewed/helpful articles widget
Include both management interface and public portal.
```

### 13. Customer Portal
```
Build a customer self-service portal with:
- Ticket submission form with dynamic fields
- Ticket status tracking
- Knowledge base search
- Service catalog browser
- File attachment support
- Ticket history view
- Satisfaction survey after ticket closure
- Profile management
- Password reset
Make it responsive and accessible (WCAG 2.1 AA).
```

### 14. Workflow Automation
```
Implement a workflow automation system:
- Visual workflow designer (drag-and-drop)
- Condition-based routing (if-then-else)
- Automated actions: assign, update status, send notification, create tasks
- Time-based triggers
- Integration with external systems via webhooks
- Workflow templates for common scenarios
- Testing/simulation mode
- Workflow versioning
Use React Flow or similar for the visual designer.
```

### 15. Performance Optimization
```
Optimize the application for performance:
- Implement caching strategy with Redis
- Database query optimization with proper indexes
- Lazy loading for React components
- Image optimization and CDN integration
- API response compression
- Database connection pooling
- Background job processing with queues
- Pagination for large datasets
- React.memo and useMemo for expensive operations
Include performance monitoring and metrics.
```

## Testing Prompts

### 16. Unit Testing
```
Write comprehensive unit tests for:
- Authentication service (login, logout, token refresh)
- Ticket service (CRUD operations, status transitions)
- SLA calculation engine
- Escalation rule processor
- Notification service
Use Jest for backend and React Testing Library for frontend.
Aim for 80% code coverage.
```

### 17. Integration Testing
```
Create integration tests for:
- API endpoints with authentication
- Database operations
- Email sending functionality
- WebSocket connections
- File upload/download
- Search functionality
Use Supertest for API testing and Cypress for E2E testing.
```

## Deployment Prompts

### 18. Docker Configuration
```
Create Docker configuration for the ticketing system:
- Multi-stage Dockerfile for Node.js backend
- Dockerfile for React frontend
- docker-compose.yml with:
  - PostgreSQL database
  - Redis cache
  - Nginx reverse proxy
  - Node.js backend
  - React frontend
- Environment variable management
- Volume mapping for persistence
- Health checks for all services
```

### 19. CI/CD Pipeline
```
Set up a CI/CD pipeline using GitHub Actions that:
- Runs tests on pull requests
- Builds Docker images
- Runs security scans
- Deploys to staging on develop branch
- Deploys to production on main branch
- Runs database migrations
- Sends deployment notifications
- Includes rollback capability
```

### 20. Production Deployment
```
Create production deployment configuration:
- Kubernetes manifests for all services
- Horizontal pod autoscaling
- SSL/TLS certificate management
- Secrets management
- Monitoring with Prometheus/Grafana
- Centralized logging with ELK stack
- Backup strategy for database
- Disaster recovery plan
Include security best practices and hardening.
```

## Security Prompts

### 21. Security Implementation
```
Implement security features:
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Session security
- File upload security (type validation, antivirus)
- API authentication and authorization
- Audit logging for sensitive operations
- OWASP Top 10 compliance
```

## Migration Prompts

### 22. Data Migration Tool
```
Create a data migration tool that:
- Connects to ManageEngine ServiceDesk Plus database
- Maps old schema to new schema
- Migrates users, tickets, categories, and history
- Handles data transformation and cleaning
- Provides progress tracking
- Supports incremental migration
- Validates migrated data
- Generates migration report
Include error handling and rollback capability.
```

## Additional Features

### 23. Multi-tenancy Support
```
Add multi-tenancy support with:
- Tenant isolation at database level
- Tenant-specific configurations
- Separate subdomains or paths per tenant
- Tenant admin role
- Usage limits per tenant
- Billing integration readiness
- Tenant onboarding workflow
```

### 24. Mobile App API
```
Create mobile-optimized API endpoints for:
- Quick ticket creation
- Ticket status updates
- Push notifications
- Offline support with sync
- Biometric authentication
- Compressed responses for mobile data
- Mobile-specific workflows
```

### 25. Analytics and ML
```
Implement analytics and machine learning features:
- Ticket categorization using NLP
- Sentiment analysis on ticket content
- Predictive SLA breach warnings
- Workload forecasting
- Anomaly detection for unusual ticket patterns
- Suggested solutions based on historical data
- Performance trend analysis
Use TensorFlow.js or integrate with Python ML services.
```

---

## How to Use These Prompts

1. **Start with Project Setup** - Use prompts 1-2 to establish the foundation
2. **Core Features First** - Implement prompts 3-6 for basic functionality
3. **Add Advanced Features** - Use prompts 7-15 based on priority
4. **Testing** - Implement prompts 16-17 alongside development
5. **Deployment** - Use prompts 18-20 when ready for production
6. **Security & Migration** - Implement prompts 21-22 before go-live
7. **Future Enhancements** - Consider prompts 23-25 for version 2.0

Each prompt can be used directly in VS Code with AI coding assistants like GitHub Copilot, Cursor, or when working with AI coding tools.