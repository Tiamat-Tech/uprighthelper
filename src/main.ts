import type { PoseDetector } from '@tensorflow-models/pose-detection';
import './index.css';
import { AudioAlerts, VisualAlerts } from './alerts/index.ts';
import { CalibrationStore } from './calibration/store.ts';
import { createMoveNetDetector, disposeDetector } from './pose/detector.ts';
import { scorePose } from './pose/posture.ts';
import { AppState } from './state/app-state.ts';
import {
  CALIBRATION_FRAMES,
  DETECTION_INTERVAL_MS,
  type PostureState,
} from './types.ts';
import { setupWebcam, stopWebcam, WebcamError } from './webcam.ts';

const statusEl = document.getElementById('status')!;
const videoEl = document.getElementById('webcam') as HTMLVideoElement;
const uprightBtn = document.getElementById('class-a')!;
const badBtn = document.getElementById('class-b')!;

const appState = new AppState();
const calibration = new CalibrationStore();
const visualAlerts = new VisualAlerts();
const audioAlerts = new AudioAlerts();

let detector: PoseDetector | null = null;
let stream: MediaStream | null = null;
let loopTimer: ReturnType<typeof setTimeout> | null = null;
let calibratingKind: 'upright' | 'bad' | null = null;
let calibratingInterval: ReturnType<typeof setInterval> | null = null;

function setStatus(message: string): void {
  statusEl.textContent = message;
}

function handlePostureChange(posture: PostureState): void {
  if (posture === appState.lastPosture) return;

  visualAlerts.onPostureChange(posture);
  if (posture === 'slouching') {
    void audioAlerts.onSlouching();
  }
  appState.lastPosture = posture;
}

async function detectOnce(): Promise<void> {
  if (!detector) return;

  const poses = await detector.estimatePoses(videoEl);
  const frameHeight = videoEl.videoHeight || 480;
  const { state, metrics } = scorePose(poses[0], calibration.get(), frameHeight);

  if (appState.phase === 'monitoring' && state !== 'unknown') {
    handlePostureChange(state);
  }

  if (calibratingKind && metrics) {
    const count =
      calibratingKind === 'upright'
        ? calibration.addUprightSample(metrics)
        : calibration.addBadSample(metrics);
    setStatus(`Calibrating ${calibratingKind}: ${count}/${CALIBRATION_FRAMES} frames`);
  }
}

function startDetectionLoop(): void {
  if (loopTimer) return;

  const tick = async () => {
    try {
      await detectOnce();
    } catch (err) {
      console.error(err);
    }
    loopTimer = setTimeout(tick, DETECTION_INTERVAL_MS);
  };

  void tick();
}

function stopDetectionLoop(): void {
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
}

async function finishCalibration(kind: 'upright' | 'bad'): Promise<void> {
  if (calibratingInterval) {
    clearInterval(calibratingInterval);
    calibratingInterval = null;
  }
  calibratingKind = null;

  if (kind === 'upright') {
    await calibration.finalizeUpright();
    setStatus('Upright baseline saved. Now calibrate wrong posture.');
  } else {
    await calibration.finalizeBad();
    setStatus('Calibration complete. Monitoring your posture.');
  }

  appState.setPhase('monitoring');
}

function startCalibration(kind: 'upright' | 'bad'): void {
  if (!detector) return;

  calibratingKind = kind;
  appState.setPhase(kind === 'upright' ? 'calibrating-upright' : 'calibrating-bad');

  if (kind === 'upright') {
    calibration.startUprightCalibration();
    setStatus(`Hold upright posture. Collecting ${CALIBRATION_FRAMES} frames…`);
  } else {
    calibration.startBadCalibration();
    setStatus(`Hold a slouched posture. Collecting ${CALIBRATION_FRAMES} frames…`);
  }

  let frames = 0;
  calibratingInterval = setInterval(async () => {
    await detectOnce();
    frames += 1;
    if (frames >= CALIBRATION_FRAMES) {
      await finishCalibration(kind);
    }
  }, DETECTION_INTERVAL_MS);
}

uprightBtn.addEventListener('click', () => startCalibration('upright'));
badBtn.addEventListener('click', () => startCalibration('bad'));

window.addEventListener('beforeunload', () => {
  stopDetectionLoop();
  stopWebcam(stream);
  if (detector) void disposeDetector(detector);
});

async function bootstrap(): Promise<void> {
  try {
    setStatus('Loading pose model…');
    await calibration.load();
    detector = await createMoveNetDetector();

    setStatus('Starting webcam…');
    stream = await setupWebcam(videoEl);

    appState.setPhase('ready');
    if (calibration.isCalibrated()) {
      appState.setPhase('monitoring');
      setStatus('Calibration loaded. Monitoring posture.');
    } else {
      setStatus('Click Right Posture to calibrate your upright baseline.');
    }

    startDetectionLoop();
  } catch (err) {
    appState.setPhase('error');
    const message =
      err instanceof WebcamError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to start the app.';
    setStatus(message);
    console.error(err);
  }
}

void bootstrap();
