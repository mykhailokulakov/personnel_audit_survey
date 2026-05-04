import { test, expect } from '@playwright/test';

test.describe('mobile viewport — intro page', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('renders intro without horizontal overflow', async ({ page }) => {
    await page.goto('/survey/intro');
    // Check no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('nav button is visible in viewport on intro page', async ({ page }) => {
    await page.goto('/survey/intro');
    const nextBtn = page.getByRole('button', { name: 'Далі' });
    await expect(nextBtn).toBeVisible();
    // Button should be in the lower portion of the screen (sticky)
    const box = await nextBtn.boundingBox();
    expect(box).not.toBeNull();
  });
});

test.describe('mobile viewport — home page', () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test('home page renders on 360px', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Діагностична анкета' })).toBeVisible();
  });
});
