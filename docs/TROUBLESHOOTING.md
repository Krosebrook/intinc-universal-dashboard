# Troubleshooting Guide

This guide helps you diagnose and resolve common issues in the Intinc Universal Dashboard.

## Table of Contents

- [Development Environment](#development-environment)
- [Authentication Issues](#authentication-issues)
- [Dashboard Loading Problems](#dashboard-loading-problems)
- [Widget Issues](#widget-issues)
- [Performance Problems](#performance-problems)
- [Build and Deployment](#build-and-deployment)
- [Database Issues](#database-issues)
- [Network and API Errors](#network-and-api-errors)
- [Testing Issues](#testing-issues)

## Development Environment

### Dependencies Won't Install

**Symptom:** `npm install` fails with errors

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version
   ```
   Ensure you're using Node.js 20+ as specified in package.json

3. **Use correct registry:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   npm install
   ```

4. **Check for permission issues:**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

### Development Server Won't Start

**Symptom:** `npm run dev` fails or server crashes

**Solutions:**

1. **Port already in use:**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

2. **Missing environment variables:**
   ```bash
   # Copy example env file
   cp .env.example .env.local
   # Add your Blink credentials
   ```

3. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

4. **Check for TypeScript errors:**
   ```bash
   npm run lint:types
   ```

### Hot Reload Not Working

**Symptom:** Changes aren't reflected in the browser

**Solutions:**

1. **Hard refresh the browser:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

2. **Check Vite config:**
   Ensure `vite.config.ts` has proper HMR configuration

3. **Disable browser extensions:** Some extensions interfere with WebSocket connections

4. **Check file watchers limit (Linux):**
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

## Authentication Issues

### Can't Log In

**Symptom:** Login button doesn't work or redirects to error

**Solutions:**

1. **Check environment variables:**
   ```bash
   # Verify .env.local contains:
   VITE_BLINK_PROJECT_ID=your_project_id
   VITE_BLINK_PUBLISHABLE_KEY=your_key
   ```

2. **Verify Blink project is active:**
   - Log into Blink dashboard
   - Check project status
   - Verify API keys are correct

3. **Clear browser cookies and storage:**
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   ```

4. **Check network requests:**
   - Open browser DevTools → Network tab
   - Look for failed authentication requests
   - Check response status codes

### Session Expires Immediately

**Symptom:** User gets logged out after page refresh

**Solutions:**

1. **Check Blink session settings:**
   - Verify session duration in Blink project settings
   - Ensure cookies are enabled in browser

2. **Check for token refresh logic:**
   ```typescript
   // Ensure token refresh is implemented
   useEffect(() => {
     const refreshInterval = setInterval(() => {
       blink.auth.refreshSession();
     }, 15 * 60 * 1000); // 15 minutes

     return () => clearInterval(refreshInterval);
   }, []);
   ```

3. **Verify HTTPS in production:**
   Secure cookies require HTTPS

### OAuth Provider Errors

**Symptom:** Google/Microsoft/GitHub login fails

**Solutions:**

1. **Check OAuth configuration in Blink:**
   - Verify redirect URIs match your app URL
   - Ensure OAuth providers are enabled

2. **Check browser popup blockers:**
   - Allow popups for your domain
   - Try using redirect method instead

3. **Verify OAuth credentials:**
   - Check client ID and secret are correct
   - Ensure OAuth app is active

## Dashboard Loading Problems

### Dashboard Shows Blank Screen

**Symptom:** Dashboard page loads but shows nothing

**Solutions:**

1. **Check browser console for errors:**
   ```
   F12 → Console tab
   ```

2. **Verify user has access:**
   ```typescript
   // Check RBAC permissions
   const { hasPermission } = useRBAC();
   console.log('Can view:', hasPermission('view_dashboard'));
   ```

3. **Check network requests:**
   - Verify dashboard data is being fetched
   - Look for 403/404 errors

4. **Clear local storage:**
   ```javascript
   localStorage.removeItem('dashboard-cache');
   location.reload();
   ```

### Widgets Won't Load

**Symptom:** Dashboard loads but widgets are missing or show errors

**Solutions:**

1. **Check widget error boundaries:**
   Widgets should show error messages if they fail

2. **Verify widget data:**
   ```typescript
   // Check widget configuration
   console.log('Widgets:', dashboard.widgets);
   ```

3. **Check for code splitting issues:**
   ```bash
   # Clear build cache
   rm -rf dist
   npm run build
   ```

4. **Verify widget types are supported:**
   ```typescript
   const supportedTypes = ['bar', 'line', 'pie', 'area', 'stacked-bar'];
   const invalidWidgets = widgets.filter(w => !supportedTypes.includes(w.type));
   ```

### Data Not Updating

**Symptom:** Dashboard shows stale data

**Solutions:**

1. **Check real-time subscription:**
   ```typescript
   // Verify subscription is active
   useEffect(() => {
     const subscription = blink.realtime
       .subscribe('dashboards', dashboard.id)
       .on('update', handleUpdate);

     return () => subscription.unsubscribe();
   }, [dashboard.id]);
   ```

2. **Force refresh:**
   ```typescript
   const handleRefresh = async () => {
     await fetchDashboardData(dashboard.id, { cache: 'no-cache' });
   };
   ```

3. **Check rate limiting:**
   - Look for 429 errors in network tab
   - Wait and try again

## Widget Issues

### Chart Not Rendering

**Symptom:** Widget shows loading spinner indefinitely or blank space

**Solutions:**

1. **Verify Recharts is installed:**
   ```bash
   npm list recharts
   ```

2. **Check data format:**
   ```typescript
   // Data must match expected format
   const validData = [
     { name: 'Category', value: 100 },
     { name: 'Category 2', value: 200 },
   ];
   ```

3. **Check for responsive container:**
   ```tsx
   <ResponsiveContainer width="100%" height={300}>
     <BarChart data={data}>
       {/* Chart elements */}
     </BarChart>
   </ResponsiveContainer>
   ```

4. **Verify widget dimensions:**
   ```css
   /* Ensure container has height */
   .widget-container {
     min-height: 300px;
   }
   ```

### Custom Widget Won't Load

**Symptom:** Custom widget shows error or doesn't appear

**Solutions:**

1. **Check widget SDK integration:**
   ```typescript
   import { useWidgetSDK } from '@/hooks/use-widget-sdk';

   function CustomWidget() {
     const sdk = useWidgetSDK();
     // Use SDK methods
   }
   ```

2. **Verify widget is registered:**
   ```typescript
   // Check widget registry
   import { widgetRegistry } from '@/widgets/registry';
   console.log('Available widgets:', widgetRegistry.getAll());
   ```

3. **Check for security sandbox errors:**
   Look for CSP violations in browser console

4. **Validate widget configuration:**
   ```typescript
   import { WidgetSchema } from '@/lib/validation/widget.schema';

   try {
     WidgetSchema.parse(widgetConfig);
   } catch (error) {
     console.error('Invalid widget config:', error);
   }
   ```

### Widget Performance Issues

**Symptom:** Widget is slow or causes browser lag

**Solutions:**

1. **Check data size:**
   ```typescript
   // Limit data points
   const MAX_DATA_POINTS = 1000;
   const chartData = data.slice(0, MAX_DATA_POINTS);
   ```

2. **Use memoization:**
   ```typescript
   const processedData = useMemo(() => {
     return expensiveDataProcessing(rawData);
   }, [rawData]);
   ```

3. **Enable virtualization for large lists:**
   ```typescript
   import { VirtualizedList } from '@/components/ui/virtualized-list';
   ```

4. **Check performance profiler:**
   ```typescript
   import { widgetProfiler } from '@/lib/performance/widget-profiler';

   useEffect(() => {
     widgetProfiler.startProfiling(widget.id, 'render');
     return () => widgetProfiler.endProfiling(widget.id, 'render');
   }, [widget.id]);
   ```

## Performance Problems

### Slow Page Load

**Symptom:** Dashboard takes a long time to load

**Solutions:**

1. **Check bundle size:**
   ```bash
   npm run build
   # Check dist/ folder size
   ```

2. **Verify code splitting:**
   ```typescript
   // Use lazy loading
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

3. **Optimize images:**
   - Use WebP format
   - Compress images
   - Use appropriate sizes

4. **Check network waterfall:**
   - Open DevTools → Network tab
   - Look for slow requests
   - Identify blocking resources

### High Memory Usage

**Symptom:** Browser tab uses excessive memory

**Solutions:**

1. **Check for memory leaks:**
   ```typescript
   useEffect(() => {
     const subscription = subscribe();

     // Always cleanup!
     return () => {
       subscription.unsubscribe();
     };
   }, []);
   ```

2. **Limit widget count:**
   ```typescript
   const MAX_WIDGETS_PER_DASHBOARD = 20;
   ```

3. **Use pagination:**
   ```typescript
   const [page, setPage] = useState(1);
   const widgetsPerPage = 10;
   const visibleWidgets = widgets.slice(
     (page - 1) * widgetsPerPage,
     page * widgetsPerPage
   );
   ```

4. **Profile memory usage:**
   - Chrome DevTools → Memory tab
   - Take heap snapshots
   - Look for detached DOM nodes

### Slow Animations

**Symptom:** Framer Motion animations are janky

**Solutions:**

1. **Use GPU-accelerated properties:**
   ```typescript
   // ✅ Good: transform, opacity
   animate={{ transform: 'translateX(100px)', opacity: 0 }}

   // ❌ Bad: left, width
   animate={{ left: '100px', width: '200px' }}
   ```

2. **Reduce animation complexity:**
   ```typescript
   // Simplify animations
   const variants = {
     hidden: { opacity: 0 },
     visible: { opacity: 1 },
   };
   ```

3. **Disable animations on low-end devices:**
   ```typescript
   const prefersReducedMotion = window.matchMedia(
     '(prefers-reduced-motion: reduce)'
   ).matches;

   <motion.div animate={prefersReducedMotion ? {} : animations} />
   ```

## Build and Deployment

### Build Fails

**Symptom:** `npm run build` throws errors

**Solutions:**

1. **Check TypeScript errors:**
   ```bash
   npm run lint:types
   ```

2. **Clear cache and rebuild:**
   ```bash
   rm -rf dist node_modules/.vite
   npm run build
   ```

3. **Check for import errors:**
   ```typescript
   // Ensure all imports have correct paths
   // Use @ alias for src/
   import { Component } from '@/components/Component';
   ```

4. **Verify environment variables:**
   ```bash
   # Required for build:
   VITE_BLINK_PROJECT_ID
   VITE_BLINK_PUBLISHABLE_KEY
   ```

### Docker Build Issues

**Symptom:** Docker build fails or container won't start

**Solutions:**

1. **Check Dockerfile:**
   ```bash
   # Verify build args
   docker build \
     --build-arg VITE_BLINK_PROJECT_ID=your_id \
     --build-arg VITE_BLINK_PUBLISHABLE_KEY=your_key \
     -t intinc-dashboard .
   ```

2. **Check nginx configuration:**
   ```bash
   # Validate nginx.conf
   docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro nginx nginx -t
   ```

3. **Check port mapping:**
   ```bash
   docker run -p 80:80 intinc-dashboard
   ```

4. **View container logs:**
   ```bash
   docker logs <container_id>
   ```

### Production Errors

**Symptom:** App works locally but fails in production

**Solutions:**

1. **Check environment variables:**
   Ensure all required variables are set in production

2. **Enable source maps:**
   ```typescript
   // vite.config.ts
   build: {
     sourcemap: true
   }
   ```

3. **Check Sentry for errors:**
   Log into Sentry dashboard to see production errors

4. **Verify CORS settings:**
   ```typescript
   // Check API CORS configuration
   headers: {
     'Access-Control-Allow-Origin': 'https://yourdomain.com'
   }
   ```

## Database Issues

### RLS (Row-Level Security) Errors

**Symptom:** 403 errors when accessing data

**Solutions:**

1. **Verify RLS policies:**
   ```sql
   -- Check policies on Blink dashboard
   SELECT * FROM dashboards WHERE user_id = current_user_id();
   ```

2. **Check user authentication:**
   ```typescript
   const { user } = blink.auth.getSession();
   console.log('Current user:', user);
   ```

3. **Verify ownership:**
   ```typescript
   // Ensure user owns the resource
   const dashboard = await blink.database
     .select()
     .from('dashboards')
     .where('id', '=', dashboardId)
     .where('user_id', '=', user.id)
     .first();
   ```

### Query Timeout

**Symptom:** Database queries take too long or timeout

**Solutions:**

1. **Add indexes:**
   ```sql
   -- Add index on frequently queried columns
   CREATE INDEX idx_dashboards_user_id ON dashboards(user_id);
   CREATE INDEX idx_widgets_dashboard_id ON widgets(dashboard_id);
   ```

2. **Limit query results:**
   ```typescript
   const dashboards = await blink.database
     .select()
     .from('dashboards')
     .limit(50) // Don't fetch all at once
     .execute();
   ```

3. **Use pagination:**
   ```typescript
   const page = 1;
   const perPage = 20;
   const offset = (page - 1) * perPage;

   const results = await blink.database
     .select()
     .from('dashboards')
     .limit(perPage)
     .offset(offset)
     .execute();
   ```

## Network and API Errors

### CORS Errors

**Symptom:** "CORS policy" errors in browser console

**Solutions:**

1. **Check API CORS configuration:**
   Ensure your API allows requests from your domain

2. **Verify request headers:**
   ```typescript
   fetch(url, {
     headers: {
       'Content-Type': 'application/json',
     },
     credentials: 'include', // If using cookies
   });
   ```

3. **Use proxy in development:**
   ```typescript
   // vite.config.ts
   server: {
     proxy: {
       '/api': {
         target: 'https://api.example.com',
         changeOrigin: true,
       },
     },
   }
   ```

### Rate Limiting

**Symptom:** 429 "Too Many Requests" errors

**Solutions:**

1. **Check rate limit headers:**
   ```typescript
   const response = await fetch(url);
   console.log('Rate limit:', response.headers.get('X-RateLimit-Remaining'));
   ```

2. **Implement retry with backoff:**
   ```typescript
   async function fetchWithRetry(url: string, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         const response = await fetch(url);
         if (response.status === 429) {
           const retryAfter = response.headers.get('Retry-After');
           await wait(parseInt(retryAfter) * 1000);
           continue;
         }
         return response;
       } catch (error) {
         if (i === retries - 1) throw error;
       }
     }
   }
   ```

3. **Reduce request frequency:**
   ```typescript
   // Debounce API calls
   const debouncedSave = useMemo(
     () => debounce(saveDashboard, 1000),
     []
   );
   ```

### Connection Errors

**Symptom:** "Failed to fetch" or "Network error"

**Solutions:**

1. **Check internet connection:**
   ```typescript
   if (!navigator.onLine) {
     toast.error('No internet connection');
     return;
   }
   ```

2. **Verify API endpoint:**
   ```typescript
   // Check if endpoint is accessible
   const healthCheck = await fetch('/api/health');
   ```

3. **Implement offline mode:**
   ```typescript
   if (!navigator.onLine) {
     // Use cached data
     const cachedData = localStorage.getItem('dashboard-cache');
     return JSON.parse(cachedData);
   }
   ```

## Testing Issues

### Tests Fail Locally

**Symptom:** `npm test` shows failures

**Solutions:**

1. **Update snapshots:**
   ```bash
   npm test -- -u
   ```

2. **Check for async issues:**
   ```typescript
   // Use waitFor for async operations
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

3. **Mock external dependencies:**
   ```typescript
   vi.mock('@blinkdotnew/sdk', () => ({
     createClient: vi.fn(() => mockBlink),
   }));
   ```

4. **Clear test cache:**
   ```bash
   npm test -- --clearCache
   ```

### E2E Tests Fail

**Symptom:** Playwright tests timeout or fail

**Solutions:**

1. **Increase timeout:**
   ```typescript
   // playwright.config.ts
   timeout: 60000, // 60 seconds
   ```

2. **Wait for elements:**
   ```typescript
   await page.waitForSelector('[data-testid="dashboard"]');
   ```

3. **Check for race conditions:**
   ```typescript
   // Wait for network idle
   await page.waitForLoadState('networkidle');
   ```

4. **Run in headed mode for debugging:**
   ```bash
   npm run test:e2e:debug
   ```

## Getting More Help

If you're still experiencing issues:

1. **Check browser console:** F12 → Console tab for error messages
2. **Review logs:** Check Winston logs and Sentry for error details
3. **Search existing issues:** [GitHub Issues](https://github.com/Krosebrook/intinc-universal-dashboard/issues)
4. **Open a new issue:** Provide error messages, steps to reproduce, and environment details
5. **Contact support:** support@intinc.com

## Related Documentation

- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Error handling patterns
- [LOGGING.md](./LOGGING.md) - Logging and monitoring
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [TESTING.md](./TESTING.md) - Testing guide
- [README.md](../README.md) - Quick start guide
