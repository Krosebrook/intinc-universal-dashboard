# Next 4 Features - Detailed Planning Document

This document outlines the next 4 major features planned for the Intinc Universal Dashboard platform, building upon the completed Phases 1-6.

## Overview

With the successful completion of Phases 1-6, the platform now has:
- ✅ Core dashboard and widget infrastructure
- ✅ AI-powered insights and PRD generation
- ✅ Custom Widget SDK with cross-widget communication
- ✅ Enterprise security (RBAC, RLS, CSP, rate limiting)
- ✅ Real-time collaboration and commenting
- ✅ Performance profiling and optimization

**Next Evolution (Phase 7):** Enterprise-Grade Analytics & Automation

---

## Feature 1: Advanced Analytics & Reporting Engine

### Problem Statement

Current dashboards provide excellent visualization but lack:
- Statistical analysis tools
- Predictive analytics
- Automated anomaly detection
- Comparative analysis across dashboards/workspaces
- Advanced metric calculations

### Solution Overview

Build a comprehensive analytics engine that provides:
- Statistical analysis (regression, correlation, forecasting)
- Automated anomaly detection with alerting
- Comparative analytics across time periods and dashboards
- Calculated metrics and derived KPIs
- What-if scenario modeling

### Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│           Analytics Engine (Frontend)                │
│  ┌────────────────────────────────────────────┐    │
│  │  Analytics Dashboard                        │    │
│  │  - Statistical Insights                     │    │
│  │  - Anomaly Alerts                          │    │
│  │  - Predictive Charts                       │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │  Analytics Service Layer                    │    │
│  │  - Time Series Analysis                     │    │
│  │  - Statistical Functions                    │    │
│  │  - Anomaly Detection                        │    │
│  │  - Forecasting Models                       │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │  Data Processing Pipeline                   │    │
│  │  - Data Aggregation                         │    │
│  │  - Feature Engineering                      │    │
│  │  - Model Training (client-side)            │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│         Analytics Edge Functions (Backend)          │
│  ┌────────────────────────────────────────────┐    │
│  │  Complex Analytics API                      │    │
│  │  - Heavy computations                       │    │
│  │  - ML model inference                       │    │
│  │  - Large dataset processing                 │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Feature Components

#### 1.1 Statistical Analysis Tools

**Correlation Analysis**
- Pearson/Spearman correlation matrices
- Visual correlation heatmaps
- Identify relationships between metrics
- Export correlation reports

**Regression Analysis**
- Linear regression
- Polynomial regression
- Multiple regression
- R-squared and confidence intervals

**Distribution Analysis**
- Histogram generation
- Normal distribution testing
- Percentile calculations
- Box plot visualization

**Trend Analysis**
- Moving averages (simple, weighted, exponential)
- Trend lines and projections
- Seasonality detection
- Cyclical pattern identification

#### 1.2 Predictive Analytics

**Time Series Forecasting**
- ARIMA models (client-side implementation)
- Exponential smoothing
- Linear projections
- Confidence bands (upper/lower bounds)

**Forecast Configuration**
- Forecast horizon (days/weeks/months)
- Model selection (auto or manual)
- Seasonality settings
- Confidence level (80%, 90%, 95%)

**Forecast Visualization**
- Historical data + forecast overlay
- Confidence bands shading
- Accuracy metrics (MAPE, RMSE)
- Forecast revision tracking

#### 1.3 Anomaly Detection

**Detection Methods**
- Statistical outliers (Z-score, IQR)
- Machine learning-based (isolation forest)
- Threshold-based rules
- Pattern deviation detection

**Anomaly Alerts**
- Real-time detection
- Email notifications
- In-app alerts
- Slack/Teams webhooks
- Custom alert rules

**Alert Configuration**
- Sensitivity levels (low, medium, high)
- Alert frequency (real-time, hourly, daily)
- Metric thresholds
- Alert recipients
- Escalation rules

#### 1.4 Comparative Analytics

**Cross-Dashboard Comparison**
- Compare metrics across multiple dashboards
- Side-by-side visualization
- Percentage change calculations
- Winner/loser identification

**Time Period Comparison**
- Year-over-year (YoY)
- Quarter-over-quarter (QoQ)
- Month-over-month (MoM)
- Custom date range comparison
- Growth rate calculations

**Workspace Analytics**
- Aggregate metrics across workspaces
- Cross-team benchmarking
- Department performance comparison
- Leaderboards

#### 1.5 Calculated Metrics

**Metric Builder**
- Visual formula editor
- Drag-and-drop metric combinations
- Mathematical operations (+, -, *, /, %)
- Aggregation functions (SUM, AVG, COUNT, MIN, MAX)
- Conditional logic (IF, CASE)

**Common Calculated Metrics**
- Growth rates (absolute, percentage)
- Ratios (conversion rate, efficiency)
- Moving averages
- Cumulative totals
- Variance from target

**Metric Library**
- Save custom metrics
- Share across workspace
- Metric templates
- Versioning

#### 1.6 What-If Scenario Modeling

**Scenario Builder**
- Define variables and assumptions
- Adjust input values
- Run simulations
- Compare scenarios

