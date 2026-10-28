import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test('accessibility, remapping, touch, and audio settings persist', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.locator('#play-button').click();
  await page.locator('#settings-button').click();
  await page.locator('[data-settings-tab="access"]').click();
  await page.locator('#color-vision-select').selectOption('deuteranopia');
  await page.locator('#left-handed-toggle').check();
  await page.locator('[data-binding="left"]').selectOption('ARROWLEFT');
  await page.locator('[data-binding="right"]').selectOption('ARROWRIGHT');
  await page.locator('[data-binding="jet"]').selectOption('ARROWUP');
  await page.locator('[data-binding="down"]').selectOption('ARROWDOWN');
  await page.locator('#gamepad-deadzone-slider').fill('0.24');
  await page.locator('#touch-size-slider').fill('1.15');
  await page.locator('#touch-opacity-slider').fill('0.65');
  await page.locator('[data-settings-tab="audio"]').click();
  await page.locator('#master-volume-slider').fill('0.55');
  await page.locator('#music-volume-slider').fill('0.4');
  await page.locator('#effects-volume-slider').fill('0.7');
  await page.locator('#ambience-volume-slider').fill('0.35');
  await page.locator('#ui-volume-slider').fill('0.6');
  const screenshotPath = `docs/screenshots/phase-8-settings-complete-${testInfo.project.name}.png`;
  if (!existsSync(screenshotPath)) await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.reload();
  await expect(page.locator('#loadout-screen')).toBeVisible();
  await page.locator('#settings-button').click();
  await page.locator('[data-settings-tab="access"]').click();
  await expect(page.locator('#color-vision-select')).toHaveValue('deuteranopia');
  await expect(page.locator('#left-handed-toggle')).toBeChecked();
  await expect(page.locator('[data-binding="left"]')).toHaveValue('ARROWLEFT');
  await expect(page.locator('[data-binding="right"]')).toHaveValue('ARROWRIGHT');
  await expect(page.locator('[data-binding="jet"]')).toHaveValue('ARROWUP');
  await expect(page.locator('[data-binding="down"]')).toHaveValue('ARROWDOWN');
  await expect(page.locator('#gamepad-deadzone-slider')).toHaveValue('0.24');
  await expect(page.locator('#touch-size-slider')).toHaveValue('1.15');
  await expect(page.locator('#touch-opacity-slider')).toHaveValue('0.65');
  await expect(page.locator('html')).toHaveAttribute('data-color-vision', 'deuteranopia');
  await expect(page.locator('html')).toHaveClass(/left-handed/);
  await expect(page.locator('html')).toHaveCSS('--touch-size', '1.15');

  await page.locator('[data-settings-tab="audio"]').click();
  await expect(page.locator('#master-volume-slider')).toHaveValue('0.55');
  await expect(page.locator('#ambience-volume-slider')).toHaveValue('0.35');
  await expect(page.locator('#ui-volume-slider')).toHaveValue('0.6');
  await page.locator('#settings-modal .modal-close').click();
  await page.locator('#deploy-button').click();
  await expect(page.locator('#hud')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('#pause-screen')).toBeVisible();
  await page.locator('#resume-button').click();
  if (testInfo.project.name === 'mobile-chromium') {
    const move = await page.locator('#move-pad').boundingBox();
    const aim = await page.locator('#aim-pad').boundingBox();
    expect(move?.x).toBeGreaterThan(aim?.x ?? Number.POSITIVE_INFINITY);
    expect(move?.width).toBeGreaterThan(115);
  }
});
