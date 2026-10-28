import type { DifficultyDefinition } from '../content/difficulties';
import { SeededRandom } from '../core/math/seededRandom';
import { reactionDelay } from './BotBrain';

export interface DifficultyMetrics {
  averageReactionMs: number;
  accuracyScore: number;
  grenadesPerMinute: number;
}

export function simulateDifficulty(
  definition: DifficultyDefinition,
  matches = 100,
): DifficultyMetrics {
  let reactionTotal = 0;
  let grenadeTotal = 0;
  for (let match = 0; match < matches; match += 1) {
    const random = new SeededRandom(match + 1);
    reactionTotal += reactionDelay(definition, random.next());
    for (let opportunity = 0; opportunity < 20; opportunity += 1) {
      if (random.chance(definition.grenadeProbability)) grenadeTotal += 1;
    }
  }
  return {
    averageReactionMs: reactionTotal / matches,
    accuracyScore: definition.aimTrackingSpeed / definition.aimErrorDeg,
    grenadesPerMinute: (grenadeTotal / matches) * 3,
  };
}
