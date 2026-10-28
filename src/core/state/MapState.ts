import type { MapId } from '../types/gameplay';

let selectedMap: MapId = 'outpost-kilo';

export function getSelectedMap(): MapId {
  return selectedMap;
}

export function setSelectedMap(mapId: MapId): void {
  selectedMap = mapId;
}
