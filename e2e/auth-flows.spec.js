import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management', () => {

  test('should render the login terminal with all government UI components and pills', async ({ page }) => {
    await page.goto('/login');

    // Page title or main login headings
    await expect(page.getByText('Sign In to Your Workspace')).toBeVisible();
    await expect(page.getByText('Official Single Sign-In Terminal')).toBeVisible();

    // Form inputs
    const emailInput = page.getByPlaceholder('Email or Enrollment No');
    const passwordInput = page.getByPlaceholder('Enter your password');
    const submitBtn = page.getByRole('button', { name: /Sign In to Official Workspace/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Verify Quick Credential Selector pills exist
    await expect(page.getByRole('button', { name: /Admin/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Trainer/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Student/i }).first()).toBeVisible();
  });

  test('should display error banner upon invalid credentials', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByPlaceholder('Email or Enrollment No');
    const passwordInput = page.getByPlaceholder('Enter your password');
    const submitBtn = page.getByRole('button', { name: /Sign In to Official Workspace/i });

    await emailInput.fill('invalid.user@example.com');
    await passwordInput.fill('WrongPassword@999');
    await submitBtn.click();

    // Expect error alert banner to appear
    const errorBanner = page.locator('div.bg-rose-50');
    await expect(errorBanner).toBeVisible({ timeout: 8000 });
  });

  test('should auto-fill credentials when clicking quick role buttons', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByPlaceholder('Email or Enrollment No');
    const passwordInput = page.getByPlaceholder('Enter your password');

    // Click Student autofill button
    const studentPill = page.getByRole('button', { name: '🎓 Student', exact: true });
    await studentPill.click();

    await expect(emailInput).toHaveValue('25004406110009');
    await expect(passwordInput).toHaveValue('110009');
  });

  test('should authenticate Officer Trainee and successfully logout', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByPlaceholder('Email or Enrollment No');
    const passwordInput = page.getByPlaceholder('Enter your password');
    const submitBtn = page.getByRole('button', { name: /Sign In to Official Workspace/i });

    // Use Trainee credentials
    await emailInput.fill('25004406110009');
    await passwordInput.fill('110009');
    await submitBtn.click();

    // Should redirect to trainee dashboard
    await expect(page).toHaveURL(/\/trainee\/dashboard/, { timeout: 12000 });
    await expect(page.locator('body')).toContainText(/Deep Patel|Trainee|Competency|My Courses/i);

    // Test Logout flow
    const profileBtn = page.locator('#user-profile-menu-button');
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();

    const logoutBtn = page.getByRole('button', { name: /Sign Out \/ Log Out/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Should redirect back to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    await expect(page.getByText('Sign In to Your Workspace')).toBeVisible();
  });

});
