# API Endpoint Documentation

**Base URL**: `/api`

---

##  Authentication (`/auth`)

### `POST /auth/register`
- **Description**: Registers a new user.
- **Access**: Public
- **Body**: `{ "username", "email", "password", "role" }`

### `POST /auth/login`
- **Description**: Logs in a user and returns a JWT.
- **Access**: Public
- **Body**: `{ "email", "password" }`

---

## Tickets (`/tickets`)

### `POST /tickets`
- **Description**: Creates a new ticket. Supports file uploads.
- **Access**: Protected (Requester+)

### `GET /tickets`
- **Description**: Retrieves a list of tickets with filtering and pagination.
- **Access**: Protected

### `GET /tickets/:id`
- **Description**: Retrieves a single ticket by its ID.
- **Access**: Protected

### `PUT /tickets/:id`
- **Description**: Updates a ticket. Used by requesters to provide more info.
- **Access**: Protected (Owner or Technician/Admin)

### `POST /tickets/:id/approve`
- **Description**: Allows a manager to approve, reject, or request changes to a ticket.
- **Access**: Protected (Manager)
- **Body**: `{ "action": "approve" | "reject" | "request_changes", "comments": "..." }`

---

## Service Catalog (`/service-catalog`)

### `GET /service-catalog/categories`
- **Description**: Retrieves the hierarchical structure of service categories.
- **Access**: Protected

### `GET /service-catalog/templates/:categoryId`
- **Description**: Retrieves templates available for a specific category.
- **Access**: Protected

---

## Template Management (`/template-management`)

### `POST /template-management/templates`
- **Description**: Creates a new service template.
- **Access**: Protected (Admin)

### `GET /template-management/templates/:id/fields`
- **Description**: Retrieves the custom field definitions for a specific template.
- **Access**: Protected

### `POST /template-management/templates/:id/fields`
- **Description**: Adds a custom field definition to a template.
- **Access**: Protected (Admin)

---

## BSG Templates (`/bsg-templates`)

### `GET /bsg-templates/discover`
- **Description**: Discovers and suggests templates based on keywords from a ticket title or description.
- **Access**: Protected

### `POST /bsg-templates/import`
- **Description**: Bulk imports BSG templates from a CSV file.
- **Access**: Protected (Admin)

---

## Master Data (`/master-data`)

### `GET /master-data/:type`
- **Description**: Retrieves a list of master data entities for a given type (e.g., 'branch', 'olibs_menu').
- **Access**: Protected

### `GET /master-data/:type/hierarchy`
- **Description**: Retrieves master data in a hierarchical format.
- **Access**: Protected

### `POST /master-data/:type`
- **Description**: Creates a new master data entity.
- **Access**: Protected (Admin/Manager)

### `PUT /master-data/:type/:id`
- **Description**: Updates a master data entity.
- **Access**: Protected (Admin/Manager)

### `DELETE /master-data/:type/:id`
- **Description**: Deactivates a master data entity.
- **Access**: Protected (Admin)

### `POST /master-data/:type/bulk-import`
- **Description**: Bulk imports multiple master data entities.
- **Access**: Protected (Admin)
