export interface CameraConfig {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
  frameRate: number;
}

export class CameraCapture {
  private stream: MediaStream | null = null;
  private videoEl: HTMLVideoElement;
  private imageCapture: ImageCapture | null = null;
  private track: MediaStreamTrack | null = null;

  constructor(videoEl: HTMLVideoElement) {
    this.videoEl = videoEl;
  }

  async start(config?: Partial<CameraConfig>): Promise<void> {
    const finalConfig: CameraConfig = {
      width: 1280,
      height: 720,
      facingMode: 'environment',
      frameRate: 30,
      ...config,
    };

    try {
      // Request rear camera first, fall back to any camera
      const constraints = {
        video: {
          facingMode: finalConfig.facingMode,
          width: { ideal: finalConfig.width },
          height: { ideal: finalConfig.height },
          frameRate: { ideal: finalConfig.frameRate },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoEl.srcObject = this.stream;

      // Get the video track for exposure control later
      const tracks = this.stream.getVideoTracks();
      if (tracks.length > 0) {
        this.track = tracks[0];

        // Initialize ImageCapture for full-res photo capture
        if (typeof ImageCapture !== 'undefined') {
          this.imageCapture = new ImageCapture(this.track);
        }
      }

      // Wait for video to be ready
      await new Promise((resolve) => {
        this.videoEl.onloadedmetadata = () => {
          this.videoEl.play().catch(() => {
            // Autoplay might be blocked, but stream is still live
          });
          resolve(null);
        };
      });
    } catch (error) {
      throw new Error(
        `Camera access failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async grabFrame(): Promise<ImageBitmap> {
    if (!this.imageCapture) {
      // Fallback: draw from video element
      const canvas = document.createElement('canvas');
      canvas.width = this.videoEl.videoWidth;
      canvas.height = this.videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      ctx.drawImage(this.videoEl, 0, 0);
      return createImageBitmap(canvas);
    }

    try {
      // Type assertion for ImageCapture API
      if ('grabFrame' in this.imageCapture) {
        return await (this.imageCapture as any).grabFrame();
      }
      throw new Error('grabFrame not supported');
    } catch {
      // Fallback if ImageCapture.grabFrame() fails
      const canvas = document.createElement('canvas');
      canvas.width = this.videoEl.videoWidth;
      canvas.height = this.videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      ctx.drawImage(this.videoEl, 0, 0);
      return createImageBitmap(canvas);
    }
  }

  async takePhoto(): Promise<Blob> {
    if (!this.imageCapture) {
      // Fallback: canvas → blob
      const canvas = document.createElement('canvas');
      canvas.width = this.videoEl.videoWidth;
      canvas.height = this.videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      ctx.drawImage(this.videoEl, 0, 0);
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/jpeg', 0.95);
      });
    }

    try {
      return await this.imageCapture.takePhoto();
    } catch {
      // Fallback to grabFrame + canvas
      const frame = await this.grabFrame();
      const canvas = document.createElement('canvas');
      canvas.width = frame.width;
      canvas.height = frame.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      ctx.drawImage(frame, 0, 0);
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/jpeg', 0.95);
      });
    }
  }

  getTrack(): MediaStreamTrack | null {
    return this.track;
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.track = null;
      this.imageCapture = null;
    }
  }
}
