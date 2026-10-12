import { describe, it, expect, vi } from 'vitest';
import { updateTaxReturn } from '../taxReturn.service';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';

const { mockPrisma } = vi.hoisted(() => {
  const mPrisma: any = {
    taxReturn: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    taxCalculation: {
      deleteMany: vi.fn(),
    },
    approval: {
      deleteMany: vi.fn(),
    },
    incomeEntry: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    deduction: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  mPrisma.$transaction = vi.fn(async (cbOrArr: any) => {
    if (typeof cbOrArr === 'function') {
      return cbOrArr(mPrisma);
    }
    return Promise.all(cbOrArr);
  });
  return { mockPrisma: mPrisma };
});

vi.mock('../../config/prisma', () => ({
  default: mockPrisma,
}));



describe('updateTaxReturn', () => {
  const userId = 'user-1';
  const returnId = 'tr-1';

  it('allows manual updates between safe states', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'DRAFT', workspace: { userId }
    });
    (prisma.taxReturn.update as any).mockResolvedValue({ id: returnId, status: 'READY_FOR_REVIEW' });

    const result = await updateTaxReturn(returnId, userId, { status: 'READY_FOR_REVIEW' });
    expect(result.status).toBe('READY_FOR_REVIEW');
  });

  it('rejects patching out of SUBMISSION_UNKNOWN', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'SUBMISSION_UNKNOWN', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { status: 'DRAFT' })).rejects.toThrow('Cannot manually change status from a system-managed state (SUBMISSION_UNKNOWN)');
  });

  it('rejects patching into FILED', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'READY_FOR_REVIEW', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { status: 'FILED' })).rejects.toThrow('Cannot manually change status to a system-managed state (FILED)');
  });

  it('rejects patching out of PROCESSING', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'PROCESSING', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { status: 'DRAFT' })).rejects.toThrow('Cannot manually change status from a system-managed state (PROCESSING)');
  });

  it('rejects patching out of VERIFIED', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'FILED', verificationStatus: 'VERIFIED', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { verificationStatus: 'UNVERIFIED' })).rejects.toThrow('Cannot manually change verificationStatus from a system-managed state (VERIFIED)');
  });

  it('rejects patching into VERIFIED', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'DRAFT', verificationStatus: 'UNVERIFIED', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { verificationStatus: 'VERIFIED' })).rejects.toThrow('Cannot manually change verificationStatus to a system-managed state (VERIFIED)');
  });

  it('rejects patching into PENDING', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'FILED', verificationStatus: 'UNVERIFIED', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { verificationStatus: 'PENDING' })).rejects.toThrow('Cannot manually change verificationStatus to a system-managed state (PENDING)');
  });

  it('rejects patching into UNKNOWN', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'FILED', verificationStatus: 'UNVERIFIED', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { verificationStatus: 'UNKNOWN' })).rejects.toThrow('Cannot manually change verificationStatus to a system-managed state (UNKNOWN)');
  });

  it('rejects patching out of UNKNOWN', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'FILED', verificationStatus: 'UNKNOWN', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { verificationStatus: 'UNVERIFIED' })).rejects.toThrow('Cannot manually change verificationStatus from a system-managed state (UNKNOWN)');
  });


  it('rejects modifying regime on an already FILED return', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'FILED', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { regime: 'OLD' })).rejects.toThrow('Cannot modify tax return in a locked state (FILED)');
  });

  it('rejects modifying regime on a return in PROCESSING', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'PROCESSING', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { regime: 'OLD' })).rejects.toThrow('Cannot modify tax return in a locked state (PROCESSING)');
  });

  it('rejects modifying regime on a return in SUBMISSION_UNKNOWN', async () => {
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'SUBMISSION_UNKNOWN', workspace: { userId }
    });

    await expect(updateTaxReturn(returnId, userId, { regime: 'OLD' })).rejects.toThrow('Cannot modify tax return in a locked state (SUBMISSION_UNKNOWN)');
  });
});

describe('invalidateTaxCalculationsAndResetStatus on data mutations', () => {
  const userId = 'user-1';
  const returnId = 'tr-1';

  it('deletes cached calculations and resets reviewed/approved status to DRAFT', async () => {
    const { invalidateTaxCalculationsAndResetStatus } = await import('../taxReturn.service');
    (prisma.taxCalculation.deleteMany as any).mockResolvedValue({ count: 2 });
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });

    await invalidateTaxCalculationsAndResetStatus(returnId);

    expect(prisma.taxCalculation.deleteMany).toHaveBeenCalledWith({
      where: { taxReturnId: returnId },
    });
    expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith({
      where: {
        id: returnId,
        status: { in: ['READY_FOR_REVIEW', 'USER_REVIEW', 'APPROVED'] },
      },
      data: {
        status: 'DRAFT',
      },
    });
  });

  it('triggers invalidation when adding income to an active return', async () => {
    const { addIncome } = await import('../taxReturn.service');
    (prisma.taxReturn.findUnique as any).mockResolvedValue({
      id: returnId, status: 'APPROVED', workspace: { userId }
    });
    (prisma.incomeEntry.create as any).mockResolvedValue({ id: 'inc-1', amount: 50000 });
    (prisma.taxCalculation.deleteMany as any).mockResolvedValue({ count: 1 });
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });

    const result = await addIncome(returnId, userId, {
      incomeType: 'SALARY',
      source: 'Acme Corp',
      amount: 50000,
    });

    expect(result.id).toBe('inc-1');
    expect(prisma.taxCalculation.deleteMany).toHaveBeenCalledWith({
      where: { taxReturnId: returnId },
    });
    expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith({
      where: {
        id: returnId,
        status: { in: ['READY_FOR_REVIEW', 'USER_REVIEW', 'APPROVED'] },
      },
      data: { status: 'DRAFT' },
    });
  });

  it('triggers invalidation when deleting a deduction', async () => {
    const { deleteDeduction } = await import('../taxReturn.service');
    (prisma.deduction.findUnique as any).mockResolvedValue({
      id: 'ded-1',
      taxReturnId: returnId,
      taxReturn: { status: 'USER_REVIEW', workspace: { userId } },
    });
    (prisma.deduction.delete as any).mockResolvedValue({ id: 'ded-1' });
    (prisma.taxCalculation.deleteMany as any).mockResolvedValue({ count: 1 });
    (prisma.taxReturn.updateMany as any).mockResolvedValue({ count: 1 });

    await deleteDeduction('ded-1', userId);

    expect(prisma.taxCalculation.deleteMany).toHaveBeenCalledWith({
      where: { taxReturnId: returnId },
    });
    expect(prisma.taxReturn.updateMany).toHaveBeenCalledWith({
      where: {
        id: returnId,
        status: { in: ['READY_FOR_REVIEW', 'USER_REVIEW', 'APPROVED'] },
      },
      data: { status: 'DRAFT' },
    });
  });
});
