import { describe, expect, it } from 'vitest';
import { chooseBehavior } from '../../src/ai/BotBrain';
import { hasLineOfSight, lineIntersectsCircle } from '../../src/ai/BotPerception';
import { simulateDifficulty } from '../../src/ai/DifficultySimulation';
import { NavigationGraph } from '../../src/ai/NavigationGraph';
import { DIFFICULTIES, DIFFICULTY_IDS } from '../../src/content/difficulties';
import { getDifficulty } from '../../src/core/state/DifficultyState';
import { WEAPONS } from '../../src/content/weapons';
import { SeededRandom } from '../../src/core/math/seededRandom';

describe('seeded AI', () => {
  it('produces repeatable random sequences', () => {
    const first = new SeededRandom(42);
    const second = new SeededRandom(42);
    expect([first.next(), first.next(), first.next()]).toEqual([
      second.next(),
      second.next(),
      second.next(),
    ]);
  });

  it('blocks sight through geometry and smoke', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 };
    expect(hasLineOfSight(start, end, [{ left: 40, right: 60, top: -10, bottom: 10 }], [], 0)).toBe(
      false,
    );
    expect(lineIntersectsCircle(start, end, { x: 50, y: 5 }, 10)).toBe(true);
    expect(hasLineOfSight(start, end, [], [{ x: 50, y: 0, radius: 15, expiresAt: 100 }], 50)).toBe(
      false,
    );
  });

  it('uses health, sight, and weapon range to choose behavior', () => {
    expect(
      chooseBehavior(
        {
          health: 20,
          targetVisible: true,
          targetDistance: 300,
          lastKnownTarget: null,
          hasNearbyHealth: true,
          underThreat: false,
        },
        DIFFICULTIES.regular,
        WEAPONS.ak117,
      ),
    ).toBe('seekHealth');
    expect(
      chooseBehavior(
        {
          health: 100,
          targetVisible: false,
          targetDistance: 300,
          lastKnownTarget: { x: 1, y: 1 },
          hasNearbyHealth: false,
          underThreat: false,
        },
        DIFFICULTIES.regular,
        WEAPONS.ak117,
      ),
    ).toBe('search');
  });

  it('selects navigation neighbors that reduce target distance', () => {
    const graph = new NavigationGraph([
      { id: 'a', x: 0, y: 0, neighbors: ['b'] },
      { id: 'b', x: 100, y: 0, neighbors: ['a', 'c'] },
      { id: 'c', x: 200, y: 0, neighbors: ['b'] },
    ]);
    expect(graph.nextToward({ x: 0, y: 0 }, { x: 200, y: 0 })?.id).toBe('b');
  });
});

describe('difficulty validation', () => {
  it('defaults new sessions to the simplest difficulty', () => {
    expect(getDifficulty()).toBe('recruit');
  });

  it('keeps Recruit and Regular forgiving for beginners', () => {
    expect(DIFFICULTIES.recruit.botReactionMs[0]).toBeGreaterThan(
      DIFFICULTIES.regular.botReactionMs[0],
    );
    expect(DIFFICULTIES.regular.botReactionMs[0]).toBeGreaterThan(
      DIFFICULTIES.veteran.botReactionMs[0],
    );
    expect(DIFFICULTIES.recruit.botHealthMultiplier).toBeLessThan(
      DIFFICULTIES.regular.botHealthMultiplier,
    );
    expect(DIFFICULTIES.regular.botHealthMultiplier).toBeLessThan(1);
    expect(DIFFICULTIES.recruit.botDamageMultiplier).toBeLessThan(
      DIFFICULTIES.regular.botDamageMultiplier,
    );
    expect(DIFFICULTIES.regular.botDamageMultiplier).toBeLessThan(1);
    expect(DIFFICULTIES.recruit.weaponDropCooldownMs[0]).toBeGreaterThan(
      DIFFICULTIES.regular.weaponDropCooldownMs[0],
    );
    expect(DIFFICULTIES.regular.weaponDropCooldownMs[0]).toBeGreaterThan(
      DIFFICULTIES.veteran.weaponDropCooldownMs[0],
    );
  });

  it('improves reaction and accuracy monotonically across 100 seeded matches', () => {
    const metrics = DIFFICULTY_IDS.map((id) => simulateDifficulty(DIFFICULTIES[id], 100));
    for (let index = 1; index < metrics.length; index += 1) {
      expect(metrics[index].averageReactionMs).toBeLessThan(metrics[index - 1].averageReactionMs);
      expect(metrics[index].accuracyScore).toBeGreaterThan(metrics[index - 1].accuracyScore);
      expect(metrics[index].grenadesPerMinute).toBeGreaterThanOrEqual(
        metrics[index - 1].grenadesPerMinute,
      );
    }
  });
});
