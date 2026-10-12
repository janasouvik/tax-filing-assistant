import { getTaxReturn } from '../../services/taxReturn.service';
import { runReconciliation } from '../reconciliation/reconciliation.service';
import { calculateTax, compareRegimes } from '../taxEngine/taxEngine.service';
import { getTaxSavings } from '../taxSavings/taxSavings.service';
import { evaluateDeductions } from '../deductions/deduction.service';
import { calculateConfidence } from './confidence.service';
import { calculateFilingReadiness } from './readiness.service';

export const generateTaxPrediction = async (taxReturnId: string, userId: string) => {
  const ret = await getTaxReturn(taxReturnId, userId);

  // 1. Reconciliation (includes Income Consolidation under the hood)
  const reconciliationIssues = await runReconciliation(taxReturnId, userId);

  // 2. Deduction Eligibility
  const yearInput = (ret.metadata as any)?.canonicalYear || ret.assessmentYear || (ret.metadata as any)?.taxYear || ret.financialYear || '2026-27';
  const deductionEvaluation = await evaluateDeductions(taxReturnId, ret.regime, yearInput, ret.metadata);

  // 3. Tax Calculation
  const calculation = await calculateTax(taxReturnId, userId);

  // 4. Regime Comparison
  const regimeComparison = await compareRegimes(taxReturnId, userId);

  // 5. Tax Optimization
  const optimizations = await getTaxSavings(taxReturnId, userId);

  // 6. Confidence Scoring
  const confidence = await calculateConfidence(taxReturnId);

  // 7. Filing Readiness
  const readiness = await calculateFilingReadiness(taxReturnId, reconciliationIssues, confidence);

  // Orchestrated Output
  return {
    prediction: {
      grossIncome: calculation.grossIncome,
      taxableIncome: calculation.taxableIncome,
      totalTaxLiability: calculation.totalTax,
      tdsDeducted: calculation.tdsDeducted,
      estimatedRefundOrPayable: calculation.refundPayable,
    },
    regimes: regimeComparison,
    optimizations,
    deductionEvaluation,
    issues: reconciliationIssues,
    confidence,
    readiness
  };
};
