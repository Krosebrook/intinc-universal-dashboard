# Testing Guide

This document describes the testing strategy, guidelines, and best practices for the Intinc Universal Dashboard.

## 📋 Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)

## 🎯 Testing Philosophy

We follow the testing pyramid approach:

```
       /\
      /E2E\        Few, slow, expensive
     /------\
    /  Integ \     Some, moderate speed
   /----------\
  /   Unit     \   Many, fast, cheap
 /--------------\
```

- **Unit Tests**: 70% - Test individual functions and components
- **Integration Tests**: 20% - Test component interactions
- **E2E Tests**: 10% - Test complete user flows

## 🛠️ Testing Stack

- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **Mocking**: Vitest mocks + Mock Service Worker (future)
- **Coverage**: Vitest coverage with v8

## 🚀 Running Tests

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/lib/security/__tests__/sanitize.test.ts
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run E2E tests for specific browser
npm run test:e2e -- --project=chromium
```

## 🧪 Unit Testing

### What to Unit Test

- Utility functions (`sanitize`, `validation`, etc.)
- Custom hooks (`useDashboard`, `useRBAC`)
- Pure components
- Business logic
- Data transformations

### Example Unit Test

```typescript
// src/lib/security/__tests__/sanitize.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeText } from '../sanitize';

describe('sanitizeHtml', () => {
  it('should remove dangerous script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  it('should allow safe HTML tags', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    const result = sanitizeHtml(input);
    
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });
});
```

### Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDashboard } from '../use-dashboard';

describe('useDashboard', () => {
  it('should save dashboard', async () => {
    const { result } = renderHook(() => useDashboard());
    
    await act(async () => {
      await result.current.saveDashboard('My Dashboard');
    });
    
    expect(result.current.savedDashboards).toHaveLength(1);
  });
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🔗 Integration Testing

### What to Integration Test

- Component interactions
- Data flow between components
- Context providers
- API interactions (mocked)

### Example Integration Test

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '../DashboardPage';
import { mockBlink } from '@/test/mocks/blink';

describe('DashboardPage', () => {
  it('should create and display new dashboard', async () => {
    render(<DashboardPage />);
    
    // Open create dialog
    await userEvent.click(screen.getByText('Create Dashboard'));
    
    // Fill form
    await userEvent.type(
      screen.getByLabelText('Dashboard Name'),
      'Sales Q1'
    );
    
    // Submit
    await userEvent.click(screen.getByText('Create'));
    
    // Verify dashboard appears
    await waitFor(() => {
      expect(screen.getByText('Sales Q1')).toBeInTheDocument();
    });
  });
});
```

## 🎭 E2E Testing

### What to E2E Test

- Critical user journeys
- Authentication flows
- Data persistence
- Cross-browser compatibility

### Example E2E Test

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard Management', () => {
  test('should create, edit, and delete dashboard', async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Login (if needed)
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button:has-text("Login")');
    
    // Create dashboard
    await page.click('button:has-text("Create Dashboard")');
    await page.fill('[name="name"]', 'Test Dashboard');
    await page.click('button:has-text("Create")');
    
    // Verify creation
    await expect(page.locator('text=Test Dashboard')).toBeVisible();
    
    // Edit dashboard
    await page.click('[aria-label="Edit dashboard"]');
    await page.fill('[name="name"]', 'Updated Dashboard');
    await page.click('button:has-text("Save")');
    
    // Verify update
    await expect(page.locator('text=Updated Dashboard')).toBeVisible();
    
    // Delete dashboard
    await page.click('[aria-label="Delete dashboard"]');
    await page.click('button:has-text("Confirm")');
    
    // Verify deletion
    await expect(page.locator('text=Updated Dashboard')).not.toBeVisible();
  });
});
```

### E2E Best Practices

- Use data-testid for stable selectors
- Test in multiple browsers
- Use Page Object Model for complex flows
- Keep tests independent
- Clean up test data

## 📊 Test Coverage

### Coverage Goals

- Overall: 70%+
- Critical paths: 90%+
- Security utilities: 100%
- Utilities: 80%+

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Reports

Coverage is automatically reported in:
- CI pipeline
- Pull request comments
- CodeCov dashboard

## ✅ Best Practices

### General

1. **Write tests first** (TDD when possible)
2. **Keep tests simple** and focused
3. **Use descriptive names** that explain what is being tested
4. **Follow AAA pattern**: Arrange, Act, Assert
5. **Mock external dependencies** (API calls, browser APIs)
6. **Clean up after tests** (reset mocks, clear storage)

### Test Organization

```typescript
describe('Feature', () => {
  describe('Scenario', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

### Mocking

```typescript
// Mock Blink SDK
vi.mock('../lib/blink', () => ({
  blink: {
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    db: {
      dashboards: {
        find: vi.fn().mockResolvedValue([]),
      },
    },
  },
}));
```

### Async Testing

```typescript
// Use waitFor for async updates
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Use act for state updates
await act(async () => {
  await fetchData();
});
```

### Accessibility Testing

```typescript
// Test ARIA labels
expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();

// Test keyboard navigation
await userEvent.tab();
expect(screen.getByText('First Item')).toHaveFocus();
```

## 🐛 Debugging Tests

### Vitest

```bash
# Run single test file
npm test -- src/path/to/test.test.ts

# Run tests matching pattern
npm test -- --grep="should sanitize"

# Run tests in UI mode
npm run test:ui
```

### Playwright

```bash
# Run with headed browser
npm run test:e2e -- --headed

# Debug mode with inspector
npm run test:e2e:debug

# Generate trace
npm run test:e2e -- --trace on
```

## 📝 Writing Good Test Names

❌ Bad:
```typescript
it('test 1', () => {});
it('works', () => {});
it('sanitize', () => {});
```

✅ Good:
```typescript
it('should remove script tags from user input', () => {});
it('should return error when email is invalid', () => {});
it('should display loading spinner while fetching data', () => {});
```

## 🎯 Testing Checklist

Before submitting a PR:

- [ ] All tests pass
- [ ] New code has tests
- [ ] Coverage meets threshold
- [ ] No console errors/warnings
- [ ] E2E tests pass in CI
- [ ] Tests are deterministic (no flakiness)

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

Happy Testing! 🧪
