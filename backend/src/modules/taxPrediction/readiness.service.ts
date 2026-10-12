import prisma from '../../config/prisma';

export const calculateFilingReadiness = async (
  taxReturnId: string, 
  issues: any[], 
  confidence: any
) => {
  const taxReturn = await prisma.taxReturn.findUnique({
    where: { id: taxReturnId },
    include: { incomeEntries: true }
  });

  if (!taxReturn) throw new Error('Tax Return not found');

  const blockers: string[] = [];
  const completed: string[] = [];
  const warnings: string[] = [];

  let score = 100;

  // 1. Identity
  // Assuming identity is checked elsewhere or we just check if income exists
  if (taxReturn.incomeEntries.length === 0) {
    blockers.push('No income sources declared.');
    score -= 30;
  } else {
    completed.push('Income sources declared.');
  }

  // 2. Issues
  for (const issue of issues) {
    if (issue.severity === 'CRITICAL' || issue.severity === 'HIGH_PRIORITY') {
      blockers.push(issue.title);
      score -= 20;
    } else if (issue.severity === 'WARNING') {
      warnings.push(issue.title);
      score -= 5;
    }
  }

  // 3. Confidence
  if (confidence.overallScore < 80) {
    warnings.push('Low confidence in some extracted data. Please verify.');
    score -= 10;
  } else {
    completed.push('Data verification confidence is high.');
  }

  score = Math.max(0, score);
  const isReady = score === 100 && blockers.length === 0;

  // Update the DB
  await prisma.taxReturn.update({
    where: { id: taxReturnId },
    data: { readinessScore: score }
  });

  return {
    score,
    isReady,
    completed,
    warnings,
    blockers
  };
};
