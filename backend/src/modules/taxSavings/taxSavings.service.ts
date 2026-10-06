import prisma from '../../config/prisma';
import { AppError } from '../../utils/response';
import { getTaxReturn } from '../../services/taxReturn.service';

export const getTaxSavings = async (returnId: string, userId: string) => {
  await getTaxReturn(returnId, userId);
  const deductions = await prisma.deduction.findMany({ where: { taxReturnId: returnId } });

  const recommendations: any[] = [];

  const used80C = deductions.filter((d) => d.section === 'SEC_80C').reduce((s, d) => s + Number(d.claimedAmount), 0);
  const remaining80C = Math.max(0, 150000 - used80C);
  if (remaining80C > 0) {
    recommendations.push({
      section: 'SEC_80C',
      description: 'Section 80C — ELSS/PPF/LIC',
      currentAmount: used80C,
      maxAllowed: 150000,
      potentialSaving: Math.round(remaining80C * 0.3),
      eligibilityNote: `You can invest ₹${remaining80C.toLocaleString()} more in ELSS, PPF, or LIC to maximize Section 80C deduction.`,
      priority: 1,
    });
  }

  const has80CCD1B = deductions.some((d) => d.section === 'SEC_80CCD1B');
  if (!has80CCD1B) {
    recommendations.push({
      section: 'SEC_80CCD1B',
      description: 'NPS — Section 80CCD(1B)',
      currentAmount: 0,
      maxAllowed: 50000,
      potentialSaving: Math.round(50000 * 0.3),
      eligibilityNote: 'An additional ₹50,000 deduction is available under NPS (Section 80CCD(1B)) over and above 80C.',
      priority: 2,
    });
  }

  const used80D = deductions.filter((d) => d.section === 'SEC_80D').reduce((s, d) => s + Number(d.claimedAmount), 0);
  if (used80D < 25000) {
    recommendations.push({
      section: 'SEC_80D',
      description: 'Health Insurance Premium — Section 80D',
      currentAmount: used80D,
      maxAllowed: 25000,
      potentialSaving: Math.round((25000 - used80D) * 0.3),
      eligibilityNote: 'Health insurance premiums up to ₹25,000 (₹50,000 for senior citizens) are deductible.',
      priority: 3,
    });
  }

  // Store in DB
  await prisma.taxSaving.deleteMany({ where: { taxReturnId: returnId } });
  if (recommendations.length > 0) {
    await prisma.taxSaving.createMany({ data: recommendations.map((r) => ({ ...r, taxReturnId: returnId })) });
  }

  return prisma.taxSaving.findMany({ where: { taxReturnId: returnId }, orderBy: { priority: 'asc' } });
};
