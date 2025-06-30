# Enterprise Ticketing System

This project is an enterprise-grade ticketing system designed to replace ManageEngine ServiceDesk Plus Free Edition. 

## Tech Stack
- **Frontend:** React.js with TypeScript
- **Backend:** Node.js with Express.js and TypeScript
- **Database:** PostgreSQL

## Project Structure
- `frontend/`: Contains the React.js frontend application
- `backend/`: Contains the Node.js backend API

## Key Features

### Multi-Level Category System
- Hierarchical structure: Categories → Sub-Categories → Items → Templates
- Custom fields based on templates
- Dynamic form generation based on selected template

### Ticket Approval Workflow
- New tickets are created with 'pending-approval' status
- Manager actions:
  - **Approve**: Changes status to 'approved', clears manager comments, sets SLA due date
  - **Reject**: Changes status to 'rejected', adds manager comments
  - **Request Changes**: Changes status to 'awaiting-changes', adds manager comments
- When a requester updates a ticket in 'awaiting-changes' status, it automatically transitions back to 'pending-approval'
- Once approved, tickets can be assigned to technicians for processing

### Role-Based Access Control
- **Requesters**: Can create and update their own tickets
- **Managers**: Can review, approve, reject, or request changes for tickets from their team members
- **Technicians**: Can work on approved tickets
- **Admins**: Have full access to all system features

## Recent Improvements

### Fixed Issues
- Fixed automatic status transition from 'awaiting-changes' to 'pending-approval' when a requester updates their ticket
- Corrected database column name mismatches in SQL queries:
  - `ta.filename` → `ta.file_name`
  - `ta.filepath` → `ta.file_path`
  - `ta.mimetype` → `ta.file_type`
  - `ta.filesize` → `ta.file_size`
- Fixed database client double release errors

## Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ticketing-system.git
cd ticketing-system
```

2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env  # Update with your database credentials
npm run dev
```

3. Set up the frontend (in a separate terminal)
```bash
cd frontend
npm install
npm start
```

## Next Steps & Development Roadmap

The following is a phased plan for upcoming development, based on recent project analysis:

### Phase 1: Frontend Template System Implementation (Priority High)
- **Objective**: Enable users to select templates and fill out dynamically generated forms.
- **Key Tasks**:
    - Update `CreateTicketPage.tsx`:
        - Implement template selection UI (e.g., `CategorySelector`, `TemplateSelector`).
        - Integrate `DynamicForm.tsx` to render forms based on selected template.
        - Develop `CustomFieldRenderer.tsx` and individual field components (text, number, date, dropdown, etc.).
        - Add real-time frontend validation for custom fields.
    - API Integration:
        - Fetch available templates and their custom field definitions.
        - Submit ticket data including `templateId` and `customFieldValues` (ensure API call uses `FormData` if handling file uploads alongside, or structured JSON as appropriate).
    - **Quick Fix**: Remove current hardcoded/free-form ticket creation from frontend to enforce template usage.

### Phase 2: Manager Dashboard & Features
- **Objective**: Provide managers with tools to efficiently review and approve tickets.
- **Key Tasks**:
    - Develop `ManagerDashboard.tsx`:
        - Display list of tickets pending approval.
        - Implement quick actions (approve, reject, request changes).
        - Add functionality for bulk selection and actions.
        - Include filtering and search capabilities.
    - Ensure mobile-responsive design for the manager interface.
    - Add a route for the Manager Dashboard (e.g., `/manager/approvals` in `App.tsx`).
    - **Quick Fix**: Add manager role check in frontend to display link to the dashboard (e.g., `{isManager && <Link to="/manager/approvals">Approvals</Link>}`).

### Phase 3: Backend Enhancements & Advanced Features
- **Objective**: Strengthen backend logic and introduce advanced system capabilities.
- **Key Tasks**:
    - **Enforce Template Usage**: Modify database schema (`ALTER TABLE tickets ALTER COLUMN template_id SET NOT NULL;`) and backend logic to make `template_id` mandatory for ticket creation.
    - Implement Auto-Approval: Develop a system for automatic approval of tickets after a configurable timeout.
    - Implement Approval Delegation: Allow managers to delegate their approval responsibilities.
    - Develop Template Usage Analytics: Create backend endpoints and data collection for tracking template usage and field completion metrics.
    - Explore Template Versioning.
    - Implement Template-Based SLA Rules.
    - Design and implement an Approval Rules Engine.
    - Support Multi-Level Approvals.

### Phase 4: System Polish, Testing & Comprehensive Documentation
- **Objective**: Ensure system stability, reliability, and provide thorough documentation.
- **Key Tasks**:
    - **Testing**:
        - Conduct extensive testing of the template system (frontend and backend validation).
        - Perform thorough tests of the entire approval workflow.
        - Execute end-to-end user journey tests.
    - **Documentation**:
        - Update API documentation for all new and modified endpoints.
        - Create/update user guides for new frontend features (template creation, manager dashboard).
        - Develop admin guides for system configuration and advanced features.

### Ongoing Improvements
- Implement more comprehensive error handling throughout the application.
- Continuously add unit and integration tests, focusing on critical workflows like template management and approvals.
- Enhance logging for improved debugging and system monitoring.
- Regularly review and refactor code (e.g., `ticketRoutes.ts`, frontend components) for clarity, performance, and maintainability.
- Refine email notification system, including settings for development/testing.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
