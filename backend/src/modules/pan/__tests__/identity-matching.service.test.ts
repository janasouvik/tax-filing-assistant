import { describe, it, expect } from 'vitest';
import {
  IdentityMatchingService,
  normalizeDate,
  normalizeName,
} from '../identity-matching.service';
import {
  SYNTHETIC_PAN_DATASET,
  isSyntheticMockPan,
} from '../fixtures/synthetic-pan-dataset';
import { verifyPanWithProvider } from '../pan.service';

describe('IdentityMatchingService & 25-Record Synthetic Dataset', () => {
  // =========================================================================
  // Date Normalization Unit Tests
  // =========================================================================
  describe('Date Normalization', () => {
    it('normalizes DD/MM/YYYY to YYYY-MM-DD', () => {
      expect(normalizeDate('12/03/1998')).toBe('1998-03-12');
      expect(normalizeDate('24/07/1999')).toBe('1999-07-24');
    });

    it('normalizes YYYY-MM-DD to YYYY-MM-DD', () => {
      expect(normalizeDate('1998-03-12')).toBe('1998-03-12');
    });

    it('handles DD-MM-YYYY and single digits correctly', () => {
      expect(normalizeDate('5/2/2000')).toBe('2000-02-05');
      expect(normalizeDate('05-02-2000')).toBe('2000-02-05');
    });

    it('returns null for empty or invalid date strings', () => {
      expect(normalizeDate('')).toBeNull();
      expect(normalizeDate(null)).toBeNull();
      expect(normalizeDate('not-a-date')).toBeNull();
    });
  });

  // =========================================================================
  // Group A — 10 Properly Verified PAN Records (5 Linked, 5 Not Linked)
  // =========================================================================
  describe('Group A: 10 Properly Verified PAN Records', () => {
    const groupA = SYNTHETIC_PAN_DATASET.filter(r => r.group === 'VERIFIED');

    it('contains exactly 10 records', () => {
      expect(groupA).toHaveLength(10);
    });

    it('has exactly 5 LINKED and 5 NOT_LINKED records', () => {
      const linked = groupA.filter(r => r.aadhaarStatus === 'LINKED');
      const notLinked = groupA.filter(r => r.aadhaarStatus === 'NOT_LINKED');
      expect(linked).toHaveLength(5);
      expect(notLinked).toHaveLength(5);
    });

    // Test each of the 10 verified records individually
    groupA.forEach(record => {
      it(`[${record.id}] verifies ${record.submittedName} (${record.pan}) with Aadhaar ${record.aadhaarStatus}`, async () => {
        const result = await IdentityMatchingService.verifyIdentity({
          pan: record.pan,
          name: record.submittedName,
          dob: record.submittedDobDisplay,
        });

        expect(result.verificationStatus).toBe('PAN_VERIFIED');
        expect(result.panStatus).toBe('VALID');
        expect(result.nameMatch).toBe(true);
        expect(result.dobMatch).toBe(true);
        expect(result.aadhaarLinkStatus).toBe(record.aadhaarStatus);
        expect(result.registeredName).toBe(record.registeredName);
        expect(result.testRecordId).toBe(record.id);
        expect(result.isMockResponse).toBe(true);
        expect(result.details.panFound).toBe(true);
        expect(result.details.nameComparison.matched).toBe(true);
        expect(result.details.dobComparison.matched).toBe(true);
      });
    });
  });

  // =========================================================================
  // Group B — 5 Invalid PAN Records
  // =========================================================================
  describe('Group B: 5 Invalid PAN Records', () => {
    const groupB = SYNTHETIC_PAN_DATASET.filter(r => r.group === 'INVALID_PAN');

    it('contains exactly 5 records', () => {
      expect(groupB).toHaveLength(5);
    });

    groupB.forEach(record => {
      it(`[${record.id}] correctly rejects invalid PAN ${record.pan} (${record.submittedName})`, async () => {
        const result = await IdentityMatchingService.verifyIdentity({
          pan: record.pan,
          name: record.submittedName,
          dob: record.submittedDobDisplay,
        });

        expect(result.verificationStatus).toBe('INVALID_PAN');
        expect(['INVALID', 'NOT_FOUND']).toContain(result.panStatus);
        expect(result.nameMatch).toBe(false);
        expect(result.dobMatch).toBe(false);
        expect(result.aadhaarLinkStatus).toBe('UNKNOWN');
        expect(result.registeredName).toBeNull();
      });
    });
  });

  // =========================================================================
  // Group C — 5 Name Mismatch Records (PAN exists, DOB matches, Name differs)
  // =========================================================================
  describe('Group C: 5 Name Mismatch Records', () => {
    const groupC = SYNTHETIC_PAN_DATASET.filter(r => r.group === 'NAME_MISMATCH');

    it('contains exactly 5 records', () => {
      expect(groupC).toHaveLength(5);
    });

    groupC.forEach(record => {
      it(`[${record.id}] detects Name Mismatch for ${record.pan} (Submitted: "${record.submittedName}", Reg: "${record.registeredName}")`, async () => {
        const result = await IdentityMatchingService.verifyIdentity({
          pan: record.pan,
          name: record.submittedName,
          dob: record.submittedDobDisplay,
        });

        expect(result.verificationStatus).toBe('NAME_MISMATCH');
        expect(result.panStatus).toBe('VALID');
        expect(result.nameMatch).toBe(false);
        expect(result.dobMatch).toBe(true); // DOB matches
        // Aadhaar linkage must be UNKNOWN on failed verification per specification
        expect(result.aadhaarLinkStatus).toBe('UNKNOWN');
        expect(result.registeredName).toBe(record.registeredName);
        expect(result.details.panFound).toBe(true);
        expect(result.details.nameComparison.matched).toBe(false);
        expect(result.details.dobComparison.matched).toBe(true);
      });
    });
  });

  // =========================================================================
  // Group D — 5 DOB Mismatch Records (PAN exists, Name matches, DOB differs)
  // =========================================================================
  describe('Group D: 5 DOB Mismatch Records', () => {
    const groupD = SYNTHETIC_PAN_DATASET.filter(r => r.group === 'DOB_MISMATCH');

    it('contains exactly 5 records', () => {
      expect(groupD).toHaveLength(5);
    });

    groupD.forEach(record => {
      it(`[${record.id}] detects DOB Mismatch for ${record.pan} (Submitted DOB: ${record.submittedDobDisplay}, Reg: ${record.registeredDobDisplay})`, async () => {
        const result = await IdentityMatchingService.verifyIdentity({
          pan: record.pan,
          name: record.submittedName,
          dob: record.submittedDobDisplay,
        });

        expect(result.verificationStatus).toBe('DOB_MISMATCH');
        expect(result.panStatus).toBe('VALID');
        expect(result.nameMatch).toBe(true); // Name matches
        expect(result.dobMatch).toBe(false); // DOB differs
        // Aadhaar linkage must be UNKNOWN on failed verification per specification
        expect(result.aadhaarLinkStatus).toBe('UNKNOWN');
        expect(result.registeredName).toBe(record.registeredName);
        expect(result.details.panFound).toBe(true);
        expect(result.details.nameComparison.matched).toBe(true);
        expect(result.details.dobComparison.matched).toBe(false);
      });
    });
  });

  // =========================================================================
  // Edge Cases: Unknown PAN, Missing Name, Missing DOB, Invalid Date, Repeat
  // =========================================================================
  describe('Edge Cases & Determinism', () => {
    it('returns INVALID_PAN with NOT_FOUND for a valid-format PAN not in database', async () => {
      const result = await IdentityMatchingService.verifyIdentity({
        pan: 'ZZZZZ9999Z',
        name: 'Random Person',
        dob: '1990-01-01',
      });

      expect(result.verificationStatus).toBe('INVALID_PAN');
      expect(result.panStatus).toBe('NOT_FOUND');
      expect(result.message).toContain('PAN does not exist');
      expect(result.aadhaarLinkStatus).toBe('UNKNOWN');
    });

    it('detects name mismatch when submitted name is empty', async () => {
      // V01 exists
      const result = await IdentityMatchingService.verifyIdentity({
        pan: 'QWERT1234L',
        name: '',
        dob: '12/03/1998',
      });

      expect(result.verificationStatus).toBe('NAME_MISMATCH');
      expect(result.nameMatch).toBe(false);
      expect(result.dobMatch).toBe(true);
    });

    it('detects DOB mismatch when submitted DOB is empty or missing', async () => {
      // V01 exists
      const result = await IdentityMatchingService.verifyIdentity({
        pan: 'QWERT1234L',
        name: 'Aarav Sharma',
        dob: '',
      });

      expect(result.verificationStatus).toBe('DOB_MISMATCH');
      expect(result.nameMatch).toBe(true);
      expect(result.dobMatch).toBe(false);
    });

    it('detects DOB mismatch when submitted DOB has invalid format', async () => {
      const result = await IdentityMatchingService.verifyIdentity({
        pan: 'QWERT1234L',
        name: 'Aarav Sharma',
        dob: '32/13/1998', // Impossible date
      });

      expect(result.verificationStatus).toBe('DOB_MISMATCH');
      expect(result.dobMatch).toBe(false);
    });

    it('guarantees 100% deterministic identical results for duplicate executions', async () => {
      const run1 = await IdentityMatchingService.verifyIdentity({
        pan: 'QWERT1234L',
        name: 'Aarav Sharma',
        dob: '12/03/1998',
      });

      const run2 = await IdentityMatchingService.verifyIdentity({
        pan: 'QWERT1234L',
        name: 'Aarav Sharma',
        dob: '12/03/1998',
      });

      expect(run1.verificationStatus).toBe(run2.verificationStatus);
      expect(run1.panStatus).toBe(run2.panStatus);
      expect(run1.nameMatch).toBe(run2.nameMatch);
      expect(run1.dobMatch).toBe(run2.dobMatch);
      expect(run1.aadhaarLinkStatus).toBe(run2.aadhaarLinkStatus);
      expect(run1.registeredName).toBe(run2.registeredName);
      expect(run1.testRecordId).toBe(run2.testRecordId);
    });
  });

  // =========================================================================
  // Hard Security Boundary: Block Synthetic PANs from Setu
  // =========================================================================
  describe('Hard Security Boundary', () => {
    it('recognizes all 25 synthetic PANs as synthetic mock fixtures', () => {
      SYNTHETIC_PAN_DATASET.forEach(rec => {
        expect(isSyntheticMockPan(rec.pan)).toBe(true);
      });
      expect(isSyntheticMockPan('ABCDE1234A')).toBe(true);
      expect(isSyntheticMockPan('ABCDE1234B')).toBe(true);
    });

    it('strictly prevents synthetic PANs from being submitted in Setu mode', async () => {
      const originalProvider = process.env.PAN_PROVIDER;
      process.env.PAN_PROVIDER = 'setu';

      try {
        await expect(verifyPanWithProvider('QWERT1234L')).rejects.toThrowError(
          /Security Boundary Violation/
        );
      } finally {
        process.env.PAN_PROVIDER = originalProvider;
      }
    });
  });
});

