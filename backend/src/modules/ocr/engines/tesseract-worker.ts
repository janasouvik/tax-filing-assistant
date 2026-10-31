import { createWorker, Worker } from 'tesseract.js';
import { ImagePreprocessor } from './image-preprocessor';

export interface OcrResult {
  text: string;
  confidence: number;
}

export class TesseractEngine {
  private static workerPromise: Promise<Worker> | null = null;
  private static workerInstance: Worker | null = null;
  private static idleTimer: NodeJS.Timeout | null = null;
  private static isProcessing = false;
  private static queue: Array<() => void> = [];

  private static readonly IDLE_TIMEOUT_MS = 120000; // 2 minutes idle shutdown
  private static readonly JOB_TIMEOUT_MS = 45000; // 45 seconds per page timeout

  /**
   * Acquires or initializes the singleton Tesseract worker.
   */
  private static async getWorker(): Promise<Worker> {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    if (this.workerInstance) {
      return this.workerInstance;
    }

    if (!this.workerPromise) {
      this.workerPromise = (async () => {
        const worker = await createWorker('eng');
        this.workerInstance = worker;
        return worker;
      })();
    }

    return await this.workerPromise;
  }

  private static resetIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(async () => {
      await this.terminate();
    }, this.IDLE_TIMEOUT_MS);
  }

  /**
   * Serializes OCR requests to prevent CPU thrashing.
   */
  private static async acquireLock(): Promise<void> {
    if (!this.isProcessing) {
      this.isProcessing = true;
      return;
    }
    await new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  private static releaseLock(): void {
    const next = this.queue.shift();
    if (next) {
      next();
    } else {
      this.isProcessing = false;
    }
  }

  /**
   * Recognizes text from an image buffer with automatic preprocessing.
   */
  public static async recognizeImage(
    imageBuffer: Buffer,
    preprocess = true,
    onProgress?: (progress: number) => void
  ): Promise<OcrResult> {
    await this.acquireLock();
    try {
      const bufferToOcr = preprocess
        ? await ImagePreprocessor.preprocessForOcr(imageBuffer)
        : imageBuffer;

      const worker = await this.getWorker();

      // Wrap in timeout
      const ocrJob = async (): Promise<OcrResult> => {
        const result = await worker.recognize(bufferToOcr);
        if (onProgress) onProgress(100);
        return {
          text: result.data.text || '',
          confidence: Math.round(result.data.confidence || 0) / 100,
        };
      };

      const timeoutPromise = new Promise<OcrResult>((_, reject) => {
        setTimeout(() => reject(new Error('Tesseract OCR processing timed out')), this.JOB_TIMEOUT_MS);
      });

      return await Promise.race([ocrJob(), timeoutPromise]);
    } finally {
      this.releaseLock();
      this.resetIdleTimer();
    }
  }

  /**
   * Cleanly terminates the OCR worker and frees memory.
   */
  public static async terminate(): Promise<void> {
    if (this.workerInstance) {
      try {
        await this.workerInstance.terminate();
      } catch (err) {
        console.warn('[TesseractEngine] Error terminating worker:', err);
      } finally {
        this.workerInstance = null;
        this.workerPromise = null;
      }
    }
  }
}

