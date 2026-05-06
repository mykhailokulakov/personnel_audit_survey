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
  // Allow extra time: survey navigation (~35 s) + html2canvas on a chart-heavy
  // results page (~40 s) comfortably fits in 3 minutes in CI headless mode.
  test.setTimeout(180_000);

  // jsPDF.save() always calls URL.createObjectURL(blob) before triggering the
  // anchor click.  Intercepting here is more reliable than
  // page.waitForEvent('download') whose headless capture depends on the jsPDF
  // version and browser internals (blob-URL anchor clicks are not surfaced as
  // download events in all Playwright + jsPDF combinations).
  await page.addInitScript(() => {
    const orig = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (obj) => {
      const url = orig(obj);
      if (obj instanceof Blob && obj.type === 'application/pdf') {
        (window as any).__pdfBlobSize = obj.size;
      }
      return url;
    };
  });

  await completeFullSurvey(page, 'e2e_pdf_001');
  await page.getByRole('button', { name: /Завантажити PDF/ }).click();

  // Wait until jsPDF calls URL.createObjectURL with the PDF blob.
  // Allows up to 90 s for html2canvas to render the results page.
  await page.waitForFunction(() => (window as any).__pdfBlobSize !== undefined, {
    timeout: 90_000,
  });

  const pdfBlobSize = await page.evaluate(() => (window as any).__pdfBlobSize as number);
  expect(pdfBlobSize).toBeGreaterThan(0);
});
