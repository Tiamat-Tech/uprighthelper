export class WebcamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebcamError';
  }
}

export async function setupWebcam(video: HTMLVideoElement): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new WebcamError(
      'Camera access is not supported in this browser. Try Chrome or Firefox over HTTPS.',
    );
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });

    video.srcObject = stream;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.play().then(resolve).catch(reject);
      };
      video.onerror = () => reject(new WebcamError('Failed to load webcam stream.'));
    });

    return stream;
  } catch (err) {
    if (err instanceof WebcamError) throw err;

    const domError = err as DOMException;
    if (domError.name === 'NotAllowedError') {
      throw new WebcamError('Camera permission denied. Allow webcam access and refresh.');
    }
    if (domError.name === 'NotFoundError') {
      throw new WebcamError('No camera found. Connect a webcam and try again.');
    }
    throw new WebcamError('Could not access the webcam.');
  }
}

export function stopWebcam(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}
