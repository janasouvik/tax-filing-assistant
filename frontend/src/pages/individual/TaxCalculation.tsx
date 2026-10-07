/**
 * Tax Calculation & Old vs New Regime Comparison Page (Phase 14-15)
 *
 * RULE ENGINE CALCULATES. AI EXPLAINS. LLM NEVER DETERMINES FINAL TAX.
 */
import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { StatusBadge, LoadingSpinner, InlineError } from '../../components/individual/SharedComponents';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface TaxResult {
  regime: 'OLD' | 'NEW';
  assessmentYear: string;
  grossIncome: number;
  standardDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  tdsDeducted: number;
  taxPayable: number;
  refund: number;
  slabBreakdown: { from: number; to: number | null; rate: number; taxableAmount: number; tax: number }[];
}

interface RegimeComparison {
  assessmentYear: string;
  newRegime: TaxResult;
  oldRegime: TaxResult;
  recommendedRegime: 'OLD' | 'NEW';
  savings: number;
  savingsExplanation: string;
}

interface CalcResponse {
  comparison: RegimeComparison;
  inputSummary: { grossIncome: number; tdsDeducted: number; incomeCount: number; deductionCount: number };
  note: string;
  calculatedAt: string;
}

function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString('en-IN')}`;
}

function RegimeColumn({ result, isRecommended }: { result: TaxResult; isRecommended: boolean }) {
  const label = result.regime === 'NEW' ? 'New Regime' : 'Old Regime';
  const rows = [
    { label: 'Gross Income', value: fmt(result.grossIncome) },
    { label: 'Standard Deduction', value: `-${fmt(result.standardDeduction)}` },
    { label: 'Other Deductions', value: result.regime === 'OLD' ? `-${fmt(result.totalDeductions - result.standardDeduction)}` : '—' },
    { label: 'Taxable Income', value: fmt(result.taxableIncome), bold: true },
    { label: 'Tax on Slab', value: fmt(result.taxBeforeRebate) },
    { label: 'Rebate u/s 87A', value: result.rebate87A > 0 ? `-${fmt(result.rebate87A)}` : '—' },
    { label: 'Surcharge', value: result.surcharge > 0 ? fmt(result.surcharge) : '—' },
    { label: 'Health & Ed. Cess (4%)', value: fmt(result.cess) },
    { label: 'Total Tax', value: fmt(result.totalTax), bold: true },
    { label: 'TDS Deducted', value: result.tdsDeducted > 0 ? `-${fmt(result.tdsDeducted)}` : '—' },
    {
      label: result.refund > 0 ? 'Refund' : 'Tax Payable',
      value: result.refund > 0 ? fmt(result.refund) : fmt(result.taxPayable),
      highlight: true,
      positive: result.refund > 0,
    },
  ];

  return (
    <div className={`rounded-xl border-2 p-6 transition-all ${isRecommended ? 'border-primary shadow-md' : 'border-app-border'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[17px] font-semibold text-app-text-primary">{label}</h3>
          <p className="text-[12px] text-app-text-muted mt-0.5">AY {result.assessmentYear}</p>
        </div>
        {isRecommended && <StatusBadge variant="verified" label="Recommended" size="sm" />}
      </div>

      {/* Big number */}
      <div className={`mb-4 py-3 px-4 rounded-lg text-center ${isRecommended ? 'bg-primary/5' : 'bg-app-bg'}`}>
        <p className="text-[12px] text-app-text-muted mb-1">Total Tax</p>
        <p className={`font-serif text-[36px] font-normal tabular-nums ${isRecommended ? 'text-primary' : 'text-app-text-primary'}`}>
          {fmt(result.totalTax)}
        </p>
      </div>

      {/* Rows */}
      <div className="space-y-0 divide-y divide-app-border-light">
        {rows.map((row) => (
          <div key={row.label} className={`flex items-center justify-between py-2.5 text-[13px] ${row.highlight ? 'font-semibold' : ''}`}>
            <span className={row.highlight ? 'text-app-text-primary' : 'text-app-text-secondary'}>{row.label}</span>
            <span className={`tabular-nums ${row.positive ? 'text-app-success font-semibold' : row.highlight ? 'text-app-text-primary' : 'text-app-text-primary'}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TaxCalculation() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<CalcResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSlabs, setShowSlabs] = useState(false);

  const fetchCalc = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/individual/tax/calculate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Calculation failed');
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalc(); }, []);

  if (loading) return <IndividualLayout currentStep={8}><LoadingSpinner message="Calculating tax..." /></IndividualLayout>;

  return (
    <IndividualLayout currentStep={8}>
      <div className="space-y-6">
        {/* Header card */}
        <div className="bg-app-surface border border-app-border rounded-xl p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">calculate</span>
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">Steps 8 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary font-normal">Tax Calculation</h1>
          <p className="text-[15px] text-app-text-secondary mt-1">
            Old vs New regime comparison for AY 2026-27. Tax calculated by TaxPilot's deterministic rule engine.
          </p>

          {/* Rule engine disclaimer */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-app-bg border border-app-border text-[13px] text-app-text-muted mt-5">
            <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">gavel</span>
            <span>
              <strong>Rule Engine:</strong> Tax is calculated deterministically using official AY 2026-27 slabs from the Income Tax Act as amended by Finance Act 2025.
              AI is used only for explanations — never for calculations.
              Final tax liability must be confirmed on the official Income Tax portal.
            </span>
          </div>
        </div>

        {error && <InlineError message={error} onRetry={fetchCalc} />}

        {data && (
          <>
            {/* Recommendation Banner */}
            <div className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 ${data.comparison.savings > 0 ? 'bg-app-success-bg border-app-success/30' : 'bg-app-bg border-app-border'}`}>
              <span className="material-symbols-outlined text-[24px] text-app-success" style={{ fontVariationSettings: "'FILL' 1" }}>
                {data.comparison.savings > 0 ? 'savings' : 'info'}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-app-text-primary text-[15px]">
                  {data.comparison.recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'} Recommended
                  {data.comparison.savings > 0 && ` — Save ${fmt(data.comparison.savings)}`}
                </p>
                <p className="text-[13px] text-app-text-secondary mt-0.5">{data.comparison.savingsExplanation}</p>
              </div>
            </div>

            {/* Data completeness warning */}
            {data.inputSummary.incomeCount === 0 && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-app-warning-bg border border-app-warning/20 text-[13px] text-app-warning">
                <span className="material-symbols-outlined text-[16px] mt-0.5">warning</span>
                <div>
                  No income added yet — showing ₹0 estimate. <Link to="/individual/income" className="underline font-medium">Add income →</Link>
                </div>
              </div>
            )}

            {/* Regime Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RegimeColumn
                result={data.comparison.newRegime}
                isRecommended={data.comparison.recommendedRegime === 'NEW'}
              />
              <RegimeColumn
                result={data.comparison.oldRegime}
                isRecommended={data.comparison.recommendedRegime === 'OLD'}
              />
            </div>

            {/* Slab Breakdown */}
            <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs">
              <button
                onClick={() => setShowSlabs(!showSlabs)}
                className="flex items-center justify-between w-full text-left"
                type="button"
              >
                <h3 className="text-[15px] font-semibold text-app-text-primary">Slab Breakdown ({data.comparison.recommendedRegime === 'NEW' ? 'New' : 'Old'} Regime)</h3>
                <span className="material-symbols-outlined text-[20px] text-app-text-muted">
                  {showSlabs ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showSlabs && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-app-border">
                        <th className="text-left py-2 text-app-text-muted font-medium">Slab</th>
                        <th className="text-right py-2 text-app-text-muted font-medium">Rate</th>
                        <th className="text-right py-2 text-app-text-muted font-medium">Taxable Amount</th>
                        <th className="text-right py-2 text-app-text-muted font-medium">Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border-light">
                      {(data.comparison.recommendedRegime === 'NEW'
                        ? data.comparison.newRegime.slabBreakdown
                        : data.comparison.oldRegime.slabBreakdown
                      ).map((s, i) => (
                        <tr key={i} className={s.tax > 0 ? '' : 'opacity-40'}>
                          <td className="py-2.5 tabular-nums">
                            {fmt(s.from)} – {s.to !== null ? fmt(s.to) : 'Above'}
                          </td>
                          <td className="py-2.5 text-right">{s.rate}%</td>
                          <td className="py-2.5 text-right tabular-nums">{fmt(s.taxableAmount)}</td>
                          <td className="py-2.5 text-right tabular-nums font-medium">{fmt(s.tax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tax Insights */}
            <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs">
              <h3 className="text-[15px] font-semibold text-app-text-primary mb-4">Tax Insights</h3>
              <ul className="space-y-3 text-[14px]">
                {data.comparison.newRegime.taxableIncome <= 700000 && (
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-app-success mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-app-text-secondary">Your taxable income is ≤ ₹7,00,000 — zero tax applies under New Regime with rebate u/s 87A.</span>
                  </li>
                )}
                {data.comparison.savings > 10000 && (
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-app-success mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
                    <span className="text-app-text-secondary">
                      You can save <strong>{fmt(data.comparison.savings)}</strong> by choosing the {data.comparison.recommendedRegime === 'NEW' ? 'New' : 'Old'} Regime.
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-app-accent mt-0.5">info</span>
                  <span className="text-app-text-secondary">
                    New Regime standard deduction: ₹75,000. Old Regime: ₹50,000. Add deductions to maximize Old Regime benefits.
                  </span>
                </li>
              </ul>
            </div>

            {/* Input Summary */}
            <div className="bg-app-bg border border-app-border rounded-lg px-5 py-3 flex flex-wrap gap-6 text-[13px] text-app-text-muted">
              <span><strong className="text-app-text-primary">{data.inputSummary.incomeCount}</strong> income entries</span>
              <span><strong className="text-app-text-primary">{data.inputSummary.deductionCount}</strong> deductions</span>
              <span>Calculated: {new Date(data.calculatedAt).toLocaleString('en-IN')}</span>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => navigate('/individual/income')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={fetchCalc}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Recalculate
            </button>
            <button
              onClick={() => navigate('/individual/validation')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm"
              type="button"
            >
              Continue to Validation
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </IndividualLayout>
  );
}
