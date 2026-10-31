import pdfParse from 'pdf-parse';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ExtractedPageResult } from '../types';

const execFileAsync = promisify(execFile);

export interface PdfExtractionResult {
  pageCount: number;
  fullText: string;
  isDigital: boolean;
  pages: ExtractedPageResult[];
}

export class PdfExtractor {
  /**
   * Attempts to extract text using pdftotext (Poppler) first for perfect per-page layout,
   * falling back to pdf-parse pure JS engine if pdftotext binary is not available.
   */
  public static async extractText(pdfBuffer: Buffer): Promise<PdfExtractionResult> {
    // Try Poppler pdftotext first (preserves physical column layout)
    const popplerPath = await this.findPopplerBinary('pdftotext');
    if (popplerPath) {
      try {
        return await this.extractWithPoppler(pdfBuffer, popplerPath);
      } catch (err) {
        console.warn('[PdfExtractor] Poppler extraction failed, falling back to pdf-parse:', err);
      }
    }

    // Fallback: Pure JS pdf-parse
    return await this.extractWithPdfParse(pdfBuffer);
  }

  private static async findPopplerBinary(name: string): Promise<string | null> {
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

  private static async extractWithPoppler(pdfBuffer: Buffer, pdftotextPath: string): Promise<PdfExtractionResult> {
    const tmpDir = os.tmpdir();
    const tempFile = path.join(tmpDir, `pdf_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);
    await fs.promises.writeFile(tempFile, pdfBuffer);

    try {
      // Get page count using pdfinfo if available
      let pageCount = 1;
      const pdfinfoPath = await this.findPopplerBinary('pdfinfo');
      if (pdfinfoPath) {
        try {
          const { stdout: infoOut } = await execFileAsync(pdfinfoPath, [tempFile]);
          const pagesMatch = infoOut.match(/Pages:\s+(\d+)/i);
          if (pagesMatch) pageCount = parseInt(pagesMatch[1], 10);
        } catch {
          // Ignore, fallback to single run
        }
      }

      const pages: ExtractedPageResult[] = [];
      let fullText = '';

      for (let p = 1; p <= pageCount; p++) {
        const { stdout: pageText } = await execFileAsync(pdftotextPath, [
          '-layout',
          '-f', p.toString(),
          '-l', p.toString(),
          tempFile,
          '-' // output to stdout
        ]);

        const trimmed = pageText.trim();
        const isScanned = trimmed.length < 25; // negligible selectable text indicates scanned image
        const confidence = isScanned ? 0.2 : 0.95;

        pages.push({
          pageNumber: p,
          text: pageText,
          confidence,
          isScanned,
        });

        fullText += (fullText ? '\n\n' : '') + `--- Page ${p} ---\n` + pageText;
      }

      const hasDigitalText = pages.some(p => !p.isScanned);
      return {
        pageCount: pages.length,
        fullText,
        isDigital: hasDigitalText,
        pages,
      };
    } finally {
      fs.unlink(tempFile, () => {});
    }
  }

  private static async extractWithPdfParse(pdfBuffer: Buffer): Promise<PdfExtractionResult> {
    const pages: ExtractedPageResult[] = [];

    // Custom pager callback for pdf-parse to separate pages
    const pager = (pageData: any) => {
      return pageData.getTextContent().then((textContent: any) => {
        let lastY: number | null = null;
        let text = '';
        for (const item of textContent.items) {
          if (lastY == null || Math.abs(item.transform[5] - lastY) > 5) {
            text += '\n' + item.str;
          } else {
            text += ' ' + item.str;
          }
          lastY = item.transform[5];
        }
        return text;
      });
    };

    const data = await pdfParse(pdfBuffer, { pager } as any);
    const rawPages = data.text.split(/\f|\n--- Page \d+ ---\n/);
    const cleanedPages = rawPages.filter(p => p.trim().length > 0);
    const pageCount = data.numpages || (cleanedPages.length > 0 ? cleanedPages.length : 1);

    if (cleanedPages.length === 0) {
      // Image or scanned PDF
      pages.push({
        pageNumber: 1,
        text: '',
        confidence: 0.1,
        isScanned: true,
      });
    } else {
      cleanedPages.forEach((pageText, idx) => {
        const trimmed = pageText.trim();
        const isScanned = trimmed.length < 25;
        pages.push({
          pageNumber: idx + 1,
          text: pageText,
          confidence: isScanned ? 0.2 : 0.95,
          isScanned,
        });
      });
    }

    const hasDigitalText = pages.some(p => !p.isScanned);
    return {
      pageCount,
      fullText: data.text,
      isDigital: hasDigitalText,
      pages,
    };
  }
}
