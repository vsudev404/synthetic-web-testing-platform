import { test, expect } from '@playwright/test';

const target = process.env.APP_BASE_URL || 'https://example.com';

test('basic page loads', async ({ page }) => {
  await page.goto(target);
  await expect(page).toHaveTitle(/.*/);
});
