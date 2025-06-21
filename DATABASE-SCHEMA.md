# Database Schema Documentation

This document provides an overview of the PostgreSQL database schema, managed via Prisma.

---

## Core Models

These are the central models of the application.

- **`User`**: Stores user information, including `username`, `email`, `passwordHash`, and `role` (`admin`, `manager`, `technician`, `requester`). Each user belongs to a `Department`.
- **`Department`**: Represents an organizational unit within the company.
- **`Ticket`**: The main model for support tickets. It contains all standard ticket information like `title`, `description`, `status`, `priority`, and `sla_due_date`. It links to the creator, assignee, department, and the selected service template.

---

## Custom Fields System

This is the most critical part of the schema, enabling dynamic forms based on templates. It consists of four main models working together:

1.  **`ServiceTemplate`**: Defines a specific type of request (e.g., "OLIBS - User Mutation"). It has a name, description, and belongs to a `TemplateCategory`.

2.  **`ServiceFieldDefinition`**: Defines a single custom field that belongs to a `ServiceTemplate`. Key attributes include:
    - `fieldName`: The programmatic name (e.g., `"branch_code"`).
    - `fieldLabel`: The display name for the UI (e.g., `"Cabang / Capem"`).
    - `fieldType`: An enum defining the input type (`text`, `currency`, `date`, `dropdown`, etc.).
    - `isRequired`: A boolean indicating if the field is mandatory.
    - `validationRules`: A JSON object containing validation logic (e.g., `{ "minLength": 5, "source": "master_data", "type": "branch" }`).

3.  **`TicketServiceFieldValue`**: This model stores the actual data entered by a user. It creates the link between a `Ticket`, a `ServiceFieldDefinition`, and the `fieldValue` provided.

4.  **`MasterDataEntity`**: A flexible model used to populate dropdowns. It stores key-value pairs identified by a `type` string (e.g., `type: "branch"`). This allows for centralized management of options for branches, OLIBS menus, etc.

**Example Flow**:
A user selects the "OLIBS - User Mutation" (`ServiceTemplate`). The UI fetches all associated `ServiceFieldDefinition` records. One field is a dropdown for `"branch"`. The options for this dropdown are fetched from `MasterDataEntity` where `type` is `"branch"`. When the user submits the ticket, each custom field's value is saved as a new record in `TicketServiceFieldValue`.

---

## Categorization & Conversation

- **`TemplateCategory`**: A self-referencing model that creates a hierarchical category structure (e.g., IT Support -> OLIBS -> User Management) to organize `ServiceTemplate` records.
- **`TicketComment`**: Manages all comments on a ticket. It supports threaded conversations (`parentCommentId`), internal notes, and mentions.

---

## Key Enums

The schema uses enums to enforce consistency for specific fields:

- **`role`**: `admin`, `manager`, `technician`, `requester`
- **`ticket_status`**: `pending-approval`, `approved`, `rejected`, `assigned`, `in-progress`, `resolved`, `closed`
- **`priority`**: `low`, `medium`, `high`, `critical`
- **`field_type`**: `text`, `textarea`, `number`, `date`, `datetime`, `dropdown`, `currency`, `account_number`, etc.
