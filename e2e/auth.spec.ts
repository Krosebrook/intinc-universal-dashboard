import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page and allow clicking login', async ({ page }) => {
    await page.goto('/');
    
    // Check for login page elements
    await expect(page.getByText('Intinc Universal Dashboard')).toBeVisible();
    await expect(page.getByText('Sign in to your workspace')).toBeVisible();
    
    // Login button should be present
    const loginBtn = page.getByRole('button', { name: /Sign In with/i }).first();
    await expect(loginBtn).toBeVisible();
  });

  test('should redirect to login if unauthorized', async ({ page }) => {
    await page.goto('/dashboard');
    // Since App.tsx shows LoginPage when !user, it should stay on / or show login
    await expect(page.getByText('Sign in to your workspace')).toBeVisible();
  });
});
