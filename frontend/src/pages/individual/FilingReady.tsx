/**
 * Filing Ready & e-Verification Page (Phases 20-21)
 *
 * PRD Rule: TaxPilot does NOT fake government filing.
 * Return is NEVER marked FILED without actual government confirmation and persisted acknowledgement.
 */
import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { StatusBadge, LoadingSpinner } from '../../components/individual/SharedComponents';
import { filingApi, verificationApi, type VerificationAttemptRecord } from '../../services/individual.service';

const E_VERIFY_METHODS = [
  {
    id: 'AADHAAR_OTP',
    icon: 'smartphone',
    title: 'Aadhaar OTP',
    description: 'Instant OTP sent to Aadhaar-linked mobile number.',
    available: true,
  },
  {
    id: 'EVC_NETBANKING',
    icon: 'account_balance',
    title: 'Net Banking EVC',
    description: 'e-Verify through your authorized bank net-banking login.',
    available: true,
  },
  {
    id: 'EVC_BANK_ACCOUNT',
    icon: 'account_balance_wallet',
    title: 'Bank Account EVC',
    description: 'Pre-validated bank account Electronic Verification Code.',
    available: true,
  },
  {
    id: 'EVC_DEMAT',
    icon: 'credit_card',
    title: 'Demat Account',
    description: 'e-Verify via CDSL or NSDL demat account.',
    available: true,
  },
  {
    id: 'ITR_V',
    icon: 'mail',
    title: 'Physical ITR-V',
    description: 'Print, sign, and speed-post ITR-V to CPC Bengaluru within 30 days.',
    available: true,
  },
];

interface FilingErrorState {
  type: 'VALIDATION' | 'BLOCKED' | 'UNKNOWN' | 'SUPERSEDED' | 'FAILURE';
  message: string;
  code?: string;
}

interface VerificationErrorState {
  type: 'BLOCKED' | 'FAILED' | 'UNKNOWN' | 'ERROR';
  message: string;
  code?: string;
}

