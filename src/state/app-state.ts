import type { AppPhase } from '../types.ts';

export class AppState {
  phase: AppPhase = 'loading';
  lastPosture: import('../types.ts').PostureState = 'unknown';

  setPhase(phase: AppPhase): void {
    this.phase = phase;
  }
}
