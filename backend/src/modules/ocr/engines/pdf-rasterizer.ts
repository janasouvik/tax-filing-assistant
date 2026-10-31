import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

export class PdfRasterizer {
  private static findBinary(name: string): string | null {
    const candidates = [
      `/opt/homebrew/bin/${name}`,
      `/usr/local/bin/${name}`,
      `/usr/bin/${name}`,
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return null;
  }

  /**
   * Renders a specific page of a PDF file into a high-resolution PNG image Buffer.
   * Uses pdftoppm (Poppler) at 200 DPI.
   */
  public static async rasterizePage(pdfBuffer: Buffer, pageNumber: number, dpi = 200): Promise<Buffer> {
    const pdftoppmPath = this.findBinary('pdftoppm');
    if (!pdftoppmPath) {
      throw new Error('Poppler pdftoppm is not found. Please ensure poppler is installed.');
    }

    const tmpDir = os.tmpdir();
    const tempPdf = path.join(tmpDir, `raster_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);
    const outputPrefix = path.join(tmpDir, `page_${Date.now()}_${Math.random().toString(36).slice(2)}`);

    await fs.promises.writeFile(tempPdf, pdfBuffer);

    try {
      await execFileAsync(pdftoppmPath, [
        '-png',
        '-r', dpi.toString(),
        '-f', pageNumber.toString(),
        '-l', pageNumber.toString(),
        tempPdf,
        outputPrefix,
      ]);

      // pdftoppm produces files formatted like prefix-1.png or prefix-01.png
      const dirFiles = await fs.promises.readdir(tmpDir);
      const basePrefix = path.basename(outputPrefix);
      const generatedFile = dirFiles.find(f => f.startsWith(basePrefix) && f.endsWith('.png'));

      if (!generatedFile) {
        throw new Error(`pdftoppm rendered page ${pageNumber} but output file was not found.`);
      }

      const fullImagePath = path.join(tmpDir, generatedFile);
      const imgBuffer = await fs.promises.readFile(fullImagePath);
      await fs.promises.unlink(fullImagePath);

      return imgBuffer;
    } finally {
      fs.unlink(tempPdf, () => {});
    }
  }
}

