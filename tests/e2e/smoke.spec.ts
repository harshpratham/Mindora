import { test, expect } from '@playwright/test';

test('home page smoke renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Mindora')).toBeVisible();
});
