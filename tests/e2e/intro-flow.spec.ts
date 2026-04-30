import { test, expect } from '@playwright/test';

test('full intro flow navigates through all blocks', async ({ page }) => {
  // Start at home page
  await page.goto('/');

  // Click start button
  await page.getByRole('link', { name: 'Розпочати' }).click();
  await page.waitForURL('/survey/intro');

  // Progress bar should show step 1
  await expect(page.getByText(/Крок 1 з 7.*Вступ/)).toBeVisible();

  // Welcome screen — click Далі
  await page.getByRole('button', { name: 'Далі' }).click();

  // Code screen
  await expect(page.getByText('Ваш код')).toBeVisible();

  // Enter code and continue
  await page.getByPlaceholder('Введіть код').fill('test_user_001');
  await page.getByRole('button', { name: 'Далі' }).click();

  // Consents screen
  await expect(page.getByText('Згода на обробку')).toBeVisible();

  // Check both checkboxes
  const checkboxes = page.getByRole('checkbox');
  await checkboxes.nth(0).click();
  await checkboxes.nth(1).click();

  // Start survey
  await page.getByRole('button', { name: 'Розпочати анкету' }).click();
  await page.waitForURL('/survey/basic');

  // Progress bar should show step 2
  await expect(page.getByText(/Крок 2 з 7.*Базова інформація/)).toBeVisible();

  // BasicInfoBlock heading should be visible
  await expect(page.getByRole('heading', { name: 'Базова інформація' })).toBeVisible();
});
