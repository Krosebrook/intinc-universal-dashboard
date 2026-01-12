# Intinc Universal Dashboard Documentation

Welcome to the official documentation for the **Intinc Universal Dashboard Engine**. This platform empowers departments to generate high-fidelity, interactive dashboards from any dataset.

## Quick Links
- [🚀 Strategic Roadmap](./ROADMAP.md) - Our 5-phase plan for the future.
- [💎 Best Practices](./BEST_PRACTICES.md) - Design and engineering standards.

## Project Overview
The Universal Dashboard Engine is built with a "Modern Enterprise" aesthetic, leveraging high-fidelity glassmorphism, AI-powered insights, and seamless data portability.

### Core Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend/Auth**: Supabase
- **Intelligence**: Gemini AI API
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

### 1. Installation
```bash
bun install
```

### 2. Environment Setup
Create a `.env.local` file with the following keys:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

### 3. Development
```bash
bun dev
```

## Usage Guidelines
- **Adding a Department**: Update the `Department` type in `src/types/dashboard.ts` and add the corresponding data store in `src/hooks/use-dashboard.ts`.
- **Customizing Widgets**: Modify the `WidgetGrid` configurations to add or remove charts.
- **AI Insights**: The `AIInsight` component automatically summarizes data based on the current context.

## Support
For technical issues or feature requests, please contact the **Senior Lead Full-Stack Architect**.
