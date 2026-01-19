# Getting Started with Intinc Universal Dashboard

Welcome to the Intinc Universal Dashboard! This guide will walk you through setting up and using the platform to create your first dashboard.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Creating Your First Dashboard](#creating-your-first-dashboard)
3. [Understanding Widgets](#understanding-widgets)
4. [Working with Data](#working-with-data)
5. [Collaboration Features](#collaboration-features)
6. [Advanced Features](#advanced-features)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Blink Account** - [Sign up at blink.new](https://blink.new)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krosebrook/intinc-universal-dashboard.git
   cd intinc-universal-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   # Required - Get these from your Blink project dashboard
   VITE_BLINK_PROJECT_ID=your_project_id_here
   VITE_BLINK_PUBLISHABLE_KEY=your_publishable_key_here
   
   # Optional - For error tracking
   VITE_SENTRY_DSN=your_sentry_dsn_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will open at [http://localhost:3000](http://localhost:3000)

### First Login

1. Navigate to the login page
2. Create an account using:
   - Email/password
   - Google OAuth
   - GitHub OAuth
   - Microsoft OAuth

---

## Creating Your First Dashboard

### Method 1: Using Templates (Recommended for Beginners)

1. **Open the Dashboard**
   - Click on "Dashboard" in the sidebar
   - Look for the "Templates" section

2. **Choose a Template**
   - Select from 8 pre-built department templates:
     - Sales Dashboard
     - HR Dashboard
     - IT Dashboard
     - Marketing Dashboard
     - SaaS Metrics
     - Product Analytics
     - AI/ML Monitoring
     - Operations

3. **Customize the Template**
   - Click "Use Template"
   - The dashboard will be cloned with sample data
   - Edit widgets by clicking the gear icon
   - Replace sample data with your own

### Method 2: Building from Scratch

1. **Create a New Dashboard**
   - Click "Create Dashboard" button
   - Enter a name and description
   - Select a department type

2. **Add Your First Widget**
   - Click the "+ Add Widget" button
   - The Visual Widget Builder will open

3. **Configure the Widget**
   
   **Step 1: Choose Chart Type**
   - Line Chart - Time series trends
   - Bar Chart - Comparisons
   - Area Chart - Volume trends
   - Pie Chart - Proportions
   - Stacked Bar - Multiple series
   - Multi-Line - Multiple trends
   - Gauge - Progress indicators
   - Progress Bar - Goal completion
   - Scatter Plot - Correlations

   **Step 2: Import Data**
   - **CSV Upload**: Click "Upload CSV" and select your file
   - **Manual Entry**: Paste JSON data directly
   - **Sample Data**: Use provided examples to get started

   **Step 3: Map Your Data**
   - **Category Key (X-axis)**: Select the date/category column
   - **Data Key (Y-axis)**: Select the metric(s) to visualize
   - Preview updates in real-time

   **Step 4: Style Your Widget**
   - Choose colors (default palette or custom)
   - Set chart title and description
   - Configure legends and labels
   - Add goal lines (optional)

   **Step 5: Configure Layout**
   - Select grid span (1-12 columns)
   - Position the widget on the grid
   - Set responsive behavior

4. **Save the Widget**
   - Click "Save Widget"
   - Your widget appears on the dashboard

---

## Understanding Widgets

### Widget Types and Use Cases

| Widget Type | Best For | Example Use Cases |
|------------|----------|-------------------|
| **Line Chart** | Time series data, trends | Revenue over time, user growth |
| **Bar Chart** | Comparisons, rankings | Sales by region, top products |
| **Area Chart** | Volume trends, stacking | Traffic sources, resource usage |
| **Pie Chart** | Proportions, breakdowns | Market share, expense categories |
| **Stacked Bar** | Multi-category comparison | Monthly sales by product line |
| **Multi-Line** | Multiple trend comparison | Compare YoY performance |
| **Gauge** | Progress to goal | Quarterly sales target |
| **Progress Bar** | Linear progress | Project completion |
| **Scatter Plot** | Correlations, distributions | Customer lifetime value vs. acquisition cost |

### Widget Configuration Options

All widgets support:
- **Drag & Drop Reordering**: Click and drag widgets to rearrange
- **Resizing**: Adjust grid span (1-12 columns)
- **Drill-Down**: Click data points for detailed views
- **Export**: Download as PNG or include in PDF reports
- **Real-Time Updates**: Auto-refresh with live data sources

### Widget Interactions

- **Click**: View detailed data for that point
- **Hover**: See tooltips with exact values
- **Filter**: Apply filters that affect all widgets
- **Compare**: Enable comparison mode for time periods

---

## Working with Data

### Data Import Methods

#### 1. CSV Upload

**Supported formats:**
- CSV files (up to 10MB)
- Must have headers in first row
- Date formats: ISO 8601, MM/DD/YYYY, YYYY-MM-DD

**Example CSV:**
```csv
date,revenue,customers,conversion_rate
2024-01-01,125000,450,0.034
2024-02-01,138000,520,0.038
2024-03-01,142000,580,0.041
```

**Steps:**
1. Click "+ Add Widget"
2. Select chart type
3. Click "Upload CSV"
4. Map columns to chart axes
5. Preview and save

#### 2. Manual JSON Entry

**Format:**
```json
[
  {
    "category": "January",
    "revenue": 125000,
    "customers": 450
  },
  {
    "category": "February",
    "revenue": 138000,
    "customers": 520
  }
]
```

**Steps:**
1. Click "+ Add Widget"
2. Select chart type
3. Click "Manual Entry"
4. Paste JSON data
5. Map fields and save

#### 3. Webhook Integration (Advanced)

For real-time data updates:

1. **Go to Enterprise Settings**
   - Navigate to "Webhooks" tab
   - Click "Create Webhook"

2. **Configure Endpoint**
   - Copy your unique webhook URL
   - Set up your data source to POST to this URL

3. **Data Format**
   ```json
   {
     "dashboard_id": "your-dashboard-id",
     "widget_id": "your-widget-id",
     "data": [
       {"category": "value", "metric": 123}
     ]
   }
   ```

4. **Verify Connection**
   - Send a test payload
   - Check "Live Engine" indicator turns green
   - Data updates appear in real-time

### Data Refresh Options

- **Manual Refresh**: Click refresh icon on widget
- **Auto Refresh**: Set interval in widget settings (5s, 30s, 1m, 5m)
- **Real-Time**: Connect webhook for instant updates
- **Scheduled**: Coming in Phase 7

---

## Collaboration Features

### Workspaces

**Create a Workspace:**
1. Click workspace selector in sidebar
2. Click "+ New Workspace"
3. Enter name and description
4. Invite team members

**Workspace Roles:**
- **Owner**: Full control, billing, delete workspace
- **Admin**: Manage dashboards, invite users, configure settings
- **Editor**: Create/edit dashboards and widgets
- **Viewer**: Read-only access to dashboards
- **Guest**: Limited access to specific dashboards

### Dashboard Comments

**Add a Comment:**
1. Open the Collaboration Hub (bottom-right)
2. Type your comment
3. Click "Post Comment"
4. Comments are visible to all workspace members

**@Mentions:**
- Type `@` followed by a username
- User receives notification
- Useful for directing questions or feedback

### Real-Time Collaboration

All changes are synchronized in real-time:
- Widget additions/edits appear instantly
- Comments show up immediately
- Filter changes propagate to all viewers
- "Live Engine" indicator shows active collaborators

---

## Advanced Features

### AI-Powered Insights

**Generate Insights:**
1. Open AI Insight panel (sidebar)
2. Click "Analyze Dashboard"
3. Review "Top 3 Takeaways"
4. Ask natural language questions:
   - "What are the trends in Q4?"
   - "Which region had highest growth?"
   - "Identify any anomalies in the data"

**Rate Limits:**
- 10 AI requests per minute per user
- Results cached for 5 minutes

### Global Filters

**Apply Dashboard-Wide Filters:**
1. Open Global Filters panel (top-right)
2. Set date range using date picker
3. Add custom filters (department, region, etc.)
4. All widgets update automatically

**Filter Types:**
- **Date Range**: Filter by start/end dates
- **Category**: Filter by text/category fields
- **Numeric Range**: Filter by value ranges
- **Multi-Select**: Select multiple filter values

### Comparison Mode

**Compare Time Periods:**
1. Enable comparison mode in Global Filters
2. Select primary date range
3. Select comparison date range
4. Widgets show both periods overlaid

**Use Cases:**
- Year-over-year comparison
- Before/after analysis
- A/B test results

### Widget Performance Profiler

**Monitor Performance:**
1. Enable "Developer Mode" in settings
2. Click "Performance Profiler"
3. View metrics:
   - Render time (ms)
   - Re-render count
   - Data size (KB)
   - Memory usage

**Optimization Tips:**
- Keep data under 1MB per widget
- Limit re-renders with memoization
- Use code splitting for custom widgets

### Custom Widget Development (Advanced)

**Build Custom Widgets:**
1. Read the [Widget SDK Documentation](./WIDGET_SDK.md)
2. Use the `useWidgetSDK` hook
3. Access global state and filters
4. Deploy with code splitting

**Example Custom Widget:**
```typescript
import { useWidgetSDK } from '@/hooks/useWidgetSDK';

export function MyCustomWidget() {
  const sdk = useWidgetSDK({
    widgetId: 'my-widget',
    onEvent: (event) => {
      console.log('Event received:', event);
    }
  });

  // Access global filters
  const { filters, dateRange } = sdk.globalState;

  // Emit events to other widgets
  const handleClick = () => {
    sdk.emit('filter', { 
      field: 'region', 
      value: 'North America' 
    });
  };

  return (
    <div>
      <h3>Custom Widget</h3>
      <button onClick={handleClick}>Apply Filter</button>
    </div>
  );
}
```

---

## Troubleshooting

### Common Issues

#### Dashboard Not Loading

**Symptoms:** White screen or loading spinner
**Solutions:**
1. Check browser console for errors (F12)
2. Verify Blink credentials in `.env.local`
3. Clear browser cache and reload
4. Check network tab for failed API calls

#### CSV Upload Failing

**Symptoms:** Error message during upload
**Solutions:**
1. Verify file size < 10MB
2. Check CSV has headers in first row
3. Ensure no special characters in headers
4. Try with a smaller sample first

#### Widgets Not Updating

**Symptoms:** Old data still showing
**Solutions:**
1. Click refresh icon on widget
2. Check "Live Engine" status
3. Verify webhook configuration
4. Check browser console for errors

#### AI Insights Not Working

**Symptoms:** "Rate limit exceeded" or timeout
**Solutions:**
1. Wait 1 minute (rate limit resets)
2. Check Blink AI quota in dashboard
3. Try with smaller dataset
4. Verify API key is valid

#### Authentication Issues

**Symptoms:** Can't log in or session expires
**Solutions:**
1. Clear cookies and try again
2. Use incognito/private browsing
3. Check Blink project status
4. Verify OAuth redirects are configured

### Getting Help

- **Documentation**: Read [docs/README.md](./README.md)
- **API Reference**: Check [docs/API.md](./API.md)
- **Security**: Review [docs/security.md](./security.md)
- **Support**: Email support@intinc.com
- **GitHub Issues**: Report bugs at [GitHub Issues](https://github.com/Krosebrook/intinc-universal-dashboard/issues)

---

## Next Steps

1. **Explore Templates**: Try each department template
2. **Import Your Data**: Upload a real CSV file
3. **Create Custom Dashboards**: Build dashboards for your team
4. **Enable Collaboration**: Invite team members to your workspace
5. **Try AI Insights**: Ask questions about your data
6. **Export Reports**: Generate PDF reports for stakeholders
7. **Learn Advanced Features**: Read the [Widget SDK](./WIDGET_SDK.md)

---

## Quick Reference

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open command palette |
| `Ctrl/Cmd + S` | Save dashboard |
| `Ctrl/Cmd + E` | Export to PDF |
| `Ctrl/Cmd + /` | Toggle sidebar |
| `Esc` | Close modal/dialog |

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /dashboards` | List all dashboards |
| `POST /dashboards` | Create new dashboard |
| `GET /dashboards/:id` | Get dashboard details |
| `PUT /dashboards/:id` | Update dashboard |
| `DELETE /dashboards/:id` | Delete dashboard |

For complete API documentation, see [API.md](./API.md).

---

**Need more help?** Join our community forum or contact support@intinc.com
