import Phaser from 'phaser';
import { ArenaScene, WORLD_HEIGHT, WORLD_WIDTH } from '../scenes/ArenaScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'game',
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
  backgroundColor: '#07161d',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 860 }, debug: false },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
  },
  render: { antialias: true, roundPixels: false },
  input: { gamepad: true },
  scene: [ArenaScene],
};
