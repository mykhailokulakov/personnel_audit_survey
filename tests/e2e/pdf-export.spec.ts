import { test, expect, type Page } from '@playwright/test';

async function completeFullSurvey(page: Page, code = 'e2e_pdf_001') {
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

test('pdf-export — downloaded file is non-empty', async ({ page }) => {
  // html2canvas does not trigger a download event in headless CI
  test.skip(!!process.env['CI'], 'requires headed browser');

  await completeFullSurvey(page, 'e2e_pdf_001');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Завантажити PDF/ }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  expect(download.suggestedFilename()).toContain('e2e_pdf_001');

  // Verify file is non-empty
  const path = await download.path();
  expect(path).not.toBeNull();
  const { readFileSync } = await import('fs');
  const size = readFileSync(path!).length;
  expect(size).toBeGreaterThan(0);
});