**Use Cases**
- Revenue projections with different growth rates
- Cost impact analysis
- Resource allocation optimization
- Risk assessment

### Technical Implementation

**Dependencies**
```json
{
  "simple-statistics": "^7.8.3",      // Statistical functions
  "regression": "^2.0.1",              // Regression analysis
  "ml-matrix": "^6.10.4",              // Matrix operations
  "date-fns": "^4.1.0",                // Date handling (already installed)
  "@tensorflow/tfjs": "^4.15.0"        // Optional: Advanced ML
}
```

**New Components**
- `AnalyticsDashboard.tsx` - Main analytics interface
- `StatisticalAnalysis.tsx` - Correlation, regression, distribution
- `ForecastingPanel.tsx` - Time series forecasting
- `AnomalyDetector.tsx` - Anomaly detection and alerts
- `ComparativeAnalytics.tsx` - Cross-dashboard/time comparison
- `MetricBuilder.tsx` - Calculated metrics editor
- `ScenarioModeling.tsx` - What-if analysis

**New Hooks**
- `useStatistics()` - Statistical calculations
- `useForecasting()` - Time series forecasting
- `useAnomalyDetection()` - Anomaly detection
- `useComparison()` - Comparative analytics
- `useCalculatedMetrics()` - Custom metric calculations

**API Endpoints**
- `POST /analytics/statistics` - Statistical analysis
- `POST /analytics/forecast` - Generate forecast
- `POST /analytics/anomalies` - Detect anomalies
- `POST /analytics/compare` - Comparative analysis
- `GET /analytics/metrics` - Calculated metrics

**Database Schema**
```sql
-- Calculated metrics
CREATE TABLE calculated_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  formula TEXT NOT NULL,
  input_metrics JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Anomaly alerts
CREATE TABLE anomaly_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  dashboard_id UUID REFERENCES dashboards(id),
  widget_id VARCHAR(255),
  metric_name VARCHAR(255),
  anomaly_type VARCHAR(50),
  severity VARCHAR(20),
  value NUMERIC,
  expected_range JSONB,
  detected_at TIMESTAMP DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP
);

-- Forecast configurations
CREATE TABLE forecast_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id VARCHAR(255) NOT NULL,
  model_type VARCHAR(50),
  horizon_days INTEGER,
  seasonality BOOLEAN,
  confidence_level NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Experience

**Analytics Menu**
- Add "Analytics" tab to dashboard view
- Accessible from main navigation
- Permission: `view_analytics`

**Statistical Insights Panel**
- Shows correlation matrix
- Trend analysis
- Distribution charts

**Anomaly Alerts Widget**
- Dashboard widget showing recent anomalies
- Real-time updates
- Severity indicators
- Acknowledge/dismiss actions

**Forecast Overlay**
- Enable forecast on any time-series widget
- Toggle forecast visibility
- Adjust forecast settings
- Export forecast data

### Performance Considerations

**Client-Side Computation**
- Use Web Workers for heavy calculations
- Progressive calculation with loading states
- Cache results for 5 minutes
- Limit dataset size (max 10,000 rows)

**Server-Side Computation**
- Complex ML models run on edge functions
- Batch processing for large datasets
- Result caching in Redis
- Rate limiting: 20 requests/minute

### Security Considerations

- Validate all formula inputs
- Sanitize metric names
- RLS enforcement on all analytics queries
- Rate limiting on API endpoints
- Audit logging for alert configurations

### Testing Strategy

**Unit Tests**
- Statistical function accuracy
- Formula parser validation
- Anomaly detection algorithms
- Forecast model accuracy

**Integration Tests**
- Analytics API endpoints
- Database operations
- Real-time alert delivery
- Web Worker communication

**E2E Tests**
- Create calculated metric
- Configure anomaly alert
- Generate forecast
- Compare dashboards

### Success Metrics

- 70% of users use analytics features monthly
- 90% accuracy for anomaly detection
- < 2 seconds for statistical analysis
- < 5 seconds for forecast generation
- 50% reduction in missed anomalies

### Rollout Plan

**Phase 7.1 (Week 1-2)**
- Statistical analysis tools
- Basic forecasting

**Phase 7.2 (Week 3-4)**
- Anomaly detection
- Alert system

**Phase 7.3 (Week 5-6)**
- Comparative analytics
- Calculated metrics

**Phase 7.4 (Week 7-8)**
- What-if scenario modeling
- Documentation and testing

---

## Feature 2: Scheduled Reports & Email Delivery

### Problem Statement

Users currently must:
- Manually export dashboards
- Manually send reports to stakeholders
- Remember to check dashboards regularly
- No automated distribution of insights

### Solution Overview

Implement a comprehensive reporting system that:
- Schedules recurring reports (daily, weekly, monthly)
- Automatically generates and emails reports
- Supports multiple output formats (PDF, Excel, PowerPoint)
- Allows custom report templates
- Tracks delivery and opens

### Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│        Report Scheduler (Frontend)                  │
│  ┌────────────────────────────────────────────┐    │
│  │  Report Configuration UI                    │    │
│  │  - Schedule settings                        │    │
│  │  - Recipient management                     │    │
│  │  - Template selection                       │    │
│  │  - Preview generator                        │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│     Report Generation Service (Edge Functions)      │
│  ┌────────────────────────────────────────────┐    │
│  │  Scheduler Service                          │    │
│  │  - Cron jobs                                │    │
│  │  - Job queue                                │    │
│  │  - Retry logic                              │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Report Generator                           │    │
│  │  - PDF generation (Puppeteer)              │    │
│  │  - Excel export (ExcelJS)                  │    │
│  │  - PowerPoint export (PptxGenJS)           │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Email Service                              │    │
│  │  - Template rendering                       │    │
│  │  - SMTP delivery                            │    │
│  │  - Tracking pixels                          │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              Storage & Delivery                     │
│  - S3/Storage for generated reports                 │
│  - Email delivery queue                             │
│  - Delivery tracking database                       │
└─────────────────────────────────────────────────────┘
```

