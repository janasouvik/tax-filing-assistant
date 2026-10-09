/**
 * Final Review & User Approval Page (Phases 18-19)
 *
 * PRD Rule: DRAFT → READY_FOR_SUBMISSION (never auto-files)
 * User must explicitly approve. Return is never marked FILED here.
 */
import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { TaxpayerVerificationCard, LoadingSpinner, InlineError } from '../../components/individual/SharedComponents';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString('en-IN')}`;
}

export default function FinalReview() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [taxData, setTaxData] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const [statusRes, taxRes, vsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/individual/return/status`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/v1/individual/tax/calculate`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }),
          fetch(`${BASE_URL}/api/v1/individual/verification-status`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [statusData, taxResult, vsResult] = await Promise.all([statusRes.json(), taxRes.json(), vsRes.json()]);
        setData(statusData.data);
        setTaxData(taxResult.data);
        setVerificationStatus(vsResult.data);

        if (statusData.data?.status === 'USER_REVIEW' || statusData.data?.status === 'APPROVED') setApproved(true);
      } catch (err: any) {
        setError(err.message || 'Failed to load return data');
      } finally {
        setLoading(false);
      }
    })();
    }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleApprove = async () => {
    setApproving(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/individual/return/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Approval failed');
      setApproved(true);
      setShowConfirm(false);
      navigate('/individual/filing');
    } catch (err: any) {
      setError(err.message || 'Failed to approve return');
    } finally {
      setApproving(false);
    }
  };

  const comparison = taxData?.comparison;
  const recommended = comparison?.recommendedRegime === 'NEW' ? comparison?.newRegime : comparison?.oldRegime;
  const panStatus = verificationStatus?.profile?.panVerification?.status ?? null;
  const aadhaarStatus = verificationStatus?.profile?.aadhaarPanStatus?.status ?? null;

  if (loading) return <IndividualLayout currentStep={10}><LoadingSpinner message="Loading final review..." /></IndividualLayout>;

  return (
    <IndividualLayout currentStep={10}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-app-surface border border-app-border rounded-xl p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">rate_review</span>
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">Step 10 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary font-normal">Final Review</h1>
          <p className="text-[15px] text-app-text-secondary mt-1">
            Please carefully review your return before approval. This is your last chance to make changes.
          </p>

          {approved && (
            <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-app-success-bg border border-app-success/20">
              <span className="material-symbols-outlined text-[18px] text-app-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="text-[14px] font-medium text-app-text-primary">Return approved and marked as ready for submission.</p>
            </div>
          )}
        </div>

        {error && <InlineError message={error} onRetry={() => setError('')} />}

        {/* Return Summary */}
        <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs">
          <h2 className="text-[17px] font-semibold text-app-text-primary mb-5 pb-3 border-b border-app-border-light">Return Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left: Taxpayer */}
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider mb-1">Taxpayer</p>
                <p className="text-[16px] font-medium text-app-text-primary">{verificationStatus?.profile?.fullName || '—'}</p>
                <p className="text-[13px] text-app-text-secondary mt-0.5">{verificationStatus?.profile?.residentialStatus?.replace(/_/g, ' ') || 'RESIDENT'}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider mb-1">PAN</p>
                <p className="text-[15px] font-mono text-app-text-primary">{verificationStatus?.profile?.panVerification?.panMasked || '—'}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider mb-1">Assessment Year</p>
                <p className="text-[15px] font-medium text-app-text-primary">AY 2026-27</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider mb-1">Return Type</p>
                <p className="text-[15px] font-medium text-app-text-primary">{data?.taxReturn?.returnType || 'ITR-1'}</p>
              </div>
            </div>

            {/* Right: Tax Summary */}
            <div className="space-y-0 divide-y divide-app-border-light">
              {recommended && [
                { label: 'Tax Regime', value: comparison.recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime' },
                { label: 'Gross Income', value: fmt(recommended.grossIncome) },
                { label: 'Total Deductions', value: `-${fmt(recommended.totalDeductions)}` },
                { label: 'Taxable Income', value: fmt(recommended.taxableIncome), bold: true },
                { label: 'Total Tax', value: fmt(recommended.totalTax), bold: true },
                { label: 'TDS Deducted', value: `-${fmt(recommended.tdsDeducted)}` },
                {
                  label: recommended.refund > 0 ? 'Refund Due' : 'Tax Payable',
                  value: recommended.refund > 0 ? fmt(recommended.refund) : fmt(recommended.taxPayable),
                  highlight: true,
                  positive: recommended.refund > 0,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 text-[14px]">
                  <span className={row.highlight ? 'font-semibold text-app-text-primary' : 'text-app-text-secondary'}>{row.label}</span>
                  <span className={`tabular-nums ${row.positive ? 'text-app-success font-semibold' : row.bold ? 'font-semibold text-app-text-primary' : 'text-app-text-primary'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
              {!recommended && (
                <div className="text-[14px] text-app-text-muted py-4">
                  No tax data available. <Link to="/individual/income" className="text-primary underline">Add income first →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Links to edit each section */}
          <div className="mt-5 pt-4 border-t border-app-border-light flex flex-wrap gap-3">
            {[
              { label: 'Edit Profile', to: '/individual/profile', icon: 'person' },
              { label: 'Edit PAN', to: '/individual/pan', icon: 'verified_user' },
              { label: 'Edit Income', to: '/individual/income', icon: 'payments' },
              { label: 'Edit Deductions', to: '/individual/income', icon: 'savings' },
              { label: 'Recalculate Tax', to: '/individual/tax', icon: 'calculate' },
            ].map(item => (
              <Link
                key={item.label}
                to={item.to}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-app-border text-[12px] text-app-text-secondary hover:bg-app-bg hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Verification status */}
        <TaxpayerVerificationCard
          panStatus={panStatus}
          panMasked={verificationStatus?.profile?.panVerification?.panMasked}
          aadhaarStatus={aadhaarStatus}
          compact
        />

        {/* Documents & Income summary */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-app-surface border border-app-border rounded-xl p-5 shadow-xs">
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider mb-2">Income Sources</p>
            <p className="font-serif text-[28px] text-app-text-primary tabular-nums">{data?.incomeCount ?? 0}</p>
            <Link to="/individual/income" className="text-[12px] text-primary hover:underline mt-1 inline-block">View →</Link>
          </div>
          <div className="bg-app-surface border border-app-border rounded-xl p-5 shadow-xs">
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider mb-2">Deductions</p>
            <p className="font-serif text-[28px] text-app-text-primary tabular-nums">{data?.deductionCount ?? 0}</p>
            <Link to="/individual/income" className="text-[12px] text-primary hover:underline mt-1 inline-block">View →</Link>
          </div>
        </div>

        {/* Approval disclaimer */}
        {!approved && (
          <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs">
            <div className="flex items-start gap-3 mb-5">
              <span className="material-symbols-outlined text-[20px] text-app-warning mt-0.5">shield</span>
              <div>
                <h3 className="text-[15px] font-semibold text-app-text-primary mb-1">Before You Approve</h3>
                <p className="text-[14px] text-app-text-secondary leading-relaxed">
                  Please review your return carefully. By approving, you confirm that the information above is accurate
                  to the best of your knowledge. This approval does not file your return — it marks it as ready for
                  official submission via the Income Tax portal.
                </p>
              </div>
            </div>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[15px] font-medium transition-all shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                I Have Reviewed — Approve Return
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-[14px] font-medium text-app-text-primary text-center">
                  Are you sure you want to approve this return?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
                    type="button"
                  >
                    Cancel — Review Again
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-app-success hover:bg-[#226b33] text-white text-[14px] font-semibold transition-all disabled:opacity-60"
                    type="button"
                  >
                    {approving ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Approving...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[16px]">check</span>Yes, Approve Return</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => navigate('/individual/validation')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Validation
          </button>
          {approved && (
            <button
              onClick={() => navigate('/individual/filing')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm"
              type="button"
            >
              Continue to Filing
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </IndividualLayout>
  );
}
