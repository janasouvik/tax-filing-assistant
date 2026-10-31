import sharp from 'sharp';

export interface PreprocessingOptions {
  grayscale?: boolean;
  normalize?: boolean;
  sharpen?: boolean;
  threshold?: number;
  resizeWidth?: number;
}

export class ImagePreprocessor {
  /**
   * Optimizes an image buffer for Tesseract OCR.
   * Converts to grayscale, enhances contrast, applies unsharp mask,
   * and scales up low-resolution images.
   */
  public static async preprocessForOcr(
    imageBuffer: Buffer,
    options: PreprocessingOptions = {}
  ): Promise<Buffer> {
    const {
      grayscale = true,
      normalize = true,
      sharpen = true,
      threshold,
      resizeWidth,
    } = options;

    let pipeline = sharp(imageBuffer);

    // Read metadata
    const metadata = await pipeline.metadata();

    // Rotate based on EXIF orientation if present
    pipeline = pipeline.rotate();

    // Upscale if image is too small for optical character recognition (aiming for min 1800px width for A4 scans)
    if (resizeWidth) {
      pipeline = pipeline.resize({ width: resizeWidth, withoutEnlargement: false });
    } else if (metadata.width && metadata.width < 1200) {
      pipeline = pipeline.resize({ width: Math.round(metadata.width * 2) });
    }

    if (grayscale) {
      pipeline = pipeline.grayscale();
    }

    if (normalize) {
      pipeline = pipeline.normalize(); // Stretch contrast to full dynamic range [0, 255]
    }

    if (sharpen) {
      pipeline = pipeline.sharpen({ sigma: 1.0, m1: 0.5, m2: 2.0 });
    }

    if (typeof threshold === 'number') {
      pipeline = pipeline.threshold(threshold);
    }

    // Output high quality PNG for Tesseract input
    return await pipeline.png({ compressionLevel: 6 }).toBuffer();
  }

  /**
   * Generates a compressed thumbnail or web-friendly preview image.
   */
  public static async generatePreview(imageBuffer: Buffer, width = 800): Promise<Buffer> {
    return await sharp(imageBuffer)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  }
}

