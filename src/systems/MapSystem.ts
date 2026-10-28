import type { SpawnPoint, WeaponId } from '../core/types/gameplay';

export const REQUIRED_MAP_LAYERS = [
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
] as const;

export const PLAYER_ONLY_DAMAGE_HAZARDS = ['kill', 'train', 'laser', 'vent'] as const;
const playerOnlyDamageHazards = new Set<string>(PLAYER_ONLY_DAMAGE_HAZARDS);

export function hazardAffectsActor(hazardType: string, isPlayer: boolean): boolean {
  return isPlayer || !playerOnlyDamageHazards.has(hazardType);
}

export interface TiledProperty {
  name: string;
  type: string;
  value: string | number | boolean;
}

export interface TiledObject {
  id: number;
  name?: string;
  type?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  point?: boolean;
  properties?: TiledProperty[];
}

export interface TiledLayer {
  id: number;
  name: string;
  type: 'objectgroup' | 'tilelayer';
  objects?: TiledObject[];
  data?: number[];
}

export interface TiledMapData {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
}

export function validateMapData(data: TiledMapData): string[] {
  const names = new Set(data.layers.map((layer) => layer.name));
  const errors = REQUIRED_MAP_LAYERS.filter((name) => !names.has(name)).map(
    (name) => `Missing required layer: ${name}`,
  );
  const spawns = objectsInLayer(data, 'spawn_points');
  if (spawns.length < 4) errors.push('Map requires at least four spawn points');
  const navigation = objectsInLayer(data, 'navigation_nodes');
  if (navigation.length < 4) errors.push('Map requires at least four navigation nodes');
  const blocked = [...objectsInLayer(data, 'collision'), ...objectsInLayer(data, 'hazards')];
  spawns.forEach((spawn) => {
    const insideBlocked = blocked.some(
      (object) =>
        spawn.x > object.x &&
        spawn.x < object.x + (object.width ?? 0) &&
        spawn.y > object.y &&
        spawn.y < object.y + (object.height ?? 0),
    );
    if (insideBlocked)
      errors.push(`Spawn ${spawn.name ?? spawn.id} is inside collision or a hazard`);
  });
  return errors;
}

export function objectsInLayer(data: TiledMapData, name: string): TiledObject[] {
  return data.layers.find((layer) => layer.name === name)?.objects ?? [];
}

export function property<T extends string | number | boolean>(
  object: TiledObject,
  name: string,
  fallback: T,
): T {
  return (
    (object.properties?.find((entry) => entry.name === name)?.value as T | undefined) ?? fallback
  );
}

export function spawnPoints(data: TiledMapData): SpawnPoint[] {
  return objectsInLayer(data, 'spawn_points').map((object) => ({
    id: object.name ?? `spawn-${object.id}`,
    x: object.x,
    y: object.y,
  }));
}

export interface PickupPlacement {
  x: number;
  y: number;
  type: string;
  value?: WeaponId;
}

export function pickupPlacements(data: TiledMapData): PickupPlacement[] {
  return objectsInLayer(data, 'pickup_points').map((object) => ({
    x: object.x,
    y: object.y,
    type: property(object, 'pickupType', 'health'),
    value: (property(object, 'weaponId', '') as WeaponId) || undefined,
  }));
}
