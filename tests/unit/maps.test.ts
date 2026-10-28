import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MAPS, MAP_IDS } from '../../src/content/maps';
import {
  objectsInLayer,
  hazardAffectsActor,
  PLAYER_ONLY_DAMAGE_HAZARDS,
  pickupPlacements,
  spawnPoints,
  validateMapData,
  type TiledMapData,
} from '../../src/systems/MapSystem';

describe('map content pipeline', () => {
  const root = resolve(import.meta.dirname, '../..');

  MAP_IDS.forEach((mapId) => {
    it(`validates ${mapId}`, () => {
      const path = resolve(root, `public/assets/maps/${mapId}.json`);
      const data = JSON.parse(readFileSync(path, 'utf8')) as TiledMapData;
      expect(validateMapData(data)).toEqual([]);
      expect(spawnPoints(data).length).toBeGreaterThanOrEqual(4);
      expect(objectsInLayer(data, 'navigation_nodes').length).toBeGreaterThanOrEqual(4);
      expect(pickupPlacements(data).length).toBeGreaterThan(0);
      expect(MAPS[mapId].worldBounds.width).toBe(data.width * data.tilewidth);
      expect(MAPS[mapId].worldBounds.height).toBe(data.height * data.tileheight);
    });
  });

  it('rejects a missing required layer', () => {
    const data = JSON.parse(
      readFileSync(resolve(root, 'public/assets/maps/outpost-kilo.json'), 'utf8'),
    ) as TiledMapData;
    data.layers = data.layers.filter((layer) => layer.name !== 'hazards');
    expect(validateMapData(data)).toContain('Missing required layer: hazards');
  });

  it('keeps every damaging map hazard player-only', () => {
    expect(PLAYER_ONLY_DAMAGE_HAZARDS).toEqual(['kill', 'train', 'laser', 'vent']);
    PLAYER_ONLY_DAMAGE_HAZARDS.forEach((hazardType) => {
      expect(hazardAffectsActor(hazardType, true)).toBe(true);
      expect(hazardAffectsActor(hazardType, false)).toBe(false);
    });
    ['conveyor', 'ice', 'wind'].forEach((hazardType) => {
      expect(hazardAffectsActor(hazardType, false)).toBe(true);
    });
  });
});
