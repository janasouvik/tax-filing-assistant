import { describe, it, expect } from 'vitest';
import { PanIdentityVerificationService } from '../pan-identity-verification.service';
import { SYNTHETIC_PAN_DATASET } from '../fixtures/synthetic-pan-dataset';

describe('PAN Identity Verification — Full 25 Synthetic Test Fixture Suite', () => {
  describe('Group A (V01–V10): Successful PAN Verification', () => {
    // V01–V05: Aadhaar Linked
    const linkedGroup = SYNTHETIC_PAN_DATASET.filter(r => r.id.startsWith('V') && parseInt(r.id.slice(1)) <= 5);
    // V06–V10: Aadhaar Not Linked
    const unlinkedGroup = SYNTHETIC_PAN_DATASET.filter(r => r.id.startsWith('V') && parseInt(r.id.slice(1)) > 5);

    it('should have 5 records in V01–V05 and 5 in V06–V10', () => {
      expect(linkedGroup).toHaveLength(5);
      expect(unlinkedGroup).toHaveLength(5);
    });

    linkedGroup.forEach((fixture) => {
      it(`[${fixture.id}] ${fixture.submittedName} should verify with outcome PAN_VERIFIED and Aadhaar LINKED`, async () => {
        const result = await PanIdentityVerificationService.verifyIdentity({
          pan: fixture.pan,
          name: fixture.submittedName,
          dob: fixture.submittedDobDisplay,
        });

        expect(result.verificationStatus).toBe('PAN_VERIFIED');
        expect(result.panStatus).toBe('VALID');
        expect(result.nameMatch).toBe(true);
        expect(result.dobMatch).toBe(true);
        expect(result.aadhaarLinkStatus).toBe('LINKED');
        expect(result.success).toBe(true);
        expect(result.message).toBe(
          'PAN verified successfully. Your name and date of birth match the registered records. Aadhaar-PAN linkage is confirmed.'
        );
      });
    });

    unlinkedGroup.forEach((fixture) => {
      it(`[${fixture.id}] ${fixture.submittedName} should verify with outcome PAN_VERIFIED and Aadhaar NOT_LINKED (non-blocking)`, async () => {
        const result = await PanIdentityVerificationService.verifyIdentity({
          pan: fixture.pan,
          name: fixture.submittedName,
          dob: fixture.submittedDobDisplay,
        });

        expect(result.verificationStatus).toBe('PAN_VERIFIED');
        expect(result.panStatus).toBe('VALID');
        expect(result.nameMatch).toBe(true);
        expect(result.dobMatch).toBe(true);
        expect(result.aadhaarLinkStatus).toBe('NOT_LINKED');
        expect(result.success).toBe(true);
        expect(result.message).toBe(
          'PAN verified successfully, but Aadhaar-PAN linkage is not confirmed. Please check your Aadhaar-PAN linking status. You may continue.'
        );
      });
    });
  });

  describe('Group B (I01–I05): Invalid PAN Format', () => {
    const invalidGroup = SYNTHETIC_PAN_DATASET.filter(r => r.id.startsWith('I'));

    it('should have 5 invalid format records', () => {
      expect(invalidGroup).toHaveLength(5);
    });

    invalidGroup.forEach((fixture) => {
      it(`[${fixture.id}] PAN: "${fixture.pan}" should return INVALID_PAN_FORMAT and block progression`, async () => {
        const result = await PanIdentityVerificationService.verifyIdentity({
          pan: fixture.pan,
          name: fixture.submittedName,
          dob: fixture.submittedDobDisplay,
        });

        expect(result.verificationStatus).toBe('INVALID_PAN_FORMAT');
        expect(result.success).toBe(false);
        expect(result.panStatus).toBe('INVALID');
        expect(result.message).toBe('Invalid PAN number. Please enter a valid 10-character PAN.');
      });
    });
  });

  describe('Group C (N01–N05): Name Mismatch', () => {
    const nameMismatchGroup = SYNTHETIC_PAN_DATASET.filter(r => r.id.startsWith('N'));

    it('should have 5 name mismatch records', () => {
      expect(nameMismatchGroup).toHaveLength(5);
    });

    nameMismatchGroup.forEach((fixture) => {
      it(`[${fixture.id}] Name: "${fixture.submittedName}" should return NAME_MISMATCH and block progression`, async () => {
        const result = await PanIdentityVerificationService.verifyIdentity({
          pan: fixture.pan,
          name: fixture.submittedName,
          dob: fixture.submittedDobDisplay,
        });

        expect(result.verificationStatus).toBe('NAME_MISMATCH');
        expect(result.success).toBe(false);
        expect(result.panStatus).toBe('VALID');
        expect(result.nameMatch).toBe(false);
        expect(result.dobMatch).toBe(true);
        expect(result.aadhaarLinkStatus).toBe('UNKNOWN');
        expect(result.message).toBe(
          'The name entered does not match the name registered against this PAN. Please check the name and try again.'
        );
      });
    });
  });

  describe('Group D (D01–D05): DOB Mismatch', () => {
    const dobMismatchGroup = SYNTHETIC_PAN_DATASET.filter(r => r.id.startsWith('D'));

    it('should have 5 DOB mismatch records', () => {
      expect(dobMismatchGroup).toHaveLength(5);
    });

    dobMismatchGroup.forEach((fixture) => {
      it(`[${fixture.id}] DOB: "${fixture.submittedDobDisplay}" should return DOB_MISMATCH and block progression`, async () => {
        const result = await PanIdentityVerificationService.verifyIdentity({
          pan: fixture.pan,
          name: fixture.submittedName,
          dob: fixture.submittedDobDisplay,
        });

        expect(result.verificationStatus).toBe('DOB_MISMATCH');
        expect(result.success).toBe(false);
        expect(result.panStatus).toBe('VALID');
        expect(result.nameMatch).toBe(true);
        expect(result.dobMatch).toBe(false);
        expect(result.aadhaarLinkStatus).toBe('UNKNOWN');
        expect(result.message).toBe(
          'The date of birth entered does not match the date of birth registered against this PAN. Please check your date of birth.'
        );
      });
    });
  });

  describe('Provider Safety & Security Boundaries', () => {
    it('should automatically route synthetic mock PANs to Mock Provider even if provider is not specified in dev', async () => {
      const result = await PanIdentityVerificationService.verifyIdentity({
        pan: 'QWERT1234L',
        name: 'Aarav Sharma',
        dob: '12/03/1998',
      });
      expect(result.provider).toBe('MOCK');
      expect(result.verificationStatus).toBe('PAN_VERIFIED');
    });

    it('should strictly throw MOCK_PAN_SUBMITTED_TO_PRODUCTION if NODE_ENV is production and mock PAN is submitted', async () => {
      const prevEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        await expect(
          PanIdentityVerificationService.verifyIdentity({
            pan: 'QWERT1234L',
            name: 'Aarav Sharma',
            dob: '12/03/1998',
          })
        ).rejects.toThrow('Security Boundary Violation');
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });
  });
});