### Feature Components

#### 2.1 Report Scheduler

**Schedule Configuration**
- Frequency: Daily, Weekly, Monthly, Quarterly
- Day of week selection (for weekly)
- Day of month selection (for monthly)
- Time of day (with timezone)
- Start date and end date (optional)

**Advanced Scheduling**
- Business days only
- Skip holidays
- Multiple schedules per report
- Ad-hoc one-time reports

#### 2.2 Report Configuration

**Content Selection**
- Select dashboards to include
- Select specific widgets (not entire dashboard)
- Include AI insights
- Include comments (optional)
- Include audit trail (optional)

**Formatting Options**
- Page layout (portrait, landscape)
- Page size (A4, Letter, Legal)
- Header/footer customization
- Logo and branding
- Color scheme

**Data Options**
- Data refresh before generation
- Snapshot vs. live data
- Date range selection
- Filter application

#### 2.3 Recipient Management

**Recipient Configuration**
- Email addresses (comma-separated)
- Recipient groups
- Dynamic recipient lists (based on roles)
- External recipients (non-platform users)

**Email Settings**
- Subject line template
- Email body template (rich text)
- Reply-to address
- CC and BCC
- Attachment naming

#### 2.4 Report Templates

**Pre-Built Templates**
- Executive Summary
- Detailed Analytics Report
- Department Performance Report
- Weekly Status Update
- Monthly Business Review
- Quarterly Board Report

**Template Customization**
- Cover page design
- Table of contents
- Section headers
- Chart layouts
- Data tables
- Appendices

**Custom Templates**
- Template builder interface
- Drag-and-drop sections
- Conditional sections
- Variable substitution
- Save and share templates

#### 2.5 Output Formats

**PDF Export**
- High-fidelity rendering
- Vector graphics
- Hyperlinks preserved
- Bookmarks for navigation
- Table of contents

**Excel Export**
- Multiple worksheets
- Formatted tables
- Charts embedded
- Pivot tables
- Formulas preserved

**PowerPoint Export**
- One slide per widget
- Title slide
- Summary slide
- Speaker notes
- Editable content

**HTML Email**
- Responsive design
- Inline styles
- Image optimization
- Tracking pixels

#### 2.6 Delivery Tracking

**Delivery Status**
- Scheduled, Generating, Sent, Failed
- Retry attempts
- Error messages
- Generation time
- File size

**Engagement Tracking**
- Email opens (pixel tracking)
- Link clicks
- Attachment downloads
- Time spent viewing
- Device/client used

**Reports & Analytics**
- Delivery success rate
- Average generation time
- Most popular reports
- Recipient engagement
- Failure reasons

### Technical Implementation

**Dependencies**
```json
{
  "node-cron": "^3.0.3",              // Cron job scheduling
  "puppeteer": "^21.6.1",             // PDF generation
  "exceljs": "^4.4.0",                // Excel export
  "pptxgenjs": "^3.12.0",             // PowerPoint export
  "nodemailer": "^6.9.8",             // Email sending
  "mjml": "^4.14.1",                  // Email templates
  "handlebars": "^4.7.8"              // Template rendering
}
```

**New Components**
- `ReportScheduler.tsx` - Schedule configuration
- `ReportConfiguration.tsx` - Report settings
- `RecipientManager.tsx` - Manage email recipients
- `TemplateSelector.tsx` - Choose report templates
- `ReportPreview.tsx` - Preview before scheduling
- `DeliveryTracking.tsx` - View delivery status

**New Hooks**
- `useReportScheduler()` - Manage scheduled reports
- `useReportGeneration()` - Generate reports on-demand
- `useEmailDelivery()` - Email operations
- `useDeliveryTracking()` - Track delivery status

**API Endpoints**
- `POST /reports/schedule` - Create scheduled report
- `GET /reports/schedules` - List scheduled reports
- `PUT /reports/schedules/:id` - Update schedule
- `DELETE /reports/schedules/:id` - Delete schedule
- `POST /reports/generate` - Generate report now
- `GET /reports/history` - Generation history
- `GET /reports/tracking/:id` - Delivery tracking

