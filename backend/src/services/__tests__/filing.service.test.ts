import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeItrFiling, reconcileFilingStatus } from '../filing.service';
import prisma from '../../config/prisma';
import * as sandboxService from '../sandbox.service';
import * as taxReturnService from '../taxReturn.service';
import { AppError } from '../../utils/response';
import { ProviderError } from '../sandbox.service';

vi.mock('../../config/prisma', () => ({
  default: {
    taxReturn: { updateMany: vi.fn(), update: vi.fn() },
    filingAttempt: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn() }
  }
}));

vi.mock('../taxReturn.service', () => ({
  getTaxReturn: vi.fn(), getIncome: vi.fn(), getDeductions: vi.fn()
}));

vi.mock('../sandbox.service', () => ({
  authenticateSandbox: vi.fn(), loginEri: vi.fn(), prepareItrJson: vi.fn(),
  validateItr: vi.fn(), submitItr: vi.fn(), getFilingStatus: vi.fn(),
  ProviderError: class ProviderError extends Error {
    public statusCode?: number;
    public isNetworkError: boolean;
    public step: string;
    constructor(msg: string, step: string, code?: number, isNet: boolean = false) {
      super(msg); this.step = step; this.statusCode = code; this.isNetworkError = isNet;
    }
  }
}));

