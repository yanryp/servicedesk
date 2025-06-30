# Frontend Architecture Documentation

This document outlines the architecture of the React.js frontend application.

---

## Directory Structure

The `frontend/src` directory is organized as follows:

- **`/components`**: Contains reusable React components used across the application.
  - **`/components/CustomFields`**: Specific components for rendering dynamic forms (`CustomFieldsForm.tsx`, `CustomFieldInput.tsx`).
  - `BSGTemplateDiscovery.tsx`: A key component for helping users find the correct BSG template.
- **`/pages`**: Top-level components that correspond to application routes (e.g., `HomePage.tsx`, `CreateTicketPage.tsx`, `TicketDetailPage.tsx`).
- **`/services`**: Modules responsible for all communication with the backend API. Each file corresponds to a set of related endpoints (e.g., `tickets.ts`, `auth.ts`).
- **`/context`**: Holds React Context providers for managing global state, such as `AuthContext.tsx` for user authentication.
- **`/hooks`**: Contains custom React hooks for shared logic (e.g., `useFileDownloader.ts`).
- **`/types`**: Centralized TypeScript type and interface definitions, primarily in `index.ts`.

---

## State Management

- **Global State**: Managed via React Context (`AuthContext`). This holds user information and authentication status.
- **Local State**: Managed within individual components using `useState` and `useReducer` hooks for form data, API responses, and UI state.

---

## Routing

- Routing is handled by `react-router-dom` in `App.tsx`.
- `ProtectedRoute.tsx` is used to protect routes that require authentication, redirecting unauthenticated users to the login page.

---

## Key Components & Data Flow

### Ticket Creation (`BSGCreateTicketPage.tsx`)
1.  **User Interaction**: The user selects a category and sub-category using the `BSGTicketCategorization` component.
2.  **Template Discovery**: The `BSGTemplateDiscovery` component suggests relevant templates based on user input or selection.
3.  **Dynamic Form**: Once a template is chosen, the `CustomFieldsForm` component fetches the template's field definitions from the API (`/api/template-management/templates/:id/fields`).
4.  **Field Rendering**: `CustomFieldsForm` maps over the field definitions and uses `CustomFieldInput` (or the newer `BSGDynamicField`) to render the appropriate input for each field type (text, dropdown, currency, etc.).
5.  **Data Submission**: On submit, the form data, including custom field values, is sent to the backend via the `tickets.ts` service (`POST /api/tickets`).

### Authentication Flow
1.  **Login**: User enters credentials on `LoginPage.tsx`.
2.  **API Call**: The `auth.ts` service sends a `POST` request to `/api/auth/login`.
3.  **Token Storage**: Upon success, the returned JWT is stored, and the user's information is placed in the `AuthContext`.
4.  **Authenticated Access**: The `api.ts` service automatically attaches the JWT to the headers of all subsequent API requests, allowing access to protected routes.

---

## Next Steps for Frontend

- **Enhance `BSGDynamicField.tsx`**: Add rendering and validation logic for the new field types (`currency`, `datetime`, `account_number`).
- **Master Data Integration**: Ensure dropdown fields within the dynamic form are populated by fetching data from the `/api/master-data/:type` endpoint.
- **UI Polish**: Implement the specific UI/UX requirements from the specifications, such as real-time currency formatting and searchable dropdowns.
