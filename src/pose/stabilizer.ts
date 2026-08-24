import type { PostureState } from '../types.ts';
import { POSTURE_CONFIRM_FRAMES } from '../types.ts';

/**
 * Debounces noisy per-frame classifications: a new state must persist for
 * `framesToConfirm` consecutive frames before it replaces the committed state.
 * This stops the background from flickering between red/green while the user
 * holds a posture near the detection threshold.
 */
export class PostureStabilizer {
  private committed: PostureState = 'unknown';
  private candidate: PostureState | null = null;
  private candidateCount = 0;

  constructor(private readonly framesToConfirm = POSTURE_CONFIRM_FRAMES) {}

  push(state: PostureState): PostureState {
    if (state === this.committed) {
      this.candidate = null;
      this.candidateCount = 0;
      return this.committed;
    }

    if (state === this.candidate) {
      this.candidateCount += 1;
    } else {
      this.candidate = state;
      this.candidateCount = 1;
    }

    if (this.candidateCount >= this.framesToConfirm) {
      this.committed = state;
      this.candidate = null;
      this.candidateCount = 0;
    }

    return this.committed;
  }

  reset(): void {
    this.committed = 'unknown';
    this.candidate = null;
    this.candidateCount = 0;
  }
}
