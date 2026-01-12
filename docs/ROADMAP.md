# Intinc Universal Dashboard Roadmap

A comprehensive 5-phase strategic plan for evolving the Universal Dashboard Engine into a world-class enterprise platform.

## Phase 1: Foundation & Core Architecture
*Laying the groundwork for security, performance, and cross-departmental data handling.*

### 1.1 Data Strategy & Modeling
- Implement a flexible schema for department-specific data stores using Supabase.
- Standardize data ingestion pipelines for CSV, JSON, and external API connections.
- Design the universal widget configuration schema for cross-departmental reuse.

### 1.2 Shell & Navigation Implementation
- Finalize the "Modern Enterprise" Shell with high-fidelity glassmorphism effects.
- Implement responsive 12-column Grid layout using `shadcn/ui` primitives.
- Optimize the sticky sidebar with accessible sheet components for mobile navigation.

### 1.3 Auth & Enterprise Security
- Complete Supabase Auth integration with support for SAML/SSO for enterprise clients.
- Implement robust Row Level Security (RLS) to ensure department-level data isolation.
- Audit all API endpoints for JWT verification and strict input validation.

---

## Phase 2: Intelligent Visualization & Interactivity
*Enhancing the user experience with AI insights and dynamic, high-fidelity charting.*

### 2.1 Universal Widget Engine
- Build the `WidgetGrid` dynamic renderer to map JSON schemas to complex Recharts components.
- Support advanced chart types: Area, Multi-bar, Sunburst, and Scatter plots.
- Add support for "Drill-down" interactions, allowing users to dive deeper into specific metrics.

### 2.2 AI Summarization & Insights
- Integrate Gemini API for "Top 3 Takeaways" summaries tailored to the active department.
- Implement natural language querying (NLQ) for users to ask questions about their data.
- Develop "AI Alerts" that notify departments of statistical anomalies or trends.

### 2.3 Interactive Drill-throughs
- Create a modular modal system for detailed data inspection.
- Implement filtering and slicing synchronization across all widgets on a dashboard.
- Add "Compare Mode" to visualize metrics across different time periods or departments.

---

## Phase 3: Collaboration & Customization [COMPLETED]
*Empowering users to build and share their own data narratives without code.*

### 3.1 Multi-tenant Dashboard Management
- [x] Allow departments to create, save, and manage multiple custom dashboard views.
- [x] Implement "Dashboard Templates" for common use cases.
- [x] Add saved views management in the dashboard UI.

### 3.2 Share & Export Ecosystem
- [x] Optimize high-fidelity PDF export using `jspdf` and `html2canvas`.
- [x] Create "Public Links" with one-click copy functionality.
- [ ] Implement "Scheduled Reports" (Planned for v2).

### 3.3 Visual Widget Builder
- [x] Build an intuitive interface for users to create custom charts.
- [x] Implement "Data Explorer" for previewing configurations.
- [x] Add support for custom layout spans.

---

## Phase 4: Advanced Data Connectivity [COMPLETED]
*Moving beyond static JSON/Manual entry to live Webhook ingestion and CSV parsing.*

### 4.1 Live Webhook Ingestion
- [x] Implement a dedicated webhook listener UI in Enterprise Settings.
- [x] Provide a live data endpoint for external system integration.

### 4.2 CSV & Excel Parsing
- [x] Integrate client-side CSV parser in the Widget Builder.
- [x] Allow users to map spreadsheet data to widget attributes.

### 4.3 Automated Data Refresh
- [x] Implement real-time data sync using Blink Realtime.
- [x] Add visual indicators for "Live Engine" status.

---

## Phase 5: Collaborative Analytics [IN PROGRESS]
*Shared workspace features and dashboard commenting.*

### 5.1 Shared Workspaces
- [x] Implement "Workspace Selector" in the sidebar for multi-tenant context.
- [x] Create backend logic for workspace persistence.

### 5.2 Dashboard Commenting & Annotations
- [x] Build a "Collaboration Hub" for dashboard-level insights.
- [x] Implement real-time comment persistence via Blink DB.

### 5.3 Role-Based Access Control (RBAC)
- [ ] Implement granular permissions (Planned).

---

## Phase 6: Custom Widget SDK [INITIALIZED]
*Allowing advanced users to define custom React widgets via a controlled schema.*

### 6.1 Schema-Driven Component Definitions
- [x] Define the WSL (Widget Specification Language) JSON structure.
- [x] Create a "Developer Mode" for direct config editing.

### 6.2 Advanced Interactivity & State
- Expose a set of hooks and utilities for custom widgets to interact with the global dashboard state.
- Support complex inputs (e.g., date pickers, dropdowns) within custom widget headers.
- Enable cross-widget communication, allowing one custom widget to filter or update another.

### 6.3 Performance & Security Isolation
- Implement code-splitting for custom widget bundles to maintain fast initial load times.
- Ensure strict sanitization and security boundaries for user-defined React components.
- Develop a "Widget Performance Profiler" to help developers optimize their custom components.
