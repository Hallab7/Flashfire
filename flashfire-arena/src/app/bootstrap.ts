import Phaser from 'phaser';
import { gameConfig } from './gameConfig';
import { getActiveArena } from '../scenes/ArenaScene';
import { LoadoutController } from '../ui/LoadoutController';

declare global {
  interface Window {
    __flashfireGame?: Phaser.Game;
  }
}

function requiredButton(selector: string): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(selector);
  if (!button) throw new Error(`Required button is missing: ${selector}`);
  return button;
}

function bindOrientationGuard(): void {
  const shell = document.querySelector<HTMLElement>('#game-shell');
  if (!shell) throw new Error('Game shell is missing');
  const portrait = window.matchMedia('(orientation: portrait) and (max-width: 850px)');
  const update = (): void => {
    shell.classList.toggle('orientation-blocked', portrait.matches);
    if (portrait.matches) getActiveArena()?.pauseForOrientation();
  };
  portrait.addEventListener('change', update);
  window.addEventListener('resize', update);
  update();
}

export function bootstrap(): Phaser.Game {
  const game = new Phaser.Game(gameConfig);
  if (import.meta.env.DEV) window.__flashfireGame = game;
  const loadout = new LoadoutController();
  const showLobby = (pushHistory = true): void => {
    if (pushHistory && window.location.pathname !== '/lobby')
      window.history.pushState({}, '', `/lobby${window.location.search}`);
    loadout.open();
  };
  const showHome = (pushHistory = true): void => {
    if (pushHistory && window.location.pathname !== '/')
      window.history.pushState({}, '', `/${window.location.search}`);
    loadout.close();
  };
  const syncRoute = (): void => {
    if (window.location.pathname === '/lobby') showLobby(false);
    else showHome(false);
  };
  requiredButton('#play-button').addEventListener('click', () => showLobby());
  loadout.deploy.addEventListener('click', () => {
    loadout.close();
    getActiveArena()?.startMatch();
  });
  requiredButton('#restart-button').addEventListener('click', () =>
    getActiveArena()?.restartMatch(),
  );
  requiredButton('#finish-session-button').addEventListener('click', () =>
    getActiveArena()?.finishTrainingSession(),
  );
  requiredButton('#resume-button').addEventListener('click', () => getActiveArena()?.togglePause());
  requiredButton('#pause-button').addEventListener('click', () => getActiveArena()?.togglePause());
  requiredButton('#pause-exit-button').addEventListener('click', () =>
    getActiveArena()?.exitToLobby(),
  );
  requiredButton('#result-exit-button').addEventListener('click', () =>
    getActiveArena()?.exitToLobby(),
  );
  document.querySelectorAll<HTMLButtonElement>('[data-weapon-slot]').forEach((button) => {
    button.addEventListener('click', () =>
      getActiveArena()?.selectWeaponSlot(Number(button.dataset.weaponSlot)),
    );
  });
  requiredButton('#pickup-prompt').addEventListener('click', () =>
    getActiveArena()?.pickupNearbyWeapon(),
  );
  window.addEventListener('flashfire:navigate-lobby', () => showLobby());
  window.addEventListener('flashfire:navigate-home', () => showHome());
  window.addEventListener('popstate', syncRoute);
  syncRoute();
  bindOrientationGuard();
  return game;
}
