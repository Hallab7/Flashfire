import { describe, expect, it, vi } from 'vitest';
import { WEAPONS } from '../../src/content/weapons';
import { FixedStepRunner, STEP_MS } from '../../src/core/math/fixedStep';
import { MatchStateMachine } from '../../src/core/state/MatchStateMachine';
import { applyDamage, radialDamage } from '../../src/systems/DamageSystem';
import { chooseSafestSpawn } from '../../src/systems/SpawnSystem';
import { canFire, completeReload, consumeRound } from '../../src/systems/WeaponSystem';

describe('fixed simulation step', () => {
  it('runs stable 60 Hz steps and clamps long frames', () => {
    const simulate = vi.fn();
    const runner = new FixedStepRunner();

    expect(runner.advance(STEP_MS * 2.5, simulate)).toBe(2);
    expect(runner.advance(5_000, simulate)).toBeLessThanOrEqual(6);
    expect(simulate).toHaveBeenCalledWith(STEP_MS);
  });
});

describe('match state machine', () => {
  it('supports play, pause, resume, and results transitions', () => {
    const machine = new MatchStateMachine();
    machine.transition('playing');
    machine.transition('paused');
    machine.transition('playing');
    machine.transition('roundEnd');
    machine.transition('results');
    expect(machine.state).toBe('results');
  });

  it('rejects illegal transitions', () => {
    const machine = new MatchStateMachine();
    expect(() => machine.transition('results')).toThrow('Invalid match transition');
  });
});

describe('damage and grenades', () => {
  it('clamps damage at zero health', () => {
    expect(applyDamage(100, 14)).toBe(86);
    expect(applyDamage(8, 14)).toBe(0);
  });

  it('applies radial falloff inside the grenade radius', () => {
    expect(radialDamage(75, 0, 180)).toBe(75);
    expect(radialDamage(75, 90, 180)).toBe(38);
    expect(radialDamage(75, 180, 180)).toBe(0);
  });
});

describe('weapon cadence and reload', () => {
  it('consumes one magazine round and respects cadence', () => {
    const ammo = { mag: 3, reserve: 10 };
    expect(consumeRound(ammo)).toEqual({ mag: 2, reserve: 10 });
    const cadence = WEAPONS.ak117.cadenceMs;
    expect(canFire(ammo, false, cadence, 0, WEAPONS.ak117)).toBe(true);
    expect(canFire(ammo, false, cadence - 1, 0, WEAPONS.ak117)).toBe(false);
    expect(canFire(ammo, true, 500, 0, WEAPONS.ak117)).toBe(false);
  });

  it('reloads only as many rounds as reserve ammunition allows', () => {
    expect(completeReload({ mag: 2, reserve: 3 }, 6)).toEqual({ mag: 5, reserve: 0 });
    expect(completeReload({ mag: 2, reserve: 30 }, 6)).toEqual({ mag: 6, reserve: 26 });
  });
});

describe('spawn scoring', () => {
  it('selects the spawn with the greatest combined enemy distance', () => {
    const spawn = chooseSafestSpawn(
      [
        { id: 'near', x: 0, y: 0 },
        { id: 'middle', x: 500, y: 0 },
        { id: 'far', x: 1000, y: 0 },
      ],
      [
        { x: 50, y: 0 },
        { x: 100, y: 0 },
      ],
    );
    expect(spawn.id).toBe('far');
  });
});
