# Changelog

All notable changes to the Intinc Universal Dashboard will be documented in this file.

## [2.0.0] - 2026-01-14
### Added - Phase 6: Custom Widget SDK
- **Widget SDK Hooks**: Added comprehensive hooks for custom widget development (`useWidgetSDK`, `useFilteredData`, `useComparisonData`, `useWidgetLocalState`).
- **Cross-Widget Communication**: Implemented pub/sub system for widgets to communicate and synchronize state.
- **Widget Performance Profiler**: Real-time performance monitoring tool tracking render times, re-render counts, and data sizes.
- **Code Splitting Utilities**: Dynamic import system with lazy loading, preloading, and progressive loading strategies.
- **Security Framework**: Comprehensive security utilities including input sanitization, sandbox execution, rate limiting, and memory checks.
- **Widget Examples**: Two complete example widgets (InteractiveSalesChart, ComparisonTimeline) demonstrating SDK capabilities.
- **Widget SDK Documentation**: Complete developer guide with examples, best practices, and troubleshooting.

### Changed
- **Architecture**: Extended architecture to support custom widget SDK with performance and security isolation.
- **State Management**: Enhanced global state management to support cross-widget interactions and synchronization.

## [1.3.0] - 2026-01-12
### Added
- **Visual Widget Builder**: Added a powerful UI for creating custom widgets with real-time preview and CSV data parsing.
- **Collaboration Hub**: Implemented a dashboard-level commenting system for real-time team insights.
- **Workspaces**: Added support for multiple workspaces via a new selector in the global sidebar.
- **Sharing Ecosystem**: One-click public link generation for dashboard sharing.
- **Developer Mode (WSL)**: Introduced the Widget Specification Language (WSL) for advanced JSON-driven widget configuration.
- **Webhook Ingestion UI**: Added endpoint documentation and copy functionality in Enterprise Settings.

### Changed
- **Optimized PDF Export**: Unified the PDF export logic into a single library utility for high-fidelity reports.
- **Shell Refactoring**: Cleaned up the app shell to improve navigation and search consistency.

## [1.2.0] - 2026-01-12
### Added
- **Enterprise Branding**: Added a settings panel for custom logos, primary colors, and company names.
- **Live Data Simulator**: Implemented a "Live Simulator" to demonstrate real-time dashboard updates without external connections.
- **Dynamic Theming**: Support for dynamic HSL token generation based on enterprise settings.

## [1.1.0] - 2026-01-08
### Added
- **AI Insights**: Integrated Gemini API to provide automated "Top 3 Takeaways" for each dashboard view.
- **Widget Grid Interactivity**: Added support for resizing and repositioning widgets within the 12-column grid.
- **Skeleton Loaders**: Implemented sophisticated loading states using `shadcn/skeleton` for all data-fetching operations.

## [1.0.0] - 2026-01-01
### Added
- **Initial Shell**: Created the "Modern Enterprise" Shell with high-fidelity glassmorphism.
- **Sidebar Navigation**: Implemented the sticky sidebar with accessible sheet components for mobile.
- **Sales Dashboard Reference**: Established the "Gold Standard" reference implementation for the Sales department.
- **Supabase Integration**: Finalized the initial database schema and authentication flow.
