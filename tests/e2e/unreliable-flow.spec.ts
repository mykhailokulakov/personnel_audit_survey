import { test, expect, type Page } from '@playwright/test';

async function completeIntro(page: Page, code = 'e2e_unrel_001') {
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
    await groups.nth(i).getByRole('radio').first().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/psychometric');
}

/** Completes psychometric with ALL value 5 (flags lie scale + uniformity → unreliable). */
async function completePsychometricAllMax(page: Page) {
  const groups = page.getByRole('radiogroup');
  const count = await groups.count();
  for (let i = 0; i < count; i++) {
    await groups.nth(i).getByRole('radio').last().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/scenarios');
}

async function completeAllScenarios(page: Page) {
  for (let i = 0; i < 8; i++) {
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /Наступний сценарій/ }).click();
  }
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/results');
}

test('unreliable flow — validity warnings section is visible', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometricAllMax(page);
  await completeAllScenarios(page);

  await expect(page.getByText('Попередження щодо якості даних')).toBeVisible();
});

test('unreliable flow — archetype is not-suitable or data-unreliable', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometricAllMax(page);
  await completeAllScenarios(page);

  const archetypeText = await page.locator('[class*="font-bold"]').allTextContents();
  const archetypeValues = ['Не підходить', 'Дані недостовірні'];
  const hasExpectedArchetype = archetypeText.some((t) =>
    archetypeValues.some((v) => t.includes(v)),
  );
  expect(hasExpectedArchetype).toBe(true);
});

test('unreliable flow — lie-scale warning appears', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometricAllMax(page);
  await completeAllScenarios(page);

  await expect(page.getByText(/Шкала брехні/)).toBeVisible();
});
