import { expect, test } from '@playwright/test';

for (const path of ['/forgot-password', '/register']) {
    test(`${path} Back to login works with keyboard`, async ({ page }) => {
        await page.goto(path);
        const link = page.getByRole('link', { name: 'Back to login' });
        await link.focus();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/\/login$/);
    });
}
