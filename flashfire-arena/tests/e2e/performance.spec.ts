import { expect, test } from '@playwright/test';

test.skip(!process.env.FLASHFIRE_PERF, 'Set FLASHFIRE_PERF=1 to run the 60-second trace');
test.use({ trace: 'off' });

test('records a 60-second active match performance trace', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.goto('/');
  await page.locator('#play-button').click();
  await page.locator('#settings-button').click();
  await page.locator('[data-quality="low"]').click();
  await page.locator('[data-difficulty-id="flashpoint"]').click();
  await page.locator('#settings-modal .modal-close').click();
  await page.locator('#arena-selector-button').click();
  await page.locator('[data-map-id="drydock-12"]').click();
  await page.locator('#deploy-button').click();
  await expect(page.locator('#hud')).toBeVisible();
  await page.waitForTimeout(3000);

  const metrics = await page.evaluate(async () => {
    const samples: number[] = [];
    const memorySamples: number[] = [];
    const drawCallSamples: number[] = [];
    const activeObjectSamples: number[] = [];
    for (let second = 0; second < 60; second += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 1000));
      const game = window.__flashfireGame;
      const fps = game?.loop.actualFps;
      if (fps && Number.isFinite(fps)) samples.push(fps);
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      if (memory) memorySamples.push(memory.usedJSHeapSize / 1024 / 1024);
      const renderer = game?.renderer as { drawCount?: number } | undefined;
      const drawCount = renderer?.drawCount;
      if (typeof drawCount === 'number' && Number.isFinite(drawCount))
        drawCallSamples.push(drawCount);
      const scene = game?.scene.getScene('arena');
      if (scene)
        activeObjectSamples.push(scene.children.list.filter((child) => child.active).length);
    }
    const sorted = [...samples].sort((left, right) => left - right);
    return {
      samples: samples.length,
      averageFps: samples.reduce((sum, value) => sum + value, 0) / Math.max(1, samples.length),
      minimumFps: Math.min(...samples),
      onePercentLowFps: sorted[Math.floor(sorted.length * 0.01)] ?? 0,
      peakHeapMb: memorySamples.length > 0 ? Math.max(...memorySamples) : null,
      peakDrawCalls: drawCallSamples.length > 0 ? Math.max(...drawCallSamples) : null,
      peakActiveObjects: activeObjectSamples.length > 0 ? Math.max(...activeObjectSamples) : null,
    };
  });

  await testInfo.attach('performance-metrics', {
    body: JSON.stringify(metrics, null, 2),
    contentType: 'application/json',
  });
  process.stdout.write(`${testInfo.project.name}: ${JSON.stringify(metrics)}\n`);
  expect(metrics.samples).toBeGreaterThanOrEqual(55);
  expect(metrics.averageFps).toBeGreaterThan(testInfo.project.name.startsWith('mobile') ? 45 : 55);
});