**Database Schema**
```sql
-- Scheduled reports
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  dashboard_ids UUID[] NOT NULL,
  schedule_config JSONB NOT NULL, -- frequency, time, timezone
  recipients JSONB NOT NULL,      -- email addresses, groups
  template_id UUID REFERENCES report_templates(id),
  format VARCHAR(20),             -- pdf, excel, pptx
  enabled BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP
);

-- Report templates
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Report generation history
CREATE TABLE report_generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES scheduled_reports(id),
  status VARCHAR(50),            -- scheduled, generating, sent, failed
  generated_at TIMESTAMP,
  file_url TEXT,
  file_size INTEGER,
  error_message TEXT,
  generation_time_ms INTEGER,
  recipients_count INTEGER,
  delivered_count INTEGER,
  failed_count INTEGER
);

-- Email delivery tracking
CREATE TABLE email_delivery_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  history_id UUID REFERENCES report_generation_history(id),
  recipient_email VARCHAR(255),
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced BOOLEAN DEFAULT FALSE,
  bounce_reason TEXT,
  user_agent TEXT,
  ip_address INET
);
```

### User Experience

**Report Menu**
- Add "Reports" tab to main navigation
- List all scheduled reports
- Quick actions (run now, edit, delete)
- Report history viewer

**Schedule Creation Flow**
1. Click "New Scheduled Report"
2. Select dashboards/widgets
3. Choose frequency and time
4. Add recipients
5. Select template and format
6. Preview report
7. Save and activate

**Notification System**
- Email sent confirmation
- Generation failure alerts
- Low engagement warnings
- Schedule conflict notifications

### Performance Considerations

**Generation Optimization**
- Parallel PDF generation for large reports
- Image compression before embedding
- Incremental generation for multi-dashboard reports
- Pre-render common templates

**Delivery Optimization**
- Batch email sending
- Queue management for high volume
- Retry logic with exponential backoff
- CDN for attachment delivery

**Resource Management**
- Limit concurrent generations: 5
- Max report size: 50MB
- Timeout: 5 minutes per report
- Cleanup old reports after 90 days

### Security Considerations

- Verify recipient permissions before sending
- Sanitize email addresses
- Rate limit report generation (10/hour per workspace)
- Audit log all report deliveries
- Encrypt reports at rest
- Signed URLs for attachments (expire after 7 days)

### Testing Strategy

**Unit Tests**
- Schedule parsing
- Template rendering
- Email formatting
- Delivery tracking

**Integration Tests**
- Report generation pipeline
- Email delivery
- Webhook notifications
- Storage operations

**E2E Tests**
- Create scheduled report
- Generate report manually
- Verify email delivery
- Track engagement

### Success Metrics

- 50% of users create at least one scheduled report
- 95% report generation success rate
- < 2 minutes average generation time
- 80% email open rate
- 30% attachment download rate

### Rollout Plan

**Phase 7.5 (Week 1-2)**
- Basic scheduling
- PDF generation
- Email delivery

**Phase 7.6 (Week 3-4)**
- Report templates
- Excel/PowerPoint export
- Recipient management

**Phase 7.7 (Week 5-6)**
- Delivery tracking
- Advanced scheduling
- Template customization

---

## Feature 3: Advanced Data Connectors & Integrations

### Problem Statement

Current data import methods are limited to:
- CSV upload (manual)
- JSON entry (manual)
- Webhooks (requires setup)

Missing:
- Direct database connections
- API integrations (Salesforce, HubSpot, Google Analytics)
- Cloud storage connections (S3, Google Drive, Dropbox)
- Real-time data streams (Kafka, WebSocket)
- Authentication with external services

### Solution Overview

Build a comprehensive data integration platform that:
- Connects to 20+ external data sources
- Supports scheduled data synchronization
- Provides data transformation pipelines
- Handles authentication and credentials securely
- Monitors connection health and data quality

### Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│       Data Connector Manager (Frontend)             │
│  ┌────────────────────────────────────────────┐    │
│  │  Connector Configuration UI                 │    │
│  │  - Source selection                         │    │
│  │  - Authentication                           │    │
│  │  - Data mapping                             │    │
│  │  - Sync scheduling                          │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│      Integration Service (Edge Functions)           │
│  ┌────────────────────────────────────────────┐    │
│  │  Connector Orchestrator                     │    │
│  │  - Connection pooling                       │    │
│  │  - Credential management                    │    │
│  │  - Sync scheduling                          │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Data Connectors                            │    │
│  │  - Database drivers                         │    │
│  │  - API clients                              │    │
│  │  - File storage adapters                    │    │
│  │  - Streaming protocols                      │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Data Transformation Pipeline               │    │
│  │  - Field mapping                            │    │
│  │  - Data cleaning                            │    │
│  │  - Aggregation                              │    │
│  │  - Validation                               │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│             Data Storage & Caching                  │
│  - Blink Database (transformed data)                │
│  - Redis cache (frequently accessed data)           │
│  - Job queue (sync jobs)                            │
└─────────────────────────────────────────────────────┘
```

### Feature Components

#### 3.1 Database Connectors

**Supported Databases**
- PostgreSQL
- MySQL
- Microsoft SQL Server
- MongoDB
- Amazon Redshift
- Google BigQuery
- Snowflake
- Oracle Database

**Connection Configuration**
- Host, port, database name
- Username/password or IAM auth
- SSL/TLS settings
- Connection pooling
- Query timeout

**Query Builder**
- Visual query builder
- SQL editor with syntax highlighting
- Query validation
- Parameter binding
- Query templates

#### 3.2 API Connectors

**Supported APIs**

**CRM & Sales**
- Salesforce
- HubSpot
- Pipedrive
- Zoho CRM

**Marketing**
- Google Analytics 4
- Google Ads
- Facebook Ads
- Mailchimp
- SendGrid

**Project Management**
- Jira
- Asana
- Monday.com
- Trello

**Finance**
- Stripe
- QuickBooks
- Xero
- PayPal

**HR**
- BambooHR
- Workday
- ADP
- Greenhouse

**Support**
- Zendesk
- Intercom
- Freshdesk
- Help Scout

**Connection Configuration**
- OAuth 2.0 authentication
- API key management
- Rate limit handling
- Pagination support
- Data filtering

#### 3.3 Cloud Storage Connectors

**Supported Storage**
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Dropbox
- Google Drive
- Box
- OneDrive

**File Processing**
- CSV, Excel, JSON parsing
- Automatic file detection
- Folder monitoring
- Archive management
- Error handling

#### 3.4 Real-Time Streaming

**Supported Protocols**
- WebSocket connections
- Server-Sent Events (SSE)
- Apache Kafka
- RabbitMQ
- AWS Kinesis
- Google Pub/Sub

**Stream Configuration**
- Topic/queue selection
- Consumer group management
- Message filtering
- Error handling
- Backpressure management

#### 3.5 Data Transformation

**Transformation Operations**
- Field mapping (rename, type conversion)
- Filtering (WHERE clauses)
- Aggregation (GROUP BY, SUM, AVG)
- Joins (combine multiple sources)
- Deduplication
- Null handling

**Visual Transformation Builder**
- Drag-and-drop operations
- Preview transformed data
- Save transformation templates
- Version control

**Code-Based Transformations**
- JavaScript/Python transformations
- Custom functions
- Conditional logic
- Regular expressions

#### 3.6 Sync Management

**Sync Scheduling**
- Manual (on-demand)
- Scheduled (hourly, daily, weekly)
- Real-time (continuous)
- Event-triggered (on new data)

**Sync Monitoring**
- Last sync time
- Sync duration
- Records processed
- Errors encountered
- Data quality metrics

**Error Handling**
- Automatic retries
- Error notifications
- Rollback on failure
- Partial sync recovery

### Technical Implementation

**Dependencies**
```json
{
  "pg": "^8.11.3",                    // PostgreSQL
  "mysql2": "^3.6.5",                 // MySQL
  "mongodb": "^6.3.0",                // MongoDB
  "mssql": "^10.0.2",                 // SQL Server
  "googleapis": "^131.0.0",           // Google APIs
  "aws-sdk": "^2.1520.0",             // AWS services
  "@azure/storage-blob": "^12.17.0",  // Azure storage
  "kafkajs": "^2.2.4",                // Kafka client
  "amqplib": "^0.10.3",               // RabbitMQ
  "axios": "^1.6.5"                   // HTTP requests
}
```

**New Components**
- `ConnectorManager.tsx` - Main connector interface
- `ConnectorWizard.tsx` - Setup new connector
- `DatabaseConnector.tsx` - Database configuration
- `APIConnector.tsx` - API integration setup
- `StorageConnector.tsx` - Cloud storage setup
- `StreamConnector.tsx` - Real-time streaming
- `TransformationBuilder.tsx` - Data transformation
- `SyncMonitor.tsx` - Sync status dashboard

**New Hooks**
- `useConnectors()` - Manage data connectors
- `useConnectorSync()` - Trigger and monitor syncs
- `useTransformation()` - Data transformation
- `useConnectorHealth()` - Monitor connector status

**API Endpoints**
- `POST /connectors` - Create connector
- `GET /connectors` - List connectors
- `GET /connectors/:id` - Get connector details
- `PUT /connectors/:id` - Update connector
- `DELETE /connectors/:id` - Delete connector
- `POST /connectors/:id/test` - Test connection
- `POST /connectors/:id/sync` - Trigger sync
- `GET /connectors/:id/history` - Sync history
- `GET /connectors/:id/preview` - Preview data

**Database Schema**
```sql
-- Data connectors
CREATE TABLE data_connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,      -- database, api, storage, stream
  source VARCHAR(100) NOT NULL,    -- postgres, salesforce, s3, etc.
  connection_config JSONB NOT NULL,
  credentials_encrypted TEXT,      -- Encrypted credentials
  transformation_config JSONB,
  sync_schedule JSONB,
  enabled BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP,
  next_sync_at TIMESTAMP,
  status VARCHAR(50),              -- active, error, disabled
  error_message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sync history
