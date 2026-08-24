import { describe, expect, it } from 'vitest';
import {
  angleBetween,
  averageMetrics,
  deviationFromVertical,
  midpoint,
} from '../src/utils/geometry.ts';

describe('geometry', () => {
  it('computes midpoint', () => {
    expect(midpoint({ x: 0, y: 0 }, { x: 10, y: 20 })).toEqual({ x: 5, y: 10 });
  });

  it('computes a right angle', () => {
    expect(angleBetween({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBeCloseTo(90, 1);
  });

  it('computes vertical deviation', () => {
    expect(deviationFromVertical({ x: 100, y: 100 }, { x: 100, y: 0 })).toBeCloseTo(0, 1);
    expect(deviationFromVertical({ x: 100, y: 100 }, { x: 200, y: 100 })).toBeCloseTo(90, 1);
  });

  it('averages posture metrics', () => {
    const avg = averageMetrics([
      {
        earShoulderDeviation: 10,
        torsoVerticality: 20,
        shoulderAsymmetry: 0.02,
        noseForwardDrift: 0.1,
      },
      {
        earShoulderDeviation: 20,
        torsoVerticality: 40,
        shoulderAsymmetry: 0.06,
        noseForwardDrift: 0.3,
      },
    ]);

    expect(avg.earShoulderDeviation).toBe(15);
    expect(avg.torsoVerticality).toBe(30);
    expect(avg.shoulderAsymmetry).toBeCloseTo(0.04);
    expect(avg.noseForwardDrift).toBeCloseTo(0.2);
  });
});
