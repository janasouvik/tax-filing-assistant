import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { TaxpayerVerificationCard, FilingReadinessCard, StatusBadge, LoadingSpinner } from '../components/individual/SharedComponents';
import { individualApi, type VerificationStatus } from '../services/individual.service';

const INCOME_TAX_PORTAL = 'https://www.incometax.gov.in/iec/foportal/';

export default function IndividualTaxDashboard() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVerificationStatus = useCallback(async () => {
    try {
      const status = await individualApi.getVerificationStatus(getToken);
      setVerificationStatus(status);
    } catch {
      // If workspace not found, user may need onboarding
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  const panStatus = verificationStatus?.profile?.panVerification?.status ?? null;
  const aadhaarStatus = verificationStatus?.profile?.aadhaarPanStatus?.status ?? null;
  const panMasked = verificationStatus?.profile?.panVerification?.panMasked;
  const onboardingStep = verificationStatus?.onboardingStep ?? 1;

  // Compute readiness items
  const readinessItems = [
    { label: 'Account verified', status: 'done' as const },
    {
      label: 'PAN verified',
      status: verificationStatus?.panVerified ? 'done' as const : 'pending' as const,
    },
    {
      label: 'Aadhaar-PAN status checked',
      status: verificationStatus?.aadhaarLinked ? 'done' as const :
               aadhaarStatus ? 'warning' as const : 'pending' as const,
      detail: aadhaarStatus === 'NOT_LINKED' ? '1 action required' : undefined,
    },
    {
      label: 'Documents uploaded',
      status: 'pending' as const,
    },
    {
      label: 'Income verified',
      status: 'pending' as const,
    },
    {
      label: 'Final review pending',
      status: 'pending' as const,
    },
  ];

  return (
    <div className="bg-app-bg text-app-text-primary min-h-screen tabular-nums">
      <Navbar />
      {/* ==================== LEFT PERSISTENT SIDEBAR (~250px) ==================== */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-[250px] bg-[#F7F5F1] border-r border-app-border-sidebar flex flex-col z-40 select-none">
        {/* Navigation List */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6">
          <div>
            <Link className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#f4dbcd] text-app-text-primary font-medium text-[14px] border-l-[3px] border-app-accent transition-colors shadow-xs" to="/individualtaxdashboard">
              <span className="material-symbols-outlined text-[19px] text-app-accent" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              <span>Overview</span>
            </Link>
          </div>
          {/* Section: IDENTITY VERIFICATION */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-app-text-muted tracking-wider uppercase">
              Identity & Verification
            </div>
            <div className="space-y-0.5">
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/individual/profile">
                <span className="material-symbols-outlined text-[19px]">person</span>
                <span>Personal Profile</span>
              </Link>
              <Link className="flex items-center justify-between px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/individual/pan">
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[19px]">verified_user</span>
                  <span>PAN Verification</span>
                </span>
                {verificationStatus?.panVerified && (
                  <span className="material-symbols-outlined text-[14px] text-app-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
              </Link>
              <Link className="flex items-center justify-between px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/individual/aadhaar">
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[19px]">fingerprint</span>
                  <span>Aadhaar-PAN Status</span>
                </span>
                {verificationStatus?.aadhaarLinked && (
                  <span className="material-symbols-outlined text-[14px] text-app-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
                {aadhaarStatus === 'NOT_LINKED' && (
                  <span className="material-symbols-outlined text-[14px] text-app-warning">warning</span>
                )}
              </Link>
            </div>
          </div>
          {/* Section: MY TAX RETURN */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-app-text-muted tracking-wider uppercase">
              My Tax Return
            </div>
            <div className="space-y-0.5">
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/individual/eligibility">
                <span className="material-symbols-outlined text-[19px]">task_alt</span>
                <span>ITR Eligibility</span>
              </Link>
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/individual/documents">
                <span className="material-symbols-outlined text-[19px]">folder</span>
                <span>Documents</span>
              </Link>
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/individual/income">
                <span className="material-symbols-outlined text-[19px]">receipt_long</span>
                <span>Income & Deductions</span>
              </Link>
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/individual/tax">
                <span className="material-symbols-outlined text-[19px]">calculate</span>
                <span>Tax Calculation</span>
              </Link>
            </div>
          </div>
          {/* Section: TAX INTELLIGENCE */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-app-text-muted tracking-wider uppercase">
              Tax Intelligence
            </div>
            <div className="space-y-0.5">
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/individual/tax#insights">
                <span className="material-symbols-outlined text-[19px]">savings</span>
                <span>Tax Savings</span>
              </Link>
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/taxcopilotaichatassistant">
                <span className="material-symbols-outlined text-[19px]">auto_awesome</span>
                <span>Tax Copilot</span>
              </Link>
            </div>
          </div>
          {/* Section: VALIDATION */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-app-text-muted tracking-wider uppercase">
              Validation
            </div>
            <div className="space-y-0.5">
              <Link className="flex items-center justify-between px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/individual/validation">
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[19px]">checklist</span>
                  <span>Issues & Readiness</span>
                </span>
              </Link>
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="/individual/review">
                <span className="material-symbols-outlined text-[19px]">send</span>
                <span>Review & File</span>
              </Link>
            </div>
          </div>
          {/* Section: SYSTEM */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-app-text-muted tracking-wider uppercase">
              System
            </div>
            <div className="space-y-0.5">
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="#">
                <span className="material-symbols-outlined text-[19px]">settings</span>
                <span>Settings</span>
              </Link>
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" to="#">
                <span className="material-symbols-outlined text-[19px]">help_outline</span>
                <span>Help</span>
              </Link>
            </div>
          </div>
        </nav>
        {/* Assessee Info / Version Footer */}
        <div className="p-4 border-t border-app-border-sidebar bg-white/40">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-app-text-muted">Assessment Year</span>
            <span className="font-medium text-app-text-primary tabular-nums">AY 2026–27</span>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <div className="pl-[250px] pt-16 min-h-screen flex flex-col">
        <main className="flex-1 w-full py-10 px-12">
          <div className="max-w-[1320px] mx-auto space-y-10">

            {/* ==================== PAGE HEADER ==================== */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider mb-1">Individual Tax Filing · AY 2026–27</p>
                <h1 className="font-serif text-[40px] leading-[48px] text-app-text-primary font-normal tracking-tight">
                  Tax Return Overview
                </h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-[15px] text-app-text-secondary">Your FY 2025–26 filing at a glance.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/individual/documents"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  Upload Docs
                </Link>
                <button
                  onClick={() => navigate(onboardingStep <= 1 ? '/individual/profile' : onboardingStep <= 2 ? '/individual/pan' : onboardingStep <= 3 ? '/individual/aadhaar' : '/individual/eligibility')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm"
                  type="button"
                >
                  <span>Continue Filing</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* ==================== FILING READINESS + VERIFICATION CARD ==================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* Left: Filing Progress */}
              <div className="lg:col-span-8 bg-app-surface border border-app-border rounded-xl p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <span className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider block">Filing readiness</span>
                    <p className="text-[14px] text-app-text-secondary mt-0.5">
                      {onboardingStep <= 1 ? 'Start by setting up your personal profile.' :
                       onboardingStep <= 2 ? 'Verify your PAN to continue.' :
                       onboardingStep <= 3 ? 'Check your Aadhaar-PAN link status.' :
                       'Most of your return is ready for review.'}
                    </p>
                  </div>
                  <div className="font-serif text-[34px] leading-none text-app-text-primary font-normal tabular-nums">
                    {loading ? '—' : `${Math.min(100, Math.max(5, (onboardingStep - 1) * 12))}%`}
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-[#EFE9E2] overflow-hidden mb-7">
                  <div
                    className="h-full bg-app-accent rounded-full transition-all duration-500"
                    style={{ width: loading ? '5%' : `${Math.min(100, Math.max(5, (onboardingStep - 1) * 12))}%` }}
                  />
                </div>
                {/* Onboarding Steps Progress */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-5 border-t border-app-border-light">
                  <div>
                    <span className="text-[12px] text-app-text-muted block">Profile</span>
                    <div className={`mt-1 flex items-center gap-1.5 font-medium text-[15px] ${onboardingStep >= 2 ? 'text-app-success' : 'text-app-text-muted'}`}>
                      <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>{onboardingStep >= 2 ? 'check_circle' : 'radio_button_unchecked'}</span>
                      <span>{onboardingStep >= 2 ? 'Complete' : 'Pending'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[12px] text-app-text-muted block">PAN Verification</span>
                    <div className={`mt-1 flex items-center gap-1.5 font-medium text-[15px] ${verificationStatus?.panVerified ? 'text-app-success' : 'text-app-text-muted'}`}>
                      <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>{verificationStatus?.panVerified ? 'check_circle' : 'radio_button_unchecked'}</span>
                      <span>{verificationStatus?.panVerified ? 'Verified' : 'Pending'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[12px] text-app-text-muted block">Aadhaar-PAN</span>
                    <div className={`mt-1 flex items-center gap-1.5 font-medium text-[15px] ${verificationStatus?.aadhaarLinked ? 'text-app-success' : aadhaarStatus === 'NOT_LINKED' ? 'text-app-warning' : 'text-app-text-muted'}`}>
                      <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {verificationStatus?.aadhaarLinked ? 'check_circle' : aadhaarStatus === 'NOT_LINKED' ? 'warning' : 'radio_button_unchecked'}
                      </span>
                      <span>{verificationStatus?.aadhaarLinked ? 'Linked' : aadhaarStatus === 'NOT_LINKED' ? 'Action Req.' : 'Pending'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[12px] text-app-text-muted block">Documents</span>
                    <div className="mt-1 flex items-center gap-1.5 text-app-text-muted text-[15px]">
                      <span className="material-symbols-outlined text-[17px]">radio_button_unchecked</span>
                      <span>Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Taxpayer Verification Card */}
              <div className="lg:col-span-4">
                {loading ? (
                  <div className="bg-app-surface border border-app-border rounded-xl p-6">
                    <LoadingSpinner message="Loading verification status..." />
                  </div>
                ) : (
                  <TaxpayerVerificationCard
                    panStatus={panStatus as any}
                    panMasked={panMasked}
                    aadhaarStatus={aadhaarStatus as any}
                    onContinue={() => navigate('/individual/eligibility')}
                    onResolveAadhaar={() => window.open(INCOME_TAX_PORTAL, '_blank')}
                    onCheckAgain={() => navigate('/individual/aadhaar')}
                  />
                )}
              </div>
            </section>

            {/* ==================== SUMMARY METRICS (4-COLUMN GRID) ==================== */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1 */}
              <div className="bg-app-surface border border-app-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
                <span className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider block">Estimated Tax</span>
                <div className="mt-3 mb-2">
                  <span className="font-serif text-[32px] font-normal text-app-text-primary tabular-nums">₹—</span>
                </div>
                <p className="text-[13px] text-app-text-secondary">Pending income data</p>
              </div>
              {/* Card 2 */}
              <div className="bg-app-surface border border-app-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
                <span className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider block">Tax Paid (TDS)</span>
                <div className="mt-3 mb-2">
                  <span className="font-serif text-[32px] font-normal text-app-text-primary tabular-nums">₹—</span>
                </div>
                <p className="text-[13px] text-app-text-secondary">Upload Form 16 to extract</p>
              </div>
              {/* Card 3 */}
              <div className="bg-app-surface border border-app-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
                <span className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider block">Refund / Payable</span>
                <div className="mt-3 mb-2">
                  <span className="font-serif text-[32px] font-normal text-app-text-primary tabular-nums">₹—</span>
                </div>
                <p className="text-[13px] text-app-text-secondary">Calculated after tax entry</p>
              </div>
              {/* Card 4 */}
              <div className="bg-app-surface border border-app-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
                <span className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider block">Filing Status</span>
                <div className="mt-3 mb-2">
                  <StatusBadge variant="pending" label="Draft" />
                </div>
                <p className="text-[13px] text-app-text-secondary">AY 2026–27</p>
              </div>
            </section>

            {/* ==================== RETURN SUMMARY + NEEDS ATTENTION ==================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* LEFT PANEL: Return Summary */}
              <div className="lg:col-span-8 bg-app-surface border border-app-border rounded-xl p-7 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-app-border-light">
                  <h2 className="font-serif text-[22px] text-app-text-primary font-normal">Return Summary</h2>
                  <span className="text-[13px] text-app-text-muted">FY 2025–26 Computation</span>
                </div>
                <div className="divide-y divide-app-border-light text-[14px]">
                  {[
                    { label: 'Gross Income', value: '₹—', note: 'Add income sources' },
                    { label: 'Deductions', value: '₹—', note: 'Add deductions' },
                    { label: 'Taxable Income', value: '₹—', highlight: true },
                    { label: 'Tax Liability', value: '₹—' },
                    { label: 'TDS / Advance Tax', value: '₹—' },
                    { label: 'Estimated Refund / Payable', value: '₹—', positive: true },
                  ].map((row) => (
                    <div key={row.label} className={`py-4 flex items-center justify-between ${row.highlight ? 'bg-app-bg/50 px-3 -mx-3 rounded' : ''}`}>
                      <span className={`${row.positive ? 'text-app-success font-medium' : row.highlight ? 'text-app-text-primary font-semibold' : 'text-app-text-secondary'}`}>
                        {row.label}
                      </span>
                      <span className={`font-medium tabular-nums ${row.positive ? 'text-app-success font-semibold text-[16px]' : row.highlight ? 'text-app-text-primary font-semibold text-[15px]' : 'text-app-text-primary'}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-5 mt-2 border-t border-app-border-light">
                  <Link className="inline-flex items-center gap-1.5 text-[14px] font-medium text-app-accent hover:text-app-accent-hover hover:underline transition-colors" to="/individual/tax">
                    <span>Start tax calculation</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* RIGHT PANEL: Quick Actions */}
              <div className="lg:col-span-4 bg-app-surface border border-app-border rounded-xl p-7 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-app-border-light">
                  <h2 className="text-[19px] font-medium text-app-text-primary">Quick Actions</h2>
                </div>
                <div className="space-y-3 pt-5">
                  {[
                    { icon: 'upload_file', label: 'Upload Documents', to: '/individual/documents', desc: 'Form 16, bank statement, etc.' },
                    { icon: 'verified_user', label: 'Verify PAN', to: '/individual/pan', desc: 'Validate taxpayer identity' },
                    { icon: 'fingerprint', label: 'Aadhaar-PAN Status', to: '/individual/aadhaar', desc: 'Check linkage status' },
                    { icon: 'calculate', label: 'View Tax Summary', to: '/individual/tax', desc: 'Old vs New regime comparison' },
                  ].map((item) => (
                    <Link key={item.label} to={item.to} className="flex items-start gap-3 p-3 rounded-lg border border-app-border hover:border-primary hover:bg-[#FDF9F7] transition-all group">
                      <span className="material-symbols-outlined text-[20px] text-app-accent mt-0.5">{item.icon}</span>
                      <div>
                        <p className="text-[14px] font-medium text-app-text-primary group-hover:text-primary transition-colors">{item.label}</p>
                        <p className="text-[12px] text-app-text-muted mt-0.5">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* ==================== TAX COPILOT PREVIEW ==================== */}
            <section className="bg-primary text-[#F7F5F1] rounded-[14px] p-8 md:p-10 border border-primary shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <span className="text-[11px] font-semibold text-app-copper uppercase tracking-widest block mb-1">
                    Statutory Assistance
                  </span>
                  <h2 className="font-serif text-[26px] text-[#FFF8F5] font-normal">
                    Tax Copilot
                  </h2>
                  <p className="text-[14px] text-[#C7BFB7] mt-0.5">Need help understanding your return?</p>
                </div>
                <div>
                  <Link to="/taxcopilotaichatassistant" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-app-copper hover:bg-app-copper-hover text-app-dark text-[13px] font-medium transition-colors">
                    <span>Ask Tax Copilot</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
              <div className="bg-[#5e381f] border border-[#7e4f30] rounded-lg p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/10 text-white/80 text-[11px] flex items-center justify-center shrink-0 mt-0.5">Q</span>
                  <p className="text-[15px] font-medium text-[#FFF8F5]">Which tax regime should I choose for AY 2026–27?</p>
                </div>
                <div className="flex items-start gap-3 pt-1 pl-1">
                  <span className="material-symbols-outlined text-[18px] text-app-copper shrink-0 mt-0.5">auto_awesome</span>
                  <p className="text-[14px] text-[#DDD3CB] leading-relaxed">
                    The best regime depends on your deductions. If your eligible deductions (80C, 80D, HRA, etc.) exceed ₹3.75 lakh, the Old Regime generally results in lower tax.
                    Once you add your income and deductions, TaxPilot will calculate both and show you the difference.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
