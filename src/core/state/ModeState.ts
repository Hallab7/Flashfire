import type { ModeId } from '../types/gameplay';

let selectedMode: ModeId = 'quick-deathmatch';

export function getSelectedMode(): ModeId {
  return selectedMode;
}

export function setSelectedMode(modeId: ModeId): void {
  selectedMode = modeId;
}
