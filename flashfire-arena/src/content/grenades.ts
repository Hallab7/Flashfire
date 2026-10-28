import type { GrenadeId } from '../core/types/gameplay';

export interface GrenadeDefinition {
  id: GrenadeId;
  displayName: string;
  maximumCarried: number;
  fuseMs: number;
  centerDamage: number;
  radius: number;
  color: number;
}

export const GRENADES: Record<GrenadeId, GrenadeDefinition> = {
  frag: {
    id: 'frag',
    displayName: 'FRAG',
    maximumCarried: 3,
    fuseMs: 1000,
    centerDamage: 85,
    radius: 155,
    color: 0xf2b84f,
  },
  sticky: {
    id: 'sticky',
    displayName: 'STICKY',
    maximumCarried: 2,
    fuseMs: 1400,
    centerDamage: 70,
    radius: 125,
    color: 0xef705c,
  },
  shock: {
    id: 'shock',
    displayName: 'SHOCK',
    maximumCarried: 2,
    fuseMs: 900,
    centerDamage: 25,
    radius: 170,
    color: 0x59d9ef,
  },
  smoke: {
    id: 'smoke',
    displayName: 'SMOKE',
    maximumCarried: 2,
    fuseMs: 600,
    centerDamage: 0,
    radius: 210,
    color: 0xa6b8ad,
  },
};
