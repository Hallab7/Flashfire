import { describe, expect, it } from 'vitest';
import { equipPickedWeapon, MAX_WEAPON_SLOTS } from '../../src/systems/WeaponInventorySystem';

describe('two-slot weapon inventory', () => {
  it('adds a second weapon and equips it', () => {
    expect(equipPickedWeapon(['m9'], 'm9', 'ak47')).toEqual({
      slots: ['m9', 'ak47'],
      activeWeaponId: 'ak47',
    });
  });

  it('replaces and drops the active weapon when both slots are full', () => {
    const result = equipPickedWeapon(['m9', 'ak47'], 'ak47', 'hydra');
    expect(result).toEqual({
      slots: ['m9', 'hydra'],
      activeWeaponId: 'hydra',
      droppedWeaponId: 'ak47',
    });
    expect(result.slots).toHaveLength(MAX_WEAPON_SLOTS);
  });

  it('refills and equips an already owned weapon without creating a drop', () => {
    expect(equipPickedWeapon(['m9', 'ak47'], 'm9', 'ak47')).toEqual({
      slots: ['m9', 'ak47'],
      activeWeaponId: 'ak47',
    });
  });
});
