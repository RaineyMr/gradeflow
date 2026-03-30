import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export class OCRProcessor {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    if (this.worker) return;

    try {
      this.worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      // Configure for better grade recognition
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789/ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,-',
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
      });
    } catch (error) {
      throw new Error(`OCR initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async processImage(imageBlob: Blob): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not available');
    }

    try {
      const { data } = await this.worker.recognize(imageBlob);
      
      return {
        text: data.text.trim(),
        confidence: data.confidence,
        words: (data as any).words?.map((word: any) => ({
          text: word.text,
          confidence: word.confidence,
          bbox: {
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1,
          },
        })) || [],
      };
    } catch (error) {
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async processImageWithRetry(imageBlob: Blob, maxRetries = 2): Promise<OCRResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`OCR attempt ${attempt}/${maxRetries}`);
        const result = await this.processImage(imageBlob);
        
        // If confidence is too low, try again with different settings
        if (result.confidence < 40 && attempt < maxRetries) {
          console.log(`Low confidence (${result.confidence}%), retrying...`);
          
          // Reset worker with different parameters
          if (this.worker) {
            await this.worker.terminate();
          }
          this.worker = null;
          await this.initialize();
          
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`OCR attempt ${attempt} failed:`, lastError);
        
        if (attempt < maxRetries) {
          // Reset worker for retry
          if (this.worker) {
            await this.worker.terminate();
          }
          this.worker = null;
          await this.initialize();
        }
      }
    }

    throw lastError || new Error('OCR processing failed after all retries');
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  // Helper method to extract specific patterns from OCR text
  extractPatterns(text: string): {
    names: string[];
    scores: string[];
    percentages: string[];
  } {
    const names: string[] = [];
    const scores: string[] = [];
    const percentages: string[] = [];

    // Extract names (capitalized words, typically 2-3 words)
    const namePatterns = [
      /\b([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?)\b/g, // First Last [Middle]
      /\b([A-Z]\. [A-Z][a-z]+(?: [A-Z]\.?)?)\b/g, // J. Smith [J.]
    ];

    for (const pattern of namePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        names.push(...matches);
      }
    }

    // Extract scores (fractions like 87/100)
    const scorePattern = /\b(\d{1,3})\s*\/\s*(\d{1,3})\b/g;
    let scoreMatch;
    while ((scoreMatch = scorePattern.exec(text)) !== null) {
      scores.push(scoreMatch[0]);
    }

    // Extract percentages
    const percentagePattern = /\b(\d{1,3})%\b/g;
    let percentageMatch;
    while ((percentageMatch = percentagePattern.exec(text)) !== null) {
      percentages.push(percentageMatch[0]);
    }

    return { names, scores, percentages };
  }
}

// Singleton instance for the app
let ocrInstance: OCRProcessor | null = null;

export function getOCRInstance(): OCRProcessor {
  if (!ocrInstance) {
    ocrInstance = new OCRProcessor();
  }
  return ocrInstance;
}
