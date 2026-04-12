import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can view homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/IslandFund/);
    await expect(page.locator('body')).toContainText('Marketplace');
  });

  test('user can navigate to login page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('user can navigate to register page', async ({ page }) => {
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h1')).toContainText('Register');
  });

  test('login form validation works', async ({ page }) => {
    await page.goto('/login');
    
    // Try submitting empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('register form validation works', async ({ page }) => {
    await page.goto('/register');
    
    // Fill in invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'short');
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });
});

test.describe('Marketplace Flow', () => {
  test('user can browse listings', async ({ page }) => {
    await page.goto('/');
    
    // Wait for listings to load
    await page.waitForSelector('[data-testid="listing-card"]', { timeout: 10000 });
    
    // Check that listings are displayed
    const listings = await page.locator('[data-testid="listing-card"]').count();
    expect(listings).toBeGreaterThan(0);
  });

  test('user can view listing details', async ({ page }) => {
    await page.goto('/');
    
    // Click on first listing
    await page.click('[data-testid="listing-card"]:first-child');
    
    // Should navigate to listing detail page
    await expect(page).toHaveURL(/.*listings/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('user can search listings', async ({ page }) => {
    await page.goto('/');
    
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'tour');
    await page.press('input[placeholder*="Search"]', 'Enter');
    
    // Should show search results
    await expect(page.locator('text=Search Results')).toBeVisible();
  });
});

test.describe('Navigation Flow', () => {
  test('main navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to different sections
    await page.click('text=Tours');
    await expect(page).toHaveURL(/.*tours/);
    
    await page.click('text=Rentals');
    await expect(page).toHaveURL(/.*rentals/);
    
    await page.click('text=Campaigns');
    await expect(page).toHaveURL(/.*campaigns/);
  });

  test('mobile navigation menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Menu should be visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });
});
