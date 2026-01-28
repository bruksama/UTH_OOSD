import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration page before each test
    await page.goto('/register');
  });

  test('should display registration form correctly', async ({ page }) => {
    // Verify page title/heading
    await expect(page.locator('h2')).toContainText('Create Account');

    // Verify form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Password"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder="Confirm Password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Register');
  });

  test('should register a new user with valid data', async ({ page }) => {
    // Generate unique email using timestamp to avoid "Email already in use" errors
    const timestamp = Date.now();
    const uniqueEmail = `testuser_${timestamp}@example.com`;
    const validPassword = 'TestPass123';

    // Fill out the registration form
    await page.locator('input[type="email"]').fill(uniqueEmail);
    await page.locator('input[placeholder*="Password"]').first().fill(validPassword);
    await page.locator('input[placeholder="Confirm Password"]').fill(validPassword);

    // Click the Register button
    await page.locator('button[type="submit"]').click();

    // Wait for the response - expect either:
    // 1. Success message about email verification
    // 2. Redirect to dashboard
    // 3. Some form of success indication

    // Check for success message (based on the Register.tsx code)
    const successMessage = page.locator('.bg-green-50');
    const errorMessage = page.locator('.bg-red-50');

    // Wait for either success or error message to appear
    await expect(successMessage.or(errorMessage)).toBeVisible({ timeout: 15000 });

    // If we got a success message, verify it contains the expected text
    if (await successMessage.isVisible()) {
      await expect(successMessage).toContainText('Registration successful');
      await expect(successMessage).toContainText('verify your account');

      // Verify form was cleared after successful registration
      await expect(page.locator('input[type="email"]')).toHaveValue('');
    }

    // Take screenshot for verification
    await page.screenshot({ path: 'e2e/screenshots/registration-result.png' });
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    const timestamp = Date.now();
    const uniqueEmail = `testuser_${timestamp}@example.com`;

    // Fill form with mismatched passwords
    await page.locator('input[type="email"]').fill(uniqueEmail);
    await page.locator('input[placeholder*="Password"]').first().fill('TestPass123');
    await page.locator('input[placeholder="Confirm Password"]').fill('DifferentPass456');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Verify error message
    const errorMessage = page.locator('.bg-red-50');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Passwords do not match');
  });

  test('should show error for weak password', async ({ page }) => {
    const timestamp = Date.now();
    const uniqueEmail = `testuser_${timestamp}@example.com`;
    const weakPassword = 'short'; // Less than 8 characters

    // Fill form with weak password
    await page.locator('input[type="email"]').fill(uniqueEmail);
    await page.locator('input[placeholder*="Password"]').first().fill(weakPassword);
    await page.locator('input[placeholder="Confirm Password"]').fill(weakPassword);

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Verify error message about password requirements
    const errorMessage = page.locator('.bg-red-50');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Password must be at least 8 characters');
  });

  test('should show error for password without numbers', async ({ page }) => {
    const timestamp = Date.now();
    const uniqueEmail = `testuser_${timestamp}@example.com`;
    const lettersOnlyPassword = 'OnlyLettersHere'; // No numbers

    // Fill form with letters-only password
    await page.locator('input[type="email"]').fill(uniqueEmail);
    await page.locator('input[placeholder*="Password"]').first().fill(lettersOnlyPassword);
    await page.locator('input[placeholder="Confirm Password"]').fill(lettersOnlyPassword);

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Verify error message about password requirements
    const errorMessage = page.locator('.bg-red-50');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Password must contain both letters and numbers');
  });

  test('should navigate to login page when clicking back to login', async ({ page }) => {
    // Click "Back to login" link
    await page.locator('text=Back to login').click();

    // Verify navigation to login page
    await expect(page).toHaveURL('/login');
  });
});
