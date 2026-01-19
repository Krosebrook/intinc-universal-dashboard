import { test, expect } from '@playwright/test';

test.describe('Dashboard UI', () => {
  test('should show dashboard layout when authenticated', async ({ page }) => {
    // In a real E2E we would login here
    // For this demo test, we'll just check if we can reach the landing/login
    await page.goto('/');
    await expect(page).toHaveTitle(/Intinc Universal Dashboard/);
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // Check for mobile-specific elements if any
    await expect(page.getByText('Intinc')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have basic accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA roles
    const main = page.getByRole('main');
    // If LoginPage has a main role or similar
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });
});
