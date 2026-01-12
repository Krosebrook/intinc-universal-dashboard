# Intinc Universal Dashboard: Best Practices

This document outlines the design and engineering standards for the Universal Dashboard Engine to ensure consistency, performance, and a "Modern Enterprise" experience.

## 1. UI/UX Design Standards

### Atomic Design Hierarchy
We follow the **Atomic Design** philosophy to ensure components are modular and reusable:
- **Atoms**: Primary buttons, inputs, labels, and icons (e.g., `shadcn/ui` primitives).
- **Molecules**: Combined atoms like `FormField` or `MetricCard`.
- **Organisms**: Complex units like `Sidebar`, `KPISection`, or `WidgetGrid`.
- **Templates**: Page-level layouts like `Shell`.
- **Pages**: Final implementation with data (e.g., `DashboardPage`).

### Color & Typography
- **Primary Palette**: Slate-950 (Background), Indigo-500 (Primary), White/10 (Glass borders).
- **Typography**: Use **Geist Sans** for UI and **Geist Mono** for data/tabular values.
- **Hierarchy**: Maintain clear contrast between display headings (32px+) and body text (14-16px).

### Glassmorphism Effects
- Use `backdrop-blur-md` and `bg-slate-900/50` for cards and overlays.
- Borders should be subtle: `border border-white/10` or `border-indigo-500/20`.

---

## 2. Technical Implementation

### State Management
- Use **React Context** for global state (e.g., current department, user session).
- For complex data stores within a specific dashboard, consider **Zustand** or local `useReducer` to prevent unnecessary re-renders of the entire shell.

### Performance & Data Fetching
- **Skeleton Loaders**: Always implement `Skeleton` states using `shadcn/skeleton` during data-fetching operations.
- **Lazy Loading**: Use `React.lazy` and `Suspense` for heavy chart components (e.g., Recharts) to keep initial bundle size small.
- **Memoization**: Use `useMemo` and `useCallback` for expensive data transformations before passing to charts.

### Accessibility (A11y)
- Use semantic HTML tags and ensure all interactive elements have proper `aria-labels`.
- Maintain a minimum contrast ratio of 4.5:1 for all text.
- Ensure the dashboard is fully navigable via keyboard.

---

## 3. Security & Data Integrity

### Authentication
- All access must be mediated through **Supabase Auth**.
- Never store sensitive user tokens in `localStorage`; use the SDK's built-in session management.

### Row Level Security (RLS)
- Every table in the database must have RLS enabled.
- Filters should be applied at the database level (`user_id` or `department_id`) to prevent unauthorized data exposure.

### Input Validation
- All data ingested via CSV or API must be sanitized and validated using a library like **Zod**.
- Implement strict typing for all dashboard configuration objects.

---

## 4. Animation & Interactivity

### Entrance Animations
- Use `framer-motion` for staggered entrance animations.
- Aim for subtle, professional motion: `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}`.

### Feedback Loops
- Use `sonner` for non-intrusive toast notifications (Success, Error, Info).
- All buttons must have clear `:hover` and `:active` states for tactile feedback.
