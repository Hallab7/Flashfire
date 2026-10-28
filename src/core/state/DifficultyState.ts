import type { DifficultyId } from '../types/gameplay';

let difficulty: DifficultyId = 'regular';

export function getDifficulty(): DifficultyId {
  return difficulty;
}

export function setDifficulty(value: DifficultyId): void {
  difficulty = value;
}
