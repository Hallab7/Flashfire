export type MatchState = 'menu' | 'countdown' | 'playing' | 'paused' | 'roundEnd' | 'results';

const TRANSITIONS: Record<MatchState, MatchState[]> = {
  menu: ['countdown', 'playing'],
  countdown: ['playing', 'menu'],
  playing: ['paused', 'roundEnd'],
  paused: ['playing', 'menu'],
  roundEnd: ['results'],
  results: ['menu', 'playing'],
};

export class MatchStateMachine {
  constructor(private currentState: MatchState = 'menu') {}

  get state(): MatchState {
    return this.currentState;
  }

  canTransition(next: MatchState): boolean {
    return TRANSITIONS[this.currentState].includes(next);
  }

  transition(next: MatchState): void {
    if (!this.canTransition(next)) {
      throw new Error(`Invalid match transition: ${this.currentState} -> ${next}`);
    }
    this.currentState = next;
  }
}
