import { test, expect, type Page } from '@playwright/test';

async function completeFullSurvey(page: Page, code = 'e2e_json_001') {
  await page.goto('/survey/intro');
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.getByPlaceholder('Введіть код').fill(code);
  await page.getByRole('button', { name: 'Далі' }).click();
  const checkboxes = page.getByRole('checkbox');
  await checkboxes.nth(0).click();
  await checkboxes.nth(1).click();
  await page.getByRole('button', { name: 'Розпочати анкету' }).click();
  await page.waitForURL('/survey/basic');

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

  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/cognitive');

  const cogGroups = page.getByRole('radiogroup');
  const cogCount = await cogGroups.count();
  for (let i = 0; i < cogCount; i++) {
    await cogGroups.nth(i).getByRole('radio').last().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/psychometric');

  const psychGroups = page.getByRole('radiogroup');
  const psychCount = await psychGroups.count();
  for (let i = 0; i < psychCount; i++) {
    await psychGroups.nth(i).getByRole('radio').first().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/scenarios');

  for (let i = 0; i < 8; i++) {
    await page.getByRole('radio').last().click();
    await page.getByRole('button', { name: /Наступний сценарій/ }).click();
  }
  await page.getByRole('radio').last().click();
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/results');
}

test('json-export — filename and valid ScoringResult shape', async ({ page }) => {
  await completeFullSurvey(page);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Завантажити JSON/ }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.json$/);
  expect(download.suggestedFilename()).toContain('e2e_json_001');

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString('utf-8'));

  expect(parsed).toHaveProperty('respondentCode', 'e2e_json_001');
  expect(parsed).toHaveProperty('archetype');
  expect(parsed).toHaveProperty('profile');
  expect(parsed.profile).toHaveLength(6);
  expect(parsed).toHaveProperty('validity');
  expect(parsed).toHaveProperty('qualifications');
  expect(parsed).toHaveProperty('scoredAt');
  expect(parsed).toHaveProperty('durationMs');
});
