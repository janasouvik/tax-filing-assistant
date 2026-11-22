import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { TaxpayerVerificationCard, StatusBadge, LoadingSpinner } from '../components/individual/SharedComponents';
import { individualApi, type VerificationStatus } from '../services/individual.service';

const INCOME_TAX_PORTAL = 'https://www.incometax.gov.in/iec/foportal/';

export default function IndividualTaxDashboard() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('taxpilot_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('taxpilot_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const fetchVerificationStatus = useCallback(async () => {
    try {
      const status = await individualApi.getVerificationStatus(getToken);
      setVerificationStatus(status);
    } catch {
      // If workspace not found, user may need onboarding
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  const panStatus = verificationStatus?.profile?.panVerification?.status ?? null;
  const aadhaarStatus = verificationStatus?.profile?.aadhaarPanStatus?.status ?? null;
  const panMasked = verificationStatus?.profile?.panVerification?.panMasked;
  const onboardingStep = verificationStatus?.onboardingStep ?? 1;


  return (
    <div className="bg-app-bg dark:bg-app-dark text-app-text-primary dark:text-app-surface min-h-screen tabular-nums">
      {/* ==================== GLOBAL TOP NAVBAR (Allows browsing Home, Individuals, SMEs, etc.) ==================== */}
      <Navbar />

      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 top-16 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* ==================== LEFT PERSISTENT SIDEBAR ==================== */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] ${
          isCollapsed ? 'md:w-[70px]' : 'md:w-[250px]'
        } w-[260px] ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } bg-[#F7F5F1] dark:bg-[#20150E] border-r border-app-border dark:border-app-dark-border flex flex-col justify-between z-40 select-none transition-all duration-300 ease-in-out`}
      >
        {/* Top Header with Shrink/Expand Toggle (No duplicate logo because logo is in Navbar) */}
        <div className={`h-14 border-b border-app-border/70 dark:border-app-dark-border flex items-center ${isCollapsed ? 'md:justify-center px-3' : 'justify-between px-4'} transition-all duration-200`}>
          {(!isCollapsed || mobileSidebarOpen) && (
            <span className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider">
              Navigation
            </span>
          )}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileSidebarOpen(false);
              } else {
                toggleSidebar();
              }
            }}
            type="button"
            className="p-1.5 rounded-md text-app-text-secondary dark:text-gray-400 hover:text-app-text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Shrink sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Shrink sidebar'}
          >
            <span className="material-symbols-outlined text-[19px]">
              {mobileSidebarOpen ? 'close' : isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className={`flex-1 ${isCollapsed ? 'md:px-2' : 'px-3'} px-3 py-5 overflow-y-auto space-y-6 transition-all duration-200`}>
          <div>
            <Link
              className={`flex items-center ${isCollapsed ? 'md:justify-center md:px-2' : 'gap-3 px-3'} gap-3 px-3 py-2.5 rounded-lg bg-secondary-container dark:bg-[#3E291C] text-app-text-primary dark:text-amber-200 font-medium text-[14px] border-l-[3px] border-app-accent transition-colors shadow-xs`}
              to="/individualtaxdashboard"
              onClick={() => setMobileSidebarOpen(false)}
              title="Overview"
            >
              <span className="material-symbols-outlined text-[20px] text-app-accent dark:text-amber-400 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              {(!isCollapsed || mobileSidebarOpen) && <span>Overview</span>}
            </Link>
          </div>

          {/* Section: SYSTEM */}
          <div>
            {(!isCollapsed || mobileSidebarOpen) ? (
              <div className="px-3 pb-2 text-[11px] font-semibold text-app-text-muted dark:text-gray-400 tracking-wider uppercase">
                System
              </div>
            ) : (
              <div className="my-2 border-t border-app-border/40 dark:border-app-dark-border" />
            )}
            <div className="space-y-0.5">
              <Link
                className={`flex items-center ${isCollapsed ? 'md:justify-center md:px-2' : 'gap-3 px-3'} gap-3 px-3 py-2 rounded-lg text-app-text-secondary dark:text-gray-300 hover:text-app-text-primary dark:hover:text-app-surface hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors text-[14px]`}
                to="#"
                onClick={() => setMobileSidebarOpen(false)}
                title="Settings"
              >
                <span className="material-symbols-outlined text-[19px] shrink-0">settings</span>
                {(!isCollapsed || mobileSidebarOpen) && <span>Settings</span>}
              </Link>
              <Link
                className={`flex items-center ${isCollapsed ? 'md:justify-center md:px-2' : 'gap-3 px-3'} gap-3 px-3 py-2 rounded-lg text-app-text-secondary dark:text-gray-300 hover:text-app-text-primary dark:hover:text-app-surface hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors text-[14px]`}
                to="#"
                onClick={() => setMobileSidebarOpen(false)}
                title="Help"
              >
                <span className="material-symbols-outlined text-[19px] shrink-0">help_outline</span>
                {(!isCollapsed || mobileSidebarOpen) && <span>Help</span>}
              </Link>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer: Assessment Year (AY 2026-27) */}
        <div className="p-3 border-t border-app-border dark:border-app-dark-border bg-white/60 dark:bg-app-dark-card/40 transition-all duration-200">
          {(!isCollapsed || mobileSidebarOpen) ? (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-app-text-muted dark:text-gray-400">Assessment Year</span>
              <span className="font-medium text-app-text-primary dark:text-app-surface tabular-nums">AY 2026–27</span>
            </div>
          ) : (
            <div className="text-[10px] text-center font-semibold text-app-text-muted dark:text-gray-400" title="Assessment Year AY 2026–27">
              26–27
            </div>
          )}
        </div>
      </aside>

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <div className={`${isCollapsed ? 'md:pl-[70px]' : 'md:pl-[250px]'} pl-0 pt-16 min-h-screen flex flex-col transition-all duration-300 ease-in-out`}>
        <main className="flex-1 w-full py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-12">
          <div className="max-w-[1320px] mx-auto space-y-6 sm:space-y-10">

            {/* Mobile Sidebar Opener Pill */}
            <div className="md:hidden flex items-center justify-between">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-card text-[13px] font-medium text-app-text-secondary dark:text-gray-300 shadow-xs active:bg-black/5"
              >
                <span className="material-symbols-outlined text-[17px] text-app-accent">dock_to_right</span>
                <span>Open Overview Menu</span>
              </button>
              <span className="text-[11px] font-medium text-app-text-muted dark:text-gray-400">AY 2026–27</span>
            </div>

            {/* ==================== PAGE HEADER ==================== */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider mb-1">Individual Tax Filing · AY 2026–27</p>
                <h1 className="font-serif text-[28px] sm:text-[34px] lg:text-[40px] leading-tight text-app-text-primary dark:text-app-surface font-normal tracking-tight">
                  Tax Return Overview
                </h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-[14px] sm:text-[15px] text-app-text-secondary dark:text-gray-300">Your FY 2025–26 filing at a glance.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto">
                <Link
                  to="/individual/documents"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-app-border dark:border-app-dark-border text-app-text-secondary dark:text-gray-300 hover:bg-app-bg dark:hover:bg-app-dark hover:border-primary/50 text-[14px] font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Upload Docs</span>
                </Link>
                <button
                  onClick={() => navigate(onboardingStep <= 1 ? '/individual/profile' : onboardingStep <= 2 ? '/individual/pan' : onboardingStep <= 3 ? '/individual/aadhaar' : '/individual/eligibility')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-[#72462a] text-white text-[14px] font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow cursor-pointer"
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
              <div className="lg:col-span-8 bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <span className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider block">Filing readiness</span>
                    <p className="text-[14px] text-app-text-secondary dark:text-gray-300 mt-0.5">
                      {onboardingStep <= 1 ? 'Start by setting up your personal profile.' :
                        onboardingStep <= 2 ? 'Verify your PAN to continue.' :
                          onboardingStep <= 3 ? 'Check your Aadhaar-PAN link status.' :
                            'Most of your return is ready for review.'}
                    </p>
                  </div>
                  <div className="font-serif text-[34px] leading-none text-app-text-primary dark:text-app-surface font-normal tabular-nums">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-5 border-t border-app-border dark:border-app-dark-border-light">
                  <div>
                    <span className="text-[12px] text-app-text-muted dark:text-gray-400 block">Profile</span>
                    <div className={`mt-1 flex items-center gap-1.5 font-medium text-[15px] ${onboardingStep >= 2 ? 'text-app-success' : 'text-app-text-muted dark:text-gray-400'}`}>
                      <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>{onboardingStep >= 2 ? 'check_circle' : 'radio_button_unchecked'}</span>
                      <span>{onboardingStep >= 2 ? 'Complete' : 'Pending'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[12px] text-app-text-muted dark:text-gray-400 block">PAN Verification</span>
                    <div className={`mt-1 flex items-center gap-1.5 font-medium text-[15px] ${verificationStatus?.panVerified ? 'text-app-success' : 'text-app-text-muted dark:text-gray-400'}`}>
                      <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>{verificationStatus?.panVerified ? 'check_circle' : 'radio_button_unchecked'}</span>
                      <span>{verificationStatus?.panVerified ? 'Verified' : 'Pending'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[12px] text-app-text-muted dark:text-gray-400 block">Aadhaar-PAN</span>
                    <div className={`mt-1 flex items-center gap-1.5 font-medium text-[15px] ${verificationStatus?.aadhaarLinked ? 'text-app-success' : aadhaarStatus === 'NOT_LINKED' ? 'text-app-warning' : 'text-app-text-muted dark:text-gray-400'}`}>
                      <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {verificationStatus?.aadhaarLinked ? 'check_circle' : aadhaarStatus === 'NOT_LINKED' ? 'warning' : 'radio_button_unchecked'}
                      </span>
                      <span>{verificationStatus?.aadhaarLinked ? 'Linked' : aadhaarStatus === 'NOT_LINKED' ? 'Action Req.' : 'Pending'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[12px] text-app-text-muted dark:text-gray-400 block">Documents</span>
                    <div className="mt-1 flex items-center gap-1.5 text-app-text-muted dark:text-gray-400 text-[15px]">
                      <span className="material-symbols-outlined text-[17px]">radio_button_unchecked</span>
                      <span>Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Taxpayer Verification Card */}
              <div className="lg:col-span-4">
                {loading ? (
                  <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-6">
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
              <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
                <span className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider block">Estimated Tax</span>
                <div className="mt-3 mb-2">
                  <span className="font-serif text-[32px] font-normal text-app-text-primary dark:text-app-surface tabular-nums">₹—</span>
                </div>
                <p className="text-[13px] text-app-text-secondary dark:text-gray-300">Pending income data</p>
              </div>
              {/* Card 2 */}
              <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
                <span className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider block">Tax Paid (TDS)</span>
                <div className="mt-3 mb-2">
                  <span className="font-serif text-[32px] font-normal text-app-text-primary dark:text-app-surface tabular-nums">₹—</span>
                </div>
                <p className="text-[13px] text-app-text-secondary dark:text-gray-300">Upload Form 16 to extract</p>
              </div>
              {/* Card 3 */}
              <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
                <span className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider block">Refund / Payable</span>
                <div className="mt-3 mb-2">
                  <span className="font-serif text-[32px] font-normal text-app-text-primary dark:text-app-surface tabular-nums">₹—</span>
                </div>
                <p className="text-[13px] text-app-text-secondary dark:text-gray-300">Calculated after tax entry</p>
              </div>
              {/* Card 4 */}
              <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
                <span className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider block">Filing Status</span>
                <div className="mt-3 mb-2">
                  <StatusBadge variant="pending" label="Draft" />
                </div>
                <p className="text-[13px] text-app-text-secondary dark:text-gray-300">AY 2026–27</p>
              </div>
            </section>

            {/* ==================== RETURN SUMMARY + NEEDS ATTENTION ==================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* LEFT PANEL: Return Summary */}
              <div className="lg:col-span-8 bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-7 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-app-border dark:border-app-dark-border-light">
                  <h2 className="font-serif text-[22px] text-app-text-primary dark:text-app-surface font-normal">Return Summary</h2>
                  <span className="text-[13px] text-app-text-muted dark:text-gray-400">FY 2025–26 Computation</span>
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
                    <div key={row.label} className={`py-4 flex items-center justify-between ${row.highlight ? 'bg-app-bg dark:bg-app-dark/50 px-3 -mx-3 rounded' : ''}`}>
                      <span className={`${row.positive ? 'text-app-success font-medium' : row.highlight ? 'text-app-text-primary dark:text-app-surface font-semibold' : 'text-app-text-secondary dark:text-gray-300'}`}>
                        {row.label}
                      </span>
                      <span className={`font-medium tabular-nums ${row.positive ? 'text-app-success font-semibold text-[16px]' : row.highlight ? 'text-app-text-primary dark:text-app-surface font-semibold text-[15px]' : 'text-app-text-primary dark:text-app-surface'}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-5 mt-2 border-t border-app-border dark:border-app-dark-border-light">
                  <Link className="inline-flex items-center gap-1.5 text-[14px] font-medium text-app-accent hover:text-app-accent-hover hover:underline transition-colors" to="/individual/tax">
                    <span>Start tax calculation</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* RIGHT PANEL: Quick Actions */}
              <div className="lg:col-span-4 bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-7 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-app-border dark:border-app-dark-border-light">
                  <h2 className="text-[19px] font-medium text-app-text-primary dark:text-app-surface">Quick Actions</h2>
                </div>
                <div className="space-y-3 pt-5">
                  {[
                    { icon: 'upload_file', label: 'Upload Documents', to: '/individual/documents', desc: 'Form 16, bank statement, etc.' },
                    { icon: 'verified_user', label: 'Verify PAN', to: '/individual/pan', desc: 'Validate taxpayer identity' },
                    { icon: 'fingerprint', label: 'Aadhaar-PAN Status', to: '/individual/aadhaar', desc: 'Check linkage status' },
                    { icon: 'calculate', label: 'View Tax Summary', to: '/individual/tax', desc: 'Old vs New regime comparison' },
                  ].map((item) => (
                    <Link key={item.label} to={item.to} className="flex items-start gap-3 p-3 rounded-lg border border-app-border dark:border-app-dark-border hover:border-primary hover:bg-[#FDF9F7] dark:bg-app-dark transition-all group">
                      <span className="material-symbols-outlined text-[20px] text-app-accent mt-0.5">{item.icon}</span>
                      <div>
                        <p className="text-[14px] font-medium text-app-text-primary dark:text-app-surface group-hover:text-primary transition-colors">{item.label}</p>
                        <p className="text-[12px] text-app-text-muted dark:text-gray-400 mt-0.5">{item.desc}</p>
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
                  <span className="w-6 h-6 rounded-full bg-white dark:bg-app-dark-card/10 text-white/80 text-[11px] flex items-center justify-center shrink-0 mt-0.5">Q</span>
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
