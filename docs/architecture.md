# System Architecture

The Intinc Universal Dashboard is built on a high-fidelity, schema-driven UI pattern designed for enterprise-scale flexibility and performance.

## Core Philosophy: Schema-Driven UI
The entire dashboard interface is dynamic. Rather than hard-coding views, the platform interprets a **Dashboard Configuration Schema** (JSON) to render widgets, layout grids, and data connections. This allows for instant updates and "no-code" customization by different departments.

### The Schema Lifecycle
1. **Definition**: Dashboards are defined as a hierarchical JSON object containing layout metadata and widget specifications.
2. **Interpretation**: The `WidgetGrid` component parses the schema to determine grid spans, chart types, and data sources.
3. **Data Mapping**: Raw data is mapped to specific widget attributes (e.g., `xKey`, `yKey`, `value`) based on the schema's mapping instructions.
4. **Rendering**: Dynamic React components are instantiated with the processed data, allowing for a fully configurable UI.

## Frontend Stack
- **Framework**: Vite + React + TypeScript (for type-safe schema validation)
- **Styling**: Tailwind CSS for high-performance, atomic styling
- **Animations**: Framer Motion for sophisticated, staggered entrance animations and micro-interactions
- **UI Components**: `@shadcn/ui` primitives for a consistent "Modern Enterprise" look and feel

## State Management
- **Primary Source of Truth**: The `useDashboard` hook serves as the central state controller.
- **Synchronization**: It synchronizes local UI state with the Blink Database, ensuring that changes made by one user are persisted and potentially shared in real-time.
- **Data Flow**: `Supabase -> useDashboard Hook -> WidgetGrid -> Individual Widgets`

## Intelligence Layer: The "Insight Engine"
The **Insight Engine** is a proprietary pre-processing layer that sits between the raw data and the AI summarization service.
1. **Normalization**: Extracts and cleans relevant metrics from complex JSON datasets.
2. **Context Enrichment**: Attaches departmental metadata and historical trends.
3. **LLM Optimization**: Packages the processed data into optimized prompts for the Gemini API to generate the "Top 3 Takeaways."

## Layout System
The platform utilizes a **12-column responsive grid**. The `WidgetGrid` component dynamically calculates spans and offsets based on the dashboard configuration, supporting everything from simple KPI cards to complex, multi-span AreaCharts.

## Collaborative & Customization Layer
The platform empowers users to extend the dashboard without writing code through several key modules:

### 1. Visual Widget Builder
A multi-step configuration interface that allows users to:
- **Define Layout**: Select grid spans and positions.
- **Choose Visualization**: Select from a library of Chart types.
- **Ingest Data**: Import data via CSV parsing or manual JSON entry.
- **WSL (Widget Specification Language)**: Access the underlying JSON configuration for fine-grained developer control.

### 2. Collaboration Hub
A real-time communication layer built into each dashboard:
- **Persistence**: Comments are stored in the Blink Database and linked to specific dashboards.
- **Contextual Insights**: Allows users to provide human analysis alongside AI-generated takeaways.

### 3. Multi-tenant Workspaces
Workspaces provide high-level organization for dashboards:
- **Isolation**: Each workspace maintains its own set of dashboards and configurations.
- **Switching**: A global workspace selector in the sidebar allows for seamless context switching between different project environments.

## Custom Widget SDK (Phase 6)
The Widget SDK enables developers to create sophisticated custom widgets with full integration into the dashboard ecosystem.

### Widget State Management
- **Global State Access**: Widgets can read and modify global dashboard state through the `useWidgetSDK` hook.
- **Cross-Widget Communication**: Widgets can broadcast events and subscribe to events from other widgets.
- **Filter Synchronization**: Widgets automatically respond to global filters and can create their own filters.
- **Date Range Handling**: Unified date range management across all widgets.
- **Comparison Mode**: Built-in support for comparing data across different time periods.
- **Drill-Down Navigation**: Hierarchical data exploration with breadcrumb navigation.

### Performance Architecture
- **Code Splitting**: Widgets are loaded on-demand using dynamic imports and React.lazy.
- **Progressive Loading**: High-priority widgets load first, followed by below-fold widgets.
- **Performance Profiler**: Real-time monitoring of widget render times, re-render counts, and data sizes.
- **Memory Management**: Automatic cleanup and unloading of unused widget bundles.

### Security Architecture
- **Input Sanitization**: All widget configurations and data are sanitized using DOMPurify.
- **Sandbox Execution**: Custom widget code runs in a controlled sandbox with restricted access to dangerous APIs.
- **Rate Limiting**: Widget operations are rate-limited to prevent abuse.
- **Data Validation**: Zod-based schema validation for all widget data structures.
- **CSP Headers**: Content Security Policy enforcement for widget iframes.
- **Memory Limits**: Enforced size limits on widget data to prevent memory exhaustion.
