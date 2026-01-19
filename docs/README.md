# Intinc Universal Dashboard Documentation

Welcome to the official documentation for the **Intinc Universal Dashboard Engine**. This platform empowers departments to generate high-fidelity, interactive dashboards from any dataset.

## Quick Links

### Core Documentation
- [📋 Product Requirements Document](./PRD.md) - Comprehensive product specification and requirements
- [🚀 Strategic Roadmap](./ROADMAP.md) - Our 6-phase plan and completed features
- [💎 Best Practices](./BEST_PRACTICES.md) - Design and engineering standards
- [🏗️ Architecture](./architecture.md) - System architecture and design decisions
- [📝 Changelog](./changelog.md) - Version history and updates

### Development Guides
- [🧪 Testing](./TESTING.md) - Testing strategy and guidelines
- [🔌 API Documentation](./API.md) - API reference and examples
- [🎨 Widget SDK](./WIDGET_SDK.md) - Custom widget development guide
- [🗄️ Database Schema](./DATABASE_SCHEMA.md) - Database tables, relationships, and RLS policies
- [⚡ Performance Optimization](./PERFORMANCE.md) - Performance best practices and monitoring
- [📝 PRD Generator](./PRD_GENERATOR.md) - AI-powered PRD generation guide

### Operations & Deployment
- [📦 Deployment](./DEPLOYMENT.md) - Deployment guide for production
- [🔧 Environment Variables](./ENVIRONMENT_VARIABLES.md) - Complete environment configuration guide
- [🔒 Security](./security.md) - Security best practices and guidelines

### Troubleshooting & Support
- [🐛 Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
- [🚨 Error Handling](./ERROR_HANDLING.md) - Error handling patterns and best practices
- [📊 Logging & Monitoring](./LOGGING.md) - Winston, Sentry, and audit logging

## Project Overview
The Universal Dashboard Engine is built with a "Modern Enterprise" aesthetic, leveraging high-fidelity glassmorphism, AI-powered insights, and seamless data portability.

### Core Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend/Auth**: Blink SDK (Auth, Database, Real-time, AI)
- **Intelligence**: Gemini AI API
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file with the following keys:
- `VITE_BLINK_PROJECT_ID`
- `VITE_BLINK_PUBLISHABLE_KEY`
- `VITE_SENTRY_DSN` (optional)

### 3. Development
```bash
npm run dev
```

## Widget SDK (Phase 6)
Build custom interactive widgets with full ecosystem integration:

- **Cross-Widget Communication**: Widgets can interact and synchronize state
- **Global State Management**: Access filters, date ranges, and selections
- **Performance Profiling**: Monitor and optimize widget performance
- **Security Sandbox**: Safe execution of custom code
- **Code Splitting**: Lazy loading for optimal performance

See [Widget SDK Documentation](./WIDGET_SDK.md) for complete guide.

## Usage Guidelines
- **Adding a Department**: Update the `Department` type in `src/types/dashboard.ts` and add the corresponding data store in `src/hooks/use-dashboard.ts`.
- **Customizing Widgets**: Modify the `WidgetGrid` configurations to add or remove charts.
- **AI Insights**: The `AIInsight` component automatically summarizes data based on the current context.
- **Building Custom Widgets**: Use the Widget SDK hooks to create interactive, performant widgets.

## Support
For technical issues or feature requests, please contact the **Senior Lead Full-Stack Architect**.
