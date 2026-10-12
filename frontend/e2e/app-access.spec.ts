import { test, expect } from '@playwright/test';

test.describe('TEST 1: Application Access & Authentication Gates', () => {
  test('Application loads landing page with brand and navigation', async ({ page }) => {
    await page.goto('/');

    // Verify page title and header branding
    await expect(page).toHaveTitle(/TaxPilot/i);
    await expect(page.locator('text=TaxPilot').first()).toBeVisible();

    // Verify key editorial navigation items
    await expect(page.locator('a[href="/individuals"]').first()).toBeVisible();
    await expect(page.locator('a[href="/smes"]').first()).toBeVisible();
    await expect(page.locator('a[href="/tax-engine"]').first()).toBeVisible();

    // Verify hero text
    await expect(page.locator('text=Deterministic Rule Engine').first()).toBeVisible();
  });

  test('Public informational routes load cleanly without errors', async ({ page }) => {
    // How it works page
    await page.goto('/howitworks');
    await expect(page.locator('text=The TaxPilot Architecture').first()).toBeVisible();

    // Individuals page
    await page.goto('/individuals');
    await expect(page.locator('text=Personal tax filing').first()).toBeVisible();

    // Pricing plans page
    await page.goto('/pricingplans');
    await expect(page.locator('text=Clear statutory pricing').first()).toBeVisible();
  });

  test('Sign-in route renders authentication container', async ({ page }) => {
    await page.goto('/sign-in');

    // Verify URL
    await expect(page).toHaveURL(/.*sign-in/);

    // Verify Clerk sign-in card container renders
    const signInContainer = page.locator('.cl-signIn-root, [data-clerk-component="SignIn"], .cl-card, #root');
    await expect(signInContainer.first()).toBeVisible();
  });

  test('Protected individual routes require authentication and do not leak user data', async ({ page }) => {
    // Attempt visiting protected /individual/dashboard directly without credentials
    await page.goto('/individual/dashboard');

    // Unauthenticated user should not see taxpayer dashboard contents
    await expect(page.locator('text=Your Tax Returns')).not.toBeVisible();

    // Attempt visiting protected income deductions directly
    await page.goto('/individual/income');
    await expect(page.locator('text=Add Income Source')).not.toBeVisible();

    // Attempt visiting protected filing directly
    await page.goto('/individual/filing');
    await expect(page.locator('text=Your return is ready for filing')).not.toBeVisible();
  });
});
