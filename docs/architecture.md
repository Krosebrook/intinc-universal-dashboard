# System Architecture

The Intinc Universal Dashboard is built on a high-fidelity, schema-driven UI pattern designed for enterprise-scale flexibility and performance.

## Core Philosophy: Schema-Driven UI
The entire dashboard interface is dynamic. Rather than hard-coding views, the platform interprets a **Dashboard Configuration Schema** (JSON) to render widgets, layout grids, and data connections. This allows for instant updates and "no-code" customization by different departments.

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
