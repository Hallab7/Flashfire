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
  botDamageMultiplier: number;
  weaponDropCooldownMs: [number, number];
  scoreMultiplier: number;
  memoryMs: number;
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyDefinition> = {
  recruit: {
    id: 'recruit',
    displayName: 'RECRUIT',
    botReactionMs: [1000, 1500],
    aimErrorDeg: 22,
    aimTrackingSpeed: 0.2,
    dodgeProbability: 0.02,
    grenadeProbability: 0.005,
    pickupAwarenessRadius: 180,
    hearingRadius: 210,
    flankProbability: 0,
    retreatHealthThreshold: 45,
    jetEfficiency: 0.5,
    teamCoordination: 0.05,
    botHealthMultiplier: 0.7,
    botDamageMultiplier: 0.55,
    weaponDropCooldownMs: [18_000, 24_000],
    scoreMultiplier: 0.6,
    memoryMs: 400,
  },
  regular: {
    id: 'regular',
    displayName: 'REGULAR',
    botReactionMs: [700, 1050],
    aimErrorDeg: 14,
    aimTrackingSpeed: 0.34,
    dodgeProbability: 0.07,
    grenadeProbability: 0.025,
    pickupAwarenessRadius: 260,
    hearingRadius: 290,
    flankProbability: 0.04,
    retreatHealthThreshold: 40,
    jetEfficiency: 0.64,
    teamCoordination: 0.16,
    botHealthMultiplier: 0.85,
    botDamageMultiplier: 0.75,
    weaponDropCooldownMs: [15_000, 21_000],
    scoreMultiplier: 0.85,
    memoryMs: 700,
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
    botDamageMultiplier: 1,
    weaponDropCooldownMs: [12_000, 18_000],
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
    botDamageMultiplier: 1,
    weaponDropCooldownMs: [10_000, 17_000],
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
    botDamageMultiplier: 1,
    weaponDropCooldownMs: [10_000, 17_000],
    scoreMultiplier: 2.2,
    memoryMs: 2200,
  },
};

export const DIFFICULTY_IDS = Object.keys(DIFFICULTIES) as DifficultyId[];
