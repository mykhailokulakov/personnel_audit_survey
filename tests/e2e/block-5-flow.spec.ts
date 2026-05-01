import { test, expect, type Page } from '@playwright/test';

async function completeIntro(page: Page, code = 'e2e_b5_001') {
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

async function completePsychometric(page: Page) {
  const groups = page.getByRole('radiogroup');
  const count = await groups.count();
  for (let i = 0; i < count; i++) {
    await groups.nth(i).getByRole('radio').first().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/scenarios');
}

test('Block 5 — scenarios page shows heading and first scenario', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometric(page);

  await expect(page.getByRole('heading', { name: 'Ситуаційні завдання' })).toBeVisible();
  await expect(page.getByText('Сценарій 1 з 9')).toBeVisible();
});

test('Block 5 — shows exactly 4 options for first scenario', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometric(page);

  const radios = page.getByRole('radio');
  await expect(radios).toHaveCount(4);
});

test('Block 5 — Next button disabled until option selected', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometric(page);

  const nextBtn = page.getByRole('button', { name: /Наступний сценарій/ });
  await expect(nextBtn).toBeDisabled();
});

test('Block 5 — Next button enabled after selecting option', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometric(page);

  await page.getByRole('radio').first().click();
  const nextBtn = page.getByRole('button', { name: /Наступний сценарій/ });
  await expect(nextBtn).not.toBeDisabled();
});

test('Block 5 — can advance through all 9 scenarios', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometric(page);

  // Answer all 9 scenarios
  for (let i = 0; i < 8; i++) {
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /Наступний сценарій/ }).click();
    await expect(page.getByText(`Сценарій ${i + 2} з 9`)).toBeVisible();
  }
  // Last scenario
  await page.getByRole('radio').first().click();
  await expect(page.getByRole('button', { name: 'Далі' })).toBeVisible();
});

test('Block 5 — no Back button present (business requirement)', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometric(page);

  await expect(page.getByRole('button', { name: 'Назад' })).not.toBeVisible();
});

test('Block 5 — full flow ends at /survey/results', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);
  await completePsychometric(page);

  // Answer all 9 scenarios using first option each time
  for (let i = 0; i < 8; i++) {
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /Наступний сценарій/ }).click();
  }
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/results');
});
