import type { DifficultyDefinition } from '../content/difficulties';
import type { WeaponDefinition } from '../content/weapons';
import type { Vec2 } from '../core/types/gameplay';

export type BotBehavior =
  'patrol' | 'engage' | 'reposition' | 'evade' | 'seekHealth' | 'retreat' | 'search';

export interface BotDecisionContext {
  health: number;
  targetVisible: boolean;
  targetDistance: number;
  lastKnownTarget: Vec2 | null;
  hasNearbyHealth: boolean;
  underThreat: boolean;
}

export function chooseBehavior(
  context: BotDecisionContext,
  difficulty: DifficultyDefinition,
  weapon: WeaponDefinition,
): BotBehavior {
  if (context.health <= difficulty.retreatHealthThreshold && context.hasNearbyHealth)
    return 'seekHealth';
  if (context.health <= difficulty.retreatHealthThreshold) return 'retreat';
  if (!context.targetVisible) return context.lastKnownTarget ? 'search' : 'patrol';
  if (context.underThreat && context.targetDistance < 220) return 'evade';
  const preferred =
    weapon.category === 'shotgun' || weapon.category === 'smg'
      ? 230
      : weapon.category === 'sniper'
        ? 720
        : 430;
  if (Math.abs(context.targetDistance - preferred) > 180) return 'reposition';
  return 'engage';
}

export function reactionDelay(definition: DifficultyDefinition, random: number): number {
  const [minimum, maximum] = definition.botReactionMs;
  return Math.round(minimum + (maximum - minimum) * random);
}
