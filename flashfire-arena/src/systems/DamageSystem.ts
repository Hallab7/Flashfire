import type { HitRegion } from '../core/types/gameplay';
import type { WeaponDefinition } from '../content/weapons';

export const HIT_REGION_MULTIPLIER: Record<HitRegion, number> = {
  head: 1.5,
  torso: 1,
  arms: 0.85,
  legs: 0.8,
};

export interface DamageResult {
  health: number;
  armor: number;
  appliedToHealth: number;
  appliedToArmor: number;
}

export function applyDamage(health: number, amount: number): number {
  if (!Number.isFinite(amount) || amount < 0)
    throw new Error('Damage must be a finite positive value');
  return Math.max(0, health - amount);
}

export function damageAtDistance(weapon: WeaponDefinition, distance: number): number {
  if (weapon.falloffEnd <= weapon.falloffStart || distance <= weapon.falloffStart)
    return weapon.damage;
  if (distance >= weapon.falloffEnd) return weapon.damage * weapon.minimumDamageMultiplier;
  const progress = (distance - weapon.falloffStart) / (weapon.falloffEnd - weapon.falloffStart);
  return weapon.damage * (1 - progress * (1 - weapon.minimumDamageMultiplier));
}

export function applyBulletDamage(
  health: number,
  armor: number,
  weapon: WeaponDefinition,
  distance: number,
  region: HitRegion,
): DamageResult {
  const total = Math.round(damageAtDistance(weapon, distance) * HIT_REGION_MULTIPLIER[region]);
  const armorShare = Math.min(armor, Math.round(total * 0.65));
  const healthDamage = total - armorShare;
  return {
    health: Math.max(0, health - healthDamage),
    armor: armor - armorShare,
    appliedToHealth: healthDamage,
    appliedToArmor: armorShare,
  };
}

export function radialDamage(centerDamage: number, distance: number, radius: number): number {
  if (distance >= radius || radius <= 0) return 0;
  return Math.max(0, Math.round(centerDamage * (1 - distance / radius)));
}

export function hitRegionForOffset(offsetY: number, actorHeight = 76): HitRegion {
  const normalized = offsetY / actorHeight;
  if (normalized < 0.22) return 'head';
  if (normalized < 0.58) return 'torso';
  if (normalized < 0.78) return 'arms';
  return 'legs';
}
