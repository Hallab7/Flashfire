import { GUN_LADDER, MODES } from '../content/modes';
import type { ModeId, TeamId, WeaponId } from '../core/types/gameplay';

export interface ModeRuntime {
  modeId: ModeId;
  timeLeft: number;
  rangerScore: number;
  raiderScore: number;
  playerEliminations: number;
  playerDeaths: number;
  wave: number;
  objectiveIndex: number;
  objectiveElapsed: number;
  ladderIndex: number;
  finished: boolean;
  victory: boolean;
}

export function createModeRuntime(modeId: ModeId): ModeRuntime {
  return {
    modeId,
    timeLeft: MODES[modeId].durationSeconds ?? 0,
    rangerScore: 0,
    raiderScore: 0,
    playerEliminations: 0,
    playerDeaths: 0,
    wave: 1,
    objectiveIndex: 0,
    objectiveElapsed: 0,
    ladderIndex: 0,
    finished: false,
    victory: false,
  };
}

function finish(runtime: ModeRuntime, victory: boolean): void {
  runtime.finished = true;
  runtime.victory = victory;
}

export function registerElimination(
  runtime: ModeRuntime,
  killerTeam: TeamId,
  victimIsPlayer: boolean,
  killerIsPlayer: boolean,
): void {
  if (runtime.finished) return;
  if (victimIsPlayer) runtime.playerDeaths += 1;
  if (killerIsPlayer) runtime.playerEliminations += 1;
  if (runtime.modeId === 'survival') {
    if (victimIsPlayer) finish(runtime, false);
    else if (killerTeam === 'ranger') runtime.rangerScore += 1;
    return;
  }
  if (runtime.modeId === 'training-range') {
    if (killerIsPlayer) runtime.rangerScore += 1;
    return;
  }
  if (killerTeam === 'ranger') runtime.rangerScore += 1;
  else runtime.raiderScore += 1;
  if (runtime.modeId === 'gun-ladder' && killerIsPlayer) {
    runtime.ladderIndex = Math.min(
      GUN_LADDER.length - 1,
      Math.floor(runtime.playerEliminations / 2),
    );
  }
  const limit = MODES[runtime.modeId].scoreLimit;
  if (limit !== null && (runtime.rangerScore >= limit || runtime.raiderScore >= limit)) {
    finish(runtime, runtime.rangerScore >= limit);
  }
}

export function advanceMode(
  runtime: ModeRuntime,
  seconds: number,
  objectiveOwner: TeamId | null = null,
): void {
  if (runtime.finished || runtime.modeId === 'training-range' || runtime.modeId === 'survival')
    return;
  runtime.timeLeft = Math.max(0, runtime.timeLeft - seconds);
  if (runtime.modeId === 'control-point') {
    runtime.objectiveElapsed += seconds;
    if (objectiveOwner === 'ranger')
      runtime.rangerScore = Math.min(100, runtime.rangerScore + seconds);
    if (objectiveOwner === 'raiders')
      runtime.raiderScore = Math.min(100, runtime.raiderScore + seconds);
    if (runtime.objectiveElapsed >= 45) {
      runtime.objectiveElapsed %= 45;
      runtime.objectiveIndex = (runtime.objectiveIndex + 1) % 3;
    }
    if (runtime.rangerScore >= 100 || runtime.raiderScore >= 100)
      finish(runtime, runtime.rangerScore >= 100);
  }
  if (runtime.timeLeft <= 0) finish(runtime, runtime.rangerScore > runtime.raiderScore);
}

export function completeSurvivalWave(runtime: ModeRuntime): void {
  if (runtime.modeId !== 'survival' || runtime.finished) return;
  runtime.wave += 1;
}

export function currentLadderWeapon(runtime: ModeRuntime): WeaponId {
  return GUN_LADDER[runtime.ladderIndex];
}

export function finishTraining(runtime: ModeRuntime): void {
  if (runtime.modeId === 'training-range') finish(runtime, true);
}
