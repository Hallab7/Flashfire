import { expect, test } from '@playwright/test';

const soakMs = Number(process.env.FLASHFIRE_SOAK_MS ?? 30 * 60 * 1000);
test.skip(!process.env.FLASHFIRE_SOAK, 'Set FLASHFIRE_SOAK=1 to run the 30-minute soak');
test.use({ trace: 'off' });

test('active combat has no uncaught errors during the soak window', async ({ page }) => {
  test.setTimeout(soakMs + 90_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await page.locator('#play-button').click();
  await page.locator('#settings-button').click();
  await page.locator('[data-difficulty-id="flashpoint"]').click();
  await page.locator('#settings-modal .modal-close').click();
  await page.locator('#arena-selector-button').click();
  await page.locator('[data-map-id="ember-foundry"]').click();
  await page.locator('#deploy-button').click();
  await expect(page.locator('#hud')).toBeVisible();

  await page.evaluate(async (duration) => {
    const canvas = document.querySelector('canvas');
    const interval = window.setInterval(() => {
      const result = document.querySelector<HTMLElement>('#result-screen');
      if (result && !result.classList.contains('hidden'))
        document.querySelector<HTMLButtonElement>('#restart-button')?.click();
      canvas?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          clientX: innerWidth * 0.72,
          clientY: innerHeight * 0.45,
          button: 0,
        }),
      );
      window.setTimeout(
        () => canvas?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 })),
        220,
      );
    }, 1200);
    await new Promise((resolve) => window.setTimeout(resolve, duration));
    window.clearInterval(interval);
  }, soakMs);

  expect(errors).toEqual([]);
});
