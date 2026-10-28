import Phaser from 'phaser';
import type { ActorSprite } from './Actor';
import type { ProjectileId, WeaponId } from '../core/types/gameplay';

export interface ProjectileRuntime {
  projectileId: ProjectileId;
  owner: ActorSprite;
  damage: number;
  expireAt: number;
  weaponId: WeaponId;
  originX: number;
  originY: number;
}

export type ProjectileSprite = Phaser.Physics.Arcade.Sprite & ProjectileRuntime;
