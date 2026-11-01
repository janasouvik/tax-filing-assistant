import { describe, it, expect } from 'vitest';
import {
  PanIdentityVerificationService,
  normalizeDate,
  normalizeName,
} from '../pan-identity-verification.service';
import { SYNTHETIC_PAN_DATASET } from '../fixtures/synthetic-pan-dataset';

describe('PanIdentityVerificationService Unit Tests', () => {
  describe('Date and Name Normalization', () => {
    it('normalizes various date formats to YYYY-MM-DD', () => {
      expect(normalizeDate('12/03/1998')).toBe('1998-03-12');
      expect(normalizeDate('12-03-1998')).toBe('1998-03-12');
      expect(normalizeDate('1998-03-12')).toBe('1998-03-12');
      expect(normalizeDate('1998/03/12')).toBe('1998-03-12');
      expect(normalizeDate('invalid')).toBe(null);
      expect(normalizeDate('')).toBe(null);
    });

    it('normalizes names case-insensitively with space collapsing', () => {
      expect(normalizeName('  Aarav   Sharma  ')).toBe('aarav sharma');
      expect(normalizeName('PRIYA VERMA')).toBe('priya verma');
      expect(normalizeName('')).toBe('');
    });
  });

  describe('Full 25-Fixture Evaluation against Mock Authoritative Dataset', () => {
    it('verifies all 25 synthetic records match their expected outcome', async () => {
      expect(SYNTHETIC_PAN_DATASET.length).toBe(25);

      for (const fixture of SYNTHETIC_PAN_DATASET) {
        const result = await PanIdentityVerificationService.verifyIdentity({
          pan: fixture.pan,
          name: fixture.submittedName,
          dob: fixture.submittedDobDisplay,
          provider: 'mock',
        });

        expect(result.verificationStatus).toBe(fixture.expectedResult);
        expect(result.isMockResponse).toBe(true);

        if (fixture.expectedResult === 'PAN_VERIFIED') {
          expect(result.success).toBe(true);
          expect(result.panStatus).toBe('VALID');
          expect(result.nameMatch).toBe(true);
          expect(result.dobMatch).toBe(true);
          expect(result.aadhaarLinkStatus).toBe(fixture.aadhaarStatus);
        } else if (fixture.expectedResult === 'NAME_MISMATCH') {
          expect(result.success).toBe(false);
          expect(result.panStatus).toBe('VALID');
          expect(result.nameMatch).toBe(false);
          expect(result.aadhaarLinkStatus).toBe('UNKNOWN');
        } else if (fixture.expectedResult === 'DOB_MISMATCH') {
          expect(result.success).toBe(false);
          expect(result.panStatus).toBe('VALID');
          expect(result.nameMatch).toBe(true);
          expect(result.dobMatch).toBe(false);
          expect(result.aadhaarLinkStatus).toBe('UNKNOWN');
        } else if (fixture.expectedResult === 'INVALID_PAN' || fixture.expectedResult === 'INVALID_PAN_FORMAT') {
          expect(result.success).toBe(false);
          expect(result.aadhaarLinkStatus).toBe('UNKNOWN');
        }
      }
    });
  });

  describe('Edge Cases and Invariant Guards', () => {
    it('rejects malformed PAN syntax before contacting provider', async () => {
      const res = await PanIdentityVerificationService.verifyIdentity({
        pan: 'ABC123',
        name: 'John Doe',
        dob: '01/01/2000',
        provider: 'mock',
      });
      expect(res.verificationStatus).toBe('INVALID_PAN_FORMAT');
      expect(res.panStatus).toBe('INVALID');
      expect(res.details.formatValid).toBe(false);
      expect(res.details.panFound).toBe(false);
    });

    it('rejects unknown PAN with NOT_FOUND', async () => {
      const res = await PanIdentityVerificationService.verifyIdentity({
        pan: 'ZZZZZ9999Z',
        name: 'Unknown Person',
        dob: '01/01/2000',
        provider: 'mock',
      });
      expect(res.verificationStatus).toBe('INVALID_PAN');
      expect(res.panStatus).toBe('NOT_FOUND');
      expect(res.details.panFound).toBe(false);
    });

    it('enforces hard security boundary against submitting synthetic PANs to Setu', async () => {
      await expect(
        PanIdentityVerificationService.verifyIdentity({
          pan: 'QWERT1234L', // V01 synthetic PAN
          name: 'Aarav Sharma',
          dob: '12/03/1998',
          provider: 'setu',
        })
      ).rejects.toThrow('Security Boundary Violation');
    });
  });
});
