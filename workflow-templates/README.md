# Universal Git Workflow Template

Enterprise-grade Git workflow refactoring templates for any repository.

## 🚀 Quick Start

### Option 1: Web-Based Generator (Recommended)
Visit the web-based configuration generator:
```bash
npm install
npm run dev
# Open http://localhost:3000/workflow-generator
```

### Option 2: CLI Quick Setup
```bash
cd workflow-templates
cp examples/nextjs-pwa-enterprise.env refactor-config.env
# Edit refactor-config.env with your values
./quick-refactor.sh
```

### Option 3: Manual Configuration
```bash
cp universal-git-workflow-refactor-template.md my-refactor.md
# Replace {{VARIABLES}} with your values
claude code --prompt "$(cat my-refactor.md)"
```

## 📁 Template Structure

```
workflow-templates/
├── README.md                                    # This file
├── universal-git-workflow-refactor-template.md  # Master template
├── quick-refactor.sh                            # Automated setup script
├── validate-refactor.sh                         # Validation script
├── pre-flight-check.sh                         # Pre-refactor checks
├── examples/                                    # Example configurations
│   ├── nextjs-pwa-enterprise.env               # Next.js PWA config
│   ├── react-native-mobile.env                 # React Native config
│   ├── python-fastapi.env                      # Python API config
│   ├── rust-cli.env                            # Rust CLI config
│   └── monorepo-turborepo.env                  # Monorepo config
└── web-generator/                               # Web-based tool
    ├── pages/
    │   └── workflow-generator.tsx
    └── components/
        └── WorkflowConfigForm.tsx
```

## 📋 Supported Project Types

- ✅ Next.js PWA (Enterprise-ready)
- ✅ React Native Mobile Apps
- ✅ Python FastAPI/Django
- ✅ Rust CLI/Backend
- ✅ Monorepos (Turborepo/Nx)
- ✅ Node.js APIs
- ✅ Go Microservices
- ✅ Java Spring Boot

## 🎯 Features

- **Multi-language support**: Works with any language/framework
- **CI/CD integration**: GitHub Actions, GitLab CI, Jenkins
- **Branch protection**: Automated protection rule setup
- **Validation scripts**: Verify refactor success
- **Rollback procedures**: Safety-first approach
- **Team migration**: Automated announcement generation
- **Metrics tracking**: KPIs and success measurement

## 📚 Documentation

- [Master Template](./universal-git-workflow-refactor-template.md)
- [Next.js PWA Guide](./examples/NEXTJS-PWA-GUIDE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Contributing](./CONTRIBUTING.md)

## 🆘 Support

Create an issue with the `workflow-template` label.

## 📄 License

MIT License - Free to use, modify, and distribute.