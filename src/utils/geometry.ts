import type { Keypoint, Point } from '../types.ts';
import { KEYPOINT_CONFIDENCE } from '../types.ts';

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/** Angle at point B formed by A-B-C, in degrees (0–180). */
export function angleBetween(a: Point, b: Point, c: Point): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (mag === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Deviation of vector (from → to) from true vertical, in degrees. */
export function deviationFromVertical(from: Point, to: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angleFromHorizontal = (Math.atan2(dy, dx) * 180) / Math.PI;
  return Math.abs(90 - Math.abs(angleFromHorizontal));
}

export function getKeypoint(keypoints: Keypoint[], name: string): Keypoint | null {
  const kp = keypoints.find((k) => k.name === name);
  if (!kp || (kp.score ?? 1) < KEYPOINT_CONFIDENCE) return null;
  return kp;
}

export function averageMetrics(
  samples: import('../types.ts').PostureMetrics[],
): import('../types.ts').PostureMetrics {
  const count = samples.length;
  if (count === 0) {
    return {
      earShoulderDeviation: 0,
      torsoVerticality: 0,
      shoulderAsymmetry: 0,
      noseForwardDrift: 0,
    };
  }

  const sum = samples.reduce(
    (acc, s) => ({
      earShoulderDeviation: acc.earShoulderDeviation + s.earShoulderDeviation,
      torsoVerticality: acc.torsoVerticality + s.torsoVerticality,
      shoulderAsymmetry: acc.shoulderAsymmetry + s.shoulderAsymmetry,
      noseForwardDrift: acc.noseForwardDrift + s.noseForwardDrift,
    }),
    {
      earShoulderDeviation: 0,
      torsoVerticality: 0,
      shoulderAsymmetry: 0,
      noseForwardDrift: 0,
    },
  );

  return {
    earShoulderDeviation: sum.earShoulderDeviation / count,
    torsoVerticality: sum.torsoVerticality / count,
    shoulderAsymmetry: sum.shoulderAsymmetry / count,
    noseForwardDrift: sum.noseForwardDrift / count,
  };
}
