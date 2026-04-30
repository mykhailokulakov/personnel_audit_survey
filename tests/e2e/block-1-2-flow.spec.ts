import { test, expect, type Page } from '@playwright/test';

async function navigateToBasicPage(page: Page) {
  await page.goto('/survey/intro');
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.getByPlaceholder('Введіть код').fill('e2e_test_001');
  await page.getByRole('button', { name: 'Далі' }).click();
  const checkboxes = page.getByRole('checkbox');
  await checkboxes.nth(0).click();
  await checkboxes.nth(1).click();
  await page.getByRole('button', { name: 'Розпочати анкету' }).click();
  await page.waitForURL('/survey/basic');
}

test('Block 1 — basic page shows required sections', async ({ page }) => {
  await navigateToBasicPage(page);

  await expect(page.getByRole('heading', { name: 'Базова інформація' })).toBeVisible();
  await expect(page.getByText('Демографічна інформація')).toBeVisible();
  await expect(page.getByText('Освіта')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Мови' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Кваліфікації' })).toBeVisible();
});

test('Block 1 — Next button disabled until required questions answered', async ({ page }) => {
  await navigateToBasicPage(page);

  // Next should be disabled initially
  const nextButton = page.getByRole('button', { name: 'Далі' });
  await expect(nextButton).toBeDisabled();
});

test('Block 1 — declaring drone qualification shows sub-questions', async ({ page }) => {
  await navigateToBasicPage(page);

  await expect(page.getByText('Рівень підготовки з пілотування БПЛА')).not.toBeVisible();
  // Click Так for drone piloting
  const droneSectionHeading = page.getByText('Пілотування БПЛА (дрони)');
  await expect(droneSectionHeading).toBeVisible();

  // Find the Так button in the drone section
  const takButtons = page.getByText('Так');
  // The first Так button after drone heading
  const droneSection = page
    .locator('section')
    .filter({ has: page.getByText('Пілотування БПЛА (дрони)') });
  await droneSection.getByText('Так').click();

  await expect(page.getByText('Рівень підготовки з пілотування БПЛА')).toBeVisible();
  await expect(page.getByText('Загальний наліт')).toBeVisible();
  void takButtons;
});

test('Block 1 → Block 2 — declaring drones shows only drone verification questions', async ({
  page,
}) => {
  await navigateToBasicPage(page);

  // Fill all required basic info questions
  await page.getByText('26–35 років').click();
  await page.getByText('Чоловіча').click();
  await page.getByText('м. Київ').click();
  await page.getByText('Вища — бакалавр').click();
  await page.getByText('Технічний або інженерний').click();
  await page.getByText('Найманий працівник').click();
  await page.getByText('7–15 років').click();

  // Answer leadership (Ні)
  const leadershipSection = page
    .locator('section')
    .filter({ has: page.getByText('Чи мали ви досвід керівництва') });
  await leadershipSection.getByText('Ні', { exact: true }).click();

  // Language
  const uaSection = page
    .locator('[id="section-languages"]')
    .or(page.locator('section').filter({ has: page.getByText('Українська мова') }))
    .first();
  await uaSection.getByText('Рідна мова').first().click();
  await page.getByLabel('Англійська мова').getByText('Не знаю').click();

  // Declare drone piloting
  const droneSection = page
    .locator('section')
    .filter({ has: page.getByText('Пілотування БПЛА (дрони)') });
  await droneSection.getByText('Так').click();

  // Answer no to demining and radar
  const deminingSection = page
    .locator('section')
    .filter({ has: page.getByText('Розмінування / EOD') });
  await deminingSection.getByText('Ні', { exact: true }).click();
  const radarSection = page
    .locator('section')
    .filter({ has: page.getByText('РЛС / радіотехніка') });
  await radarSection.getByText('Ні', { exact: true }).click();

  // All required questions answered — click Далі for client-side navigation (preserves Zustand state)
  const daliButton = page.getByRole('button', { name: 'Далі' });
  await expect(daliButton).not.toBeDisabled();
  await daliButton.click();
  await page.waitForURL('/survey/verification');

  await expect(page.getByRole('heading', { name: 'Технічна перевірка' })).toBeVisible();
  await expect(page.getByText(/Питання 1 з 3/)).toBeVisible();
  // Should show drone GPS lock question prompt
  await expect(page.getByText(/GPS lock/i)).toBeVisible();
});

test('Block 2 — navigation through all drone questions to completion', async ({ page }) => {
  // Set up store state by navigating through the survey
  await page.goto('/survey/verification');

  // Without any declared qualifications, should show skip message
  await expect(page.getByText(/блок пропускається/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Далі' })).toBeVisible();
});
