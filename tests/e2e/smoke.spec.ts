import { expect, test } from '@playwright/test';

test('menu, match start, firing, and HUD are playable', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page).toHaveTitle('Flashfire');
  await expect(page.locator('h1')).toContainText('FLASHFIRE');
  await page.locator('#play-button').click();
  await expect(page.locator('#loadout-screen')).toBeVisible();
  await expect(page.locator('[data-weapon-id]')).toHaveCount(0);
  await expect(page.locator('.starter-weapon')).toHaveCount(0);
  await expect(page.locator('#deploy-button')).toHaveText('START');
  await page.locator('#settings-button').click();
  await page.locator('[data-difficulty-id="recruit"]').click();
  await page.locator('#settings-modal .modal-close').click();
  await page.locator('#arena-selector-button').click();
  await page.locator('[data-map-id="drydock-12"]').click();
  await page.locator('#mode-selector-button').click();
  await page.locator('[data-mode-id="team-deathmatch"]').click();
  await expect(page.locator('#selected-map-name')).toHaveText('DRYDOCK 12');
  await expect(page.locator('#selected-mode-name')).toHaveText('TEAM DEATHMATCH');
  await page.screenshot({
    path: `docs/screenshots/phase-8-loadout-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.locator('#deploy-button').click();
  await expect(page.locator('#hud')).toBeVisible();
  await expect(page.locator('#match-time')).toHaveText(/05:5\d|06:00/);
  await expect(page.locator('#weapon-name')).toHaveText('M9 PISTOL');
  await expect(page.locator('#ammo-value')).toHaveText('12 / 72');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.45);
    await page.mouse.down();
    await expect(page.locator('#ammo-value')).not.toHaveText('12 / 72');
    await page.mouse.up();
  }
  await page.screenshot({
    path: `docs/screenshots/phase-8-match-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test('every mode reaches results and supports rematch', async ({ page }) => {
  test.setTimeout(90_000);
  const modes = [
    'quick-deathmatch',
    'team-deathmatch',
    'survival',
    'gun-ladder',
    'control-point',
    'training-range',
  ];
  for (const [index, mode] of modes.entries()) {
    await page.goto('/?e2e-fast');
    await page.locator('#play-button').click();
    await page.locator('#mode-selector-button').click();
    await page.locator(`[data-mode-id="${mode}"]`).click();
    await page.locator('#deploy-button').click();
    await expect(page.locator('#result-screen')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#result-stats')).toContainText(/eliminations|accuracy/);
    if (index === 0) {
      await page.screenshot({
        path: `docs/screenshots/fix-results-exit-${test.info().project.name}.png`,
        fullPage: true,
      });
      await expect(page.locator('#result-exit-button')).toHaveText('EXIT');
      const rematchBox = await page.locator('#restart-button').boundingBox();
      const resultExitBox = await page.locator('#result-exit-button').boundingBox();
      expect(Math.abs((rematchBox?.y ?? 0) - (resultExitBox?.y ?? 0))).toBeLessThanOrEqual(2);
      await page.locator('#result-exit-button').click();
      await expect(page.locator('#loadout-screen')).toBeVisible({ timeout: 15_000 });
      await expect(page).toHaveURL(/\/lobby/);
      await expect(page.locator('#hud')).toBeHidden();
    } else {
      await page.locator('#restart-button').click();
      await expect(page.locator('#hud')).toBeVisible({ timeout: 15_000 });
    }
  }
});

test('training can be ended explicitly', async ({ page }) => {
  await page.goto('/');
  await page.locator('#play-button').click();
  await page.locator('#mode-selector-button').click();
  await page.locator('[data-mode-id="training-range"]').click();
  await page.locator('#deploy-button').click();
  await expect(page.locator('#finish-session-button')).toBeVisible();
  await page.locator('#finish-session-button').click();
  await expect(page.locator('#result-screen')).toBeVisible();
  await expect(page.locator('#result-stats')).toContainText('accuracy');
});

test('pause supports resume and exit to lobby', async ({ page }) => {
  await page.goto('/');
  await page.locator('#play-button').click();
  await page.locator('#deploy-button').click();
  await expect(page.locator('#hud')).toBeVisible();
  await page.waitForTimeout(250);
  await expect(page.locator('#pause-button')).toBeVisible();
  await page.locator('#pause-button').click();
  await expect(page.locator('#pause-screen')).toBeVisible();
  await expect(page.locator('#hud')).toBeVisible();
  await page.locator('#resume-button').click();
  await expect(page.locator('#pause-screen')).toBeHidden();
  await expect(page.locator('#match-time')).toHaveText(/02:5\d|03:00/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#pause-screen')).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/fix-pause-exit-${test.info().project.name}.png`,
    fullPage: true,
  });
  await expect(page.locator('#pause-exit-button')).toHaveText('EXIT');
  const resumeBox = await page.locator('#resume-button').boundingBox();
  const pauseExitBox = await page.locator('#pause-exit-button').boundingBox();
  expect(Math.abs((resumeBox?.y ?? 0) - (pauseExitBox?.y ?? 0))).toBeLessThanOrEqual(2);
  await page.locator('#pause-exit-button').click();
  await expect(page.locator('#loadout-screen')).toBeVisible();
  await expect(page).toHaveURL(/\/lobby/);
  await expect(page.locator('#hud')).toBeHidden();
});
