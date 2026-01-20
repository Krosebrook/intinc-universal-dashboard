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

## 🌲 Git Workflow & Branching Strategy

This repository uses a **three-branch workflow** for development, staging, and production environments.

### Branch Overview

```
production (🏭 production)  ← Manual approval, 2 reviews
    ↑
main (🚀 staging)          ← Auto-deploy, 1 review  
    ↑
development (🌱 dev)       ← Auto-deploy, no review required
    ↑
feature branches
```

### Branch Descriptions

| Branch | Environment | Auto-Deploy | Protection | Purpose |
|--------|------------|-------------|------------|---------|
| `development` | Development | ✅ Yes | Basic | Active development |
| `main` | Staging | ✅ Yes | Medium | Pre-production QA |
| `production` | Production | ⚠️  Manual | High | Production releases |

### Quick Start

```bash
# Work on a new feature
git checkout development
git pull origin development
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# Create PR to development → Auto-deploys to dev
# After testing, merge to main → Auto-deploys to staging
# After QA, merge to production → Manual approval required
```

### Workflow Generator

We provide a web-based configuration generator to set up workflows for any project:

🌐 **[Open Workflow Generator](/workflow-generator)** - Generate custom Git workflow configurations

Or use the command-line tools:

```bash
# Pre-flight check
./workflow-templates/pre-flight-check.sh

# Validate workflow setup
./workflow-templates/validate-refactor.sh

# Generate AI refactoring prompts
./workflow-templates/quick-refactor.sh

# Configure branch protection via API
export GITHUB_TOKEN='your_token'
./workflow-templates/setup-branch-protection.sh
```

### Detailed Documentation

📖 **[Complete Branching Strategy Guide](./workflow-templates/BRANCHING_STRATEGY.md)**

Includes:
- Detailed workflow examples
- Branch protection rules
- Conflict resolution guide
- Emergency procedures
- Team migration guide

### Example Configurations

The `workflow-templates/examples/` directory contains pre-configured examples for:
- **React Native Mobile Apps** - iOS/Android with App Store deployment
- **Python FastAPI** - Backend APIs with Docker and PostgreSQL
- **Rust CLI Tools** - Cross-compilation and GitHub releases

## 📚 Documentation

### Getting Started
- **[Getting Started Guide](./docs/GETTING_STARTED.md)** - Step-by-step tutorial for new users
- **[Features Overview](./docs/FEATURES.md)** - Complete feature documentation
- [PRD](./docs/PRD.md) - Product Requirements Document

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
- **[Next 4 Features](./docs/NEXT_FEATURES.md)** - Detailed planning for upcoming features
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
