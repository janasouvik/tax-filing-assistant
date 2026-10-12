import prisma from '../../config/prisma';
import { consolidateIncome } from '../consolidation/consolidation.service';
import { IssueSeverity, IssueStatus } from '@prisma/client';

export const runReconciliation = async (taxReturnId: string, userId: string) => {
  const consolidated = await consolidateIncome(taxReturnId, userId);
  
  // 1. Clear previous open issues for this tax return
  await prisma.validationIssue.deleteMany({
    where: { taxReturnId, status: IssueStatus.OPEN }
  });

  const issues: any[] = [];
  
  let totalTds = 0;
  let totalIncome = 0;
  
  for (const item of consolidated) {
    totalIncome += item.amount;
    totalTds += item.tds;
  }

  // Example Rule 1: TDS without matching income
  if (totalTds > 0 && totalIncome === 0) {
    issues.push({
      taxReturnId,
      code: 'REC_TDS_NO_INCOME',
      title: 'TDS reported without matching income',
      description: 'You have TDS deducted but no corresponding income reported. Please verify your income sources.',
      severity: IssueSeverity.WARNING,
      status: IssueStatus.OPEN
    });
  }

  // Example Rule 2: Unverified documents
  const unverifiedDocs = await prisma.document.count({
    where: { taxReturnId, isVerified: false, status: 'PROCESSED' }
  });

  if (unverifiedDocs > 0) {
    issues.push({
      taxReturnId,
      code: 'REC_UNVERIFIED_DOCS',
      title: 'Unverified Documents Found',
      description: `You have ${unverifiedDocs} processed document(s) that require manual verification.`,
      severity: IssueSeverity.WARNING,
      status: IssueStatus.OPEN
    });
  }

  // Example Rule 3: High TDS compared to income (e.g. > 30%)
  if (totalIncome > 0 && (totalTds / totalIncome) > 0.3) {
    issues.push({
      taxReturnId,
      code: 'REC_HIGH_TDS',
      title: 'High TDS Ratio',
      description: 'The TDS deducted seems unusually high compared to the total reported income. Please ensure all income sources are declared.',
      severity: IssueSeverity.INFO,
      status: IssueStatus.OPEN
    });
  }

  if (issues.length > 0) {
    await prisma.validationIssue.createMany({
      data: issues
    });
  }

  return prisma.validationIssue.findMany({
    where: { taxReturnId, status: IssueStatus.OPEN }
  });
};
