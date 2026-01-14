# Widget Communication Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Dashboard Application                       │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              WidgetStateProvider (Context)                     │ │
│  │                                                                 │ │
│  │  Global State:                                                  │ │
│  │  • Active Filters                                               │ │
│  │  • Date Range                                                   │ │
│  │  • Selected Data Points                                         │ │
│  │  • Comparison Mode                                              │ │
│  │  • Drill-Down Path                                              │ │
│  │  • Last Interaction                                             │ │
│  └───────────────────┬───────────────────────────────────────────┘ │
│                      │                                              │
│                      │ Provides Global State & Methods              │
│                      │                                              │
│  ┌───────────────────▼───────────────────────────────────────────┐ │
│  │                    Widget Grid                                  │ │
│  │                                                                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │ │
│  │  │   Widget 1   │  │   Widget 2   │  │   Widget 3   │        │ │
│  │  │              │  │              │  │              │        │ │
│  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │        │ │
│  │  │ │ SDK Hook │ │  │ │ SDK Hook │ │  │ │ SDK Hook │ │        │ │
│  │  │ └────┬─────┘ │  │ └────┬─────┘ │  │ └────┬─────┘ │        │ │
│  │  │      │       │  │      │       │  │      │       │        │ │
│  │  │      │       │  │      │       │  │      │       │        │ │
│  │  └──────┼───────┘  └──────┼───────┘  └──────┼───────┘        │ │
│  │         │                 │                 │                 │ │
│  │         │    Broadcast    │   Subscribe     │                 │ │
│  │         └─────────────────┼─────────────────┘                 │ │
│  │                           │                                   │ │
│  └───────────────────────────┼───────────────────────────────────┘ │
│                              │                                     │
└──────────────────────────────┼─────────────────────────────────────┘
                               │
                               │
                    Event Communication Bus
```

## Widget Communication Patterns

### 1. Broadcasting Events

```
Widget A                    WidgetStateProvider                Widget B, C, D
   │                              │                                │
   │  1. User clicks bar         │                                │
   ├─────────────────────────────>│                                │
   │  sdk.emit('filter', {...})  │                                │
   │                              │                                │
   │                              │  2. Store interaction          │
   │                              │  3. Update global state        │
   │                              │  4. Notify subscribers         │
   │                              ├───────────────────────────────>│
   │                              │  Interaction Event             │
   │                              │                                │
   │                              │  5. Subscribers execute        │
   │                              │     callbacks                  │
   │                              │<───────────────────────────────┤
   │                              │                                │
```

### 2. Filter Synchronization

```
Sales Widget            Global State            Revenue Widget
     │                       │                         │
     │  Create Filter        │                         │
     │  category='Electronics'│                        │
     ├──────────────────────>│                         │
     │                       │                         │
     │                       │  Add to activeFilters   │
     │                       │  Broadcast 'filter'     │
     │                       ├────────────────────────>│
     │                       │                         │
     │                       │                         │ Apply Filter
     │                       │                         │ Re-render with
     │                       │                         │ filtered data
     │                       │                         │
```

### 3. Date Range Coordination

```
Date Picker             Global State            All Widgets
     │                       │                         │
     │  Set Date Range       │                         │
     │  2024-01-01 to        │                         │
     │  2024-03-31           │                         │
     ├──────────────────────>│                         │
     │                       │                         │
     │                       │  Update dateRange       │
     │                       │  Broadcast to all       │
     │                       ├────────────────────────>│
     │                       │                         │
     │                       │                         │ Filter data
     │                       │                         │ by date range
     │                       │                         │ Re-render
     │                       │                         │
```

## Data Flow Through Widget

```
┌─────────────────────────────────────────────────────────────┐
│                          Widget                              │
│                                                              │
│  1. Props Data                                               │
│     ┌──────────────┐                                         │
│     │  Raw Data    │                                         │
│     └──────┬───────┘                                         │
│            │                                                 │
│            ▼                                                 │
│  2. SDK Processing                                           │
│     ┌─────────────────────────────────────┐                 │
│     │  useFilteredData()                  │                 │
│     │  • Apply global filters             │                 │
│     │  • Apply date range                 │                 │
│     │  • Filter by field mapping          │                 │
│     └─────────┬───────────────────────────┘                 │
│               │                                              │
│               ▼                                              │
│  3. Filtered Data                                            │
│     ┌──────────────┐                                         │
│     │  Processed   │                                         │
│     │  Data        │                                         │
│     └──────┬───────┘                                         │
│            │                                                 │
│            ▼                                                 │
│  4. Render                                                   │
│     ┌─────────────────────────────────────┐                 │
│     │  Chart Component                    │                 │
│     │  • Visualization                    │                 │
│     │  • User Interactions                │                 │
│     └─────────┬───────────────────────────┘                 │
│               │                                              │
│               ▼                                              │
│  5. User Action                                              │
│     ┌─────────────────────────────────────┐                 │
│     │  Click / Select / Filter            │                 │
│     │  → sdk.emit() / sdk.filters.create()│                 │
│     └─────────────────────────────────────┘                 │
│               │                                              │
└───────────────┼──────────────────────────────────────────────┘
                │
                ▼ Broadcast to other widgets
