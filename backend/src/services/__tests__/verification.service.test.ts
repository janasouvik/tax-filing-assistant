import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../../config/prisma';
import {
  initiateVerification,
  submitVerificationOtp,
  reconcileVerificationStatus,
  getVerificationHistory,
  sandboxEverifyAdapter
} from '../verification.service';
import * as taxReturnService from '../taxReturn.service';
import { AppError } from '../../utils/response';

vi.mock('../../config/prisma', () => ({
  default: {
    verificationAttempt: {
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    taxReturn: {
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('../taxReturn.service', () => ({
  getTaxReturn: vi.fn(),
}));

describe('Verification Service', () => {
  const userId = 'user-1';
  const returnId = 'tr-1';

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });
    (prisma.verificationAttempt.create as any).mockResolvedValue({ id: 'att-1' });
  });

  describe('Ownership & Access Control', () => {
    it('rejects initiation if user does not own the return', async () => {
      (taxReturnService.getTaxReturn as any).mockRejectedValue(new AppError('Forbidden', 403, 'FORBIDDEN'));

      await expect(initiateVerification(returnId, userId, 'AADHAAR_OTP')).rejects.toThrow('Forbidden');
      expect(prisma.verificationAttempt.create).not.toHaveBeenCalled();
    });

    it('rejects OTP submission if user does not own the return', async () => {
      (taxReturnService.getTaxReturn as any).mockRejectedValue(new AppError('Forbidden', 403, 'FORBIDDEN'));

      await expect(submitVerificationOtp(returnId, userId, '123456')).rejects.toThrow('Forbidden');
    });

    it('rejects reconciliation if user does not own the return', async () => {
      (taxReturnService.getTaxReturn as any).mockRejectedValue(new AppError('Forbidden', 403, 'FORBIDDEN'));

      await expect(reconcileVerificationStatus(returnId, userId)).rejects.toThrow('Forbidden');
    });

    it('rejects history retrieval if user does not own the return', async () => {
      (taxReturnService.getTaxReturn as any).mockRejectedValue(new AppError('Forbidden', 403, 'FORBIDDEN'));

      await expect(getVerificationHistory(returnId, userId)).rejects.toThrow('Forbidden');
    });
  });

  describe('Ineligible Return Rejection & Method Validation', () => {
    it('rejects initiation if return is in DRAFT state', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'DRAFT', verificationStatus: 'UNVERIFIED' });

      await expect(initiateVerification(returnId, userId, 'AADHAAR_OTP'))
        .rejects.toThrow('Only successfully filed returns can be e-verified.');
      expect(prisma.taxReturn.updateMany).not.toHaveBeenCalled();
    });

    it('rejects initiation if return is in APPROVED but not FILED state', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'APPROVED', verificationStatus: 'UNVERIFIED' });

      await expect(initiateVerification(returnId, userId, 'AADHAAR_OTP'))
        .rejects.toThrow('Only successfully filed returns can be e-verified.');
    });

    it('rejects initiation if return is in SUBMISSION_UNKNOWN state', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'SUBMISSION_UNKNOWN', verificationStatus: 'UNVERIFIED' });

      await expect(initiateVerification(returnId, userId, 'AADHAAR_OTP'))
        .rejects.toThrow('Only successfully filed returns can be e-verified.');
    });

    it('rejects initiation if invalid method is specified', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'UNVERIFIED' });

      await expect(initiateVerification(returnId, userId, 'CARRIER_PIGEON'))
        .rejects.toThrow('Invalid verification method');
      expect(prisma.verificationAttempt.create).not.toHaveBeenCalled();
    });

    it('rejects initiation if return is already VERIFIED', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'VERIFIED' });

      await expect(initiateVerification(returnId, userId, 'AADHAAR_OTP'))
        .rejects.toThrow('This return has already been verified.');
    });

    it('rejects initiation if a verification attempt is already PENDING', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'PENDING' });

      await expect(initiateVerification(returnId, userId, 'AADHAAR_OTP'))
        .rejects.toThrow('A verification attempt is currently pending for this return.');
    });

    it('rejects initiation if verification status is UNKNOWN requiring reconciliation', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'UNKNOWN' });

      await expect(initiateVerification(returnId, userId, 'AADHAAR_OTP'))
        .rejects.toThrow('This return has an unknown verification status and requires reconciliation');
    });
  });

  describe('Duplicate Request Protection (Concurrency Claim)', () => {
    it('throws concurrency conflict if atomic claim fails', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'UNVERIFIED' });
      (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 0 });

      await expect(initiateVerification(returnId, userId, 'AADHAAR_OTP'))
        .rejects.toThrow('Verification conflict. Another process is modifying this return.');
      expect(prisma.verificationAttempt.create).not.toHaveBeenCalled();
    });
  });

  describe('Blocked Provider Behavior & Rollback', () => {
    it('rolls back to UNVERIFIED and logs attempt as FAILED when provider is blocked', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'UNVERIFIED' });
      const mockAttempt = { id: 'attempt-1' };
      (prisma.verificationAttempt.create as any).mockResolvedValue(mockAttempt);

      await expect(initiateVerification(returnId, userId, 'AADHAAR_OTP'))
        .rejects.toThrow('Sandbox ERI API test credentials and product scopes are blocked');

      // Attempt logged as FAILED
      expect(prisma.verificationAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: mockAttempt.id },
        data: expect.objectContaining({
          status: 'FAILED',
          errorCategory: 'PROVIDER_ACCESS_BLOCKED',
        }),
      }));

      // Rollback restores original UNVERIFIED status
      expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith({
        where: { id: returnId, verificationStatus: 'PENDING' },
        data: { verificationStatus: 'UNVERIFIED' },
      });
    });

    it('allows retrying initiation on a previously FAILED verification and rolls back to FAILED on blocked provider', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'FAILED' });
      const mockAttempt = { id: 'attempt-2' };
      (prisma.verificationAttempt.create as any).mockResolvedValue(mockAttempt);

      await expect(initiateVerification(returnId, userId, 'EVC_NETBANKING'))
        .rejects.toThrow('Sandbox ERI API test credentials and product scopes are blocked');

      // Attempt logged
      expect(prisma.verificationAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: mockAttempt.id },
        data: expect.objectContaining({ status: 'FAILED' }),
      }));

      // Rollback restores original FAILED status (not trapped in PENDING)
      expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith({
        where: { id: returnId, verificationStatus: 'PENDING' },
        data: { verificationStatus: 'FAILED' },
      });
    });
  });

  describe('submitVerificationOtp', () => {
    it('rejects if return is not FILED', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'READY_FOR_REVIEW', verificationStatus: 'PENDING' });

      await expect(submitVerificationOtp(returnId, userId, '123456'))
        .rejects.toThrow('Only successfully filed returns can be e-verified.');
    });

    it('rejects if return is already VERIFIED', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'VERIFIED' });

      await expect(submitVerificationOtp(returnId, userId, '123456'))
        .rejects.toThrow('This return has already been verified.');
    });

    it('rejects if verificationStatus is not PENDING', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'UNVERIFIED' });

      await expect(submitVerificationOtp(returnId, userId, '123456'))
        .rejects.toThrow('No pending verification request exists for this return.');
    });

    it('rejects invalid OTP formats without calling provider', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'PENDING' });

      await expect(submitVerificationOtp(returnId, userId, 'abc'))
        .rejects.toThrow('Invalid OTP format. Must be a 6-digit numeric code.');
      await expect(submitVerificationOtp(returnId, userId, '12345'))
        .rejects.toThrow('Invalid OTP format. Must be a 6-digit numeric code.');
      await expect(submitVerificationOtp(returnId, userId, ''))
        .rejects.toThrow('Invalid OTP format. Must be a 6-digit numeric code.');
    });

    it('does not mark return verification as FAILED when provider is blocked, records operational attempt failure', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'PENDING' });
      (prisma.verificationAttempt.findFirst as any).mockResolvedValue({ id: 'att-1' });

      await expect(submitVerificationOtp(returnId, userId, '123456'))
        .rejects.toThrow('Sandbox ERI API test credentials and product scopes are blocked');

      // Attempt recorded as FAILED with PROVIDER_ACCESS_BLOCKED
      expect(prisma.verificationAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'att-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          errorCategory: 'PROVIDER_ACCESS_BLOCKED',
        }),
      }));

      // TaxReturn is NOT updated to FAILED (remains PENDING)
      expect(prisma.taxReturn.updateMany).not.toHaveBeenCalledWith(expect.objectContaining({
        data: { verificationStatus: 'FAILED' },
      }));
    });

    it('transitions return to FAILED only on genuine provider rejection contract (400/422)', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'PENDING' });
      (prisma.verificationAttempt.findFirst as any).mockResolvedValue({ id: 'att-1' });

      const verifySpy = vi.spyOn(sandboxEverifyAdapter, 'verifyEVC').mockRejectedValueOnce(
        new AppError('Invalid OTP provided', 400, 'INVALID_EVC')
      );

      await expect(submitVerificationOtp(returnId, userId, '123456')).rejects.toThrow('Invalid OTP provided');

      expect(prisma.verificationAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'att-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          errorCategory: 'INVALID_EVC',
        }),
      }));

      expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith({
        where: { id: returnId, verificationStatus: 'PENDING' },
        data: { verificationStatus: 'FAILED' },
      });

      verifySpy.mockRestore();
    });

    it('transitions to UNKNOWN on ambiguous timeout or 500 error, never VERIFIED', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'PENDING' });
      (prisma.verificationAttempt.findFirst as any).mockResolvedValue({ id: 'att-1' });

      const verifySpy = vi.spyOn(sandboxEverifyAdapter, 'verifyEVC').mockRejectedValueOnce({
        isNetworkError: true,
        message: 'ETIMEDOUT',
      });

      await expect(submitVerificationOtp(returnId, userId, '123456')).rejects.toMatchObject({
        isNetworkError: true,
      });

      expect(prisma.verificationAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'att-1' },
        data: expect.objectContaining({ status: 'UNKNOWN' }),
      }));

      expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith({
        where: { id: returnId, verificationStatus: 'PENDING' },
        data: { verificationStatus: 'UNKNOWN' },
      });

      verifySpy.mockRestore();
    });

    it('sets VERIFIED only when provider returns authoritative success with reference', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'PENDING' });
      (prisma.verificationAttempt.findFirst as any).mockResolvedValue({ id: 'att-1' });

      const verifySpy = vi.spyOn(sandboxEverifyAdapter, 'verifyEVC').mockResolvedValueOnce({
        status: 'SUCCESS',
        verificationReference: 'EVC-REF-999',
      });

      const res = await submitVerificationOtp(returnId, userId, '123456');

      expect(res.verificationStatus).toBe('VERIFIED');
      expect(prisma.verificationAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'att-1' },
        data: expect.objectContaining({
          status: 'SUCCESS',
          providerReference: 'EVC-REF-999',
        }),
      }));

      expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith({
        where: { id: returnId, verificationStatus: 'PENDING' },
        data: { verificationStatus: 'VERIFIED' },
      });

      verifySpy.mockRestore();
    });

    it('rejects setting VERIFIED if provider response is missing reference or not SUCCESS', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'PENDING' });
      (prisma.verificationAttempt.findFirst as any).mockResolvedValue({ id: 'att-1' });

      const verifySpy = vi.spyOn(sandboxEverifyAdapter, 'verifyEVC').mockResolvedValueOnce({
        status: 'OK', // Not 'SUCCESS'
      });

      await expect(submitVerificationOtp(returnId, userId, '123456')).rejects.toThrow('missing authoritative verification confirmation');

      expect(prisma.taxReturn.updateMany).not.toHaveBeenCalledWith(expect.objectContaining({
        data: { verificationStatus: 'VERIFIED' },
      }));

      verifySpy.mockRestore();
    });

  });

  describe('reconcileVerificationStatus', () => {
    it('rejects reconciliation if return is not in UNKNOWN or PENDING', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'VERIFIED' });

      await expect(reconcileVerificationStatus(returnId, userId))
        .rejects.toThrow('Only returns in UNKNOWN or PENDING verification state can be reconciled.');
    });

    it('unlocks abandoned PENDING verification to UNVERIFIED if no attempt exists', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'PENDING' });
      (prisma.verificationAttempt.findFirst as any).mockResolvedValue(null);

      const res = await reconcileVerificationStatus(returnId, userId);

      expect(res.verificationStatus).toBe('UNVERIFIED');
      expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith({
        where: { id: returnId, verificationStatus: 'PENDING' },
        data: { verificationStatus: 'UNVERIFIED' },
      });
    });

    it('fails gracefully with 503 and never marks VERIFIED when attempt exists but provider is blocked', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'UNKNOWN' });
      (prisma.verificationAttempt.findFirst as any).mockResolvedValue({ id: 'att-1' });

      await expect(reconcileVerificationStatus(returnId, userId))
        .rejects.toThrow('Reconciliation unavailable: Sandbox ERI API test credentials and product scopes are blocked');

      expect(prisma.taxReturn.updateMany).not.toHaveBeenCalledWith(expect.objectContaining({
        data: { verificationStatus: 'VERIFIED' },
      }));
    });

  });

  describe('getVerificationHistory', () => {
    it('retrieves verification history preserving filing status separation', async () => {
      (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'FILED', verificationStatus: 'UNVERIFIED' });
      (prisma.verificationAttempt.findMany as any).mockResolvedValue([
        { id: 'att-1', method: 'AADHAAR_OTP', status: 'FAILED', requestedAt: new Date(), errorCategory: 'PROVIDER_ACCESS_BLOCKED' },
      ]);

      const result = await getVerificationHistory(returnId, userId);

      expect(result.taxReturnId).toBe(returnId);
      expect(result.filingStatus).toBe('FILED');
      expect(result.verificationStatus).toBe('UNVERIFIED');
      expect(result.attempts.length).toBe(1);
    });
  });
});
