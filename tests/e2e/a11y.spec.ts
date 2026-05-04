import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('a11y — home page', () => {
  test('no axe violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('a11y — survey intro', () => {
  test('no axe violations on welcome screen', async ({ page }) => {
    await page.goto('/survey/intro');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('no axe violations on code entry screen', async ({ page }) => {
    await page.goto('/survey/intro');
    await page.getByRole('button', { name: 'Далі' }).click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('no axe violations on consent screen', async ({ page }) => {
    await page.goto('/survey/intro');
    await page.getByRole('button', { name: 'Далі' }).click();
    await page.getByPlaceholder('Введіть код').fill('test_a11y');
    await page.getByRole('button', { name: 'Далі' }).click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