CREATE TABLE connector_sync_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connector_id UUID REFERENCES data_connectors(id),
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  status VARCHAR(50),              -- running, completed, failed
  records_processed INTEGER,
  records_inserted INTEGER,
  records_updated INTEGER,
  records_failed INTEGER,
  duration_ms INTEGER,
  error_message TEXT,
  error_details JSONB
);

-- Connector credentials (encrypted)
CREATE TABLE connector_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connector_id UUID REFERENCES data_connectors(id),
  credential_type VARCHAR(50),     -- password, api_key, oauth
  encrypted_value TEXT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Experience

**Connector Setup Flow**
1. Click "Add Data Source"
2. Select connector type (Database, API, Storage, Stream)
3. Choose specific source (e.g., Salesforce)
4. Authenticate (OAuth or credentials)
5. Test connection
6. Configure data mapping
7. Set sync schedule
8. Preview data
9. Save and activate

**Connector Dashboard**
- List all connectors with status
- Quick sync actions
- Health indicators
- Recent sync history
- Error notifications

**Data Preview**
- View sample data before syncing
- Check data types
- Verify field mappings
- Test transformations

### Performance Considerations

**Sync Optimization**
- Incremental syncs (only new/updated records)
- Parallel processing for multiple connectors
- Connection pooling for databases
- Batch operations for APIs
- Caching frequently accessed data

**Resource Management**
- Max 10 concurrent syncs per workspace
- Rate limiting per connector type
- Timeout: 30 minutes per sync
- Memory limit: 2GB per sync job

### Security Considerations

- Encrypt credentials at rest (AES-256)
- Separate credential storage
- Rotate credentials regularly
- Audit all connector operations
- Network isolation for database connections
- IP whitelisting support
- VPN/SSH tunnel support

### Testing Strategy

**Unit Tests**
- Connector authentication
- Data transformation logic
- Query generation
- Error handling

**Integration Tests**
- Test connections to mock sources
- Sync pipeline end-to-end
- Credential encryption/decryption
- Error recovery

**E2E Tests**
- Create database connector
- Authenticate with API
- Run sync and verify data
- Handle sync failures

### Success Metrics

- 80% of workspaces use at least one connector
- 95% sync success rate
- < 5 minutes average sync time (for 10k records)
- 50% reduction in manual data entry
- 90% data accuracy

### Rollout Plan

**Phase 7.8 (Week 1-2)**
- Database connectors (PostgreSQL, MySQL)
- Basic API connectors (Salesforce, Google Analytics)

**Phase 7.9 (Week 3-4)**
- Cloud storage connectors
- Data transformation pipeline
- Sync scheduling

**Phase 7.10 (Week 5-6)**
- Remaining API connectors
- Real-time streaming
- Advanced transformations

---

## Feature 4: Widget Marketplace & Template Sharing

### Problem Statement

Current limitations:
- Custom widgets are not shareable across workspaces
- No central repository for community-contributed widgets
- No way to monetize custom widgets
- Difficult to discover pre-built solutions
- No quality control for custom widgets

### Solution Overview

Build a comprehensive marketplace platform that:
- Hosts community-contributed widgets and templates
- Provides widget discovery and search
- Enables widget monetization (free and paid)
- Implements quality control and reviews
- Supports versioning and updates
- Includes a developer portal for widget creators

### Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│           Marketplace (Frontend)                    │
│  ┌────────────────────────────────────────────┐    │
│  │  Marketplace Browser                        │    │
│  │  - Widget gallery                           │    │
│  │  - Search and filters                       │    │
│  │  - Widget details                           │    │
│  │  - Reviews and ratings                      │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Widget Installation                        │    │
│  │  - Preview widget                           │    │
│  │  - Configuration                            │    │
│  │  - Dependency management                    │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Developer Portal                           │    │
│  │  - Widget submission                        │    │
│  │  - Documentation builder                    │    │
│  │  - Analytics dashboard                      │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│       Marketplace API (Edge Functions)              │
│  ┌────────────────────────────────────────────┐    │
│  │  Widget Repository                          │    │
│  │  - Widget storage (CDN)                     │    │
│  │  - Version management                       │    │
│  │  - Security scanning                        │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Review & Rating System                     │    │
│  │  - User reviews                             │    │
│  │  - Rating aggregation                       │    │
│  │  - Moderation                               │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Payment Processing (Optional)              │    │
│  │  - Stripe integration                       │    │
│  │  - Revenue sharing                          │    │
│  │  - Subscription management                  │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│               Storage & Analytics                   │
│  - Widget packages (CDN)                            │
│  - Marketplace database                             │
│  - Usage analytics                                  │
│  - Download tracking                                │
└─────────────────────────────────────────────────────┘
```

### Feature Components

#### 4.1 Widget Marketplace Browser

**Discovery Features**
- Featured widgets
- Popular widgets (by downloads/ratings)
- Recent additions
- Trending widgets
- Category browsing
- Tag-based filtering
- Search with autocomplete

**Categories**
- Charts & Visualizations
- KPI Cards & Metrics
- Interactive Controls
- Data Tables & Grids
- Maps & Geospatial
- Real-Time Monitors
- AI & ML Widgets
- Integration Widgets

**Widget Listing**
- Widget name and icon
- Short description
- Preview screenshot/GIF
- Author information
- Rating (1-5 stars)
- Download count
- Last updated date
- Price (free or paid)
- Compatible version

#### 4.2 Widget Details Page

**Overview Tab**
- Full description
- Screenshots/demo videos
- Live preview (sandbox)
- Feature list
- Requirements
- Installation instructions

**Reviews Tab**
- User reviews and ratings
- Sort by rating, date, helpfulness
- Verified purchaser badge
- Reply to reviews (for authors)
- Report inappropriate reviews

**Changelog Tab**
- Version history
- Release notes
- Bug fixes
- New features
- Breaking changes

**Documentation Tab**
- Configuration options
- Props and API reference
- Code examples
- Troubleshooting
- FAQ

**Support Tab**
- Author contact
- Issue tracker
- Community forum
- Support email

#### 4.3 Widget Installation

**Installation Flow**
1. Click "Install" on widget
2. Review permissions required
3. Configure widget settings
4. Choose installation location (dashboard/workspace)
5. Preview installed widget
6. Confirm installation

**Dependency Management**
- Auto-install dependencies
- Conflict detection
- Version compatibility check
- Rollback on error

**Update Management**
- Notification of updates
- Changelog preview
- One-click updates
- Automatic updates (optional)

#### 4.4 Developer Portal

**Widget Submission**
- Upload widget package (ZIP)
- Provide metadata (name, description, category)
- Upload screenshots/videos
- Write documentation
- Set pricing (free or paid)
- Submit for review

**Widget Packaging**
```
my-widget/
├── package.json          # Widget metadata
├── src/
│   ├── index.tsx         # Main widget component
│   ├── config.json       # Configuration schema
│   └── styles.css        # Widget styles
├── docs/
│   ├── README.md         # Documentation
│   └── CHANGELOG.md      # Version history
├── assets/
│   ├── icon.png          # Widget icon
│   └── preview.gif       # Preview animation
└── tests/
    └── widget.test.tsx   # Unit tests
```

**Developer Dashboard**
- Widget analytics (installs, views, revenue)
- User reviews management
- Version management
- Support tickets
- Earnings report (for paid widgets)

**Quality Guidelines**
- Code quality standards
- Performance benchmarks
- Security requirements
- Documentation completeness
- Test coverage (min 70%)

#### 4.5 Review & Quality Control

**Submission Review Process**
1. **Automated Checks**
   - Code scanning (ESLint, security)
   - Performance testing
   - Bundle size check
   - Dependency audit

2. **Manual Review**
   - Code quality review
   - Functionality testing
   - Documentation review
   - Compliance check

3. **Approval/Rejection**
   - Approved: Published to marketplace
   - Rejected: Feedback provided to developer

**Rating System**
- 1-5 star ratings
- Written reviews (min 50 characters)
- Verified purchaser badge
- Helpful votes on reviews
- Average rating calculation

**Moderation**
- Report inappropriate content
- Review moderation queue
- Ban abusive users
- Take down violating widgets

#### 4.6 Monetization (Optional)

**Pricing Models**
- Free (open source)
- One-time purchase
- Subscription (monthly/annual)
- Freemium (free with premium features)

**Payment Processing**
- Stripe integration
- Multiple currencies
- Secure checkout
- Invoice generation

**Revenue Sharing**
- Platform fee: 20%
- Developer revenue: 80%
- Monthly payouts
- Minimum payout threshold: $50

#### 4.7 Template Sharing

**Dashboard Templates**
- Share entire dashboard configurations
- Include widgets and layouts
- Export/import templates
- Public or private templates

**Template Marketplace**
- Browse dashboard templates
- Filter by department/use case
- Preview template
- One-click installation
- Customize after installation

### Technical Implementation

**Dependencies**
```json
{
  "stripe": "^14.10.0",               // Payment processing
  "jszip": "^3.10.1",                 // Widget packaging
  "semver": "^7.5.4",                 // Version management
  "marked": "^11.1.1",                // Markdown rendering
  "prismjs": "^1.29.0"                // Code syntax highlighting
}
```

**New Components**
- `MarketplaceBrowser.tsx` - Browse widgets
- `WidgetDetails.tsx` - Widget detail page
- `WidgetInstaller.tsx` - Installation flow
- `DeveloperPortal.tsx` - Developer dashboard
- `WidgetSubmission.tsx` - Submit new widget
- `ReviewSystem.tsx` - Reviews and ratings
- `TemplateMarketplace.tsx` - Dashboard templates

**New Hooks**
- `useMarketplace()` - Marketplace operations
- `useWidgetInstall()` - Install/uninstall widgets
- `useReviews()` - Review management
- `useDeveloperPortal()` - Developer operations

**API Endpoints**
- `GET /marketplace/widgets` - List widgets
- `GET /marketplace/widgets/:id` - Widget details
- `POST /marketplace/widgets` - Submit widget
- `PUT /marketplace/widgets/:id` - Update widget
- `DELETE /marketplace/widgets/:id` - Remove widget
- `POST /marketplace/widgets/:id/install` - Install widget
- `POST /marketplace/widgets/:id/reviews` - Add review
- `GET /marketplace/widgets/:id/reviews` - Get reviews
- `GET /marketplace/templates` - List templates
- `POST /marketplace/templates` - Submit template

**Database Schema**
```sql
-- Marketplace widgets
CREATE TABLE marketplace_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  tags TEXT[],
  author_id UUID REFERENCES users(id),
  package_url TEXT NOT NULL,
  icon_url TEXT,
  preview_urls TEXT[],
  version VARCHAR(20),
  price_cents INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  downloads INTEGER DEFAULT 0,
  rating_average NUMERIC(3,2),
  rating_count INTEGER DEFAULT 0,
  status VARCHAR(50),            -- pending, approved, rejected
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Widget reviews
CREATE TABLE widget_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id UUID REFERENCES marketplace_widgets(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Widget installations
CREATE TABLE widget_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id UUID REFERENCES marketplace_widgets(id),
  workspace_id UUID REFERENCES workspaces(id),
  installed_by UUID REFERENCES users(id),
  version VARCHAR(20),
  enabled BOOLEAN DEFAULT TRUE,
  installed_at TIMESTAMP DEFAULT NOW()
);

