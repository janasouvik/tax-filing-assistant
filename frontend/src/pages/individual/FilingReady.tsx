/**
 * Filing Ready & e-Verification Page (Phases 20-21)
 *
 * PRD Rule: TaxPilot does NOT fake government filing.
 * Return is NEVER marked FILED here without actual government confirmation.
 * User is guided to the official Income Tax portal.
 */
import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { StatusBadge, LoadingSpinner } from '../../components/individual/SharedComponents';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const E_VERIFY_METHODS = [
  {
    icon: 'smartphone',
    title: 'Aadhaar OTP',
    description: 'Generate OTP using Aadhaar-linked mobile number on the IT portal.',
    available: true,
  },
  {
    icon: 'account_balance',
    title: 'Net Banking',
    description: 'e-Verify through your bank\'s net banking login.',
    available: true,
  },
  {
    icon: 'credit_card',
    title: 'Demat Account',
    description: 'e-Verify via CDSL or NSDL demat account.',
    available: true,
  },
  {
    icon: 'mail',
    title: 'Send Physical ITR-V',
    description: 'Print and send signed ITR-V to CPC Bengaluru within 30 days.',
    available: true,
  },
];

export default function FilingReady() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('DRAFT');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${BASE_URL}/api/v1/individual/return/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setStatus(json.data?.status || 'DRAFT');
      } catch {
        // Show the UI anyway
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  if (loading) return <IndividualLayout currentStep={11}><LoadingSpinner message="Loading filing status..." /></IndividualLayout>;

  const isReady = status === 'USER_REVIEW' || status === 'APPROVED';

  return (
    <IndividualLayout currentStep={11}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-app-surface border border-app-border rounded-xl p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">send</span>
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">Step 11 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary font-normal">Filing & e-Verification</h1>
          <p className="text-[15px] text-app-text-secondary mt-1">
            Your return is prepared. Proceed to the official Income Tax portal to file and e-verify.
          </p>
        </div>

        {/* Not approved warning */}
        {!isReady && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl border-2 border-app-warning/30 bg-app-warning-bg text-[14px]">
            <span className="material-symbols-outlined text-[20px] text-app-warning shrink-0">warning</span>
            <div>
              <p className="font-semibold text-app-text-primary">Return Not Yet Approved</p>
              <p className="text-app-text-secondary mt-0.5">
                Please complete the <Link to="/individual/review" className="text-primary underline">Final Review</Link> and approve your return before filing.
              </p>
            </div>
          </div>
        )}

        {/* Ready banner */}
        {isReady && (
          <div className="rounded-xl border-2 border-app-success/30 bg-app-success-bg p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-12 h-12 rounded-full bg-app-success flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </span>
              <div>
                <h2 className="text-[20px] font-semibold text-app-text-primary">Your return is ready for filing</h2>
                <p className="text-[14px] text-app-text-secondary mt-0.5">TaxPilot has prepared and validated your return for AY 2026-27.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-app-text-muted">
              <StatusBadge variant="verified" label="Approved by you" size="sm" />
              <StatusBadge variant="processing" label="Pending Official Filing" size="sm" />
            </div>
          </div>
        )}

        {/* What TaxPilot has done */}
        <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs">
          <h2 className="text-[17px] font-semibold text-app-text-primary mb-4">What TaxPilot has prepared</h2>
          <ul className="space-y-3">
            {[
              'Taxpayer identity verified (PAN + Aadhaar-PAN status)',
              'Income sources organized and verified',
              'Deductions claimed and documented',
              'Tax calculated using AY 2026-27 rule engine',
              'Old vs New regime comparison completed',
              'Validation checks passed',
              'Return reviewed and approved by you',
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-[14px] text-app-text-secondary">
                <span className="material-symbols-outlined text-[16px] text-app-success shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Official Filing Section */}
        <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs">
          <div className="flex items-start gap-3 mb-5">
            <span className="material-symbols-outlined text-[22px] text-app-accent">open_in_new</span>
            <div>
              <h2 className="text-[17px] font-semibold text-app-text-primary">Official Filing</h2>
              <p className="text-[14px] text-app-text-secondary mt-1">
                TaxPilot does not directly file with the Income Tax Department.
                You must complete the actual filing through the official portal.
                Your return data is ready — use it to fill the official portal.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-app-bg border border-app-border mb-5 text-[13px] text-app-text-muted">
            <p className="font-semibold text-app-text-primary mb-1">Important Notice</p>
            <p>TaxPilot has NOT filed your return. Your tax return will only be officially filed when you complete the process on the Income Tax e-Filing portal and receive a confirmation acknowledgement (ITR-V).</p>
          </div>

          <a
            href="https://www.incometax.gov.in/iec/foportal/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B3D91] hover:bg-[#083080] text-white text-[15px] font-semibold transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
            Continue to Official Income Tax Portal
          </a>
          <p className="text-center text-[12px] text-app-text-muted mt-2">
            incometax.gov.in — Official Government Portal
          </p>
        </div>

        {/* e-Verification Section */}
        <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">verified</span>
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">Step 12 of 12</p>
          </div>
          <h2 className="text-[17px] font-semibold text-app-text-primary mb-1">e-Verification</h2>
          <p className="text-[14px] text-app-text-secondary mb-5">
            After filing, you must e-verify your ITR within 30 days. Choose one of the following methods on the official portal:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {E_VERIFY_METHODS.map(m => (
              <div key={m.title} className="flex items-start gap-3 p-4 rounded-lg border border-app-border bg-app-bg">
                <span className="material-symbols-outlined text-[22px] text-app-accent mt-0.5 shrink-0">{m.icon}</span>
                <div>
                  <p className="text-[14px] font-semibold text-app-text-primary">{m.title}</p>
                  <p className="text-[12px] text-app-text-secondary mt-0.5">{m.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-lg bg-app-warning-bg border border-app-warning/20 flex items-start gap-3 text-[13px] text-app-text-secondary">
            <span className="material-symbols-outlined text-[16px] text-app-warning mt-0.5 shrink-0">schedule</span>
            <p>
              <strong>30-day deadline:</strong> e-Verify your return within 30 days of filing, else it will be treated as invalid.
              Aadhaar-PAN linkage is required for Aadhaar OTP-based e-verification.
            </p>
          </div>

          <div className="mt-4">
            <a
              href="https://www.incometax.gov.in/iec/foportal/help/how-to-e-verify-itr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              Official e-Verification guide — incometax.gov.in
            </a>
          </div>
        </div>

        {/* Filing Status */}
        <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs">
          <h3 className="text-[15px] font-semibold text-app-text-primary mb-4">Return Status</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Prepared by TaxPilot', done: true },
              { label: 'Approved by You', done: isReady },
              { label: 'Filed on IT Portal', done: false, note: 'Complete on incometax.gov.in' },
              { label: 'e-Verified', done: false, note: 'After filing' },
            ].map(step => (
              <div key={step.label} className={`flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-lg ${step.done ? 'bg-app-success-bg text-app-success' : 'bg-app-bg text-app-text-muted border border-app-border'}`}>
                <span className="material-symbols-outlined text-[14px]" style={step.done ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {step.done ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span>{step.label}</span>
                {step.note && !step.done && <span className="text-[11px] opacity-70">({step.note})</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => navigate('/individual/review')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Review
          </button>
          <Link
            to="/individualtaxdashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm"
          >
            Return to Dashboard
            <span className="material-symbols-outlined text-[16px]">home</span>
          </Link>
        </div>
      </div>
    </IndividualLayout>
  );
}
