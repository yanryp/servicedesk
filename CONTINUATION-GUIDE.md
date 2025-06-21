# Project Continuation Guide

This guide is intended for developers who will continue working on this project. It provides a high-level overview of the project's status, immediate goals, and a recommended workflow.

---

## 1. Understand the Current Status

First, review the `PROJECT-STATUS.md` document. It provides a detailed breakdown of what is complete, what is partially implemented, and what features are still missing. The core frontend and backend are ~95% complete, but the system's full potential is locked behind the implementation of template-specific custom fields.

---

## 2. The Immediate Priority: BSG Custom Fields

**The single most important next step is to implement the custom fields for the three main BSG templates.**

Your work should be guided by two key documents:

1.  **`BSG-TEMPLATE-SPECIFICATIONS.md`**: This is the **"what"**. It details every field required for the OLIBS, BSGTouch, and ATM templates, including their types, validation rules, and UI requirements.
2.  **`CUSTOM-FIELDS-IMPLEMENTATION.md`**: This is the **"how"**. It provides a step-by-step technical guide for implementing these fields, from database changes to frontend component updates.

### Recommended Workflow:

1.  **Master Data Population**: The custom fields rely on master data for dropdowns. Start by writing and running the scripts to populate the `MasterDataEntity` table for branches, OLIBS menus, bank codes, etc., as detailed in the implementation guide.

2.  **Backend Schema Extension**: Update the `field_type` enum in `backend/prisma/schema.prisma` to include the new field types (`currency`, `account_number`, etc.). Run `npx prisma migrate dev` to apply the changes.

3.  **Frontend Component Enhancement**: Modify the `BSGDynamicField.tsx` component to correctly render and handle the new field types. This includes adding input masks for currency, validation for account numbers, and fetching options for dropdowns from the master data API.

4.  **Connect and Test**: Ensure the dynamic form on the `BSGCreateTicketPage.tsx` correctly loads and renders the fields when a template is selected. Test the entire flow from form submission to data being correctly saved in the `TicketServiceFieldValue` table.

---

## 3. Key Documentation Reference

- **`API-ENDPOINTS.md`**: Your reference for all backend API routes.
- **`FRONTEND-ARCHITECTURE.md`**: Explains the structure and data flow of the React application.
- **`DATABASE-SCHEMA.md`**: Explains the database models and their relationships, especially the custom fields system.
- **`DEPLOYMENT-GUIDE.md`**: Instructions for setting up your local development environment.

---

## 4. Task Management

This project uses `task-master` for task management. Once the initial tasks are generated from the `prd.txt` file, use the following commands to manage your workflow:

- `task-master list`: View all tasks.
- `task-master show <id>`: See the details of a specific task.
- `task-master next`: Find the next available task to work on.
- `task-master set-status --id=<id> --status=done`: Mark a task as complete.

By following this guide and referencing the detailed documentation, you will be able to efficiently continue the development of this project and deliver the critical features required by the stakeholders.
