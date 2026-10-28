export type ActorId = string & { readonly __brand: 'ActorId' };
export type ProjectileId = string & { readonly __brand: 'ProjectileId' };
export type PickupId = string & { readonly __brand: 'PickupId' };
export type TeamId = 'ranger' | 'raiders';
export type WeaponId =
  | 'm9'
  | 'viper'
  | 'ak47'
  | 'ak117'
  | 'falcon'
  | 'vector9'
  | 'b4rpd'
  | 'ironclad'
  | 'longbow'
  | 'arc'
  | 'hydra';
export type GrenadeId = 'frag' | 'sticky' | 'shock' | 'smoke';
export type HitRegion = 'head' | 'torso' | 'arms' | 'legs';
export type DifficultyId = 'recruit' | 'regular' | 'veteran' | 'elite' | 'flashpoint';
export type MapId =
  | 'outpost-kilo'
  | 'drydock-12'
  | 'ember-foundry'
  | 'canopy-ruins'
  | 'frost-relay'
  | 'neon-underpass'
  | 'sky-fortress'
  | 'blacksite-zero';
export type ModeId =
  | 'quick-deathmatch'
  | 'team-deathmatch'
  | 'survival'
  | 'gun-ladder'
  | 'control-point'
  | 'training-range';
export type PerkId = 'light-frame' | 'fuel-recycler' | 'quick-hands' | 'blast-lining';
export type GraphicsQuality = 'auto' | 'low' | 'medium' | 'high';
export type ColorVisionMode = 'default' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export interface KeyBindings {
  left: string;
  right: string;
  jet: string;
  down: string;
  reload: string;
  grenade: string;
  pause: string;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface AmmoState {
  mag: number;
  reserve: number;
}

export type InventoryState = Record<WeaponId, AmmoState>;

export interface ActorState {
  id: ActorId;
  teamId: TeamId;
  position: Vec2;
  velocity: Vec2;
  aimAngle: number;
  facing: -1 | 1;
  health: number;
  armor: number;
  jetFuel: number;
  grounded: boolean;
  alive: boolean;
  activeWeaponId: WeaponId;
  inventory: InventoryState;
  statusEffects: string[];
  lastDamageAt: number;
  respawnAt: number | null;
}

export interface SpawnPoint extends Vec2 {
  id: string;
}

export interface MatchSnapshot {
  playerHealth: number;
  playerArmor: number;
  playerFuel: number;
  playerScore: number;
  enemyScore: number;
  timeLeft: number;
  weaponId: WeaponId;
  weaponSlots: WeaponId[];
  ammo: AmmoState;
  reloading: boolean;
  grenadeId: GrenadeId;
  grenades: number;
  modeLabel: string;
}
