import { describe, expect, it } from 'vitest';
import { GRENADES } from '../../src/content/grenades';
import { theoreticalTimeToKill, WEAPONS, WEAPON_IDS } from '../../src/content/weapons';
import {
  applyBulletDamage,
  damageAtDistance,
  hitRegionForOffset,
} from '../../src/systems/DamageSystem';

describe('launch arsenal', () => {
  it('defines every launch gun with valid ammunition and cadence', () => {
    expect(WEAPON_IDS).toHaveLength(11);
    WEAPON_IDS.forEach((id) => {
      const weapon = WEAPONS[id];
      expect(weapon.magazineSize).toBeGreaterThan(0);
      expect(weapon.reserveAmmo).toBeGreaterThanOrEqual(weapon.magazineSize);
      expect(weapon.cadenceMs).toBeGreaterThan(0);
      expect(theoreticalTimeToKill(weapon)).toBeGreaterThanOrEqual(0);
    });
  });

  it('applies linear range falloff', () => {
    const weapon = WEAPONS.ak47;
    expect(damageAtDistance(weapon, weapon.falloffStart)).toBe(weapon.damage);
    expect(damageAtDistance(weapon, weapon.falloffEnd)).toBeCloseTo(
      weapon.damage * weapon.minimumDamageMultiplier,
    );
    expect(damageAtDistance(weapon, (weapon.falloffStart + weapon.falloffEnd) / 2)).toBeLessThan(
      weapon.damage,
    );
  });

  it('applies body regions and armor absorption', () => {
    const headshot = applyBulletDamage(100, 0, WEAPONS.longbow, 200, 'head');
    expect(headshot.health).toBe(0);
    const armored = applyBulletDamage(100, 50, WEAPONS.ak47, 200, 'torso');
    expect(armored.armor).toBeLessThan(50);
    expect(armored.health).toBeGreaterThan(73);
    expect(hitRegionForOffset(5)).toBe('head');
    expect(hitRegionForOffset(70)).toBe('legs');
  });

  it('defines all four grenade types', () => {
    expect(Object.keys(GRENADES)).toEqual(['frag', 'sticky', 'shock', 'smoke']);
    expect(GRENADES.frag.centerDamage).toBeGreaterThan(GRENADES.shock.centerDamage);
    expect(GRENADES.smoke.centerDamage).toBe(0);
  });
});
