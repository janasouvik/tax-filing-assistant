import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { StatusBadge, TaxpayerVerificationCard, SandboxBanner, LoadingSpinner, InlineError } from '../../components/individual/SharedComponents';
import { individualApi } from '../../services/individual.service';
import type { AadhaarPanStatusResult, VerificationStatus } from '../../services/individual.service';

const INCOME_TAX_PORTAL = 'https://www.incometax.gov.in/iec/foportal/';

const STATUS_UI: Record<string, { icon: string; iconColor: string; title: string; description: string; variant: 'verified' | 'pending' | 'action-required' | 'failed' | 'linked' | 'exempt' | 'unknown'; bg: string; border: string }> = {
  LINKED:             { icon: 'check_circle',   iconColor: 'text-app-success',  title: 'Aadhaar–PAN Linked',         description: 'Your PAN and Aadhaar are linked.',                                  variant: 'linked',          bg: 'bg-app-success-bg', border: 'border-app-success/30' },
  EXEMPT:             { icon: 'check_circle',   iconColor: 'text-app-success',  title: 'Linkage Not Required',       description: 'Aadhaar-PAN linkage requirement does not apply.',                   variant: 'exempt',          bg: 'bg-app-success-bg', border: 'border-app-success/30' },
  PENDING:            { icon: 'schedule',       iconColor: 'text-app-warning',  title: 'Link Request Pending',       description: 'Your Aadhaar-PAN linking request is currently under validation.',  variant: 'pending',         bg: 'bg-app-warning-bg', border: 'border-app-warning/30' },
  NOT_LINKED:         { icon: 'warning',        iconColor: 'text-[#C2410C]',    title: 'Action Required',            description: 'Your PAN-Aadhaar linkage could not be confirmed.',                 variant: 'action-required', bg: 'bg-[#FEF3EC]',      border: 'border-[#C2410C]/30' },
  FAILED:             { icon: 'cancel',         iconColor: 'text-app-error',    title: 'Linkage Validation Failed',  description: 'Aadhaar-PAN linkage validation failed.',                            variant: 'failed',          bg: 'bg-[#FFF1F0]',      border: 'border-app-error/30' },
  PAN_INOPERATIVE:    { icon: 'warning',        iconColor: 'text-app-warning',  title: 'PAN Inoperative',            description: 'Your PAN appears to be inoperative. Resolve on the IT portal.',   variant: 'action-required', bg: 'bg-app-warning-bg', border: 'border-app-warning/30' },
  UNKNOWN:            { icon: 'help_outline',   iconColor: 'text-app-text-muted', title: 'Status Unknown',           description: 'Unable to determine current Aadhaar-PAN link status.',             variant: 'unknown',         bg: 'bg-gray-50',        border: 'border-gray-200' },
  SERVICE_UNAVAILABLE:{ icon: 'cloud_off',      iconColor: 'text-app-text-muted', title: 'Service Unavailable',      description: 'The Aadhaar-PAN status service is temporarily unavailable.',        variant: 'unknown',         bg: 'bg-gray-50',        border: 'border-gray-200' },
};

