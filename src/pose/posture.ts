import type { CalibrationData, Keypoint, Pose, PostureMetrics, PostureState } from '../types.ts';
import {
  DEFAULT_THRESHOLDS,
  KEYPOINT_CONFIDENCE,
  METRIC_KEYS,
} from '../types.ts';
import {
  deviationFromVertical,
  getKeypoint,
  midpoint,
} from '../utils/geometry.ts';

export function extractMetrics(keypoints: Keypoint[], frameHeight = 480): PostureMetrics | null {
  const nose = getKeypoint(keypoints, 'nose');
  const leftEar = getKeypoint(keypoints, 'left_ear');
  const rightEar = getKeypoint(keypoints, 'right_ear');
  const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
  const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
  const leftHip = getKeypoint(keypoints, 'left_hip');
  const rightHip = getKeypoint(keypoints, 'right_hip');

  if (!leftShoulder || !rightShoulder || !nose) return null;

  const shoulderMid = midpoint(leftShoulder, rightShoulder);
  const hipMid =
    leftHip && rightHip ? midpoint(leftHip, rightHip) : null;

  const earMid =
    leftEar && rightEar
      ? midpoint(leftEar, rightEar)
      : leftEar ?? rightEar ?? null;

  const earShoulderDeviation = earMid
    ? deviationFromVertical(shoulderMid, earMid)
    : DEFAULT_THRESHOLDS.earShoulderDeviation;

  const torsoVerticality = hipMid
    ? deviationFromVertical(shoulderMid, hipMid)
    : DEFAULT_THRESHOLDS.torsoVerticality;

  const shoulderAsymmetry =
    Math.abs(leftShoulder.y - rightShoulder.y) / frameHeight;

  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x) || 1;
  const noseForwardDrift = Math.abs(nose.x - shoulderMid.x) / shoulderWidth;

  return {
    earShoulderDeviation,
    torsoVerticality,
    shoulderAsymmetry,
    noseForwardDrift,
  };
}

export function hasReliableKeypoints(keypoints: Keypoint[]): boolean {
  const required = ['nose', 'left_shoulder', 'right_shoulder'];
  return required.every((name) => {
    const kp = keypoints.find((k) => k.name === name);
    return kp && (kp.score ?? 1) >= KEYPOINT_CONFIDENCE;
  });
}

function getThreshold(
  key: keyof PostureMetrics,
  calibration: CalibrationData | null,
): number {
  if (calibration?.baseline && calibration.margins?.[key] != null) {
    return calibration.baseline[key] + calibration.margins[key]!;
  }
  return DEFAULT_THRESHOLDS[key];
}

export function classifyPosture(
  metrics: PostureMetrics,
  calibration: CalibrationData | null,
): PostureState {
  for (const key of METRIC_KEYS) {
    const threshold = getThreshold(key, calibration);
    if (metrics[key] > threshold) {
      return 'slouching';
    }
  }
  return 'upright';
}

export function computeMargins(
  baseline: PostureMetrics,
  badSample: PostureMetrics,
): Partial<PostureMetrics> {
  const margins: Partial<PostureMetrics> = {};
  for (const key of METRIC_KEYS) {
    const diff = badSample[key] - baseline[key];
    margins[key] = Math.max(diff * 0.6, DEFAULT_THRESHOLDS[key] * 0.5);
  }
  return margins;
}

export function scorePose(
  pose: Pose | undefined,
  calibration: CalibrationData | null,
  frameHeight = 480,
): { state: PostureState; metrics: PostureMetrics | null } {
  if (!pose || !hasReliableKeypoints(pose.keypoints)) {
    return { state: 'unknown', metrics: null };
  }

  const metrics = extractMetrics(pose.keypoints, frameHeight);
  if (!metrics) {
    return { state: 'unknown', metrics: null };
  }

  return {
    state: classifyPosture(metrics, calibration),
    metrics,
  };
}
