import type { ModeId, WeaponId } from '../core/types/gameplay';

export interface ModeDefinition {
  id: ModeId;
  displayName: string;
  description: string;
  durationSeconds: number | null;
  scoreLimit: number | null;
}

export const GUN_LADDER: WeaponId[] = [
  'm9',
  'vector9',
  'ak117',
  'ak47',
  'ironclad',
  'b4rpd',
  'arc',
  'longbow',
  'hydra',
];

export const MODES: Record<ModeId, ModeDefinition> = {
  'quick-deathmatch': {
    id: 'quick-deathmatch',
    displayName: 'Quick Deathmatch',
    description: 'First to 12 eliminations',
    durationSeconds: 180,
    scoreLimit: 12,
  },
  'team-deathmatch': {
    id: 'team-deathmatch',
    displayName: 'Team Deathmatch',
    description: '3v3, first team to 30',
    durationSeconds: 360,
    scoreLimit: 30,
  },
  survival: {
    id: 'survival',
    displayName: 'Survival',
    description: 'Escalating enemy waves',
    durationSeconds: null,
    scoreLimit: null,
  },
  'gun-ladder': {
    id: 'gun-ladder',
    displayName: 'Gun Ladder',
    description: 'Advance every two eliminations',
    durationSeconds: 420,
    scoreLimit: GUN_LADDER.length * 2,
  },
  'control-point': {
    id: 'control-point',
    displayName: 'Control Point',
    description: 'Hold the moving objective',
    durationSeconds: 420,
    scoreLimit: 100,
  },
  'training-range': {
    id: 'training-range',
    displayName: 'Training Range',
    description: 'Untimed weapon metrics',
    durationSeconds: null,
    scoreLimit: null,
  },
};

export const MODE_IDS = Object.keys(MODES) as ModeId[];
