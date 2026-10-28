import type { MapId } from '../core/types/gameplay';

export interface AmbienceProfile {
  baseFrequency: number;
  modulationFrequency: number;
  waveform: OscillatorType;
  gain: number;
}

export const MAP_AMBIENCE: Record<MapId, AmbienceProfile> = {
  'outpost-kilo': { baseFrequency: 72, modulationFrequency: 0.11, waveform: 'sine', gain: 0.006 },
  'drydock-12': { baseFrequency: 54, modulationFrequency: 0.18, waveform: 'triangle', gain: 0.006 },
  'ember-foundry': {
    baseFrequency: 46,
    modulationFrequency: 0.24,
    waveform: 'sawtooth',
    gain: 0.004,
  },
  'canopy-ruins': { baseFrequency: 83, modulationFrequency: 0.09, waveform: 'sine', gain: 0.005 },
  'frost-relay': { baseFrequency: 118, modulationFrequency: 0.07, waveform: 'sine', gain: 0.004 },
  'neon-underpass': {
    baseFrequency: 61,
    modulationFrequency: 0.31,
    waveform: 'square',
    gain: 0.003,
  },
  'sky-fortress': {
    baseFrequency: 96,
    modulationFrequency: 0.05,
    waveform: 'triangle',
    gain: 0.005,
  },
  'blacksite-zero': { baseFrequency: 42, modulationFrequency: 0.16, waveform: 'sine', gain: 0.006 },
};
