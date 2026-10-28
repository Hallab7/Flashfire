import type { DifficultyId } from '../core/types/gameplay';

export interface DifficultyDefinition {
  id: DifficultyId;
  displayName: string;
  botReactionMs: [number, number];
  aimErrorDeg: number;
  aimTrackingSpeed: number;
  dodgeProbability: number;
  grenadeProbability: number;
  pickupAwarenessRadius: number;
  hearingRadius: number;
  flankProbability: number;
  retreatHealthThreshold: number;
  jetEfficiency: number;
  teamCoordination: number;
  botHealthMultiplier: number;
  scoreMultiplier: number;
  memoryMs: number;
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyDefinition> = {
  recruit: {
    id: 'recruit',
    displayName: 'RECRUIT',
    botReactionMs: [600, 900],
    aimErrorDeg: 12,
    aimTrackingSpeed: 0.35,
    dodgeProbability: 0.08,
    grenadeProbability: 0.02,
    pickupAwarenessRadius: 260,
    hearingRadius: 280,
    flankProbability: 0.03,
    retreatHealthThreshold: 25,
    jetEfficiency: 0.7,
    teamCoordination: 0.15,
    botHealthMultiplier: 0.9,
    scoreMultiplier: 0.75,
    memoryMs: 800,
  },
  regular: {
    id: 'regular',
    displayName: 'REGULAR',
    botReactionMs: [420, 700],
    aimErrorDeg: 8,
    aimTrackingSpeed: 0.5,
    dodgeProbability: 0.16,
    grenadeProbability: 0.06,
    pickupAwarenessRadius: 340,
    hearingRadius: 360,
    flankProbability: 0.1,
    retreatHealthThreshold: 30,
    jetEfficiency: 0.78,
    teamCoordination: 0.3,
    botHealthMultiplier: 1,
    scoreMultiplier: 1,
    memoryMs: 1100,
  },
  veteran: {
    id: 'veteran',
    displayName: 'VETERAN',
    botReactionMs: [260, 480],
    aimErrorDeg: 5,
    aimTrackingSpeed: 0.68,
    dodgeProbability: 0.28,
    grenadeProbability: 0.12,
    pickupAwarenessRadius: 430,
    hearingRadius: 450,
    flankProbability: 0.22,
    retreatHealthThreshold: 34,
    jetEfficiency: 0.86,
    teamCoordination: 0.5,
    botHealthMultiplier: 1,
    scoreMultiplier: 1.35,
    memoryMs: 1400,
  },
  elite: {
    id: 'elite',
    displayName: 'ELITE',
    botReactionMs: [170, 330],
    aimErrorDeg: 3,
    aimTrackingSpeed: 0.82,
    dodgeProbability: 0.4,
    grenadeProbability: 0.18,
    pickupAwarenessRadius: 520,
    hearingRadius: 560,
    flankProbability: 0.35,
    retreatHealthThreshold: 38,
    jetEfficiency: 0.93,
    teamCoordination: 0.72,
    botHealthMultiplier: 1.08,
    scoreMultiplier: 1.7,
    memoryMs: 1800,
  },
  flashpoint: {
    id: 'flashpoint',
    displayName: 'FLASHPOINT',
    botReactionMs: [110, 240],
    aimErrorDeg: 1.8,
    aimTrackingSpeed: 0.94,
    dodgeProbability: 0.52,
    grenadeProbability: 0.24,
    pickupAwarenessRadius: 620,
    hearingRadius: 680,
    flankProbability: 0.48,
    retreatHealthThreshold: 42,
    jetEfficiency: 1,
    teamCoordination: 0.9,
    botHealthMultiplier: 1.15,
    scoreMultiplier: 2.2,
    memoryMs: 2200,
  },
};

export const DIFFICULTY_IDS = Object.keys(DIFFICULTIES) as DifficultyId[];
