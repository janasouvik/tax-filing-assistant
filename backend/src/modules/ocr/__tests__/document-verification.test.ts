import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentVerificationService } from '../document-verification.service';
import prisma from '../../../config/prisma';

// Mock prisma and taxReturnService
vi.mock('../../../config/prisma', () => {
  return {
    default: {
      document: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      taxReturn: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      extractedField: {
        findMany: vi.fn(),
        updateMany: vi.fn(),
      },
      incomeEntry: {
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      deduction: {
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => {
        return cb(prisma);
      }),
    },
  };
});

vi.mock('../../../services/taxReturn.service', () => ({
  invalidateTaxCalculationsAndResetStatus: vi.fn().mockResolvedValue(true),
}));

describe('DocumentVerificationService (Tax Engine Integration)', () => {
  const mockUserId = 'usr_123';
  const mockDocId = 'doc_f16_001';
  const mockTaxReturnId = 'ret_ay2026_001';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('atomically transfers verified Form 16 salary and deductions into return', async () => {
    const mockDocument = {
      id: mockDocId,
      name: 'Form16_2025_26.pdf',
      category: 'FORM_16',
      workspaceId: 'ws_001',
      taxReturnId: mockTaxReturnId,
      workspace: { userId: mockUserId },
      extractedFields: [
        { fieldName: 'employerName', normalizedValue: 'TATA CONSULTANCY SERVICES' },
        { fieldName: 'employerTan', normalizedValue: 'MUMA00123C' },
        { fieldName: 'employeePan', normalizedValue: 'ABCDE1234F' },
        { fieldName: 'grossSalary', normalizedValue: '1500000' },
        { fieldName: 'standardDeduction', normalizedValue: '75000' },
        { fieldName: 'netTaxableSalary', normalizedValue: '1425000' },
        { fieldName: 'deductions80C', normalizedValue: '150000' },
        { fieldName: 'deductions80D', normalizedValue: '25000' },
        { fieldName: 'tdsDeducted', normalizedValue: '120000' },
      ],
    };

    (prisma.document.findUnique as any).mockResolvedValue(mockDocument);
    (prisma.taxReturn.findUnique as any).mockResolvedValue({ id: mockTaxReturnId, status: 'DRAFT' });
    (prisma.extractedField.findMany as any).mockResolvedValue(mockDocument.extractedFields);
    (prisma.incomeEntry.create as any).mockResolvedValue({ id: 'inc_001' });
    (prisma.deduction.create as any).mockResolvedValue({ id: 'ded_001' });
    (prisma.document.update as any).mockResolvedValue({ ...mockDocument, status: 'VERIFIED', isVerified: true });

    const result = await DocumentVerificationService.verifyAndApplyToTaxReturn(mockDocId, mockUserId);

    expect(result.document.status).toBe('VERIFIED');
    expect(result.document.isVerified).toBe(true);

    // Verify deduplication: existing entries with sourceDocumentId were deleted first
    expect(prisma.incomeEntry.deleteMany).toHaveBeenCalledWith({ where: { sourceDocumentId: mockDocId } });
    expect(prisma.deduction.deleteMany).toHaveBeenCalledWith({ where: { sourceDocumentId: mockDocId } });

    // Verify IncomeEntry created with correct values
    expect(prisma.incomeEntry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taxReturnId: mockTaxReturnId,
        incomeType: 'SALARY',
        source: 'TATA CONSULTANCY SERVICES',
        amount: 1500000,
        tdsDeducted: 120000,
        sourceDocumentId: mockDocId,
      }),
    });

    // Verify Section 80C and 80D deductions created
    expect(prisma.deduction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taxReturnId: mockTaxReturnId,
        section: 'SEC_80C',
        claimedAmount: 150000,
        sourceDocumentId: mockDocId,
      }),
    });

    expect(prisma.deduction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taxReturnId: mockTaxReturnId,
        section: 'SEC_80D',
        claimedAmount: 25000,
        sourceDocumentId: mockDocId,
      }),
    });
  });

  it('rejects verification if user is not the document owner', async () => {
    (prisma.document.findUnique as any).mockResolvedValue({
      id: mockDocId,
      workspace: { userId: 'different_user_999' },
      extractedFields: [],
    });

    await expect(
      DocumentVerificationService.verifyAndApplyToTaxReturn(mockDocId, mockUserId)
    ).rejects.toThrow('Forbidden');
  });

  it('rejects verification if target return is locked in FILED status', async () => {
    (prisma.document.findUnique as any).mockResolvedValue({
      id: mockDocId,
      taxReturnId: mockTaxReturnId,
      workspace: { userId: mockUserId },
      extractedFields: [],
    });
    (prisma.taxReturn.findUnique as any).mockResolvedValue({ id: mockTaxReturnId, status: 'FILED' });

    await expect(
      DocumentVerificationService.verifyAndApplyToTaxReturn(mockDocId, mockUserId)
    ).rejects.toThrow('Cannot verify document into locked return (FILED)');
  });
});

