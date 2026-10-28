import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';

test('first four production maps render at every target viewport', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const maps = ['outpost-kilo', 'drydock-12', 'ember-foundry', 'canopy-ruins'];
  for (const mapId of maps) {
    await page.goto('/');
    await page.locator('#play-button').click();
    await page.locator('#arena-selector-button').click();
    await page.locator(`[data-map-id="${mapId}"]`).click();
    await page.locator('#settings-button').click();
    await page.locator('[data-quality="high"]').click();
    await page.locator('#settings-modal .modal-close').click();
    await page.locator('#deploy-button').click();
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('#hud')).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    const screenshotPath = `docs/screenshots/phase-6-${mapId}-${testInfo.project.name}.png`;
    if (!existsSync(screenshotPath))
      await page.screenshot({ path: screenshotPath, fullPage: true });
  }
});
