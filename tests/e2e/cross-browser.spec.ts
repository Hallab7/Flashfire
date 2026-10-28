import { expect, test } from '@playwright/test';

test('@cross-browser fresh profile loads and deploys', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  if (testInfo.project.name === 'ios-webkit-cross-browser')
    await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expect(page).toHaveTitle('Flashfire');
  await page.locator('#play-button').click();
  await page.locator('#deploy-button').click();
  await expect(page.locator('#hud')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
