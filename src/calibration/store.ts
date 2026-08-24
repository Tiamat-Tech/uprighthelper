import { get, set } from 'idb-keyval';
import type { CalibrationData, PostureMetrics } from '../types.ts';
import { computeMargins } from '../pose/posture.ts';
import { averageMetrics } from '../utils/geometry.ts';

const STORAGE_KEY = 'uprighthelper-calibration';

const emptyCalibration = (): CalibrationData => ({
  baseline: null,
  badSample: null,
  margins: null,
});

export class CalibrationStore {
  private data: CalibrationData = emptyCalibration();
  private uprightSamples: PostureMetrics[] = [];
  private badSamples: PostureMetrics[] = [];

  async load(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;
    const stored = await get<CalibrationData>(STORAGE_KEY);
    if (stored) {
      this.data = stored;
    }
  }

  async save(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;
    await set(STORAGE_KEY, this.data);
  }

  get(): CalibrationData {
    return this.data;
  }

  startUprightCalibration(): void {
    this.uprightSamples = [];
  }

  startBadCalibration(): void {
    this.badSamples = [];
  }

  addUprightSample(metrics: PostureMetrics): number {
    this.uprightSamples.push(metrics);
    return this.uprightSamples.length;
  }

  addBadSample(metrics: PostureMetrics): number {
    this.badSamples.push(metrics);
    return this.badSamples.length;
  }

  async finalizeUpright(): Promise<void> {
    if (this.uprightSamples.length === 0) return;
    this.data.baseline = averageMetrics(this.uprightSamples);
    if (this.data.badSample) {
      this.data.margins = computeMargins(this.data.baseline, this.data.badSample);
    }
    await this.save();
    this.uprightSamples = [];
  }

  async finalizeBad(): Promise<void> {
    if (this.badSamples.length === 0) return;
    this.data.badSample = averageMetrics(this.badSamples);
    if (this.data.baseline) {
      this.data.margins = computeMargins(this.data.baseline, this.data.badSample);
    }
    await this.save();
    this.badSamples = [];
  }

  isCalibrated(): boolean {
    return this.data.baseline !== null;
  }
}
