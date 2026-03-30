import { CameraCapture } from '../components/camera/CameraCapture';
import { DocumentDetector } from '../components/camera/DocumentDetector';

export interface SnapSignals {
  documentDetected: boolean;
  frameStable: boolean;
  imageSharp: boolean;
  consecutiveReady: number;
}

export interface AutoSnapConfig {
  stabilityThreshold: number; // Max pixel difference for stability
  sharpnessThreshold: number; // Laplacian variance threshold
  requiredConsecutiveFrames: number; // Frames needed to trigger snap
  frameInterval: number; // Milliseconds between frame checks
}

export class AutoSnapEngine {
  private camera: CameraCapture;
  private detector: DocumentDetector;
  private config: AutoSnapConfig;
  private isRunning = false;
  private lastFrame: ImageBitmap | null = null;
  private consecutiveReady = 0;
  private onSnapCallback?: (imageBlob: Blob) => void;
  private onStatusCallback?: (signals: SnapSignals) => void;
  private intervalId?: number;

  constructor(camera: CameraCapture, config?: Partial<AutoSnapConfig>) {
    this.camera = camera;
    this.detector = new DocumentDetector(1280, 720); // Default resolution
    this.config = {
      stabilityThreshold: 5,
      sharpnessThreshold: 200,
      requiredConsecutiveFrames: 5,
      frameInterval: 100,
      ...config,
    };
  }

  start(
    onSnap: (imageBlob: Blob) => void,
    onStatus?: (signals: SnapSignals) => void
  ): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.consecutiveReady = 0;
    this.onSnapCallback = onSnap;
    this.onStatusCallback = onStatus;

    this.intervalId = window.setInterval(() => {
      this.checkAndSnap();
    }, this.config.frameInterval);
  }

  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.lastFrame = null;
    this.consecutiveReady = 0;
  }

  private async checkAndSnap(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const frame = await this.camera.grabFrame();
      
      // Check all three signals
      const documentDetected = await this.checkDocumentDetection(frame);
      const frameStable = await this.checkFrameStability(frame);
      const imageSharp = await this.checkImageSharpness(frame);

      // Update consecutive ready counter
      if (documentDetected && frameStable && imageSharp) {
        this.consecutiveReady++;
      } else {
        this.consecutiveReady = 0;
      }

      const signals: SnapSignals = {
        documentDetected,
        frameStable,
        imageSharp,
        consecutiveReady: this.consecutiveReady,
      };

      // Notify status update
      if (this.onStatusCallback) {
        this.onStatusCallback(signals);
      }

      // Check if we should snap
      if (this.consecutiveReady >= this.config.requiredConsecutiveFrames) {
        await this.performSnap();
        this.consecutiveReady = 0; // Reset after snap
      }

      // Store current frame for next stability check
      if (this.lastFrame) {
        this.lastFrame.close();
      }
      this.lastFrame = frame;

    } catch (error) {
      console.error('AutoSnap check failed:', error);
      this.consecutiveReady = 0;
    }
  }

  private async checkDocumentDetection(frame: ImageBitmap): Promise<boolean> {
    const result = this.detector.detect(frame);
    return result.detected;
  }

  private async checkFrameStability(frame: ImageBitmap): Promise<boolean> {
    if (!this.lastFrame) return false;

    // Simple pixel difference calculation
    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    canvas1.width = frame.width;
    canvas1.height = frame.height;
    canvas2.width = frame.width;
    canvas2.height = frame.height;

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    if (!ctx1 || !ctx2) return false;

    ctx1.drawImage(frame, 0, 0);
    ctx2.drawImage(this.lastFrame, 0, 0);

    const imageData1 = ctx1.getImageData(0, 0, frame.width, frame.height);
    const imageData2 = ctx2.getImageData(0, 0, frame.width, frame.height);
    const data1 = imageData1.data;
    const data2 = imageData2.data;

    let totalDiff = 0;
    const pixelCount = frame.width * frame.height;

    for (let i = 0; i < data1.length; i += 4) {
      const diff = Math.abs(data1[i] - data2[i]) + 
                   Math.abs(data1[i + 1] - data2[i + 1]) + 
                   Math.abs(data1[i + 2] - data2[i + 2]);
      totalDiff += diff / 3; // Average across RGB channels
    }

    const avgDiff = totalDiff / pixelCount;
    return avgDiff < this.config.stabilityThreshold;
  }

  private async checkImageSharpness(frame: ImageBitmap): Promise<boolean> {
    // Calculate Laplacian variance as sharpness metric
    const canvas = document.createElement('canvas');
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.drawImage(frame, 0, 0);
    const imageData = ctx.getImageData(0, 0, frame.width, frame.height);
    const data = imageData.data;

    // Convert to grayscale
    const gray = new Float32Array(frame.width * frame.height);
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    // Apply Laplacian kernel
    const laplacian = new Float32Array(gray.length);
    const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
    const width = frame.width;
    const height = frame.height;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            sum += gray[idx] * kernel[kernelIdx];
          }
        }
        laplacian[y * width + x] = sum;
      }
    }

    // Calculate variance
    const mean = laplacian.reduce((a, b) => a + b, 0) / laplacian.length;
    const variance = laplacian.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / laplacian.length;

    return variance > this.config.sharpnessThreshold;
  }

  private async performSnap(): Promise<void> {
    if (!this.onSnapCallback) return;

    try {
      const blob = await this.camera.takePhoto();
      this.onSnapCallback(blob);
    } catch (error) {
      console.error('Failed to capture photo:', error);
    }
  }

  updateConfig(config: Partial<AutoSnapConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getSignals(): SnapSignals {
    return {
      documentDetected: false, // Would need current frame to compute
      frameStable: false,
      imageSharp: false,
      consecutiveReady: this.consecutiveReady,
    };
  }
}
