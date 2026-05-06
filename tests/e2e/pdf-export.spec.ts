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
  // html2canvas cannot reliably render complex SVG charts in headless Chromium.
  // Inject a stub via window.__html2canvasMock so the test covers the full
  // jsPDF generation and blob-creation path without depending on canvas rendering.
  // The production code checks for __html2canvasMock before using the real lib.
  await page.addInitScript(() => {
    (window as any).__html2canvasMock = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 595;
      canvas.height = 842;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.font = '14px sans-serif';
        ctx.fillText('CI test — pdf-export', 20, 40);
      }
      return canvas;
    };

    // Intercept URL.createObjectURL to capture the PDF blob size.
    const orig = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (obj: any) => {
      const url = orig(obj);
      if (obj instanceof Blob && obj.type === 'application/pdf') {
        (window as any).__pdfBlobSize = obj.size;
      }
      return url;
    };
  });

  // Survey navigation: ~35 s in CI. With the mock, the export itself is instant.
  test.setTimeout(120_000);

  await completeFullSurvey(page, 'e2e_pdf_001');
  await page.getByRole('button', { name: /Завантажити PDF/ }).click();

  // Wait for jsPDF to call URL.createObjectURL with the PDF blob.
  await page.waitForFunction(() => (window as any).__pdfBlobSize !== undefined, {
    timeout: 15_000,
  });

  const pdfBlobSize = await page.evaluate(() => (window as any).__pdfBlobSize as number);
  expect(pdfBlobSize).toBeGreaterThan(0);
});
