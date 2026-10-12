import prisma from '../../config/prisma';
import { DeductionSection, TaxRegime } from '@prisma/client';
import { getRules } from '../taxEngine/taxEngine.service';

export const evaluateDeductions = async (taxReturnId: string, regime: TaxRegime, assessmentYear: string = '2025-26', metadata?: any) => {
  const deductions = await prisma.deduction.findMany({
    where: { taxReturnId }
  });

  const rules = await getRules(regime, assessmentYear, metadata);
  const limits = rules.dedLimits;

  const results: any[] = [];

  for (const ded of deductions) {
    const limit = limits[ded.section] ?? 0;
    
    // Logic for eligibility
    let isEligible = true;
    let reason = 'Eligible';
    let eligibleAmount = Math.min(Number(ded.claimedAmount), limit);

    if (limit === 0) {
      isEligible = false;
      reason = `Section ${ded.section} is not available in the ${regime} regime.`;
      eligibleAmount = 0;
    } else if (Number(ded.claimedAmount) > limit && limit !== 9999999999) {
      reason = `Claimed amount exceeds the maximum limit of ₹${limit} for Section ${ded.section}.`;
    }

    results.push({
      id: ded.id,
      section: ded.section,
      claimedAmount: Number(ded.claimedAmount),
      eligibleAmount,
      isEligible,
      reason
    });

    // Optionally update the DB with eligible amount
    await prisma.deduction.update({
      where: { id: ded.id },
      data: { eligibleAmount }
    });
  }

  return results;
};
