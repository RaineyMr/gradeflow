export interface Point {
  x: number;
  y: number;
}

export interface Quad {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface DetectionResult {
  detected: boolean;
  quad: Quad | null;
  coverage: number;
  alignmentScore: number;
}

export class DocumentDetector {
  private width: number;
  private height: number;
  private guideBoxArea: number; // Expected document area (90% of frame)

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.guideBoxArea = width * height * 0.9;
  }

  detect(frame: ImageBitmap): DetectionResult {
    const canvas = document.createElement('canvas');
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { detected: false, quad: null, coverage: 0, alignmentScore: 0 };

    // Draw frame to canvas
    ctx.drawImage(frame, 0, 0);
    const imageData = ctx.getImageData(0, 0, frame.width, frame.height);
    const data = imageData.data;

    // Convert to grayscale
    const gray = new Uint8ClampedArray(frame.width * frame.height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }

    // Sobel edge detection
    const edges = this.sobelFilter(gray, frame.width, frame.height);

    // Otsu threshold
    const threshold = this.otsuThreshold(edges);
    const binary = new Uint8ClampedArray(edges.length);
    for (let i = 0; i < edges.length; i++) {
      binary[i] = edges[i] > threshold ? 255 : 0;
    }

    // Find contours (simplified: find bounding boxes of connected components)
    const quads = this.findQuads(binary, frame.width, frame.height);

    if (quads.length === 0) {
      return { detected: false, quad: null, coverage: 0, alignmentScore: 0 };
    }

    // Score quads by coverage + alignment
    let bestQuad = quads[0];
    let bestScore = 0;

    for (const quad of quads) {
      const coverage = this.quadArea(quad) / this.guideBoxArea;
      const alignment = this.alignmentScore(quad);
      const score = coverage * 0.6 + alignment * 0.4;

      if (coverage > 0.3 && alignment > 0.5 && score > bestScore) {
        bestScore = score;
        bestQuad = quad;
      }
    }

    const coverage = Math.min(this.quadArea(bestQuad) / this.guideBoxArea, 1);
    const alignment = this.alignmentScore(bestQuad);

    return {
      detected: coverage > 0.3 && alignment > 0.5,
      quad: bestQuad,
      coverage,
      alignmentScore: alignment,
    };
  }

  private sobelFilter(
    gray: Uint8ClampedArray,
    width: number,
    height: number
  ): Uint8ClampedArray {
    const edges = new Uint8ClampedArray(gray.length);

    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0;
        let gy = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = (y + dy) * width + (x + dx);
            const kernelIdx = (dy + 1) * 3 + (dx + 1);
            gx += gray[idx] * sobelX[kernelIdx];
            gy += gray[idx] * sobelY[kernelIdx];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[y * width + x] = Math.min(magnitude, 255);
      }
    }

    return edges;
  }

  private otsuThreshold(data: Uint8ClampedArray): number {
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i++) {
      histogram[data[i]]++;
    }

    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i];
    }

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let mB = 0;
    let mF = 0;
    let maxVar = 0;
    let threshold = 0;

    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;

      wF = data.length - wB;
      if (wF === 0) break;

      sumB += t * histogram[t];
      mB = sumB / wB;
      mF = (sum - sumB) / wF;

      const varBetween = wB * wF * Math.pow(mB - mF, 2);
      if (varBetween > maxVar) {
        maxVar = varBetween;
        threshold = t;
      }
    }

    return threshold;
  }

  private findQuads(binary: Uint8ClampedArray, width: number, height: number): Quad[] {
    const quads: Quad[] = [];
    const visited = new Set<number>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (binary[idx] > 0 && !visited.has(idx)) {
          const bounds = this.floodFill(binary, visited, x, y, width, height);
          if (bounds) {
            const quad = this.boundsToQuad(bounds);
            quads.push(quad);
          }
        }
      }
    }

    return quads;
  }

  private floodFill(
    binary: Uint8ClampedArray,
    visited: Set<number>,
    startX: number,
    startY: number,
    width: number,
    height: number
  ): { minX: number; maxX: number; minY: number; maxY: number } | null {
    const stack = [[startX, startY]];
    let minX = startX;
    let maxX = startX;
    let minY = startY;
    let maxY = startY;
    let pixelCount = 0;

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const idx = y * width + x;

      if (visited.has(idx) || binary[idx] === 0) continue;
      visited.add(idx);
      pixelCount++;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      for (const [dx, dy] of [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          stack.push([nx, ny]);
        }
      }

      // Limit flood fill to avoid huge regions
      if (pixelCount > 100000) break;
    }

    // Ignore tiny regions
    if (pixelCount < 100) return null;

    return { minX, maxX, minY, maxY };
  }

  private boundsToQuad(bounds: { minX: number; maxX: number; minY: number; maxY: number }): Quad {
    return {
      topLeft: { x: bounds.minX, y: bounds.minY },
      topRight: { x: bounds.maxX, y: bounds.minY },
      bottomRight: { x: bounds.maxX, y: bounds.maxY },
      bottomLeft: { x: bounds.minX, y: bounds.maxY },
    };
  }

  private quadArea(quad: Quad): number {
    // Approximate area as bounding box
    const minX = Math.min(quad.topLeft.x, quad.topRight.x, quad.bottomLeft.x, quad.bottomRight.x);
    const maxX = Math.max(quad.topLeft.x, quad.topRight.x, quad.bottomLeft.x, quad.bottomRight.x);
    const minY = Math.min(quad.topLeft.y, quad.topRight.y, quad.bottomLeft.y, quad.bottomRight.y);
    const maxY = Math.max(quad.topLeft.y, quad.topRight.y, quad.bottomLeft.y, quad.bottomRight.y);
    return (maxX - minX) * (maxY - minY);
  }

  private alignmentScore(quad: Quad): number {
    // Score how close corners are to 90-degree angles
    const angles = [
      this.cornerAngle(quad.topLeft, quad.topRight, quad.bottomLeft),
      this.cornerAngle(quad.topRight, quad.topLeft, quad.bottomRight),
      this.cornerAngle(quad.bottomRight, quad.topRight, quad.bottomLeft),
      this.cornerAngle(quad.bottomLeft, quad.bottomRight, quad.topLeft),
    ];

    // Average deviation from 90 degrees
    const deviations = angles.map((a) => Math.abs(a - 90));
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / 4;

    // 0 = perfect alignment (90°), 1 = completely misaligned (180°)
    return Math.max(0, 1 - avgDeviation / 90);
  }

  private cornerAngle(corner: Point, p1: Point, p2: Point): number {
    const v1 = { x: p1.x - corner.x, y: p1.y - corner.y };
    const v2 = { x: p2.x - corner.x, y: p2.y - corner.y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 === 0 || mag2 === 0) return 0;

    const cos = dot / (mag1 * mag2);
    return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  }
}