describe('executeItrFiling', () => {
  const userId = 'user-1';
  const returnId = 'tr-1';

  const createMockReturn = (overrides: any = {}) => ({
    id: returnId,
    workspaceId: 'ws-1',
    financialYear: '2024-25',
    assessmentYear: '2025-26',
    returnType: 'ITR1',
    status: 'READY_FOR_REVIEW',
    regime: 'NEW',
    workspace: {
      pan: 'ABCDE1234F',
      name: 'John Doe',
      taxpayerProfile: {
        fullName: 'John Doe',
        dateOfBirth: new Date('1990-01-01'),
        panVerification: { pan: 'ABCDE1234F' }
      }
    },
    metadata: {
      bankAccounts: [
        {
          accountNumber: '123456789012',
          ifsc: 'HDFC0001234',
          accountType: 'SAVINGS',
          isRefundAccount: true
        }
      ]
    },
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (taxReturnService.getIncome as any).mockReset();
    (taxReturnService.getDeductions as any).mockReset();
    (prisma.taxReturn.update as any).mockReset();
    (prisma.filingAttempt.create as any).mockReset();
    (prisma.filingAttempt.update as any).mockReset();

    (taxReturnService.getIncome as any).mockResolvedValue([]);
    (taxReturnService.getDeductions as any).mockResolvedValue([]);
    (prisma.filingAttempt.create as any).mockResolvedValue({ id: 'att-1' });
  });

  it('rejects filing if the user does not own the return', async () => {
    (taxReturnService.getTaxReturn as any).mockRejectedValue(new AppError('Forbidden', 403, 'FORBIDDEN'));
    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('Forbidden');
  });

  it('rejects filing if the return status is ineligible', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'PROCESSING' }));
    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('currently being processed');
  });

  it('throws concurrency conflict if atomic claim fails', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'READY_FOR_REVIEW' }));
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 0 }); 
    
    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('Filing conflict');
    expect(sandboxService.authenticateSandbox).not.toHaveBeenCalled();
  });

  it('persists successful filing with ack number and creates attempt record', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'READY_FOR_REVIEW' }));
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });
    (sandboxService.authenticateSandbox as any).mockResolvedValue('token');
    (sandboxService.loginEri as any).mockResolvedValue('eri-token');
    (sandboxService.prepareItrJson as any).mockResolvedValue({});
    (sandboxService.validateItr as any).mockResolvedValue({});
    (sandboxService.submitItr as any).mockResolvedValue({
      data: { acknowledgement_number: 'ACK123', is_mock: true },
      transaction_id: 'TX123', timestamp: '2025-01-01T00:00:00Z'
    });
    (prisma.taxReturn.update as any).mockResolvedValue({ id: returnId, status: 'FILED' });

    await executeItrFiling(returnId, userId);

    expect(prisma.filingAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'SUCCESS', ackNumber: 'ACK123' })
    }));
    expect(prisma.taxReturn.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'FILED', ackNumber: 'ACK123' })
    }));
  });

  it('marks SUBMISSION_UNKNOWN if provider returns 200 OK without acknowledgement', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'READY_FOR_REVIEW' }));
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });
    (sandboxService.authenticateSandbox as any).mockResolvedValue('token');
    (sandboxService.loginEri as any).mockResolvedValue('eri-token');
    (sandboxService.submitItr as any).mockResolvedValue({ data: {} }); 

    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('malformed');
    expect(prisma.filingAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'UNKNOWN', errorCategory: 'MALFORMED_SUCCESS_RESPONSE' })
    }));
    expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: returnId, status: 'PROCESSING' },
      data: expect.objectContaining({ status: 'SUBMISSION_UNKNOWN' })
    }));
  });

  it('restores DRAFT to DRAFT on pre-dispatch failure', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'DRAFT' }));
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });
    (sandboxService.authenticateSandbox as any).mockRejectedValue(new sandboxService.ProviderError('Auth failed', 'authenticateSandbox', 401));

    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('Filing failed: Auth failed');
    expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: returnId, status: 'PROCESSING' },
      data: expect.objectContaining({ status: 'DRAFT' })
    }));
    expect(prisma.filingAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'FAILED', errorCategory: 'PROVIDER_AUTHENTICATESANDBOX_ERROR' })
    }));
  });

  it('restores READY_FOR_REVIEW to READY_FOR_REVIEW on pre-dispatch failure', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'READY_FOR_REVIEW' }));
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });
    (sandboxService.authenticateSandbox as any).mockResolvedValue('token');
    (sandboxService.loginEri as any).mockRejectedValue(new sandboxService.ProviderError('ERI Blocked', 'loginEri', 403));

    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('Filing failed: ERI Blocked');
    expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: returnId, status: 'PROCESSING' },
      data: expect.objectContaining({ status: 'READY_FOR_REVIEW' })
    }));
    expect(prisma.filingAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'FAILED', errorCategory: 'PROVIDER_LOGINERI_ERROR' })
    }));
  });

  it('rejects resubmission if tax return is in SUBMISSION_UNKNOWN state', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'SUBMISSION_UNKNOWN' }));

    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('unknown submission status and requires manual reconciliation');
    expect(prisma.taxReturn.updateMany).not.toHaveBeenCalled();
    expect(sandboxService.submitItr).not.toHaveBeenCalled();
  });

  it('transitions to SUBMISSION_FAILED on definitive provider rejection (400)', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'READY_FOR_REVIEW' }));
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });
    (sandboxService.authenticateSandbox as any).mockResolvedValue('token');
    (sandboxService.loginEri as any).mockResolvedValue('eri-token');
    (sandboxService.submitItr as any).mockRejectedValue(new sandboxService.ProviderError('Bad Request', 'submitItr', 400));

    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('Filing failed');
    expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: returnId, status: 'PROCESSING' },
      data: expect.objectContaining({ status: 'SUBMISSION_FAILED' })
    }));
  });

  it('transitions to SUBMISSION_UNKNOWN on ambiguous HTTP 500 error after dispatch', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'READY_FOR_REVIEW' }));
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });
    (sandboxService.authenticateSandbox as any).mockResolvedValue('token');
    (sandboxService.loginEri as any).mockResolvedValue('eri-token');
    (sandboxService.submitItr as any).mockRejectedValue(new sandboxService.ProviderError('Internal Server Error', 'submitItr', 500));

    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('Filing failed');
    expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: returnId, status: 'PROCESSING' },
      data: expect.objectContaining({ status: 'SUBMISSION_UNKNOWN' })
    }));
  });

  it('transitions to SUBMISSION_UNKNOWN on ambiguous network error/timeout after dispatch', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'READY_FOR_REVIEW' }));
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });
    (sandboxService.authenticateSandbox as any).mockResolvedValue('token');
    (sandboxService.loginEri as any).mockResolvedValue('eri-token');
    (sandboxService.submitItr as any).mockRejectedValue(new sandboxService.ProviderError('Network timeout', 'submitItr', undefined, true));

    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('Filing failed');
    expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: returnId, status: 'PROCESSING' },
      data: expect.objectContaining({ status: 'SUBMISSION_UNKNOWN' })
    }));
  });

  it('logs warning and does not corrupt return if conditional rollback update affects 0 records', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'DRAFT' }));
    (prisma.taxReturn.updateMany as any)
      .mockResolvedValueOnce({ count: 1 }) // atomic claim succeeds
      .mockResolvedValueOnce({ count: 0 }); // conditional rollback matches 0 records
    (sandboxService.authenticateSandbox as any).mockRejectedValue(new sandboxService.ProviderError('Prepare failed', 'prepareItrJson', 400));

    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('Filing failed: Prepare failed');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[Filing Recovery Warning]'));
    warnSpy.mockRestore();
  });

  it('does not rollback state if database fails after successful provider submission, keeps attempt', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue(createMockReturn({ status: 'READY_FOR_REVIEW' }));
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });
    (sandboxService.authenticateSandbox as any).mockResolvedValue('token');
    (sandboxService.loginEri as any).mockResolvedValue('eri-token');
    (sandboxService.submitItr as any).mockResolvedValue({ data: { acknowledgement_number: 'ACK1' } });
    
    (prisma.taxReturn.update as any).mockRejectedValue(new Error('DB Connection Lost'));

    await expect(executeItrFiling(returnId, userId)).rejects.toThrow('database persistence failed');
    // Ensure it successfully logged the attempt BEFORE the crash
    expect(prisma.filingAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'SUCCESS', ackNumber: 'ACK1' })
    }));
  });
});

describe('reconcileFilingStatus', () => {
  const userId = 'user-1';
  const returnId = 'tr-1';

  beforeEach(() => {
    vi.clearAllMocks();
    (taxReturnService.getTaxReturn as any).mockReset();
    (prisma.taxReturn.update as any).mockReset();
    (prisma.filingAttempt.findFirst as any).mockReset();
    
    (prisma.taxReturn.update as any).mockResolvedValue({ id: returnId });
  });

  it('unlocks abandoned processing attempts if no dispatch attempt exists', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'PROCESSING' });
    (prisma.filingAttempt.findFirst as any).mockResolvedValue(null);

    await reconcileFilingStatus(returnId, userId);
    expect(prisma.taxReturn.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { status: 'READY_FOR_REVIEW' }
    }));
  });

  it('fails reconciliation gracefully if ERI scopes are unavailable', async () => {
    (taxReturnService.getTaxReturn as any).mockResolvedValue({ id: returnId, status: 'SUBMISSION_UNKNOWN' });
    (prisma.filingAttempt.findFirst as any).mockResolvedValue({ id: 'att-1' });

    await expect(reconcileFilingStatus(returnId, userId)).rejects.toThrow('ERI API test credentials');
  });
});
