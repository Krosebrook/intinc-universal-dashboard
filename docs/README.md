# Intinc Universal Dashboard Documentation

Welcome to the official documentation for the **Intinc Universal Dashboard Engine**. This platform empowers departments to generate high-fidelity, interactive dashboards from any dataset with AI-powered insights, real-time collaboration, and enterprise-grade security.

## 📖 Documentation Navigation

### 🚀 Getting Started
- **[Getting Started Guide](./GETTING_STARTED.md)** - **START HERE** - Step-by-step tutorial for new users
- **[Features Overview](./FEATURES.md)** - Complete list of all platform capabilities
- [Quick Start Video](#) - Coming soon

### 📋 Product Documentation
- [📋 Product Requirements Document](./PRD.md) - Comprehensive product specification
- [🚀 Roadmap](./ROADMAP.md) - Completed features and future plans
- **[🎯 Next 4 Features](./NEXT_FEATURES.md)** - Detailed planning for Phase 7
- [📝 Changelog](../CHANGELOG.md) - Version history and release notes

### 🏗️ Architecture & Design
- [🏗️ Architecture](./architecture.md) - System architecture and design patterns
- [💎 Best Practices](./BEST_PRACTICES.md) - Design and engineering standards
- [🎨 Widget SDK](./WIDGET_SDK.md) - Custom widget development guide
- [📊 Widget Communication](./WIDGET_COMMUNICATION_DIAGRAM.md) - Cross-widget communication patterns

### 💻 Development Guides
- [🧪 Testing](./TESTING.md) - Testing strategy and guidelines
- [🔌 API Documentation](./API.md) - Complete API reference
- [🗄️ Database Schema](./DATABASE_SCHEMA.md) - Tables, relationships, RLS policies
- [⚡ Performance](./PERFORMANCE.md) - Optimization strategies and monitoring
- [📝 PRD Generator](./PRD_GENERATOR.md) - AI-powered PRD generation

### 🔒 Security & Operations
- [🔒 Security](./security.md) - Security best practices and guidelines
- [🔐 RBAC](./security.md#rbac) - Role-Based Access Control
- [📦 Deployment](./DEPLOYMENT.md) - Production deployment guide
- [🔧 Environment Variables](./ENVIRONMENT_VARIABLES.md) - Configuration reference
- [🐛 Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

### 📊 Monitoring & Support
- [📊 Logging & Monitoring](./LOGGING.md) - Winston, Sentry, audit logs
- [🚨 Error Handling](./ERROR_HANDLING.md) - Error patterns and practices
- [📈 Audit Summary](./AUDIT_SUMMARY_2026.md) - Security and compliance audit

---

## 🎯 Quick Start

### For New Users
1. Read the **[Getting Started Guide](./GETTING_STARTED.md)**
2. Review **[Features Overview](./FEATURES.md)**
3. Try creating your first dashboard using templates

### For Developers
1. Review [Architecture](./architecture.md) and [Best Practices](./BEST_PRACTICES.md)
2. Set up environment using [Deployment Guide](./DEPLOYMENT.md)
3. Read [Widget SDK](./WIDGET_SDK.md) for custom widget development
4. Review [Testing Guide](./TESTING.md) before contributing

### For Administrators
1. Review [Security Documentation](./security.md)
2. Configure [Environment Variables](./ENVIRONMENT_VARIABLES.md)
3. Set up [Logging & Monitoring](./LOGGING.md)
4. Review [RBAC](./security.md#rbac) for access control

---

## 🏆 Project Overview

The Intinc Universal Dashboard is a **production-ready, enterprise-grade** universal dashboard platform that solves the problem of fragmented data visualization across departments.

### Key Capabilities

**✅ Completed (Phases 1-6)**
- 🎨 9 chart types with visual widget builder
- 🤖 AI-powered insights via Gemini API
- 🏢 Multi-workspace collaboration with RBAC
- 🔒 Enterprise security (RLS, CSP, rate limiting)
- 📊 Custom Widget SDK with cross-widget communication
- 📈 Real-time data sync and collaboration
- 📄 PDF export and public sharing

**📋 Planned (Phase 7 - 2026)**
- 📊 Advanced analytics and statistical analysis
- 📧 Scheduled reports with email delivery
- 🔌 20+ data connectors and integrations
- 🛒 Widget marketplace and template sharing

See [ROADMAP.md](./ROADMAP.md) and [NEXT_FEATURES.md](./NEXT_FEATURES.md) for details.

### Core Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI**: Radix UI, Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **Backend**: Blink SDK (Auth, Database, Real-time, AI)
- **AI**: Google Gemini API
- **Testing**: Vitest, Playwright, Testing Library
- **Deployment**: Docker, Nginx, GitHub Actions

---

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/Krosebrook/intinc-universal-dashboard.git
cd intinc-universal-dashboard

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Blink credentials

# Start development server
npm run dev
```

See [Getting Started Guide](./GETTING_STARTED.md) for detailed setup instructions.

---

## 🎨 Widget SDK (Phase 6)

Build custom interactive widgets with full ecosystem integration:

**Key Features:**
- 🔄 **Cross-Widget Communication** - Publish/subscribe event system
- 🌐 **Global State Access** - Filters, date ranges, selections
- ⚡ **Performance Profiling** - Real-time monitoring and optimization
- 🔒 **Security Sandbox** - Safe execution environment
- 📦 **Code Splitting** - Lazy loading and progressive enhancement

**Example Custom Widget:**
```typescript
import { useWidgetSDK } from '@/hooks/useWidgetSDK';

export function MyCustomWidget() {
  const sdk = useWidgetSDK({
    widgetId: 'my-widget',
    onEvent: (event) => console.log(event)
  });

  // Access global filters
  const { filters, dateRange } = sdk.globalState;

  // Emit events to other widgets
  sdk.emit('filter', { field: 'region', value: 'US' });

  return <div>Custom Widget</div>;
}
```

See [Widget SDK Documentation](./WIDGET_SDK.md) for complete guide.

---

## 🔧 Configuration

### Environment Variables
```env
# Required - Blink Configuration
VITE_BLINK_PROJECT_ID=your_project_id
VITE_BLINK_PUBLISHABLE_KEY=your_key

# Optional - Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn

# Optional - Feature Flags
VITE_ENABLE_WIDGET_PROFILER=true
VITE_ENABLE_AI_INSIGHTS=true
```

See [Environment Variables](./ENVIRONMENT_VARIABLES.md) for complete reference.

---

## 🧪 Testing

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests in UI mode
npm run test:e2e:ui
```

See [Testing Guide](./TESTING.md) for detailed testing strategy.

---

## 🚀 Deployment

### Docker Deployment
```bash
# Using Docker Compose
docker-compose up -d

# Using Docker directly
docker build -t intinc-dashboard .
docker run -p 80:80 intinc-dashboard
```

See [Deployment Guide](./DEPLOYMENT.md) for production deployment instructions.

---

## 📊 Platform Statistics

| Metric | Value |
|--------|-------|
| **Phases Completed** | 6 of 6 (Phase 1-6) |
| **Chart Types** | 9 types |
| **Widget SDK Version** | 1.0 |
| **Security Layers** | 5+ (Auth, RLS, CSP, Rate Limiting, Audit) |
| **Supported Departments** | 8 templates |
| **Test Coverage** | 70%+ target |
| **Documentation Pages** | 20+ guides |

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](../CONTRIBUTING.md) for:
- Code style guidelines
- Testing requirements
- Pull request process
- Development workflow

---

## 📞 Support & Resources

### Documentation
- 📚 **[Full Documentation Index](#-documentation-navigation)** - Above
- 🚀 **[Getting Started](./GETTING_STARTED.md)** - New user guide
- 📖 **[Features](./FEATURES.md)** - Complete feature list
- 🎯 **[Next Features](./NEXT_FEATURES.md)** - Upcoming Phase 7

### Help & Support
- 🐛 [GitHub Issues](https://github.com/Krosebrook/intinc-universal-dashboard/issues) - Bug reports
- 📧 Email: support@intinc.com
- 📖 [Troubleshooting Guide](./TROUBLESHOOTING.md)
- 💬 Community Forum (coming soon)

### External Resources
- [Blink Documentation](https://docs.blink.new)
- [Radix UI](https://radix-ui.com)
- [Recharts](https://recharts.org)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📄 License

This project is private and proprietary to Intinc.

---

## 🙏 Acknowledgments

Built with:
- [Blink](https://blink.new) - Backend infrastructure
- [Radix UI](https://radix-ui.com) - Accessible components
- [Recharts](https://recharts.org) - Chart library
- [Tailwind CSS](https://tailwindcss.com) - Styling framework

---

**Last Updated:** January 19, 2026  
**Version:** 1.0 (Phase 6 Complete)  
**Maintained By:** Intinc Product Team
