export type InputAction =
  | 'moveLeft'
  | 'moveRight'
  | 'jet'
  | 'drop'
  | 'aim'
  | 'fire'
  | 'reload'
  | 'throwGrenade'
  | 'switchPrimary'
  | 'switchSecondary'
  | 'pause';

export interface InputSnapshot {
  moveX: number;
  wantsJet: boolean;
  wantsDrop: boolean;
  aimX: number;
  aimY: number;
  firing: boolean;
  grenade: boolean;
}
