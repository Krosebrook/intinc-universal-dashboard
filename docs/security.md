# Security Policy

Security and data isolation are fundamental to the Intinc Universal Dashboard, especially given the sensitive nature of HR, Sales, and IT data.

## Owner-Based Security Policy
The platform implements a strict **Owner-Based Security Policy** enforced at the database level via Supabase Row Level Security (RLS).

- **Principle**: Users can only access data that they own or have been explicitly granted access to.
- **Enforcement**: Every record in the `dashboards` and `enterprise_settings` tables includes a `user_id` field.
- **SDK Filtering**: The Blink SDK automatically appends `user_id` filters to all queries, ensuring that users never "leak" into another department's or user's data space.

## Data Isolation
Data isolation is maintained through multiple layers:
1. **Application Layer**: React context and hooks filter data based on the authenticated user's profile.
2. **Database Layer**: Supabase RLS policies prevent unauthorized SELECT, UPDATE, or DELETE operations even if the API is called directly.
3. **Departmental Separation**: While multiple departments may share the same physical infrastructure, logical isolation is maintained via strict schema validation.

## Authentication Flow
The transition from public to protected space is strictly managed:
1. **LoginPage**: Handles initial authentication via Email/Google/Microsoft/GitHub.
2. **JWT Issuance**: Upon successful login, a secure JSON Web Token (JWT) is issued.
3. **Protected Routes**: The `DashboardPage` and all associated API calls require a valid JWT. Unauthenticated requests are automatically redirected to the `LoginPage`.

## Sensitive Data Handling
- **API Keys**: All enterprise API keys and secrets are stored using the Blink Secrets vault (environment variables) and are never exposed to the client-side code unless explicitly prefixed (e.g., `NEXT_PUBLIC_` or `VITE_`).
- **Webhooks**: Incoming webhooks should include signature verification to prevent spoofing.
- **Audit Logs**: All significant actions (dashboard creation, configuration changes, data exports) are logged in the `audit_logs` table for compliance tracking.