-- Widget analytics
CREATE TABLE widget_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id UUID REFERENCES marketplace_widgets(id),
  event_type VARCHAR(50),        -- view, install, uninstall, update
  workspace_id UUID,
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Marketplace templates
CREATE TABLE marketplace_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(100),
  template_config JSONB NOT NULL,
  author_id UUID REFERENCES users(id),
  preview_url TEXT,
  downloads INTEGER DEFAULT 0,
  rating_average NUMERIC(3,2),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Experience

**Marketplace Menu**
- Add "Marketplace" to main navigation
- Badge for new/updated widgets
- Quick search bar

**Installation Experience**
- One-click install
- Progress indicator
- Success notification with link to use widget
- Onboarding tips for new widgets

**Developer Experience**
- Simple submission process
- Clear feedback on rejections
- Analytics dashboard
- Earnings tracking (for paid widgets)

### Performance Considerations

**CDN Distribution**
- Widget packages hosted on CDN
- Lazy loading of marketplace content
- Image optimization for previews
- Cached search results

**Resource Management**
- Max 50 installed widgets per workspace
- Bundle size limit: 5MB per widget
- Automatic cleanup of unused widgets

### Security Considerations

**Widget Review**
- Automated security scanning (CodeQL)
- Dependency vulnerability check
- Code obfuscation detection
- Malicious pattern detection

**Sandboxing**
- Widgets run in isolated context
- Restricted access to sensitive APIs
- CSP enforcement
- XSS prevention

**Privacy**
- No tracking without consent
- Data collection disclosure
- GDPR compliance
- User data anonymization

### Testing Strategy

**Unit Tests**
- Widget installation logic
- Version compatibility
- Review system
- Payment processing

**Integration Tests**
- Widget submission flow
- Installation pipeline
- Rating aggregation
- CDN integration

**E2E Tests**
- Browse marketplace
- Install widget
- Submit widget
- Write review

### Success Metrics

- 100+ widgets in marketplace within 6 months
- 60% of workspaces install at least one widget
- 500+ widget installations per month
- 4.5+ average widget rating
- 30% conversion for paid widgets

### Rollout Plan

**Phase 7.11 (Week 1-2)**
- Marketplace browser
- Widget installation
- Free widgets only

**Phase 7.12 (Week 3-4)**
- Developer portal
- Widget submission
- Review system

**Phase 7.13 (Week 5-6)**
- Template marketplace
- Monetization (paid widgets)
- Analytics dashboard

---

## Summary & Timeline

### Effort Estimation

| Feature | Complexity | Estimated Time | Team Size |
|---------|-----------|----------------|-----------|
| **Feature 1: Advanced Analytics** | High | 8 weeks | 2 developers |
| **Feature 2: Scheduled Reports** | Medium | 8 weeks | 2 developers |
| **Feature 3: Data Connectors** | Very High | 10 weeks | 3 developers |
| **Feature 4: Widget Marketplace** | High | 8 weeks | 2 developers |

### Recommended Prioritization

**Priority 1: Advanced Analytics & Reporting (Features 1 & 2)**
- High user demand
- Differentiates from competitors
- Builds on existing analytics foundation
- Timeline: Q2 2026

**Priority 2: Data Connectors (Feature 3)**
- Critical for enterprise adoption
- Reduces manual data entry
- Enables real-time dashboards
- Timeline: Q3 2026

**Priority 3: Widget Marketplace (Feature 4)**
- Community engagement
- Ecosystem growth
- Revenue opportunity
- Timeline: Q4 2026

### Success Criteria

- 80% user adoption of at least one new feature
- NPS score increase by 10 points
- 40% reduction in support tickets
- 50% increase in daily active users
- 25% increase in revenue (via paid features)

---

**Document Version:** 1.0  
**Created:** January 19, 2026  
**Status:** Draft for Review  
**Next Review:** Q2 2026 Planning Meeting
