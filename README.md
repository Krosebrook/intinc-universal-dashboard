# 🚀 Intinc Universal Dashboard

A production-ready, enterprise-grade universal dashboard platform built with React, TypeScript, and Blink SDK. Features comprehensive security, testing, CI/CD, and monitoring infrastructure.

[![CI Pipeline](https://github.com/Krosebrook/intinc-universal-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Krosebrook/intinc-universal-dashboard/actions/workflows/ci.yml)
[![Security Scanning](https://github.com/Krosebrook/intinc-universal-dashboard/actions/workflows/security.yml/badge.svg)](https://github.com/Krosebrook/intinc-universal-dashboard/actions/workflows/security.yml)

## ✨ Features

### Core Functionality
- 📊 **Multi-Department Dashboards** - Sales, HR, IT, Marketing with customizable KPIs
- 🎨 **Visual Widget Builder** - Drag-and-drop interface for creating custom widgets
- 📈 **Advanced Charts** - Line, bar, area, pie, stacked bar, and composed charts
- 🤖 **AI-Powered Insights** - Automated analysis and recommendations
- 📝 **PRD Generator** - AI-powered Product Requirements Document generation
- 💾 **CSV Import/Export** - Easy data import and PDF export
- 🔄 **Real-Time Collaboration** - Live updates and team commenting
- 🏢 **Workspace Management** - Multi-tenant architecture with RBAC
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🔧 **Custom Widget SDK** - Build interactive widgets with full SDK support

### Enterprise Features
- 🔒 **Production-Grade Security** - Input sanitization, CSP, rate limiting, RLS
- 🧪 **Comprehensive Testing** - Unit, integration, and E2E test infrastructure
- 🚀 **CI/CD Pipeline** - Automated testing, building, and deployment
- 📊 **Error Tracking** - Sentry integration with error boundaries
- 🐳 **Docker Support** - Containerized deployment with nginx
- 📝 **Structured Logging** - Winston logging and Sentry monitoring
- 🔐 **RBAC** - Role-based access control (Owner, Admin, Editor, Viewer)
- ⚡ **Performance Optimized** - Code splitting, lazy loading, caching

### Widget SDK (Phase 6)
- 🎯 **Cross-Widget Communication** - Widgets can interact and synchronize
- 🔍 **Global Filtering** - Unified filter system across all widgets
- 📊 **Comparison Mode** - Compare metrics across time periods
- 🎢 **Drill-Down Navigation** - Hierarchical data exploration
- ⚡ **Performance Profiler** - Real-time widget performance monitoring
- 🔒 **Security Sandbox** - Safe execution of custom widget code
- 📦 **Code Splitting** - Lazy loading with progressive enhancement
- 📚 **Complete SDK Docs** - Comprehensive developer documentation

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **Backend**: Blink SDK (Auth, Database, Real-time, AI)
- **Testing**: Vitest, Testing Library, Playwright
- **CI/CD**: GitHub Actions
- **Deployment**: Docker, Nginx
- **Monitoring**: Sentry, Structured Logging

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krosebrook/intinc-universal-dashboard.git
   cd intinc-universal-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Blink credentials:
   ```env
   VITE_BLINK_PROJECT_ID=your_project_id
   VITE_BLINK_PUBLISHABLE_KEY=your_publishable_key
   VITE_SENTRY_DSN=your_sentry_dsn # Optional
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker Directly

```bash
# Build image
docker build -t intinc-dashboard \
  --build-arg VITE_BLINK_PROJECT_ID=your_id \
  --build-arg VITE_BLINK_PUBLISHABLE_KEY=your_key \
  .

# Run container
docker run -p 80:80 intinc-dashboard
```

## 📚 Documentation

### Core Documentation
- [Architecture](./docs/architecture.md) - System architecture and design decisions
- [Security](./docs/security.md) - Security best practices and guidelines
- [API](./docs/API.md) - API documentation
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Database tables, relationships, and RLS policies

### Development Guides
- [Testing](./docs/TESTING.md) - Testing strategy and guidelines
- [Best Practices](./docs/BEST_PRACTICES.md) - Design and engineering standards
- [Widget SDK](./docs/WIDGET_SDK.md) - Custom widget development guide
- [PRD Generator](./docs/PRD_GENERATOR.md) - AI-powered PRD generation guide
- [Performance](./docs/PERFORMANCE.md) - Performance optimization strategies

### Operations
- [Deployment](./docs/DEPLOYMENT.md) - Deployment guide
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md) - Complete environment configuration
- [Logging & Monitoring](./docs/LOGGING.md) - Winston, Sentry, and audit logging
- [Error Handling](./docs/ERROR_HANDLING.md) - Error handling patterns and practices
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions

### Project Management
- [Roadmap](./docs/ROADMAP.md) - Product roadmap and completed features
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## 🔒 Security

This project implements multiple layers of security:

- **Input Sanitization**: All user inputs are sanitized using DOMPurify
- **Validation**: Zod schemas validate all data structures
- **Rate Limiting**: API and upload rate limiting
- **CSP Headers**: Content Security Policy prevents XSS attacks
- **RLS**: Row-Level Security ensures data access control
- **Security Scanning**: Automated vulnerability scanning in CI/CD

For more details, see [Security Documentation](./docs/security.md).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Blink](https://blink.new)
- UI components from [Radix UI](https://radix-ui.com)
- Charts by [Recharts](https://recharts.org)

## 📞 Support

For support, please contact [support@intinc.com](mailto:support@intinc.com).

---

**Made with ❤️ by the Intinc Team**
