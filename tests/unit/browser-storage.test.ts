import { afterEach, expect, test, vi } from 'vitest';

const values = new Map<string, string>();
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => {
    values.set(key, value);
  },
  removeItem: (key: string) => {
    values.delete(key);
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  values.clear();
});

test('denied localStorage access keeps the game playable and retains the current visit', async () => {
  vi.stubGlobal(
    'window',
    Object.defineProperty({}, 'localStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError');
      },
    }),
  );
  const { getSaveRepository } = await import('../../src/persistence/SaveRepository');
  const repository = getSaveRepository(),
    save = repository.load();
  save.profile.totalMatches = 2;
  save.settings.masterVolume = 0.3;
  expect(repository.save(save)).toBe(true);
  expect(getSaveRepository().load().profile.totalMatches).toBe(2);
  expect(getSaveRepository().load().settings.masterVolume).toBe(0.3);
  expect(repository.reset().profile.totalMatches).toBe(0);
});

test('blocked reads do not prevent startup', async () => {
  vi.stubGlobal('window', {
    localStorage: {
      ...storage,
      getItem() {
        throw new DOMException('Storage blocked', 'SecurityError');
      },
    },
  });
  const { getSaveRepository, isValidSave } = await import('../../src/persistence/SaveRepository');
  expect(isValidSave(getSaveRepository().load())).toBe(true);
});

test('readable progress survives a write quota failure and can advance in memory', async () => {
  const { createDefaultSave, SAVE_KEY } = await import('../../src/persistence/SaveRepository');
  const saved = createDefaultSave();
  saved.profile.totalMatches = 7;
  saved.profile.experience = 200;
  saved.profile.rank = 2;
  const original = JSON.stringify(saved);
  values.set(SAVE_KEY, original);
  vi.stubGlobal('window', {
    localStorage: {
      ...storage,
      setItem() {
        throw new DOMException('Storage full', 'QuotaExceededError');
      },
    },
  });
  const { getSaveRepository } = await import('../../src/persistence/SaveRepository');
  const repository = getSaveRepository();
  expect(repository.load().profile.totalMatches).toBe(7);
  const next = repository.load();
  next.profile.totalMatches = 8;
  expect(repository.save(next)).toBe(true);
  expect(repository.load().profile.totalMatches).toBe(8);
  expect(values.get(SAVE_KEY)).toBe(original);
});

test('writable browser storage still persists progress across repository initialization', async () => {
  vi.stubGlobal('window', { localStorage: storage });
  const { getSaveRepository, SAVE_KEY } = await import('../../src/persistence/SaveRepository');
  const save = getSaveRepository().load();
  save.profile.totalMatches = 3;
  expect(getSaveRepository().save(save)).toBe(true);
  expect(values.has('flashfire.storage-test')).toBe(false);
  expect(JSON.parse(values.get(SAVE_KEY)!).profile.totalMatches).toBe(3);
  vi.resetModules();
  const reloaded = await import('../../src/persistence/SaveRepository');
  expect(reloaded.getSaveRepository().load().profile.totalMatches).toBe(3);
});
