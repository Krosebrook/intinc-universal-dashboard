# Environment Variables Guide

This guide documents all environment variables used in the Intinc Universal Dashboard, including required and optional variables, how to obtain credentials, and configuration examples.

## Table of Contents

- [Quick Start](#quick-start)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Obtaining Credentials](#obtaining-credentials)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your credentials:**
   ```env
   VITE_BLINK_PROJECT_ID=your_project_id_here
   VITE_BLINK_PUBLISHABLE_KEY=your_publishable_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Required Variables

These variables are **required** for the application to function.

### VITE_BLINK_PROJECT_ID

**Purpose:** Identifies your Blink project for authentication and database access.

**Format:** String (UUID format)

**Example:**
```env
VITE_BLINK_PROJECT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Where to get it:**
1. Log into [Blink Dashboard](https://blink.new)
2. Select your project
3. Navigate to Settings → Project Details
4. Copy the Project ID

**Required for:**
- Authentication
- Database operations
- Real-time subscriptions
- AI features

### VITE_BLINK_PUBLISHABLE_KEY

**Purpose:** Public API key for client-side Blink SDK initialization.

**Format:** String (starts with `pk_`)

**Example:**
```env
VITE_BLINK_PUBLISHABLE_KEY=pk_live_example_key_replace_with_your_actual_key
```

**Where to get it:**
1. Log into [Blink Dashboard](https://blink.new)
2. Navigate to Settings → API Keys
3. Copy the Publishable Key (starts with `pk_`)
4. Use `pk_test_` for development, `pk_live_` for production

**Required for:**
- SDK initialization
- Client-side API calls
- Authentication flows

**Note:** This key is safe to expose in client-side code. Never use the secret key in the frontend!

## Optional Variables

These variables enhance functionality but aren't required for basic operation.

### VITE_SENTRY_DSN

**Purpose:** Enable error tracking and performance monitoring with Sentry.

**Format:** URL string

**Example:**
```env
VITE_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7890123
```

**Where to get it:**
1. Create a [Sentry account](https://sentry.io)
2. Create a new project (select React as platform)
3. Copy the DSN from project settings
4. Paste into `.env.local`

**Features enabled:**
- Automatic error capture
- Performance monitoring
- Session replay
- User feedback
- Source map upload (in production builds)

**Without this variable:**
- Errors only logged to console
- No performance tracking
- No error aggregation

### VITE_AI_API_KEY

**Purpose:** Custom AI provider API key (if not using Blink AI).

**Format:** String

**Example:**
```env
VITE_AI_API_KEY=sk-your-openai-or-gemini-key-here
```

**Where to get it:**
- OpenAI: https://platform.openai.com/api-keys
- Google AI Studio: https://makersuite.google.com/app/apikey
- Anthropic: https://console.anthropic.com/

**Note:** If using Blink's built-in AI, this variable is not needed.

### VITE_API_BASE_URL

**Purpose:** Override the default API base URL.

**Format:** URL string

**Default:** Uses Blink's default API endpoint

**Example:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

**When to use:**
- Self-hosted backend
- Custom API proxy
- Different environments (staging, production)

### VITE_ENABLE_ANALYTICS

**Purpose:** Enable/disable analytics tracking.

**Format:** Boolean string (`true` or `false`)

**Default:** `false`

**Example:**
```env
VITE_ENABLE_ANALYTICS=true
```

**Features controlled:**
- User behavior tracking
- Feature usage metrics
- Performance analytics

### VITE_LOG_LEVEL

**Purpose:** Control Winston logger verbosity.

**Format:** String (`error`, `warn`, `info`, `debug`)

**Default:** `info` (production), `debug` (development)

**Example:**
```env
VITE_LOG_LEVEL=debug
```

**Log levels:**
- `error`: Only critical errors
- `warn`: Errors and warnings
- `info`: Errors, warnings, and important events
- `debug`: All logs (verbose)

### VITE_MAX_UPLOAD_SIZE

**Purpose:** Maximum file upload size in bytes.

**Format:** Number

**Default:** `10485760` (10MB)

**Example:**
```env
VITE_MAX_UPLOAD_SIZE=52428800
```

**Affects:**
- CSV imports
- PDF exports
- Image uploads
- Widget data imports

### VITE_ENABLE_DEV_MODE

**Purpose:** Enable development mode features in production.

**Format:** Boolean string (`true` or `false`)

**Default:** `false`

**Example:**
```env
VITE_ENABLE_DEV_MODE=true
```

**Features enabled:**
- Dashboard dev tools
- Performance profiler UI
- Widget inspector
- Debug logging

**Warning:** Do not enable in production unless needed for debugging!

### VITE_RATE_LIMIT_AI

**Purpose:** AI API rate limit (requests per minute).

**Format:** Number

**Default:** `10`

**Example:**
```env
VITE_RATE_LIMIT_AI=20
```

### VITE_RATE_LIMIT_API

**Purpose:** General API rate limit (requests per minute).

**Format:** Number

**Default:** `100`

**Example:**
```env
VITE_RATE_LIMIT_API=200
```

### VITE_DISABLE_ANIMATIONS

**Purpose:** Disable all Framer Motion animations.

**Format:** Boolean string (`true` or `false`)

**Default:** `false`

**Example:**
```env
VITE_DISABLE_ANIMATIONS=true
```

**When to use:**
- Low-performance devices
- Accessibility requirements
- E2E testing

## Environment-Specific Configuration

### Development (.env.local)

```env
# Required
VITE_BLINK_PROJECT_ID=your_dev_project_id
VITE_BLINK_PUBLISHABLE_KEY=pk_test_your_dev_key

# Optional
VITE_SENTRY_DSN=https://your-dev-sentry-dsn
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEV_MODE=true
VITE_DISABLE_ANIMATIONS=false
```

### Staging (.env.staging)

```env
# Required
VITE_BLINK_PROJECT_ID=your_staging_project_id
VITE_BLINK_PUBLISHABLE_KEY=pk_test_your_staging_key

# Optional
VITE_SENTRY_DSN=https://your-staging-sentry-dsn
VITE_LOG_LEVEL=info
VITE_ENABLE_ANALYTICS=true
VITE_RATE_LIMIT_AI=15
VITE_RATE_LIMIT_API=150
```

### Production (.env.production)

```env
# Required
VITE_BLINK_PROJECT_ID=your_prod_project_id
VITE_BLINK_PUBLISHABLE_KEY=pk_live_your_prod_key

# Optional - Production should have minimal config
VITE_SENTRY_DSN=https://your-prod-sentry-dsn
VITE_LOG_LEVEL=warn
VITE_ENABLE_ANALYTICS=true
```

**Note:** Never commit production credentials to version control!

## Obtaining Credentials

### Blink Credentials

1. **Sign up for Blink:**
   - Visit https://blink.new
   - Create an account
   - Verify your email

2. **Create a project:**
   - Click "New Project"
   - Name your project (e.g., "Intinc Dashboard Dev")
   - Select a region closest to your users

3. **Get credentials:**
   - Navigate to Settings → API Keys
   - Copy the **Project ID** (UUID format)
   - Copy the **Publishable Key** (starts with `pk_`)

4. **Configure authentication:**
   - Go to Authentication settings
   - Enable desired providers (Email, Google, GitHub, etc.)
   - Configure OAuth redirect URLs:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://yourdomain.com/auth/callback`

5. **Set up database:**
   - Go to Database → Tables
   - Run migrations (if provided)
   - Configure Row-Level Security (RLS) policies

### Sentry Credentials

1. **Sign up for Sentry:**
   - Visit https://sentry.io
   - Create account (free tier available)

2. **Create project:**
   - Click "Create Project"
   - Select "React" as platform
   - Name your project

3. **Get DSN:**
   - Project Settings → Client Keys (DSN)
   - Copy the DSN URL
   - Add to `.env.local`

4. **Configure source maps (optional):**
   ```bash
   # Install Sentry CLI
   npm install -g @sentry/cli

   # Add auth token to .env.local
   SENTRY_AUTH_TOKEN=your_auth_token
   ```

### AI Provider Credentials (Optional)

**OpenAI:**
1. Visit https://platform.openai.com
2. Create account and add payment method
3. Navigate to API Keys
4. Create new key
5. Copy and save securely

**Google AI Studio:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy key

**Note:** If using Blink's built-in AI, you don't need separate AI credentials.

## Security Best Practices

### 1. Never Commit Secrets

```bash
# Ensure .env.local is in .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### 2. Use Different Keys per Environment

```env
# Development
VITE_BLINK_PUBLISHABLE_KEY=pk_test_dev_key

# Production
VITE_BLINK_PUBLISHABLE_KEY=pk_live_prod_key
```

### 3. Rotate Keys Regularly

- Rotate API keys every 90 days
- Immediately rotate if compromised
- Update all environments

### 4. Limit Key Permissions

- Use read-only keys where possible
- Restrict API key access by IP (if supported)
- Use separate keys for different services

### 5. Environment Variable Validation

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_BLINK_PROJECT_ID: z.string().uuid(),
  VITE_BLINK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
});

export const env = envSchema.parse(import.meta.env);
```

### 6. CI/CD Secrets Management

**GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
env:
  VITE_BLINK_PROJECT_ID: ${{ secrets.BLINK_PROJECT_ID }}
  VITE_BLINK_PUBLISHABLE_KEY: ${{ secrets.BLINK_PUBLISHABLE_KEY }}
  VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
```

**Docker:**
```bash
# Pass secrets as build args
docker build \
  --build-arg VITE_BLINK_PROJECT_ID=$BLINK_PROJECT_ID \
  --build-arg VITE_BLINK_PUBLISHABLE_KEY=$BLINK_PUBLISHABLE_KEY \
  -t intinc-dashboard .
```

### 7. Use Secrets Manager (Production)

For production deployments, consider using:
- **AWS Secrets Manager**
- **Google Cloud Secret Manager**
- **HashiCorp Vault**
- **Azure Key Vault**

## Troubleshooting

### Variable Not Being Read

**Issue:** Environment variable not working

**Solutions:**

1. **Check variable name:**
   - Vite requires `VITE_` prefix for client-side variables
   - ❌ `BLINK_PROJECT_ID`
   - ✅ `VITE_BLINK_PROJECT_ID`

2. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Verify file name:**
   - `.env.local` (not `.env.local.txt`)
   - No spaces in file name

4. **Check file location:**
   - Must be in project root
   - Same directory as `package.json`

### Variables Not Working in Production

**Issue:** Variables work locally but not in production build

**Solutions:**

1. **Pass variables at build time:**
   ```bash
   VITE_BLINK_PROJECT_ID=abc123 npm run build
   ```

2. **Use Docker build args:**
   ```dockerfile
   ARG VITE_BLINK_PROJECT_ID
   ENV VITE_BLINK_PROJECT_ID=$VITE_BLINK_PROJECT_ID
   ```

3. **Check CI/CD configuration:**
   Ensure secrets are configured in CI/CD platform

### Invalid Credentials Error

**Issue:** "Invalid credentials" or 401 errors

**Solutions:**

1. **Verify credentials:**
   - Log into Blink dashboard
   - Confirm keys are correct
   - Check for extra spaces or line breaks

2. **Check key prefix:**
   - Test keys start with `pk_test_`
   - Live keys start with `pk_live_`

3. **Verify project is active:**
   - Check project status in Blink dashboard
   - Ensure billing is active (if required)

### Sentry Not Receiving Errors

**Issue:** Errors not appearing in Sentry dashboard

**Solutions:**

1. **Verify DSN:**
   ```javascript
   console.log('Sentry DSN:', import.meta.env.VITE_SENTRY_DSN);
   ```

2. **Test Sentry manually:**
   ```typescript
   import * as Sentry from '@sentry/react';
   Sentry.captureMessage('Test error');
   ```

3. **Check Sentry project settings:**
   - Verify project is active
   - Check rate limits
   - Review data filters

## Example Configuration Files

### Complete .env.example

```env
# ============================================
# REQUIRED VARIABLES
# ============================================

# Blink Project Configuration
# Get from: https://blink.new → Settings → API Keys
VITE_BLINK_PROJECT_ID=your_project_id_here
VITE_BLINK_PUBLISHABLE_KEY=your_publishable_key_here

# ============================================
# OPTIONAL VARIABLES
# ============================================

# Error Tracking (Sentry)
# Get from: https://sentry.io → Project Settings → Client Keys
# VITE_SENTRY_DSN=https://abc@123.ingest.sentry.io/456

# AI Configuration (if not using Blink AI)
# VITE_AI_API_KEY=your_ai_api_key_here

# API Configuration
# VITE_API_BASE_URL=https://api.yourdomain.com

# Analytics
# VITE_ENABLE_ANALYTICS=false

# Logging
# VITE_LOG_LEVEL=info

# Upload Limits (bytes)
# VITE_MAX_UPLOAD_SIZE=10485760

# Development Mode
# VITE_ENABLE_DEV_MODE=false

# Rate Limiting
# VITE_RATE_LIMIT_AI=10
# VITE_RATE_LIMIT_API=100

# Animations
# VITE_DISABLE_ANIMATIONS=false
```

### Docker Compose Example

```yaml
version: '3.8'
services:
  dashboard:
    build:
      context: .
      args:
        - VITE_BLINK_PROJECT_ID=${VITE_BLINK_PROJECT_ID}
        - VITE_BLINK_PUBLISHABLE_KEY=${VITE_BLINK_PUBLISHABLE_KEY}
        - VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
```

## Related Documentation

- [README.md](../README.md) - Quick start guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [security.md](./security.md) - Security best practices
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development setup
