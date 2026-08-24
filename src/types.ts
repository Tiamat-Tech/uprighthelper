export interface Point {
  x: number;
  y: number;
}

export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

export interface Pose {
  keypoints: Keypoint[];
  score?: number;
}

export interface PostureMetrics {
  earShoulderDeviation: number;
  torsoVerticality: number;
  shoulderAsymmetry: number;
  noseForwardDrift: number;
}

export interface CalibrationData {
  baseline: PostureMetrics | null;
  badSample: PostureMetrics | null;
  margins: Partial<PostureMetrics> | null;
}

export type PostureState = 'upright' | 'slouching' | 'unknown';

export type AppPhase =
  | 'loading'
  | 'ready'
  | 'calibrating-upright'
  | 'calibrating-bad'
  | 'monitoring'
  | 'error';

export const KEYPOINT_CONFIDENCE = 0.3;
export const CALIBRATION_FRAMES = 15;
export const DETECTION_INTERVAL_MS = 100;
export const AUDIO_COOLDOWN_MS = 3000;
/** Consecutive frames a new posture must persist before it takes effect. */
export const POSTURE_CONFIRM_FRAMES = 4;

export const DEFAULT_THRESHOLDS: PostureMetrics = {
  earShoulderDeviation: 15,
  torsoVerticality: 20,
  shoulderAsymmetry: 0.04,
  noseForwardDrift: 0.25,
};

export const METRIC_KEYS: (keyof PostureMetrics)[] = [
  'earShoulderDeviation',
  'torsoVerticality',
  'shoulderAsymmetry',
  'noseForwardDrift',
];
