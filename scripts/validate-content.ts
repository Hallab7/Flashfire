import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MAPS, MAP_IDS } from '../src/content/maps.ts';
import { WEAPONS, WEAPON_IDS } from '../src/content/weapons.ts';

const requiredLayers = [
  'background',
  'decor_far',
  'decor_mid',
  'collision',
  'one_way_platforms',
  'hazards',
  'spawn_points',
  'pickup_points',
  'navigation_nodes',
  'navigation_edges',
  'objectives',
  'foreground',
  'lighting',
];
const errors: string[] = [];

if (new Set(WEAPON_IDS).size !== WEAPON_IDS.length) errors.push('Weapon IDs are duplicated');
for (const weaponId of WEAPON_IDS) {
  const weapon = WEAPONS[weaponId];
  if (
    weapon.damage <= 0 ||
    weapon.cadenceMs <= 0 ||
    weapon.magazineSize <= 0 ||
    weapon.falloffStart < 0
  ) {
    errors.push(`${weaponId}: invalid damage, cadence, ammo, or range`);
  }
  if (!existsSync(resolve(`public/assets/${weapon.spriteKey}.png`)))
    errors.push(`${weaponId}: missing sprite asset`);
}

for (const mapId of MAP_IDS) {
  const path = resolve(`public/assets/maps/${mapId}.json`);
  if (!existsSync(path)) {
    errors.push(`${mapId}: missing map JSON`);
    continue;
  }
  const map = JSON.parse(readFileSync(path, 'utf8')) as {
    width: number;
    height: number;
    tilewidth: number;
    tileheight: number;
    layers: Array<{
      name: string;
      objects?: Array<{ x: number; y: number; width?: number; height?: number }>;
    }>;
  };
  const layers = new Map(map.layers.map((layer) => [layer.name, layer]));
  requiredLayers.forEach((layer) => {
    if (!layers.has(layer)) errors.push(`${mapId}: missing layer ${layer}`);
  });
  const spawns = layers.get('spawn_points')?.objects ?? [];
  const blocked = [
    ...(layers.get('collision')?.objects ?? []),
    ...(layers.get('hazards')?.objects ?? []),
  ];
  spawns.forEach((spawn, index) => {
    if (
      blocked.some(
        (item) =>
          spawn.x > item.x &&
          spawn.x < item.x + (item.width ?? 0) &&
          spawn.y > item.y &&
          spawn.y < item.y + (item.height ?? 0),
      )
    ) {
      errors.push(`${mapId}: spawn ${index} is inside collision or a hazard`);
    }
  });
  if (MAPS[mapId].supportedModes.length < 1) errors.push(`${mapId}: supports no modes`);
  if (
    MAPS[mapId].worldBounds.width !== map.width * map.tilewidth ||
    MAPS[mapId].worldBounds.height !== map.height * map.tileheight
  ) {
    errors.push(`${mapId}: world bounds do not match map dimensions`);
  }
  if (!existsSync(resolve(`public/assets/maps/${mapId}-background.jpg`)))
    errors.push(`${mapId}: missing production background`);
}

if (errors.length > 0) {
  errors.forEach((error) => process.stderr.write(`${error}\n`));
  process.exit(1);
}
process.stdout.write(`Validated ${WEAPON_IDS.length} weapons and ${MAP_IDS.length} maps.\n`);
