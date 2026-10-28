import type { AmmoState } from '../core/types/gameplay';
import type { WeaponDefinition } from '../content/weapons';

export function canFire(
  ammo: AmmoState,
  reloading: boolean,
  nowMs: number,
  lastShotMs: number,
  weapon: WeaponDefinition,
): boolean {
  return !reloading && ammo.mag > 0 && nowMs >= lastShotMs + weapon.cadenceMs;
}

export function consumeRound(ammo: AmmoState): AmmoState {
  return { ...ammo, mag: Math.max(0, ammo.mag - 1) };
}

export function completeReload(ammo: AmmoState, magazineSize: number): AmmoState {
  const required = Math.max(0, magazineSize - ammo.mag);
  const loaded = Math.min(required, ammo.reserve);
  return { mag: ammo.mag + loaded, reserve: ammo.reserve - loaded };
}
