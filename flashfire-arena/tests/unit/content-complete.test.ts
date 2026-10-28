import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MAP_AMBIENCE } from '../../src/content/audio';
import { MAP_IDS, MAP_UNLOCK_RANK } from '../../src/content/maps';
import { applyMatchReward, createDefaultSave } from '../../src/persistence/SaveRepository';
import { objectsInLayer, type TiledMapData } from '../../src/systems/MapSystem';

describe('content complete maps', () => {
  it('ships eight maps with ambience and obtainable unlock requirements', () => {
    expect(MAP_IDS).toHaveLength(8);
    expect(Object.keys(MAP_AMBIENCE)).toHaveLength(8);
    expect(MAP_UNLOCK_RANK).toEqual({
      'frost-relay': 3,
      'neon-underpass': 5,
      'sky-fortress': 8,
      'blacksite-zero': 12,
    });
    const rewarded = applyMatchReward(createDefaultSave(), {
      modeId: 'survival',
      weaponId: 'ak117',
      victory: true,
      eliminations: 1000,
      score: 1000,
      difficultyMultiplier: 2.2,
    });
    expect(rewarded.profile.rank).toBeGreaterThanOrEqual(12);
    expect(rewarded.unlocks.maps).toEqual(expect.arrayContaining(MAP_IDS));
  });

  it.each([
    ['frost-relay', ['ice'], ['moving']],
    ['neon-underpass', ['train'], ['service-door']],
    ['sky-fortress', ['wind', 'kill'], ['moving']],
    ['blacksite-zero', ['laser'], ['service-door']],
  ] as const)('%s encodes its launch mechanics', (mapId, hazards, platforms) => {
    const data = JSON.parse(
      readFileSync(resolve(`public/assets/maps/${mapId}.json`), 'utf8'),
    ) as TiledMapData;
    expect(objectsInLayer(data, 'hazards').map((object) => object.type)).toEqual(
      expect.arrayContaining([...hazards]),
    );
    expect(objectsInLayer(data, 'one_way_platforms').map((object) => object.type)).toEqual(
      expect.arrayContaining([...platforms]),
    );
    expect(objectsInLayer(data, 'objectives').length).toBeGreaterThanOrEqual(3);
  });
});
