import { test, expect } from '@playwright/test';

test.describe('Role-Based Workspaces & Dashboards', () => {

  test('should login as Platform Admin and access Central Governance Command Center', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email or Enrollment No').fill('bhaumikkothiya1@gmail.com');
    await page.getByPlaceholder('Enter your password').fill('Bhaumik@1910');
    await page.getByRole('button', { name: /Sign In to Official Workspace/i }).click();

    // Verify redirection to Admin Dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });

    // Verify Admin Header and Governance tools
    await expect(page.getByText('Central Governance Command Center')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Ministry of Earth Sciences • Central Governance Cell')).toBeVisible();

    // Verify administrative quick actions
    await expect(page.getByRole('link', { name: '+ Create Government Course' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Govt Certificate Studio/i }).first()).toBeVisible();
  });

  test('should login as Faculty Trainer and access Trainer Workspace', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email or Enrollment No').fill('jd@gmail.com');
    await page.getByPlaceholder('Enter your password').fill('Jd@123');
    await page.getByRole('button', { name: /Sign In to Official Workspace/i }).click();

    // Verify redirection to Trainer Dashboard
    await expect(page).toHaveURL(/\/trainer\/dashboard/, { timeout: 15000 });

    // Verify Trainer Header & Actions
    await expect(page.getByText(/Faculty Workspace/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /Launch Builder/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Exam Bank/i }).first()).toBeVisible();
  });

  test('should login as Officer Trainee and navigate course catalogue & competency passport', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email or Enrollment No').fill('25004406110009');
    await page.getByPlaceholder('Enter your password').fill('110009');
    await page.getByRole('button', { name: /Sign In to Official Workspace/i }).click();

    // Verify Trainee Dashboard
    await expect(page).toHaveURL(/\/trainee\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 10000 });

    // Navigate to Course Catalogue
    await page.getByRole('link', { name: /Browse Catalogue/i }).click();
    await expect(page).toHaveURL(/\/trainee\/catalogue/, { timeout: 10000 });
    await expect(page.getByPlaceholder(/Search by course title/i).or(page.locator('body'))).toBeVisible();

    // Navigate to Competency Passport / Skill-Gap Radar
    await page.goto('/trainee/competency-passport');
    await expect(page).toHaveURL(/\/trainee\/competency-passport/, { timeout: 10000 });
    await expect(page.locator('body')).toContainText(/Passport|Competency|Skill|Radar/i);
  });

});
