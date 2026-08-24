import { describe, expect, it, vi } from 'vitest';

vi.mock('idb-keyval', () => ({
  get: vi.fn().mockResolvedValue(undefined),
  set: vi.fn().mockResolvedValue(undefined),
}));

import { CalibrationStore } from '../src/calibration/store.ts';
import type { PostureMetrics } from '../src/types.ts';

const sample: PostureMetrics = {
  earShoulderDeviation: 10,
  torsoVerticality: 12,
  shoulderAsymmetry: 0.03,
  noseForwardDrift: 0.15,
};

describe('CalibrationStore', () => {
  it('tracks upright samples and finalizes baseline', async () => {
    const store = new CalibrationStore();
    store.startUprightCalibration();
    store.addUprightSample(sample);
    store.addUprightSample({ ...sample, earShoulderDeviation: 14 });

    await store.finalizeUpright();

    expect(store.get().baseline?.earShoulderDeviation).toBe(12);
    expect(store.isCalibrated()).toBe(true);
  });

  it('computes margins when bad samples exist', async () => {
    const store = new CalibrationStore();
    store.startUprightCalibration();
    store.addUprightSample(sample);
    await store.finalizeUpright();

    store.startBadCalibration();
    store.addBadSample({
      ...sample,
      earShoulderDeviation: 25,
      noseForwardDrift: 0.5,
    });
    await store.finalizeBad();

    expect(store.get().margins?.earShoulderDeviation).toBeGreaterThan(0);
  });
});
