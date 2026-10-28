import type { ActorId, PickupId, WeaponId } from '../types/gameplay';

export interface GameEventMap {
  'match:started': { at: number };
  'match:ended': { victory: boolean; playerScore: number; enemyScore: number };
  'match:paused': { paused: boolean };
  'actor:damaged': { actorId: ActorId; amount: number; sourceId: ActorId };
  'actor:eliminated': { actorId: ActorId; sourceId: ActorId };
  'weapon:fired': { actorId: ActorId; weaponId: WeaponId };
  'weapon:reloaded': { actorId: ActorId; weaponId: WeaponId };
  'weapon:switched': { actorId: ActorId; weaponId: WeaponId };
  'grenade:thrown': { actorId: ActorId };
  'pickup:collected': { pickupId: PickupId; actorId: ActorId };
}
