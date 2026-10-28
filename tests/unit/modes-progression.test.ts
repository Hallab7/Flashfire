import { describe, expect, it } from 'vitest';
import { MODE_IDS, MODES } from '../../src/content/modes';
import { WEAPON_IDS } from '../../src/content/weapons';
import {
  applyMatchReward,
  createDefaultSave,
  isValidSave,
  SAVE_KEY,
  SaveRepository,
  type StorageLike,
} from '../../src/persistence/SaveRepository';
import {
  advanceMode,
  createModeRuntime,
  finishTraining,
  registerElimination,
} from '../../src/systems/MatchModeSystem';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('game modes', () => {
  it('defines all six launch modes', () => {
    expect(MODE_IDS).toEqual([
      'quick-deathmatch',
      'team-deathmatch',
      'survival',
      'gun-ladder',
      'control-point',
      'training-range',
    ]);
  });

  it('sets Quick Deathmatch to first-to-20 eliminations', () => {
    expect(MODES['quick-deathmatch']).toMatchObject({
      description: 'First to 20 eliminations',
      scoreLimit: 20,
    });
  });

  it.each(MODE_IDS)('%s reaches a result state', (modeId) => {
    const runtime = createModeRuntime(modeId);
    if (modeId === 'survival') registerElimination(runtime, 'raiders', true, false);
    else if (modeId === 'training-range') finishTraining(runtime);
    else if (modeId === 'control-point') advanceMode(runtime, 100, 'ranger');
    else {
      const limit = MODES[modeId].scoreLimit ?? 1;
      for (let index = 0; index < limit; index += 1)
        registerElimination(runtime, 'ranger', false, true);
    }
    expect(runtime.finished).toBe(true);
    expect(runtime.victory).toBe(modeId !== 'survival');
  });

  it('advances the gun ladder every two player eliminations', () => {
    const runtime = createModeRuntime('gun-ladder');
    registerElimination(runtime, 'ranger', false, true);
    registerElimination(runtime, 'ranger', false, true);
    expect(runtime.ladderIndex).toBe(1);
  });
});

describe('progression persistence', () => {
  it('creates a complete valid versioned save', () => {
    const save = createDefaultSave();
    expect(isValidSave(save)).toBe(true);
    expect(Object.keys(save.mastery)).toEqual(WEAPON_IDS);
  });

  it('falls back safely from corrupt JSON', () => {
    const storage = new MemoryStorage();
    storage.values.set(SAVE_KEY, '{bad json');
    const loaded = new SaveRepository(storage).load();
    expect(loaded.version).toBe(1);
    expect(JSON.parse(storage.values.get(SAVE_KEY)!)).toEqual(loaded);
  });

  it('preserves the last valid save when a newer schema appears', () => {
    const storage = new MemoryStorage();
    const repository = new SaveRepository(storage);
    const original = repository.load();
    storage.values.set(SAVE_KEY, JSON.stringify({ version: 99, profile: { rank: 30 } }));
    expect(repository.load()).toEqual(original);
    expect(JSON.parse(storage.values.get(SAVE_KEY)!).version).toBe(99);
  });

  it('awards experience, mastery, records, challenges, and rank perks', () => {
    const save = createDefaultSave();
    const rewarded = applyMatchReward(save, {
      modeId: 'quick-deathmatch',
      weaponId: 'ak117',
      victory: true,
      eliminations: 120,
      score: 12,
      difficultyMultiplier: 2.2,
    });
    expect(rewarded.profile.rank).toBeGreaterThanOrEqual(5);
    expect(rewarded.mastery.ak117.level).toBe(3);
    expect(rewarded.records['quick-deathmatch']).toMatchObject({
      matches: 1,
      wins: 1,
      bestScore: 12,
    });
    expect(rewarded.challenges.every((challenge) => challenge.current <= challenge.target)).toBe(
      true,
    );
    expect(rewarded.unlocks.perks).toContain('light-frame');
  });

  it('round-trips exports and rejects invalid imports', () => {
    const repository = new SaveRepository(new MemoryStorage());
    repository.load();
    expect(repository.importJson(repository.exportJson())).toBe(true);
    expect(repository.importJson('{"version":1}')).toBe(false);
  });
});
