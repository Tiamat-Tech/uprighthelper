import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import type { PoseDetector } from '@tensorflow-models/pose-detection';

export async function createMoveNetDetector(): Promise<PoseDetector> {
  await tf.ready();
  await tf.setBackend('webgl');

  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
    },
  );

  return detector;
}

export async function disposeDetector(detector: PoseDetector): Promise<void> {
  detector.dispose();
}
