import type { PostureState } from '../types.ts';
import { AUDIO_COOLDOWN_MS } from '../types.ts';

const UPRIGHT_COLOR = 'rgb(80, 168, 80)';
const SLOUCHING_COLOR = 'rgb(168, 63, 63)';
const NEUTRAL_COLOR = 'white';

export class VisualAlerts {
  onPostureChange(posture: PostureState): void {
    switch (posture) {
      case 'upright':
        document.body.style.backgroundColor = UPRIGHT_COLOR;
        break;
      case 'slouching':
        document.body.style.backgroundColor = SLOUCHING_COLOR;
        break;
      default:
        document.body.style.backgroundColor = NEUTRAL_COLOR;
    }
  }
}

export class AudioAlerts {
  private audio: HTMLAudioElement;
  private lastPlayedAt = 0;

  constructor(src = `${import.meta.env.BASE_URL}audio_file.mp3`) {
    this.audio = new Audio(src);
  }

  async onSlouching(): Promise<void> {
    const now = Date.now();
    if (now - this.lastPlayedAt < AUDIO_COOLDOWN_MS) return;

    try {
      this.audio.currentTime = 0;
      await this.audio.play();
      this.lastPlayedAt = now;
    } catch {
      // Autoplay policy may block until user interaction
    }
  }
}
