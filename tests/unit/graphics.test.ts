import { describe, expect, it } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  GRAPHICS_PROFILES,
  mapWeather,
  resolveGraphicsQuality,
} from '../../src/systems/GraphicsSystem';

describe('graphics profiles', () => {
  it('honors an explicit quality selection', () => {
    expect(resolveGraphicsQuality('low', { hardwareConcurrency: 16, deviceMemory: 16 })).toBe(
      'low',
    );
  });

  it('selects low for constrained touch devices', () => {
    expect(
      resolveGraphicsQuality('auto', {
        hardwareConcurrency: 4,
        deviceMemory: 4,
        coarsePointer: true,
      }),
    ).toBe('low');
  });

  it('selects high for capable desktop devices', () => {
    expect(resolveGraphicsQuality('auto', { hardwareConcurrency: 12, deviceMemory: 16 })).toBe(
      'high',
    );
  });

  it('keeps low particle and weather budgets below high', () => {
    expect(GRAPHICS_PROFILES.low.particleMultiplier).toBeLessThan(
      GRAPHICS_PROFILES.high.particleMultiplier,
    );
    expect(GRAPHICS_PROFILES.low.weatherFrequency).toBeGreaterThan(
      GRAPHICS_PROFILES.high.weatherFrequency,
    );
  });

  it('provides distinct weather profiles for the first four maps', () => {
    const tints = ['outpost-kilo', 'drydock-12', 'ember-foundry', 'canopy-ruins'].map(
      (id) => mapWeather(id as Parameters<typeof mapWeather>[0]).tint,
    );
    expect(new Set(tints).size).toBe(4);
  });

  it('ships production backdrops and six-frame character sheets', () => {
    for (const mapId of ['outpost-kilo', 'drydock-12', 'ember-foundry', 'canopy-ruins']) {
      expect(statSync(resolve(`public/assets/maps/${mapId}-background.jpg`)).size).toBeGreaterThan(
        50_000,
      );
    }
    for (const actor of [
      'ranger',
      'raider-coral',
      'raider-gold',
      'raider-green',
      'raider-violet',
    ]) {
      const png = readFileSync(resolve(`public/assets/${actor}-sheet.png`));
      expect(png.readUInt32BE(16)).toBe(576);
      expect(png.readUInt32BE(20)).toBe(96);
    }
  });
});
