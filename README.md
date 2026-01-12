# Intinc Universal Dashboard

**Intinc Universal Dashboard** empowers every department to generate high-fidelity, interactive dashboards from any dataset, featuring modern enterprise UI, instant AI-powered insights, and seamless export to PDF—all without developer intervention.

## 🚀 Key Features
- **Modern Enterprise UI**: High-fidelity design system built with Indigo-500, Slate-950, and glassmorphism.
- **Dynamic Widget Engine**: Self-service dashboard generation mapping JSON schemas to interactive Recharts.
- **AI-Powered Insights**: Real-time summaries and "Top 3 Takeaways" generated via Gemini AI.
- **Enterprise Security**: Secure multi-tenant architecture leveraging Supabase Auth and Row Level Security.
- **High-Fidelity Export**: Pixel-perfect PDF exports preserving custom design system styles.

## 📚 Documentation
For detailed guides, architecture, and future plans, see the [Documentation Hub](./docs/README.md).

- [Strategic Roadmap](./docs/ROADMAP.md) - Our 5-phase plan for evolution.
- [Best Practices](./docs/BEST_PRACTICES.md) - Design and engineering standards.

## 🛠️ Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Run linting and CSS validation
bun lint
```

## 🏗️ Architecture
The project follows a modular React architecture:
- `src/components/dashboard`: Core widget and layout components.
- `src/hooks/use-dashboard`: Central data orchestration and state management.
- `src/lib/blink`: SDK integration for Auth and Database.

---

Built with ❤️ by the **Intinc Engineering Team**.
