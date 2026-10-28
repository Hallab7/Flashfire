import type { MapId, ModeId } from '../core/types/gameplay';

const ALL_MAP_MODES: ModeId[] = [
  'quick-deathmatch',
  'team-deathmatch',
  'survival',
  'gun-ladder',
  'control-point',
  'training-range',
];

export interface MapDefinition {
  id: MapId;
  displayName: string;
  tilemapKey: string;
  jsonPath: string;
  previewPath: string;
  worldBounds: { width: number; height: number };
  palette: { tint: number; haze: number; accent: string };
  mechanic: string;
  ambience: string;
  supportedModes: ModeId[];
}

export const MAPS: Record<MapId, MapDefinition> = {
  'outpost-kilo': {
    id: 'outpost-kilo',
    displayName: 'OUTPOST KILO',
    tilemapKey: 'map-outpost-kilo',
    jsonPath: '/assets/maps/outpost-kilo.json',
    previewPath: '/assets/maps/outpost-kilo-preview.png',
    worldBounds: { width: 1600, height: 900 },
    palette: { tint: 0xffffff, haze: 0x173b3d, accent: '#6cddc8' },
    mechanic: 'Balanced vertical routes',
    ambience: 'Coastal jungle',
    supportedModes: [...ALL_MAP_MODES],
  },
  'drydock-12': {
    id: 'drydock-12',
    displayName: 'DRYDOCK 12',
    tilemapKey: 'map-drydock-12',
    jsonPath: '/assets/maps/drydock-12.json',
    previewPath: '/assets/maps/drydock-12-preview.png',
    worldBounds: { width: 1920, height: 960 },
    palette: { tint: 0x7894a8, haze: 0x172b42, accent: '#f2c15a' },
    mechanic: 'Moving cargo and water',
    ambience: 'Storm shipyard',
    supportedModes: [...ALL_MAP_MODES],
  },
  'ember-foundry': {
    id: 'ember-foundry',
    displayName: 'EMBER FOUNDRY',
    tilemapKey: 'map-ember-foundry',
    jsonPath: '/assets/maps/ember-foundry.json',
    previewPath: '/assets/maps/ember-foundry-preview.png',
    worldBounds: { width: 1760, height: 960 },
    palette: { tint: 0xc47a5f, haze: 0x4a211c, accent: '#ff8a54' },
    mechanic: 'Heat vents and conveyors',
    ambience: 'Industrial furnace',
    supportedModes: [...ALL_MAP_MODES],
  },
  'canopy-ruins': {
    id: 'canopy-ruins',
    displayName: 'CANOPY RUINS',
    tilemapKey: 'map-canopy-ruins',
    jsonPath: '/assets/maps/canopy-ruins.json',
    previewPath: '/assets/maps/canopy-ruins-preview.png',
    worldBounds: { width: 1880, height: 1120 },
    palette: { tint: 0x8eb889, haze: 0x173c30, accent: '#72dfc8' },
    mechanic: 'Breakable bridges and vertical routes',
    ambience: 'Overgrown research site',
    supportedModes: [...ALL_MAP_MODES],
  },
  'frost-relay': {
    id: 'frost-relay',
    displayName: 'FROST RELAY',
    tilemapKey: 'map-frost-relay',
    jsonPath: '/assets/maps/frost-relay.json',
    previewPath: '/assets/maps/frost-relay-preview.png',
    worldBounds: { width: 1920, height: 1088 },
    palette: { tint: 0xc7e8f2, haze: 0x29485b, accent: '#b7efff' },
    mechanic: 'Ice lanes and whiteout cycles',
    ambience: 'Polar relay storm',
    supportedModes: [...ALL_MAP_MODES],
  },
  'neon-underpass': {
    id: 'neon-underpass',
    displayName: 'NEON UNDERPASS',
    tilemapKey: 'map-neon-underpass',
    jsonPath: '/assets/maps/neon-underpass.json',
    previewPath: '/assets/maps/neon-underpass-preview.png',
    worldBounds: { width: 2048, height: 960 },
    palette: { tint: 0xc362ff, haze: 0x281747, accent: '#ff5ccf' },
    mechanic: 'Passing trains and service doors',
    ambience: 'Electric transit tunnel',
    supportedModes: [...ALL_MAP_MODES],
  },
  'sky-fortress': {
    id: 'sky-fortress',
    displayName: 'SKY FORTRESS',
    tilemapKey: 'map-sky-fortress',
    jsonPath: '/assets/maps/sky-fortress.json',
    previewPath: '/assets/maps/sky-fortress-preview.png',
    worldBounds: { width: 1800, height: 1200 },
    palette: { tint: 0xcbefff, haze: 0x496d83, accent: '#ffe08a' },
    mechanic: 'Wind, low gravity, and lifts',
    ambience: 'High-altitude carrier',
    supportedModes: [...ALL_MAP_MODES],
  },
  'blacksite-zero': {
    id: 'blacksite-zero',
    displayName: 'BLACKSITE ZERO',
    tilemapKey: 'map-blacksite-zero',
    jsonPath: '/assets/maps/blacksite-zero.json',
    previewPath: '/assets/maps/blacksite-zero-preview.png',
    worldBounds: { width: 1920, height: 960 },
    palette: { tint: 0x9ca7ad, haze: 0x171d23, accent: '#ff625e' },
    mechanic: 'Security doors and rotating lasers',
    ambience: 'Subterranean facility',
    supportedModes: [...ALL_MAP_MODES],
  },
};

export const MAP_IDS = Object.keys(MAPS) as MapId[];

export const MAP_UNLOCK_RANK: Partial<Record<MapId, number>> = {
  'frost-relay': 3,
  'neon-underpass': 5,
  'sky-fortress': 8,
  'blacksite-zero': 12,
};