export default function FilingReady() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [taxReturn, setTaxReturn] = useState<any>(null);
  const [status, setStatus] = useState<string>('DRAFT');
  const [verificationStatus, setVerificationStatus] = useState<string>('UNVERIFIED');
  const [loading, setLoading] = useState(true);
  const [isFiling, setIsFiling] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [filingError, setFilingError] = useState<FilingErrorState | null>(null);
  const [reconcileMessage, setReconcileMessage] = useState<string | null>(null);

  // E-Verification interaction states
  const [selectedMethod, setSelectedMethod] = useState<string>('AADHAAR_OTP');
  const [otpInput, setOtpInput] = useState<string>('');
  const [isInitiatingVerification, setIsInitiatingVerification] = useState(false);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [isReconcilingVerification, setIsReconcilingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<VerificationErrorState | null>(null);
  const [verificationSuccessMessage, setVerificationSuccessMessage] = useState<string | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationAttemptRecord[]>([]);

  const loadVerificationHistory = async (returnId?: string) => {
    const id = returnId || taxReturn?.id;
    if (!id) return;
    try {
      const hist = await verificationApi.getHistory(getToken, id);
      setVerificationHistory(hist.attempts || []);
      if (hist.verificationStatus) {
        setVerificationStatus(hist.verificationStatus);
      }
    } catch (err) {
      console.error('Failed to load verification history:', err);
    }
  };

  const loadStatus = async () => {
    try {
      const data = await filingApi.getReturnStatus(getToken);
      setStatus(data.status || 'DRAFT');
      setTaxReturn(data.taxReturn || null);
      setVerificationStatus(data.taxReturn?.verificationStatus || 'UNVERIFIED');
      if (data.taxReturn?.id) {
        await loadVerificationHistory(data.taxReturn.id);
      }
    } catch (err) {
      console.error('Failed to load return status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleFileReturn = async () => {
    // Prevent accidental duplicate clicks or submission from invalid states
    if (isFiling || status === 'PROCESSING' || status === 'FILED') return;

    if (!taxReturn?.id) {
      setFilingError({
        type: 'FAILURE',
        message: 'No active tax return was found. Please return to the review step.',
      });
      return;
    }

    if (status !== 'APPROVED') {
      setFilingError({
        type: 'FAILURE',
        message: 'Return must be approved by you before filing. Please complete Final Review first.',
      });
      return;
    }

    setIsFiling(true);
    setFilingError(null);
    setReconcileMessage(null);

    try {
      const result = await filingApi.fileReturn(getToken, taxReturn.id);

      // Strict Invariant: Only claim filed if backend confirms FILED and ackNumber
      if (result.status === 'FILED' && result.ackNumber) {
        setStatus('FILED');
        setTaxReturn((prev: any) => ({ ...prev, ...result }));
        setVerificationStatus(result.verificationStatus || 'UNVERIFIED');
      } else if (result.status === 'SUBMISSION_UNKNOWN') {
        setStatus('SUBMISSION_UNKNOWN');
        setTaxReturn((prev: any) => ({ ...prev, ...result }));
        setFilingError({
          type: 'UNKNOWN',
          message: 'Submission request was dispatched, but provider response could not be verified. Do not submit again.',
          code: 'SUBMISSION_UNKNOWN',
        });
      } else {
        setStatus(result.status || status);
        setTaxReturn((prev: any) => ({ ...prev, ...result }));
      }
    } catch (err: any) {
      const errMsg: string = err.message || 'Filing request failed';
      const errCode: string = err.code || '';

      if (errCode === 'SUBMISSION_UNKNOWN' || errMsg.toLowerCase().includes('unknown submission status')) {
        setStatus('SUBMISSION_UNKNOWN');
        setFilingError({
          type: 'UNKNOWN',
          message: 'The submission status is unknown due to a network interruption. Do not attempt to file again until the status is verified.',
          code: errCode,
        });
      } else if (
        errCode === 'APPROVAL_SUPERSEDED' ||
        errMsg.toLowerCase().includes('superseded') ||
        errMsg.toLowerCase().includes('invalidated')
      ) {
        setFilingError({
          type: 'SUPERSEDED',
          message: 'Your previous approval has been superseded or invalidated by subsequent changes. Re-approval is required before filing.',
          code: errCode,
        });
      } else if (
        errMsg.includes('ITRValidationError') ||
        errMsg.includes('Missing') ||
        errMsg.includes('Invalid') ||
        errMsg.includes('pending official CBDT notification') ||
        errMsg.includes('Supported assessment years')
      ) {
        setFilingError({
          type: 'VALIDATION',
          message: errMsg,
          code: errCode,
        });
      } else if (
        errMsg.includes('ERI Integration Blocked') ||
        errMsg.includes('Missing Sandbox ERI API test credentials') ||
        errCode === 'PROVIDER_LOGINERI_ERROR'
      ) {
        setFilingError({
          type: 'BLOCKED',
          message: 'Government ERI integration is deliberately blocked pending authorized provider credentials and product scopes.',
          code: errCode,
        });
      } else {
        setFilingError({
          type: 'FAILURE',
          message: errMsg,
          code: errCode,
        });
      }
    } finally {
      setIsFiling(false);
      await loadStatus();
    }
  };

  const handleReconcile = async () => {
    if (isReconciling || !taxReturn?.id) return;
    setIsReconciling(true);
    setReconcileMessage(null);
    try {
      const result = await filingApi.reconcileFiling(getToken, taxReturn.id);
      setStatus(result.status);
      setTaxReturn((prev: any) => ({ ...prev, ...result }));
      setReconcileMessage(`Status successfully updated: ${result.status}`);
    } catch (err: any) {
      setReconcileMessage(
        err.message || 'Automatic reconciliation is unavailable. Please check the official Income Tax portal directly.'
      );
    } finally {
      setIsReconciling(false);
      await loadStatus();
    }
  };

  const handleInitiateVerification = async () => {
    if (isInitiatingVerification || !taxReturn?.id || status !== 'FILED') return;
    if (verificationStatus === 'VERIFIED') return;

    setIsInitiatingVerification(true);
    setVerificationError(null);
    setVerificationSuccessMessage(null);

    try {
      const res = await verificationApi.initiateVerification(getToken, taxReturn.id, selectedMethod);
      setVerificationSuccessMessage(res.message || 'Verification initiated successfully.');
      setVerificationStatus('PENDING');
    } catch (err: any) {
      const errMsg: string = err.message || 'Verification initiation failed';
      const errCode: string = err.code || '';

      if (
        errCode === 'PROVIDER_ACCESS_BLOCKED' ||
        errMsg.includes('PROVIDER_ACCESS_BLOCKED') ||
        errMsg.includes('Sandbox ERI API test credentials and product scopes are blocked')
      ) {
        setVerificationError({
          type: 'BLOCKED',
          message:
            'In-app automated e-verification is currently unavailable: Sandbox ERI API scopes and test credentials are blocked. Cannot contact government verification endpoints. To complete your mandatory 30-day verification, please verify directly on the official Income Tax portal.',
          code: 'PROVIDER_ACCESS_BLOCKED',
        });
      } else if (errCode === 'VERIFICATION_IN_PROGRESS') {
        setVerificationError({
          type: 'FAILED',
          message: 'A verification attempt is already pending for this return. Please enter your OTP or reconcile.',
          code: errCode,
        });
      } else if (errCode === 'VERIFICATION_UNKNOWN') {
        setVerificationError({
          type: 'UNKNOWN',
          message: 'This return has an unknown verification status and requires reconciliation before re-attempting.',
          code: errCode,
        });
      } else {
        setVerificationError({
          type: 'ERROR',
          message: errMsg,
          code: errCode,
        });
      }
    } finally {
      setIsInitiatingVerification(false);
      await loadStatus();
    }
  };

  const handleSubmitOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingOtp || !taxReturn?.id || status !== 'FILED') return;
    const cleanOtp = otpInput.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setVerificationError({
        type: 'ERROR',
        message: 'Invalid OTP format. Please enter a valid 6-digit numeric code.',
      });
      return;
    }

    setIsSubmittingOtp(true);
    setVerificationError(null);
    setVerificationSuccessMessage(null);

    try {
      const res = await verificationApi.submitOtp(getToken, taxReturn.id, cleanOtp);
      setVerificationSuccessMessage(res.message || 'Return verified successfully!');
      setVerificationStatus(res.verificationStatus || 'VERIFIED');
      setOtpInput('');
    } catch (err: any) {
      const errMsg: string = err.message || 'Verification submission failed';
      const errCode: string = err.code || '';

      if (
        errCode === 'PROVIDER_ACCESS_BLOCKED' ||
        errMsg.includes('PROVIDER_ACCESS_BLOCKED') ||
        errMsg.includes('Sandbox ERI API test credentials and product scopes are blocked')
      ) {
        setVerificationError({
          type: 'BLOCKED',
          message:
            'Verification submission unavailable: Sandbox ERI API scopes are blocked. Your return remains safely in PENDING status.',
          code: 'PROVIDER_ACCESS_BLOCKED',
        });
      } else if (errCode === 'TIMEOUT_ERROR' || err.isNetworkError) {
        setVerificationError({
          type: 'UNKNOWN',
          message:
            'Verification outcome is unknown due to a network timeout. Do not retry blindly; check status on the official IT portal.',
          code: 'UNKNOWN',
        });
      } else {
        setVerificationError({
          type: 'FAILED',
          message: errMsg,
          code: errCode,
        });
      }
    } finally {
      setIsSubmittingOtp(false);
      // Strictly clear OTP input to avoid retaining secret in memory
      setOtpInput('');
      await loadStatus();
    }
  };

  const handleReconcileVerification = async () => {
    if (isReconcilingVerification || !taxReturn?.id) return;
    setIsReconcilingVerification(true);
    setVerificationError(null);
    setVerificationSuccessMessage(null);

    try {
      const res = await verificationApi.reconcileVerification(getToken, taxReturn.id);
      setVerificationSuccessMessage(res.message);
      setVerificationStatus(res.verificationStatus);
    } catch (err: any) {
      setVerificationError({
        type: 'BLOCKED',
        message:
          err.message ||
          'Reconciliation unavailable: Sandbox ERI API scopes are blocked. Please check your return status directly on incometax.gov.in.',
        code: err.code || 'RECONCILIATION_UNAVAILABLE',
      });
    } finally {
      setIsReconcilingVerification(false);
      await loadStatus();
    }
  };

  if (loading) {
    return (
      <IndividualLayout currentStep={11}>
        <LoadingSpinner message="Loading filing status..." />
      </IndividualLayout>
    );
  }

  const isReady = status === 'APPROVED';
  const isFiled = status === 'FILED';
  const isUnknown = status === 'SUBMISSION_UNKNOWN';

  return (
    <IndividualLayout currentStep={11}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">send</span>
            <p className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider">Step 11 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary dark:text-app-surface font-normal">Filing & e-Verification</h1>
          <p className="text-[15px] text-app-text-secondary dark:text-gray-300 mt-1">
            Review your filing readiness, transmit to the Income Tax Department, or complete your submission on the official portal.
          </p>
        </div>

        {/* Not approved warning */}
        {!isReady && !isFiled && !isUnknown && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl border-2 border-app-warning/30 bg-app-warning-bg text-[14px]">
            <span className="material-symbols-outlined text-[20px] text-app-warning shrink-0">warning</span>
            <div>
              <p className="font-semibold text-app-text-primary dark:text-app-surface">Return Not Yet Approved</p>
              <p className="text-app-text-secondary dark:text-gray-300 mt-0.5">
                Please complete the <Link to="/individual/review" className="text-primary underline font-medium">Final Review</Link> and approve your return before filing.
              </p>
            </div>
          </div>
        )}

        {/* Filed Confirmation Banner */}
        {isFiled && (
          <div className="rounded-xl border-2 border-app-success/30 bg-app-success-bg p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-12 h-12 rounded-full bg-app-success flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </span>
              <div>
                <h2 className="text-[20px] font-semibold text-app-text-primary dark:text-app-surface">Return Officially Filed</h2>
                <p className="text-[14px] text-app-text-secondary dark:text-gray-300 mt-0.5">
                  Your tax return has been successfully submitted and confirmed by the Income Tax Department.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-app-success/20">
              <div>
                <p className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider">ITR Acknowledgement Number</p>
                <p className="font-mono text-[16px] font-bold text-app-text-primary dark:text-app-surface mt-0.5">
                  {taxReturn?.ackNumber || 'ACK-CONFIRMED'}
                </p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider">Filing Timestamp</p>
                <p className="text-[14px] text-app-text-secondary dark:text-gray-300 mt-0.5">
                  {taxReturn?.filedAt ? new Date(taxReturn.filedAt).toLocaleString('en-IN') : 'Confirmed'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-[13px]">
              <StatusBadge variant="verified" label="Filed with ITD" size="sm" />
              <StatusBadge
                variant={verificationStatus === 'VERIFIED' ? 'verified' : 'processing'}
                label={verificationStatus === 'VERIFIED' ? 'e-Verified' : 'Pending e-Verification'}
                size="sm"
              />
            </div>
          </div>
        )}

        {/* Ready for Filing Banner */}
        {isReady && !isFiled && (
          <div className="rounded-xl border-2 border-app-success/30 bg-app-success-bg p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-12 h-12 rounded-full bg-app-success flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </span>
              <div>
                <h2 className="text-[20px] font-semibold text-app-text-primary dark:text-app-surface">Your return is ready for filing</h2>
                <p className="text-[14px] text-app-text-secondary dark:text-gray-300 mt-0.5">
                  TaxPilot has prepared, validated, and confirmed your approval for Assessment Year {taxReturn?.assessmentYear || '2025-26'}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-app-text-muted dark:text-gray-400">
              <StatusBadge variant="verified" label="Approved by you" size="sm" />
              <StatusBadge variant="processing" label="Pending Official Filing" size="sm" />
            </div>
          </div>
        )}

        {/* Submission Unknown Banner */}
        {isUnknown && (
          <div className="rounded-xl border-2 border-yellow-400/40 bg-yellow-50 dark:bg-yellow-950/30 p-6 text-yellow-900 dark:text-yellow-100">
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[22px]">help</span>
              </span>
              <div className="flex-1">
                <h2 className="text-[18px] font-semibold">Filing Submission Outcome Unknown</h2>
                <p className="text-[14px] mt-1 opacity-90">
                  Your return was dispatched to the tax provider, but confirmation was interrupted by a network timeout.
                  <strong> Do not submit again</strong> — resubmitting unconfirmed returns can result in duplicate filing errors.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* What TaxPilot has prepared */}
        <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-6 shadow-xs">
          <h2 className="text-[17px] font-semibold text-app-text-primary dark:text-app-surface mb-4">What TaxPilot has prepared</h2>
          <ul className="space-y-3">
            {[
              'Taxpayer identity verified (PAN + Aadhaar-PAN status)',
              'Income sources organized and verified',
              'Deductions claimed and documented',
              'Tax calculated using deterministic statutory tax engine',
              'Old vs New regime comparison completed',
              'Pre-filing validation checks passed',
              'Return reviewed and approved by you',
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-[14px] text-app-text-secondary dark:text-gray-300">
                <span className="material-symbols-outlined text-[16px] text-app-success shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Government ITR Filing Action Section */}
        <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-6 shadow-xs">
          <div className="flex items-start gap-3 mb-5">
            <span className="material-symbols-outlined text-[22px] text-app-accent">cloud_upload</span>
            <div>
              <h2 className="text-[17px] font-semibold text-app-text-primary dark:text-app-surface">Government ITR Filing</h2>
              <p className="text-[14px] text-app-text-secondary dark:text-gray-300 mt-1">
                Transmit your validated tax return to the Income Tax Department via authorized E-Return Intermediary (ERI) gateway.
              </p>
            </div>
          </div>

          {/* Validation Error Alert */}
          {filingError?.type === 'VALIDATION' && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 mb-5 text-[13px]">
              <span className="material-symbols-outlined text-[20px] text-red-600 shrink-0 mt-0.5">fact_check</span>
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Pre-Dispatch Validation Error</p>
                <p className="mt-0.5">{filingError.message}</p>
                <p className="mt-1 text-[12px] opacity-80">
                  Please update your profile, banking information, or income entries before attempting to file again.
                </p>
              </div>
            </div>
          )}

          {/* Provider Access Blocked Alert */}
          {filingError?.type === 'BLOCKED' && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 mb-5 text-[13px]">
              <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5">lock</span>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300">Government ERI Provider Access Blocked</p>
                <p className="mt-0.5">{filingError.message}</p>
                <p className="mt-1 text-[12px] opacity-80">
                  TaxPilot strictly complies with government filing safeguards: automated submission is disabled pending authorized ERI access. Your return data is completely prepared and can be submitted on the official portal below.
                </p>
              </div>
            </div>
          )}

          {/* Superseded Approval Alert */}
          {filingError?.type === 'SUPERSEDED' && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-orange-300 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 mb-5 text-[13px]">
              <span className="material-symbols-outlined text-[20px] text-orange-600 shrink-0 mt-0.5">history</span>
              <div>
                <p className="font-semibold text-orange-800 dark:text-orange-300">Approval Superseded</p>
                <p className="mt-0.5">{filingError.message}</p>
                <div className="mt-2">
                  <Link to="/individual/review" className="text-primary font-semibold underline">
                    Return to Final Review to re-approve
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* General Failure Alert */}
          {filingError?.type === 'FAILURE' && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 mb-5 text-[13px]">
              <span className="material-symbols-outlined text-[20px] text-red-600 shrink-0 mt-0.5">error</span>
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Filing Dispatch Failed</p>
                <p className="mt-0.5">{filingError.message}</p>
              </div>
            </div>
          )}

          {/* Submission Unknown Actions */}
          {isUnknown ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/50 text-[13px] text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-1">Check Filing Status</p>
                <p>
                  To avoid duplicate filing penalties, automated re-submission is disabled. Check your return status with the provider or directly on the official portal.
                </p>
                {reconcileMessage && (
                  <p className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded border border-yellow-300 dark:border-yellow-700 font-mono text-[12px]">
                    {reconcileMessage}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReconcile}
                  disabled={isReconciling}
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-yellow-600 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-[14px] font-semibold transition-all disabled:opacity-50"
                >
                  {isReconciling ? (
                    <>
                      <span className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>Checking Status...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">sync</span>
                      <span>Check Filing Status</span>
                    </>
                  )}
                </button>

                <a
                  href="https://www.incometax.gov.in/iec/foportal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0B3D91] hover:bg-[#083080] text-white text-[14px] font-semibold transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  <span>Check on Official IT Portal</span>
                </a>
              </div>
            </div>
          ) : isFiled ? (
            /* Filed State View */
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-[13px] text-emerald-800 dark:text-emerald-200">
                <p className="font-semibold mb-1">Filing Complete</p>
                <p>
                  Your return has been filed. Please proceed to the e-Verification section below to complete your mandatory 30-day verification.
                </p>
              </div>
              <a
                href="https://www.incometax.gov.in/iec/foportal/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-app-border dark:border-app-dark-border text-app-text-secondary dark:text-gray-300 hover:bg-app-bg dark:bg-app-dark text-[14px] font-medium transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                <span>View ITR-V on Income Tax e-Filing Portal</span>
              </a>
            </div>
          ) : (
            /* Unfiled State: File Return Action Button */
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-app-bg dark:bg-app-dark border border-app-border dark:border-app-dark-border text-[13px] text-app-text-muted dark:text-gray-400">
                <p className="font-semibold text-app-text-primary dark:text-app-surface mb-1">Important Filing Notice</p>
                <p>
                  Clicking the button below dispatches your approved return to the government tax-filing adapter. Your return will only be marked officially FILED when an authoritative acknowledgement is confirmed and persisted.
                </p>
              </div>

              <button
                onClick={handleFileReturn}
                disabled={!isReady || isFiling}
                type="button"
                className={`w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-[16px] font-semibold transition-all shadow-md ${
                  !isReady || isFiling
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-primary hover:bg-[#52321c] text-white hover:shadow-lg active:scale-[0.99]'
                }`}
              >
                {isFiling ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span>Transmitting Return to Income Tax Department...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[22px]">send</span>
                    <span>File Return with Income Tax Department</span>
                  </>
                )}
              </button>

              {!isReady && (
                <p className="text-center text-[12px] text-app-warning font-medium">
                  Approval is required before filing can be dispatched.
                </p>
              )}

              <div className="pt-2 text-center">
                <a
                  href="https://www.incometax.gov.in/iec/foportal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  <span>Or file manually on Official Income Tax Portal (incometax.gov.in)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* e-Verification Section */}
        <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">verified</span>
            <p className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider">Step 12 of 12</p>
          </div>
          <h2 className="text-[17px] font-semibold text-app-text-primary dark:text-app-surface mb-1">e-Verification</h2>
          <p className="text-[14px] text-app-text-secondary dark:text-gray-300 mb-5">
            After filing, you must e-verify your ITR within 30 days to ensure it is processed by the Income Tax Department.
          </p>

          {/* Verification Success Message */}
          {verificationSuccessMessage && (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50 mb-5 text-[13px] flex items-start gap-3">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
              <div>
                <p className="font-semibold">{verificationSuccessMessage}</p>
              </div>
            </div>
          )}

          {/* Verification Error Alerts */}
          {verificationError && (
            <div
              className={`p-4 rounded-lg border mb-5 text-[13px] flex items-start gap-3 ${
                verificationError.type === 'BLOCKED'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/50'
                  : verificationError.type === 'UNKNOWN'
                  ? 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800/50'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800/50'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                  verificationError.type === 'BLOCKED'
                    ? 'text-amber-600'
                    : verificationError.type === 'UNKNOWN'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {verificationError.type === 'BLOCKED' ? 'lock' : verificationError.type === 'UNKNOWN' ? 'help' : 'error'}
              </span>
              <div>
                <p className="font-semibold">
                  {verificationError.type === 'BLOCKED'
                    ? 'Provider Integration Blocked'
                    : verificationError.type === 'UNKNOWN'
                    ? 'Verification Outcome Unknown'
                    : 'Verification Request Notice'}
                </p>
                <p className="mt-0.5">{verificationError.message}</p>
                {verificationError.type === 'BLOCKED' && (
                  <div className="mt-2">
                    <a
                      href="https://www.incometax.gov.in/iec/foportal/help/how-to-e-verify-itr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary dark:text-amber-300 font-semibold underline inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      Follow official Income Tax Portal e-verification instructions
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Status Banners */}
          {verificationStatus === 'VERIFIED' ? (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50 mb-5 text-[13px]">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>e-Verification Confirmed</span>
              </div>
              <p>Your return has been authoritatively verified by an authorized provider.</p>
            </div>
          ) : verificationStatus === 'PENDING' ? (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800/50 mb-5 text-[13px]">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                <span>Verification Request Pending</span>
              </div>
              <p>An OTP / EVC request is currently awaiting completion. Enter the 6-digit numeric OTP received below or reconcile with the official portal.</p>
            </div>
          ) : verificationStatus === 'UNKNOWN' ? (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800/50 mb-5 text-[13px]">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <span className="material-symbols-outlined text-[18px]">help</span>
                <span>Verification Outcome Unknown</span>
              </div>
              <p>A network interruption occurred during verification confirmation. Check your verification status below or directly on the official portal.</p>
            </div>
          ) : verificationStatus === 'FAILED' ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800/50 mb-5 text-[13px]">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>Verification Failed</span>
              </div>
              <p>A previous verification attempt was rejected by the tax provider. You may retry below or complete verification directly on the official portal.</p>
            </div>
          ) : null}

          {/* Interactive Flow When Return is FILED */}
          {isFiled ? (
            <div className="space-y-6">
              {/* PENDING State: OTP Input Form */}
              {verificationStatus === 'PENDING' ? (
                <form onSubmit={handleSubmitOtp} className="p-5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-4">
                  <h4 className="font-semibold text-[15px] text-app-text-primary dark:text-app-surface">
                    Submit 6-Digit OTP / EVC Code
                  </h4>
                  <p className="text-[13px] text-app-text-secondary dark:text-gray-300">
                    Enter the 6-digit code received on your registered Aadhaar mobile number or bank Net Banking:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 123456"
                      className="px-4 py-2.5 rounded-lg border border-app-border dark:border-app-dark-border bg-white dark:bg-app-dark font-mono text-center tracking-widest text-[18px] focus:outline-hidden focus:ring-2 focus:ring-primary w-full sm:w-48"
                      disabled={isSubmittingOtp}
                    />
                    <button
                      type="submit"
                      disabled={otpInput.length !== 6 || isSubmittingOtp}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-semibold transition-all disabled:opacity-50"
                    >
                      {isSubmittingOtp ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          <span>Submit OTP</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleReconcileVerification}
                      disabled={isReconcilingVerification}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-app-border dark:border-app-dark-border text-app-text-secondary dark:text-gray-300 hover:bg-app-bg dark:bg-app-dark text-[13px] font-medium transition-all disabled:opacity-50"
                    >
                      {isReconcilingVerification ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">sync</span>
                          <span>Reconcile Status</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : verificationStatus === 'UNKNOWN' ? (
                /* UNKNOWN State: Reconcile Action */
                <div className="p-5 rounded-xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20 space-y-3">
                  <h4 className="font-semibold text-[15px] text-yellow-900 dark:text-yellow-200">
                    Reconciliation Required
                  </h4>
                  <p className="text-[13px] text-yellow-800 dark:text-yellow-300">
                    The outcome of your previous verification request could not be determined. Check status with the provider or on the official portal before initiating again.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleReconcileVerification}
                      disabled={isReconcilingVerification}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-yellow-600 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-[14px] font-semibold transition-all disabled:opacity-50"
                    >
                      {isReconcilingVerification ? (
                        <>
                          <span className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Reconciling...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">sync</span>
                          <span>Reconcile Verification</span>
                        </>
                      )}
                    </button>
                    <a
                      href="https://www.incometax.gov.in/iec/foportal/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B3D91] hover:bg-[#083080] text-white text-[14px] font-semibold transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      <span>Check on Official Portal</span>
                    </a>
                  </div>
                </div>
              ) : verificationStatus === 'VERIFIED' ? (
                /* VERIFIED State: Already Confirmed */
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-[13px] text-emerald-800 dark:text-emerald-200">
                  <p className="font-semibold mb-1">e-Verification Completed</p>
                  <p>
                    Your ITR e-verification is confirmed. The Income Tax Department will now process your return. No further action is required.
                  </p>
                </div>
              ) : (
                /* UNVERIFIED or FAILED State: Method Selection & Initiation */
                <div className="space-y-4">
                  <h4 className="font-semibold text-[15px] text-app-text-primary dark:text-app-surface">
                    Select Verification Method
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {E_VERIFY_METHODS.map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedMethod === m.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-app-border dark:border-app-dark-border bg-app-bg dark:bg-app-dark hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="verificationMethod"
                          value={m.id}
                          checked={selectedMethod === m.id}
                          onChange={() => setSelectedMethod(m.id)}
                          className="mt-1 text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-[14px] text-app-text-primary dark:text-app-surface">
                            <span className="material-symbols-outlined text-[18px] text-app-accent">{m.icon}</span>
                            <span>{m.title}</span>
                          </div>
                          <p className="text-[12px] text-app-text-secondary dark:text-gray-300 mt-0.5">{m.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleInitiateVerification}
                      disabled={isInitiatingVerification}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-[#52321c] text-white text-[14px] font-semibold transition-all shadow-md disabled:opacity-50"
                    >
                      {isInitiatingVerification ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                          <span>Initiating Verification...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          <span>Initiate e-Verification ({E_VERIFY_METHODS.find((m) => m.id === selectedMethod)?.title})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Return is Not Yet FILED */
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-app-bg dark:bg-app-dark border border-app-border dark:border-app-dark-border text-[13px] text-app-text-muted dark:text-gray-400">
                <p className="font-semibold text-app-text-primary dark:text-app-surface mb-1">
                  e-Verification Available After Filing
                </p>
                <p>
                  You can e-verify your return once it has been successfully filed with the Income Tax Department. Current return status: <span className="font-mono font-semibold text-app-text-primary dark:text-app-surface">{status}</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {E_VERIFY_METHODS.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 p-4 rounded-lg border border-app-border dark:border-app-dark-border bg-app-bg dark:bg-app-dark opacity-75">
                    <span className="material-symbols-outlined text-[22px] text-app-accent mt-0.5 shrink-0">{m.icon}</span>
                    <div>
                      <p className="text-[14px] font-semibold text-app-text-primary dark:text-app-surface">{m.title}</p>
                      <p className="text-[12px] text-app-text-secondary dark:text-gray-300 mt-0.5">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Audit History */}
          {verificationHistory && verificationHistory.length > 0 && (
            <div className="mt-6 pt-5 border-t border-app-border dark:border-app-dark-border">
              <h4 className="font-semibold text-[14px] text-app-text-primary dark:text-app-surface mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">history</span>
                Verification Audit History ({verificationHistory.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {verificationHistory.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-lg border border-app-border dark:border-app-dark-border bg-app-bg dark:bg-app-dark text-[12px] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-app-text-primary dark:text-app-surface">{att.method}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            att.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {att.status}
                        </span>
                      </div>
                      <p className="text-app-text-muted dark:text-gray-400 mt-0.5">
                        {new Date(att.requestedAt).toLocaleString()}
                        {att.errorCategory && ` • Code: ${att.errorCategory}`}
                      </p>
                    </div>
                    {att.providerReference && (
                      <span className="font-mono text-[11px] text-app-text-secondary dark:text-gray-300">
                        Ref: {att.providerReference}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 p-4 rounded-lg bg-app-warning-bg border border-app-warning/20 flex items-start gap-3 text-[13px] text-app-text-secondary dark:text-gray-300">
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

        {/* Return Status */}
        <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-6 shadow-xs">
          <h3 className="text-[15px] font-semibold text-app-text-primary dark:text-app-surface mb-4">Return Status</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Prepared by TaxPilot', done: true },
              { label: 'Approved by You', done: isReady || isFiled },
              {
                label: 'Filed with ITD',
                done: isFiled,
                note: isFiled
                  ? (taxReturn?.ackNumber ? `Ack: ${taxReturn.ackNumber}` : 'Confirmed')
                  : isUnknown
                  ? 'Outcome Unknown'
                  : status === 'PROCESSING'
                  ? 'Processing'
                  : 'Pending',
              },
              {
                label: 'e-Verified',
                done: verificationStatus === 'VERIFIED',
                note: verificationStatus === 'VERIFIED'
                  ? undefined
                  : verificationStatus === 'PENDING'
                  ? 'Pending'
                  : verificationStatus === 'UNKNOWN'
                  ? 'Outcome Unknown'
                  : verificationStatus === 'FAILED'
                  ? 'Failed - Retry'
                  : 'After filing',
              },
            ].map(step => (
              <div
                key={step.label}
                className={`flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-lg ${
                  step.done
                    ? 'bg-app-success-bg text-app-success'
                    : 'bg-app-bg dark:bg-app-dark text-app-text-muted dark:text-gray-400 border border-app-border dark:border-app-dark-border'
                }`}
              >
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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border dark:border-app-dark-border text-app-text-secondary dark:text-gray-300 hover:bg-app-bg dark:bg-app-dark text-[14px] font-medium transition-all"
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
