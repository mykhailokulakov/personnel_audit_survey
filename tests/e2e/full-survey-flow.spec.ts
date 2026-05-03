import { test, expect, type Page } from '@playwright/test';

async function completeIntro(page: Page, code = 'e2e_results_001') {
  await page.goto('/survey/intro');
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.getByPlaceholder('Введіть код').fill(code);
  await page.getByRole('button', { name: 'Далі' }).click();
  const checkboxes = page.getByRole('checkbox');
  await checkboxes.nth(0).click();
  await checkboxes.nth(1).click();
  await page.getByRole('button', { name: 'Розпочати анкету' }).click();
  await page.waitForURL('/survey/basic');
}

async function completeBasicAndQual(page: Page) {
  await page.getByText('26–35 років').click();
  await page.getByText('Чоловіча').click();
  await page.getByText('м. Київ').click();
  await page.getByText('Вища — бакалавр').click();
  await page.getByText('Технічний або інженерний').click();
  await page.getByText('Найманий працівник').click();
  await page.getByText('7–15 років').click();

  const leadershipSection = page
    .locator('section')
    .filter({ has: page.getByText('Чи мали ви досвід керівництва') });
  await leadershipSection.getByText('Ні', { exact: true }).click();

  const uaSection = page
    .locator('section')
    .filter({ has: page.getByText('Українська мова') })
    .first();
  await uaSection.getByText('Рідна мова').first().click();
  await page.getByLabel('Англійська мова').getByText('Не знаю').click();

  const deminingSection = page
    .locator('section')
    .filter({ has: page.getByText('Розмінування / EOD') });
  await deminingSection.getByText('Ні', { exact: true }).click();

  const droneSection = page
    .locator('section')
    .filter({ has: page.getByText('Пілотування БПЛА (дрони)') });
  await droneSection.getByText('Ні', { exact: true }).click();

  const radarSection = page
    .locator('section')
    .filter({ has: page.getByText('РЛС / радіотехніка') });
  await radarSection.getByText('Ні', { exact: true }).click();

  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/verification');
}

async function skipVerification(page: Page) {
  await expect(page.getByText(/блок пропускається/)).toBeVisible();
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/cognitive');
}

async function completeCognitive(page: Page) {
  const groups = page.getByRole('radiogroup');
  const count = await groups.count();
  for (let i = 0; i < count; i++) {
    await groups.nth(i).getByRole('radio').last().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/psychometric');
}

async function completePsychometric(page: Page) {
  const groups = page.getByRole('radiogroup');
  const count = await groups.count();
  for (let i = 0; i < count; i++) {
    await groups.nth(i).getByRole('radio').first().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/scenarios');
}

async function completeAllScenarios(page: Page) {
  for (let i = 0; i < 8; i++) {
    await page.getByRole('radio').last().click();
    await page.getByRole('button', { name: /Наступний сценарій/ }).click();
  }
  await page.getByRole('radio').last().click();
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/results');
}

test('full survey flow — results page, archetype, radar chart, code, and export button', async ({
  page,
}) => {
  const code = 'e2e_results_001';
  await completeIntro(page, code);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometric(page);
  await completeAllScenarios(page);

  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'Результати оцінювання' })).toBeVisible();
  await expect(page.getByText('Архетип')).toBeVisible();
  await expect(page.locator('[aria-label="Радар-діаграма профілю по 6 осях"]')).toBeVisible();
  await expect(page.getByText(code)).toBeVisible();
  await expect(page.getByRole('button', { name: /Завантажити результати/ })).toBeVisible();
});

test('results page — redirects away when session is not completed', async ({ page }) => {
  await page.goto('/survey/results');
  await expect(page).not.toHaveURL('/survey/results');
});
