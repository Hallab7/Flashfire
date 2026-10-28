import type { WeaponId } from '../core/types/gameplay';

export const MAX_WEAPON_SLOTS = 2;

export interface WeaponPickupResult {
  slots: WeaponId[];
  activeWeaponId: WeaponId;
  droppedWeaponId?: WeaponId;
}

export function equipPickedWeapon(
  currentSlots: readonly WeaponId[],
  activeWeaponId: WeaponId,
  pickedWeaponId: WeaponId,
): WeaponPickupResult {
  const slots = [...currentSlots].slice(0, MAX_WEAPON_SLOTS);
  if (slots.includes(pickedWeaponId)) return { slots, activeWeaponId: pickedWeaponId };

  if (slots.length < MAX_WEAPON_SLOTS) {
    slots.push(pickedWeaponId);
    return { slots, activeWeaponId: pickedWeaponId };
  }

  const replacedIndex = Math.max(0, slots.indexOf(activeWeaponId));
  const droppedWeaponId = slots[replacedIndex];
  slots[replacedIndex] = pickedWeaponId;
  return { slots, activeWeaponId: pickedWeaponId, droppedWeaponId };
}
