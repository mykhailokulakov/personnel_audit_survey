import { test, expect, type Page } from '@playwright/test';
import attentionChecksData from '../../src/data/questions/attention-checks.json';
import { buildScenariosBlockItems } from '../../src/lib/storage/build-block-questions';

const RESPONDENT_CODE = 'e2e_ac_fail_001';

async function completeIntro(page: Page, code = RESPONDENT_CODE) {
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

test('attention-check — Block 4 attention checks are present in the Likert list', async ({
  page,
}) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);

  // Verify attention-check prompt text appears among the Likert questions
  const ac1 = attentionChecksData.psychometricChecks[0]!;
  const ac2 = attentionChecksData.psychometricChecks[1]!;
  await expect(page.getByText(ac1.promptUa)).toBeVisible();
  await expect(page.getByText(ac2.promptUa)).toBeVisible();
});

test('attention-check — Block 4 ACs appear in non-first, non-last positions', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);

  const acPrompts = attentionChecksData.psychometricChecks.map((ac) => ac.promptUa);

  // Get all question prompts as displayed on page
  const allPrompts = await page.locator('[id$="-label"]').allTextContents();

  acPrompts.forEach((acPrompt) => {
    const idx = allPrompts.findIndex((p) => p.trim() === acPrompt.trim());
    expect(idx).toBeGreaterThan(0); // not first
    expect(idx).toBeLessThan(allPrompts.length - 1); // not last
  });
});

test('attention-check — Block 5 attention-check scenarios are interspersed', async ({ page }) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);

  // Answer all psychometric questions
  const groups = page.getByRole('radiogroup');
  const count = await groups.count();
  for (let i = 0; i < count; i++) {
    await groups.nth(i).getByRole('radio').first().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/scenarios');

  // The block has 9 scenarios total (7 main + 2 AC)
  await expect(page.getByText('Сценарій 1 з 9')).toBeVisible();

  // Verify AC scenarios are NOT at index 0 or last
  const scenarios = buildScenariosBlockItems(RESPONDENT_CODE);
  expect(scenarios[0]!.isAttentionCheck).toBe(false);
  expect(scenarios[scenarios.length - 1]!.isAttentionCheck).toBe(false);
});

test('attention-check — failing Block 4 ACs is recorded in store state (wrong values)', async ({
  page,
}) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);

  // Answer all psychometric Likert scales — intentionally pick WRONG value for ACs
  // (pick value 1 for everything, but AC1 expects 2 and AC2 expects 3)
  const allGroups = page.getByRole('radiogroup');
  const totalCount = await allGroups.count();
  for (let i = 0; i < totalCount; i++) {
    // Always pick first radio (Likert value=1) — will fail AC1 (expects 2) and AC2 (expects 3)
    await allGroups.nth(i).getByRole('radio').first().click();
  }

  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/scenarios');

  // The survey allows proceeding regardless of AC pass/fail (scoring happens post-survey)
  await expect(page.getByRole('heading', { name: 'Ситуаційні завдання' })).toBeVisible();
});

test('attention-check — Block 5 AC scenarios look identical to regular scenarios', async ({
  page,
}) => {
  await completeIntro(page);
  await completeBasicAndQual(page);
  await skipVerification(page);
  await completeCognitive(page);

  const groups = page.getByRole('radiogroup');
  const count = await groups.count();
  for (let i = 0; i < count; i++) {
    await groups.nth(i).getByRole('radio').first().click();
  }
  await page.getByRole('button', { name: 'Далі' }).click();
  await page.waitForURL('/survey/scenarios');

  // Navigate to all scenarios and check that all show 4 options with no special marker
  const scenarios = buildScenariosBlockItems(RESPONDENT_CODE);
  for (let i = 0; i < scenarios.length; i++) {
    await expect(page.getByText(`Сценарій ${i + 1} з 9`)).toBeVisible();
    const radios = page.getByRole('radio');
    await expect(radios).toHaveCount(4);
    // No visual "attention check" badge
    await expect(page.locator('[data-attention-check]')).toHaveCount(0);

    await radios.first().click();
    if (i < scenarios.length - 1) {
      await page.getByRole('button', { name: /Наступний сценарій/ }).click();
    }
  }
});
