import Phaser from 'phaser';
import type { BotBehavior } from '../ai/BotBrain';
import { SeededRandom } from '../core/math/seededRandom';
import { WEAPONS, WEAPON_IDS } from '../content/weapons';
import type { ActorId, GrenadeId, InventoryState, TeamId, WeaponId } from '../core/types/gameplay';

export interface ActorRuntime {
  id: ActorId;
  teamId: TeamId;
  actorName: string;
  isPlayer: boolean;
  alive: boolean;
  health: number;
  armor: number;
  fuel: number;
  weaponId: WeaponId;
  weaponSlots: WeaponId[];
  ammo: InventoryState;
  lastShotAt: number;
  reloadToken: number;
  reloading: boolean;
  grenadeReadyAt: number;
  grenadeId: GrenadeId;
  grenades: number;
  aimAngle: number;
  shotHeat: number;
  jetActive: boolean;
  accuracy: number;
  nextDecisionAt: number;
  moveDirection: number;
  jumpBias: number;
  behavior: BotBehavior;
  lastSeenAt: number;
  lastKnownTargetX: number;
  lastKnownTargetY: number;
  reactionReadyAt: number;
  random: SeededRandom;
  debugTag?: Phaser.GameObjects.Text;
  gun: Phaser.GameObjects.Image;
  nameTag: Phaser.GameObjects.Text;
}

export type ActorSprite = Phaser.Physics.Arcade.Sprite & ActorRuntime;

let nextActorId = 1;

export function createInventory(isPlayer: boolean): InventoryState {
  return Object.fromEntries(
    WEAPON_IDS.map((weaponId) => [
      weaponId,
      {
        mag: WEAPONS[weaponId].magazineSize,
        reserve: isPlayer ? WEAPONS[weaponId].reserveAmmo : 999,
      },
    ]),
  ) as InventoryState;
}

export function actorId(): ActorId {
  const id = `actor-${nextActorId}` as ActorId;
  nextActorId += 1;
  return id;
}