```

## Performance & Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Widget Loader                            │ │
│  │  • Dynamic imports                                      │ │
│  │  • Code splitting                                       │ │
│  │  • Lazy loading                                         │ │
│  │  • Progressive loading                                  │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                     │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │           Performance Monitor                           │ │
│  │  • Track render times                                   │ │
│  │  • Count re-renders                                     │ │
│  │  • Measure data sizes                                   │ │
│  │  • Report warnings                                      │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                     │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │              Security Layer                             │ │
│  │  • Sanitize configs                                     │ │
│  │  • Validate data                                        │ │
│  │  • Sandbox execution                                    │ │
│  │  • Rate limiting                                        │ │
│  │  • Memory checks                                        │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                     │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │                  Widget                                 │ │
│  │  • Safe execution                                       │ │
│  │  • Monitored performance                                │ │
│  │  • Optimized loading                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Widget Lifecycle with SDK

```
1. REGISTRATION
   ┌────────────────────────────────────┐
   │ widgetLoader.registerWidget()      │
   │ • Define manifest                  │
   │ • Specify component path           │
   │ • List dependencies                │
   └────────────┬───────────────────────┘
                │
2. LOADING      ▼
   ┌────────────────────────────────────┐
   │ Dynamic Import                     │
   │ • Fetch bundle                     │
   │ • Parse module                     │
   │ • Cache component                  │
   └────────────┬───────────────────────┘
                │
3. INITIALIZATION▼
   ┌────────────────────────────────────┐
   │ Component Mount                    │
   │ • Receive props                    │
   │ • Initialize SDK hooks             │
   │ • Subscribe to events              │
   └────────────┬───────────────────────┘
                │
4. RENDERING    ▼
   ┌────────────────────────────────────┐
   │ First Render                       │
   │ • Apply filters                    │
   │ • Process data                     │
   │ • Track performance                │
   └────────────┬───────────────────────┘
                │
5. INTERACTION  ▼
   ┌────────────────────────────────────┐
   │ User Actions                       │
   │ • Handle clicks                    │
   │ • Create filters                   │
   │ • Broadcast events                 │
   │ • Update selections                │
   └────────────┬───────────────────────┘
                │
6. RE-RENDERING ▼
   ┌────────────────────────────────────┐
   │ State Updates                      │
   │ • Respond to global state          │
   │ • Re-filter data                   │
   │ • Update visualization             │
   └────────────┬───────────────────────┘
                │
7. CLEANUP      ▼
   ┌────────────────────────────────────┐
   │ Component Unmount                  │
   │ • Unsubscribe from events          │
   │ • Clear local state                │
   │ • Release resources                │
   └────────────────────────────────────┘
```

## Example: Filter Creation Flow

```
User clicks bar in Sales Chart
         │
         ▼
┌─────────────────────────┐
│ handleBarClick()         │
│ • Extract category       │
│ • Validate value         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ sdk.filters.create()     │
│ • Generate filter ID     │
│ • Build filter object    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ addFilter()              │
│ • Add to activeFilters   │
│ • Update global state    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ broadcast()              │
│ • Create interaction     │
│ • Notify all subscribers │
└────────┬────────────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Revenue Widget │  │ Product Widget │  │ Region Widget  │
│ • Receive event│  │ • Receive event│  │ • Receive event│
│ • Apply filter │  │ • Apply filter │  │ • Apply filter │
│ • Re-render    │  │ • Re-render    │  │ • Re-render    │
└────────────────┘  └────────────────┘  └────────────────┘
```

## Key Components

### 1. WidgetStateProvider
- **Role:** Central state management
- **Responsibilities:**
  - Store global state
  - Manage filters, dates, selections
  - Coordinate events
  - Notify subscribers

### 2. useWidgetSDK Hook
- **Role:** Widget API interface
- **Provides:**
  - Simplified API
  - Filter management
  - Event handling
  - State access

### 3. Event Bus
- **Role:** Communication channel
- **Features:**
  - Pub/sub pattern
  - Type-safe events
  - Automatic cleanup
  - Performance optimized

### 4. Security Layer
- **Role:** Safe execution
- **Protections:**
  - Input sanitization
  - Data validation
  - Sandbox execution
  - Rate limiting

### 5. Performance Monitor
- **Role:** Optimization tool
- **Tracks:**
  - Render performance
  - Re-render frequency
  - Data sizes
  - Load times

## Summary

This architecture enables:
- ✅ **Loose Coupling:** Widgets are independent
- ✅ **Strong Communication:** Rich interaction patterns
- ✅ **Performance:** Optimized loading and rendering
- ✅ **Security:** Protected execution boundaries
- ✅ **Scalability:** Add widgets without complexity
- ✅ **Developer Experience:** Simple, powerful API
