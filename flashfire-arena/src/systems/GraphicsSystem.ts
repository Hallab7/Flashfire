import type { GraphicsQuality, MapId } from '../core/types/gameplay';

export type ResolvedGraphicsQuality = Exclude<GraphicsQuality, 'auto'>;

export interface GraphicsProfile {
  id: ResolvedGraphicsQuality;
  particleMultiplier: number;
  weatherFrequency: number;
  cameraLead: number;
  lightingAlpha: number;
}

export const GRAPHICS_PROFILES: Record<ResolvedGraphicsQuality, GraphicsProfile> = {
  low: {
    id: 'low',
    particleMultiplier: 0.25,
    weatherFrequency: 300,
    cameraLead: 35,
    lightingAlpha: 0.07,
  },
  medium: {
    id: 'medium',
    particleMultiplier: 0.6,
    weatherFrequency: 160,
    cameraLead: 52,
    lightingAlpha: 0.11,
  },
  high: {
    id: 'high',
    particleMultiplier: 0.9,
    weatherFrequency: 90,
    cameraLead: 68,
    lightingAlpha: 0.15,
  },
};

export interface DeviceCapability {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  coarsePointer?: boolean;
}

export function resolveGraphicsQuality(
  requested: GraphicsQuality,
  device: DeviceCapability,
): ResolvedGraphicsQuality {
  if (requested !== 'auto') return requested;
  const cores = device.hardwareConcurrency ?? 4;
  const memory = device.deviceMemory ?? 4;
  if (device.coarsePointer && (cores <= 4 || memory <= 4)) return 'low';
  if (cores >= 8 && memory >= 8) return 'high';
  return 'medium';
}

export function mapWeather(mapId: MapId): { tint: number; angle: number; speed: number } {
  if (mapId === 'drydock-12') return { tint: 0x9fd8e8, angle: 104, speed: 520 };
  if (mapId === 'ember-foundry') return { tint: 0xff7a42, angle: 260, speed: 95 };
  if (mapId === 'canopy-ruins') return { tint: 0x75e0ae, angle: 170, speed: 70 };
  if (mapId === 'frost-relay') return { tint: 0xe8fbff, angle: 155, speed: 360 };
  if (mapId === 'neon-underpass') return { tint: 0xf05bd4, angle: 90, speed: 38 };
  if (mapId === 'sky-fortress') return { tint: 0xf2fbff, angle: 178, speed: 210 };
  if (mapId === 'blacksite-zero') return { tint: 0xf04b47, angle: 90, speed: 24 };
  return { tint: 0xb8e5dc, angle: 182, speed: 45 };
}
