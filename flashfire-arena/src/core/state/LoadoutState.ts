import type { GrenadeId } from '../types/gameplay';

export interface LoadoutSelection {
  grenade: GrenadeId;
}

const loadout: LoadoutSelection = {
  grenade: 'frag',
};

export function getLoadout(): LoadoutSelection {
  return { ...loadout };
}

export function setGrenade(grenade: GrenadeId): void {
  loadout.grenade = grenade;
}
