import { test, expect } from '@playwright/test';

test('Block 2 — skipped when no critical qualifications declared', async ({ page }) => {
  // Navigate directly to verification page without declaring any critical quals
  await page.goto('/survey/verification');

  await expect(page.getByText(/блок пропускається/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Далі' })).toBeVisible();
});

test('Block 2 — clicking Далі in skip mode navigates to cognitive block', async ({ page }) => {
  await page.goto('/survey/verification');

  await expect(page.getByText(/блок пропускається/)).toBeVisible();
  await page.getByRole('button', { name: 'Далі' }).click();

  // Should navigate to cognitive block
  await page.waitForURL('/survey/cognitive');
});
