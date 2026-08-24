import { describe, expect, it } from 'vitest';
import { computeMargins, classifyPosture, extractMetrics } from '../src/pose/posture.ts';
import type { Keypoint, PostureMetrics } from '../src/types.ts';

function makeKeypoints(overrides: Partial<Record<string, { x: number; y: number }>>): Keypoint[] {
  const defaults: Record<string, { x: number; y: number }> = {
    nose: { x: 200, y: 80 },
    left_ear: { x: 180, y: 90 },
    right_ear: { x: 220, y: 90 },
    left_shoulder: { x: 160, y: 150 },
    right_shoulder: { x: 240, y: 150 },
    left_hip: { x: 170, y: 280 },
    right_hip: { x: 230, y: 280 },
  };

  return Object.entries({ ...defaults, ...overrides }).map(([name, point]) => ({
    name,
    x: point!.x,
    y: point!.y,
    score: 0.9,
  }));
}

describe('posture', () => {
  it('extracts metrics from upright keypoints', () => {
    const metrics = extractMetrics(makeKeypoints({}), 480);
    expect(metrics).not.toBeNull();
    expect(metrics!.earShoulderDeviation).toBeLessThan(15);
    expect(metrics!.torsoVerticality).toBeLessThan(20);
  });

  it('detects slouching with forward head', () => {
    const slouched = extractMetrics(
      makeKeypoints({
        nose: { x: 260, y: 140 },
        left_ear: { x: 220, y: 130 },
        right_ear: { x: 260, y: 130 },
      }),
      480,
    );

    expect(slouched).not.toBeNull();
    const state = classifyPosture(slouched!, null);
    expect(state).toBe('slouching');
  });

  it('computes calibration margins', () => {
    const baseline: PostureMetrics = {
      earShoulderDeviation: 8,
      torsoVerticality: 10,
      shoulderAsymmetry: 0.02,
      noseForwardDrift: 0.1,
    };
    const bad: PostureMetrics = {
      earShoulderDeviation: 20,
      torsoVerticality: 30,
      shoulderAsymmetry: 0.08,
      noseForwardDrift: 0.4,
    };

    const margins = computeMargins(baseline, bad);
    expect(margins.earShoulderDeviation).toBeCloseTo(7.5);
    expect(margins.torsoVerticality).toBeCloseTo(12);
  });
});
