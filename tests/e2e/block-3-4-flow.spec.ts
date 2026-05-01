import { test, expect, type Page } from '@playwright/test';

async function completeIntro(page: Page) {
  await page.goto('/survey/intro');
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.getByPlaceholder('Введіть код').fill('e2e_b34_001');
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

  // No critical quals — answer Ні for all three
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

async function completeVerification(page: Page) {
  // No critical quals declared, so this block is skipped
  await expect(page.getByText(/блок пропускається/)).toBeVisible();
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/cognitive');
}

test('Block 3 — cognitive page shows heading and questions', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await completeVerification(page);

  await expect(page.getByRole('heading', { name: 'Когнітивний профіль' })).toBeVisible();
  await expect(page.getByText(/правильних відповідей немає/)).toBeVisible();
});

test('Block 3 — Next button disabled until all questions answered', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await completeVerification(page);

  const nextButton = page.getByRole('button', { name: 'Далі' });
  await expect(nextButton).toBeDisabled();
});

test('Block 3 — answering all questions enables Next', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await completeVerification(page);

  // Answer all radio questions — pick first option for each question
  const radioGroups = page.getByRole('radiogroup');
  const count = await radioGroups.count();
  for (let i = 0; i < count; i++) {
    const group = radioGroups.nth(i);
    const firstRadio = group.getByRole('radio').first();
    await firstRadio.click();
  }

  const nextButton = page.getByRole('button', { name: 'Далі' });
  await expect(nextButton).not.toBeDisabled();
});

test('Block 3 → Block 4 navigation', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await completeVerification(page);

  // Answer all cognitive questions
  const radioGroups = page.getByRole('radiogroup');
  const count = await radioGroups.count();
  for (let i = 0; i < count; i++) {
    const group = radioGroups.nth(i);
    await group.getByRole('radio').first().click();
  }

  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/psychometric');

  await expect(page.getByRole('heading', { name: 'Психометричний профіль' })).toBeVisible();
});

test('Block 4 — psychometric page shows Likert scales', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await completeVerification(page);

  // Fast-forward through Block 3
  const cogRadioGroups = page.getByRole('radiogroup');
  const cogCount = await cogRadioGroups.count();
  for (let i = 0; i < cogCount; i++) {
    await cogRadioGroups.nth(i).getByRole('radio').first().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/psychometric');

  // Each Likert scale radiogroup should be visible
  const psychGroups = page.getByRole('radiogroup');
  const psychCount = await psychGroups.count();
  expect(psychCount).toBeGreaterThanOrEqual(22);
});

test('Block 4 — Next disabled until all Likert answered', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await completeVerification(page);

  const cogRadioGroups = page.getByRole('radiogroup');
  const cogCount = await cogRadioGroups.count();
  for (let i = 0; i < cogCount; i++) {
    await cogRadioGroups.nth(i).getByRole('radio').first().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/psychometric');

  const nextButton = page.getByRole('button', { name: 'Далі' });
  await expect(nextButton).toBeDisabled();
});

test('Block 4 → Block 5 navigation after answering all', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await completeVerification(page);

  // Complete Block 3
  const cogGroups = page.getByRole('radiogroup');
  const cogCount = await cogGroups.count();
  for (let i = 0; i < cogCount; i++) {
    await cogGroups.nth(i).getByRole('radio').first().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/psychometric');

  // Complete Block 4 — click first Likert option for each scale
  const psychGroups = page.getByRole('radiogroup');
  const psychCount = await psychGroups.count();
  for (let i = 0; i < psychCount; i++) {
    await psychGroups.nth(i).getByRole('radio').first().click();
  }

  const nextButton = page.getByRole('button', { name: 'Далі' });
  await expect(nextButton).not.toBeDisabled();
  await nextButton.click();
  await page.waitForURL('/survey/scenarios');
});

test('Block 3 — back navigation returns to verification', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await completeVerification(page);

  await page.getByRole('button', { name: 'Назад' }).click();
  await page.waitForURL(/\/survey\/verification/);
});

test('Block 4 — back navigation returns to cognitive', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await completeVerification(page);

  const cogGroups = page.getByRole('radiogroup');
  const cogCount = await cogGroups.count();
  for (let i = 0; i < cogCount; i++) {
    await cogGroups.nth(i).getByRole('radio').first().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/psychometric');

  await page.getByRole('button', { name: 'Назад' }).click();
  await page.waitForURL(/\/survey\/cognitive/);
});
