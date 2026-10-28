import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';

test('remaining production maps load and play at every target viewport', async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const maps = ['frost-relay', 'neon-underpass', 'sky-fortress', 'blacksite-zero'];
  await page.goto('/');
  await page.evaluate(() => {
    const raw = localStorage.getItem('flashfire.save');
    if (!raw) throw new Error('Expected the default Flashfire save');
    const save = JSON.parse(raw) as { profile: { rank: number }; unlocks: { maps: string[] } };
    save.profile.rank = 30;
    save.unlocks.maps = [
      'outpost-kilo',
      'drydock-12',
      'ember-foundry',
      'canopy-ruins',
      'frost-relay',
      'neon-underpass',
      'sky-fortress',
      'blacksite-zero',
    ];
    localStorage.setItem('flashfire.save', JSON.stringify(save));
  });

  for (const mapId of maps) {
    await page.goto('/');
    await page.locator('#play-button').click();
    await page.locator('#arena-selector-button').click();
    const mapButton = page.locator(`[data-map-id="${mapId}"]`);
    await expect(mapButton).toBeEnabled();
    await mapButton.click();
    await page.locator('#deploy-button').click();
    await expect(page.locator('#hud')).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(650);
    const screenshotPath = `docs/screenshots/phase-7-${mapId}-${testInfo.project.name}.png`;
    if (!existsSync(screenshotPath))
      await page.screenshot({ path: screenshotPath, fullPage: true });
  }
});
