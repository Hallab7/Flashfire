import { expect, test } from '@playwright/test';

test('deployment lobby organizes arena, mode, and settings into focused dialogs', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.locator('#play-button').click();
  await expect(page).toHaveURL(/\/lobby$/);

  await expect(page.locator('#loadout-screen')).toBeVisible();
  await expect(page.locator('#arena-selector-button')).toBeVisible();
  await expect(page.locator('#mode-selector-button')).toBeVisible();
  await expect(page.locator('#settings-button')).toBeVisible();
  await expect(page.locator('#map-options')).toBeHidden();
  await expect(page.locator('#mode-options')).toBeHidden();
  await expect(page.locator('#settings-modal')).toBeHidden();

  const viewport = page.viewportSize();
  const lobbyControls = await page.locator('.lobby-controls').boundingBox();
  expect(viewport).not.toBeNull();
  expect(lobbyControls).not.toBeNull();
  if (viewport && lobbyControls) {
    expect(lobbyControls.x).toBeGreaterThanOrEqual(0);
    expect(lobbyControls.y).toBeGreaterThanOrEqual(0);
    expect(lobbyControls.x + lobbyControls.width).toBeLessThanOrEqual(viewport.width);
    expect(lobbyControls.y + lobbyControls.height).toBeLessThanOrEqual(viewport.height);
  }
  await page.screenshot({
    path: `docs/screenshots/fix-organized-lobby-${testInfo.project.name}.png`,
    fullPage: true,
  });

  await page.locator('#arena-selector-button').click();
  await expect(page.locator('#map-modal')).toBeVisible();
  await expect(page.locator('#map-options [data-map-id]')).toHaveCount(8);
  await page.screenshot({
    path: `docs/screenshots/fix-map-modal-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.locator('#map-modal .modal-close').click();

  await page.locator('#mode-selector-button').click();
  await expect(page.locator('#mode-modal')).toBeVisible();
  await expect(page.locator('#mode-options [data-mode-id]')).toHaveCount(6);
  await page.locator('#mode-modal .modal-close').click();

  await page.locator('#settings-button').click();
  await expect(page.locator('#settings-modal')).toBeVisible();
  await expect(page.locator('[data-difficulty-id="recruit"]')).toHaveClass(/selected/);
  await expect(page.locator('.settings-modal-panel')).toHaveCSS('scrollbar-width', 'none');
  await expect(page.locator('[data-settings-panel="gameplay"]')).toBeVisible();
  await page.locator('[data-settings-tab="access"]').click();
  await expect(page.locator('#color-vision-select')).toBeVisible();
  await expect(page.locator('#binding-options')).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/fix-settings-modal-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test('lobby has a direct route and its back button returns home', async ({ page }) => {
  await page.goto('/lobby');
  await expect(page.locator('#loadout-screen')).toBeVisible();
  await page.locator('#lobby-back-button').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#start-screen')).toBeVisible();
});