export default function AadhaarPANStatusPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [aadhaarResult, setAadhaarResult] = useState<AadhaarPanStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const loadStatus = async () => {
    try {
      const vs = await individualApi.getVerificationStatus(getToken);
      setVerificationStatus(vs);

      // If PAN not verified, redirect
      if (!vs.panVerified && !vs.profile?.panVerification) {
        navigate('/individual/pan');
        return;
      }

      // If already have aadhaar status from profile
      if (vs.profile?.aadhaarPanStatus) {
        const existingStatus = vs.profile.aadhaarPanStatus.status;
        setAadhaarResult({
          status: existingStatus,
          displayMessage: STATUS_UI[existingStatus]?.description || 'Status checked',
          actionRequired: ['NOT_LINKED', 'FAILED', 'PAN_INOPERATIVE', 'UNKNOWN'].includes(existingStatus),
          actionUrl: ['NOT_LINKED', 'FAILED', 'PAN_INOPERATIVE'].includes(existingStatus) ? INCOME_TAX_PORTAL : undefined,
          isSandbox: vs.profile.aadhaarPanStatus.isSandbox,
          checkedAt: vs.profile.aadhaarPanStatus.checkedAt || new Date().toISOString(),
          aadhaarPanStatus: vs.profile.aadhaarPanStatus,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const handleCheck = async () => {
    const pan = verificationStatus?.profile?.panVerification?.pan;
    if (!pan) { navigate('/individual/pan'); return; }

    setChecking(true);
    setError('');
    try {
      const res = await individualApi.checkAadhaarPanStatus(getToken, pan);
      setAadhaarResult(res);
      // Refresh overall status
      const vs = await individualApi.getVerificationStatus(getToken);
      setVerificationStatus(vs);
    } catch (err: any) {
      setError(err.message || 'Failed to check Aadhaar-PAN status');
    } finally {
      setChecking(false);
    }
  };

  const panVerified = verificationStatus?.panVerified;
  const panStatus = verificationStatus?.profile?.panVerification?.status;
  const panMasked = verificationStatus?.profile?.panVerification?.panMasked;
  
  const isFailed = panStatus === 'FAILED' || panStatus === 'NOT_FOUND' || panStatus === 'INACTIVE';
  const isCheckDisabled = checking || !panVerified || isFailed;
  
  let disabledReason = '';
  if (isFailed) {
    disabledReason = 'PAN verification failed. Please re-verify your PAN.';
  } else if (!panVerified) {
    disabledReason = 'Please verify your PAN first';
  }
  const currentStatus = aadhaarResult?.status;
  const statusUi = currentStatus ? STATUS_UI[currentStatus] : null;
  const isLinked = currentStatus === 'LINKED' || currentStatus === 'EXEMPT';

  if (loading) {
    return (
      <IndividualLayout currentStep={3}>
        <LoadingSpinner message="Loading Aadhaar-PAN status..." />
      </IndividualLayout>
    );
  }

  return (
    <IndividualLayout currentStep={3}>
      <div className="space-y-6">
        {/* Main card */}
        <div className="bg-app-surface border border-app-border rounded-xl p-8 shadow-xs">
          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[20px] text-app-accent">fingerprint</span>
              <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">Step 3 of 12</p>
            </div>
            <h1 className="font-serif text-[32px] text-app-text-primary font-normal">Aadhaar & PAN Status</h1>
            <p className="text-[15px] text-app-text-secondary mt-1">
              This checks whether your PAN and Aadhaar are linked as required by the Income Tax Department.
            </p>
          </div>

          {/* Important note */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-[13px] text-blue-800 mb-6">
            <span className="material-symbols-outlined text-[18px] text-blue-600 mt-0.5 shrink-0">info</span>
            <div>
              <span className="font-semibold">Privacy Note</span>
              <p className="mt-0.5 text-blue-700">
                TaxPilot does not collect or store your Aadhaar number. Aadhaar-PAN linkage status is verified via your PAN.
                This check does not replace official Aadhaar authentication.
              </p>
            </div>
          </div>

          {/* Sandbox Banner */}
          <div className="mb-6"><SandboxBanner /></div>

          {/* Error */}
          {error && <div className="mb-5"><InlineError message={error} onRetry={handleCheck} /></div>}

          {/* PAN status summary */}
          <div className={`flex items-center justify-between p-4 rounded-lg border mb-5 ${panVerified ? 'bg-app-success-bg border-app-success/30' : 'bg-app-warning-bg border-app-warning/30'}`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-app-success" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <div>
                <p className="text-[14px] font-semibold text-app-text-primary">PAN</p>
                {panMasked && <p className="text-[13px] font-mono text-app-text-secondary">{panMasked}</p>}
              </div>
            </div>
            <StatusBadge variant={panVerified ? 'verified' : 'pending'} label={panVerified ? 'Verified' : 'Pending'} size="sm" />
          </div>

          {/* Aadhaar-PAN Status Result */}
          {aadhaarResult && statusUi ? (
            <div className={`rounded-xl border-2 p-6 ${statusUi.bg} ${statusUi.border} mb-6`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-[24px] ${statusUi.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {statusUi.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="text-[18px] font-semibold text-app-text-primary">{statusUi.title}</h2>
                    <StatusBadge variant={statusUi.variant} size="sm" />
                  </div>
                  <p className="text-[14px] text-app-text-secondary leading-relaxed">{statusUi.description}</p>

                  {aadhaarResult.isSandbox && (
                    <p className="text-[12px] text-purple-600 font-medium mt-2">DEMO / SANDBOX — Not a real government verification</p>
                  )}

                  {aadhaarResult.checkedAt && (
                    <p className="text-[12px] text-app-text-muted mt-2">
                      Checked: {new Date(aadhaarResult.checkedAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons for non-linked state */}
              {!isLinked && (
                <div className="mt-5 flex flex-wrap gap-3 pl-16">
                  <a
                    href={INCOME_TAX_PORTAL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#C2410C] text-[#C2410C] hover:bg-white text-[13px] font-medium transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Resolve on Income Tax Portal
                  </a>
                  <button
                    onClick={handleCheck}
                    disabled={checking}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-app-border text-app-text-secondary hover:bg-white text-[13px] font-medium transition-all disabled:opacity-50"
                    type="button"
                  >
                    {checking ? (
                      <span className="w-4 h-4 border-2 border-app-border border-t-primary rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[15px]">refresh</span>
                    )}
                    Check Status Again
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* No status yet — show check button */
            <div className="text-center py-10 border-2 border-dashed border-app-border rounded-xl mb-6">
              <span className="material-symbols-outlined text-[48px] text-app-text-muted block mb-3">fingerprint</span>
              <p className="text-[15px] text-app-text-secondary mb-5">Check your Aadhaar-PAN linkage status</p>
              <button
                onClick={handleCheck}
                disabled={isCheckDisabled}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm disabled:opacity-60"
                type="button"
              >
                {checking ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking status...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                    Check Aadhaar-PAN Status
                  </>
                )}
              </button>
              {disabledReason && (
                <p className="text-[12px] text-app-text-muted mt-3">{disabledReason}</p>
              )}
            </div>
          )}

          {/* Action footer */}
          <div className="flex items-center justify-between pt-2 border-t border-app-border-light">
            <button
              onClick={() => navigate('/individual/pan')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back
            </button>
            <div className="flex gap-3">
              {!aadhaarResult && (
                <button
                  onClick={handleCheck}
                  disabled={isCheckDisabled}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all disabled:opacity-50"
                  type="button"
                >
                  {checking ? 'Checking...' : 'Check Status'}
                </button>
              )}
              <button
                onClick={() => navigate('/individual/eligibility')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm"
                type="button"
              >
                {isLinked ? 'Continue' : 'Skip for Now'}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Combined Verification Card */}
        <TaxpayerVerificationCard
          panStatus={(verificationStatus?.profile?.panVerification?.status as any) ?? null}
          panMasked={panMasked}
          aadhaarStatus={(currentStatus as any) ?? null}
          onContinue={() => navigate('/individual/eligibility')}
          onResolveAadhaar={() => window.open(INCOME_TAX_PORTAL, '_blank')}
          onCheckAgain={handleCheck}
          loading={checking}
        />
      </div>
    </IndividualLayout>
  );
}
