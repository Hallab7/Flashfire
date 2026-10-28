const LETTER_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const KEY_BINDING_CHOICES: readonly string[] = [
  ...LETTER_KEYS,
  'SPACE',
  'SHIFT',
  'ESC',
  'ARROWLEFT',
  'ARROWRIGHT',
  'ARROWUP',
  'ARROWDOWN',
];

const PHASER_KEY_NAMES: Record<string, string> = {
  ARROWLEFT: 'LEFT',
  ARROWRIGHT: 'RIGHT',
  ARROWUP: 'UP',
  ARROWDOWN: 'DOWN',
};

export function toPhaserKeyName(binding: string): string {
  return PHASER_KEY_NAMES[binding] ?? binding;
}
