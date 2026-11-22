import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runReconciliation } from '../../backend/src/modules/reconciliation/reconciliation.service';
import prisma from '../../backend/src/config/prisma';
import * as consolidationService from '../../backend/src/modules/consolidation/consolidation.service';
import { IssueSeverity, IssueStatus } from '@prisma/client';

vi.mock('../../backend/src/config/prisma', () => ({
  default: {
    validationIssue: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    document: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../backend/src/modules/consolidation/consolidation.service', () => ({
  consolidateIncome: vi.fn(),
}));

describe('Reconciliation & Missing Income Suite (Section 10 & 11)', () => {
  const returnId = 'tr-recon-001';
  const userId = 'u-recon-001';

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.validationIssue.deleteMany as any).mockResolvedValue({ count: 1 });
  });

  it('Scenario 1: Form 16 Salary matches AIS Salary -> Clean reconciliation without issues', async () => {
    (consolidationService.consolidateIncome as any).mockResolvedValue([
      { type: 'SALARY', amount: 800000, tds: 25000 },
    ]);
    (prisma.document.count as any).mockResolvedValue(0);
    (prisma.validationIssue.createMany as any).mockResolvedValue({ count: 0 });
    (prisma.validationIssue.findMany as any).mockResolvedValue([]);

    const issues = await runReconciliation(returnId, userId);
    expect(issues).toHaveLength(0);
  });

  it('Scenario 2: TDS deducted without declared income triggers REC_TDS_NO_INCOME warning', async () => {
    (consolidationService.consolidateIncome as any).mockResolvedValue([
      { type: 'OTHER_SOURCES', amount: 0, tds: 10000 },
    ]);
    (prisma.document.count as any).mockResolvedValue(0);

    let createdIssues: any[] = [];
    (prisma.validationIssue.createMany as any).mockImplementation(({ data }: any) => {
      createdIssues = data;
      return Promise.resolve({ count: data.length });
    });
    (prisma.validationIssue.findMany as any).mockImplementation(() => Promise.resolve(createdIssues));

    const issues = await runReconciliation(returnId, userId);
    expect(issues.some(i => i.code === 'REC_TDS_NO_INCOME')).toBe(true);
    expect(issues[0].severity).toBe(IssueSeverity.WARNING);
  });

  it('Scenario 3: Unverified documents present triggers REC_UNVERIFIED_DOCS review requirement', async () => {
    (consolidationService.consolidateIncome as any).mockResolvedValue([
      { type: 'SALARY', amount: 800000, tds: 25000 },
    ]);
    (prisma.document.count as any).mockResolvedValue(2); // 2 unverified docs

    let createdIssues: any[] = [];
    (prisma.validationIssue.createMany as any).mockImplementation(({ data }: any) => {
      createdIssues = data;
      return Promise.resolve({ count: data.length });
    });
    (prisma.validationIssue.findMany as any).mockImplementation(() => Promise.resolve(createdIssues));

    const issues = await runReconciliation(returnId, userId);
    expect(issues.some(i => i.code === 'REC_UNVERIFIED_DOCS')).toBe(true);
    const unverifiedIssue = issues.find(i => i.code === 'REC_UNVERIFIED_DOCS');
    expect(unverifiedIssue.description).toContain('2 processed document(s)');
  });

  it('Scenario 4: High TDS ratio compared to reported income triggers REC_HIGH_TDS info notice', async () => {
    (consolidationService.consolidateIncome as any).mockResolvedValue([
      { type: 'OTHER_SOURCES', amount: 50000, tds: 20000 }, // 40% TDS
    ]);
    (prisma.document.count as any).mockResolvedValue(0);

    let createdIssues: any[] = [];
    (prisma.validationIssue.createMany as any).mockImplementation(({ data }: any) => {
      createdIssues = data;
      return Promise.resolve({ count: data.length });
    });
    (prisma.validationIssue.findMany as any).mockImplementation(() => Promise.resolve(createdIssues));

    const issues = await runReconciliation(returnId, userId);
    expect(issues.some(i => i.code === 'REC_HIGH_TDS')).toBe(true);
  });
});
