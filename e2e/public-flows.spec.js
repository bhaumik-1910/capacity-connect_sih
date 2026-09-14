import { test, expect } from '@playwright/test';

test.describe('Public & Unauthenticated User Journeys', () => {

  test('should load Landing Page with Government identity and branding', async ({ page }) => {
    await page.goto('/');

    // Check page title & brand visibility
    await expect(page).toHaveTitle(/Capacity Connect|LMS|MoES/i);
    const headerBrand = page.locator('header').getByText('CAPACITY CONNECT');
    await expect(headerBrand).toBeVisible();

    // Verify Ministry indicator
    await expect(page.locator('header')).toContainText('Ministry of Earth Sciences');

    // Verify main Hero heading on landing page
    const heroHeading = page.getByRole('heading', { level: 1 });
    await expect(heroHeading).toBeVisible();

    // Verify Sign In CTA link
    const signInBtn = page.locator('header').getByRole('link', { name: /Sign In/i });
    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toHaveAttribute('href', '/login');
  });

  test('should navigate to MoES Framework (About) page', async ({ page }) => {
    await page.goto('/');

    // Navigate to /about via header link
    const aboutLink = page.locator('header').getByRole('link', { name: /MoES Framework/i });
    await aboutLink.click();

    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('body')).toContainText(/WMO|Competency|Framework/i);
  });

  test('should navigate to Public Certificate Verification portal', async ({ page }) => {
    await page.goto('/verify');

    await expect(page).toHaveURL(/\/verify/);

    // Verify certificate verification heading and search input
    const certInput = page.getByPlaceholder(/Certificate Number|UUID|QR|e\.g\./i).first();
    await expect(certInput).toBeVisible();

    // Verify verification button exists
    const verifyBtn = page.getByRole('button', { name: /Verify Now/i });
    await expect(verifyBtn).toBeVisible();

    // Try an invalid query and verify proper feedback
    await certInput.fill('INVALID-CERT-99999');
    await verifyBtn.click();

    // Should indicate not found or invalid format without crashing
    await expect(page.locator('body')).toContainText(/not found|invalid|no certificate/i, { timeout: 10000 });
  });

});
