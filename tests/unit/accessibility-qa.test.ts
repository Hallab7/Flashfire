import { describe, expect, it } from 'vitest';
import { applyGamepadDeadzone, gamepadAimAngle } from '../../src/input/GamepadInput';
import { KEY_BINDING_CHOICES, toPhaserKeyName } from '../../src/input/KeyboardInput';
import {
  createDefaultSave,
  migrateSaveDocument,
  SAVE_KEY,
  SaveRepository,
  type StorageLike,
} from '../../src/persistence/SaveRepository';

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
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

describe('accessibility and input QA', () => {
  it('supports alphabetic and directional arrow bindings', () => {
    expect(KEY_BINDING_CHOICES).toEqual(
      expect.arrayContaining(['A', 'Z', 'ARROWLEFT', 'ARROWRIGHT', 'ARROWUP', 'ARROWDOWN']),
    );
    expect(toPhaserKeyName('ARROWLEFT')).toBe('LEFT');
    expect(toPhaserKeyName('ARROWDOWN')).toBe('DOWN');
    expect(toPhaserKeyName('A')).toBe('A');
  });

  it('normalizes axes outside the configured gamepad dead zone', () => {
    expect(applyGamepadDeadzone(0.1, 0.18)).toBe(0);
    expect(applyGamepadDeadzone(-1, 0.18)).toBe(-1);
    expect(applyGamepadDeadzone(0.59, 0.18)).toBeCloseTo(0.5, 1);
    expect(gamepadAimAngle(0.05, 0.04, 0.18)).toBeNull();
    expect(gamepadAimAngle(0, 1, 0.18)).toBeCloseTo(Math.PI / 2);
  });

  it('migrates a legacy version-zero profile into the current save', () => {
    const migrated = migrateSaveDocument({
      version: 0,
      profile: { displayName: 'Legacy Ranger', rank: 7, experience: 900 },
    });
    expect(migrated).not.toBeNull();
    expect(migrated?.version).toBe(1);
    expect(migrated?.profile).toMatchObject({
      displayName: 'Legacy Ranger',
      rank: 7,
      experience: 900,
    });
    expect(migrated?.settings.keyBindings.left).toBe('A');
  });

  it('normalizes settings missing from an older v1 export', () => {
    const storage = new MemoryStorage();
    const older = createDefaultSave() as unknown as { settings: Record<string, unknown> };
    delete older.settings.colorVision;
    delete older.settings.keyBindings;
    storage.values.set(SAVE_KEY, JSON.stringify(older));
    const loaded = new SaveRepository(storage).load();
    expect(loaded.settings.colorVision).toBe('default');
    expect(loaded.settings.keyBindings.pause).toBe('ESC');
    expect(loaded.settings.keyBindings.down).toBe('S');
    expect(loaded.settings.highContrastPickups).toBe(true);
    expect(loaded.settings.ambienceVolume).toBe(0.65);
    expect(loaded.settings.uiVolume).toBe(0.8);
  });

  it('rejects unsafe imported setting values and clamps numeric controls', () => {
    const storage = new MemoryStorage();
    const malformed = createDefaultSave() as unknown as {
      settings: Record<string, unknown>;
    };
    malformed.settings.colorVision = 'unknown-palette';
    malformed.settings.keyBindings = { left: 'NOT_A_KEY', pause: 'ESC' };
    malformed.settings.masterVolume = 99;
    malformed.settings.touchControlOpacity = -2;
    malformed.settings.reducedMotion = 'yes';
    storage.values.set(SAVE_KEY, JSON.stringify(malformed));

    const loaded = new SaveRepository(storage).load();
    expect(loaded.settings.colorVision).toBe('default');
    expect(loaded.settings.keyBindings.left).toBe('A');
    expect(loaded.settings.keyBindings.pause).toBe('ESC');
    expect(loaded.settings.masterVolume).toBe(1);
    expect(loaded.settings.touchControlOpacity).toBe(0.35);
    expect(loaded.settings.reducedMotion).toBe(false);
  });
});
