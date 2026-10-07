import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { StatusBadge, SandboxBanner, LoadingSpinner, InlineError } from '../../components/individual/SharedComponents';
import { individualApi } from '../../services/individual.service';
import type { PANVerificationResult } from '../../services/individual.service';

function maskPanDisplay(pan: string) {
  if (!pan || pan.length < 5) return pan;
  return pan.slice(0, 4) + '••••' + pan.slice(-1);
}

type VerifyState = 'idle' | 'loading' | 'success' | 'error';

export default function PANVerificationPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [pan, setPan] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [state, setState] = useState<VerifyState>('idle');
  const [result, setResult] = useState<PANVerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [existingStatus, setExistingStatus] = useState<'VERIFIED' | 'SANDBOX' | null>(null);

  // Load existing PAN status
  useEffect(() => {
    (async () => {
      try {
        const status = await individualApi.getPanStatus(getToken);
        if (status.panVerification) {
          const pv = status.panVerification;
          if (pv.status === 'VERIFIED' || pv.status === 'SANDBOX') {
            setExistingStatus(pv.status);
            setPan(pv.pan || '');
            setName(pv.submittedName || '');
            setDob(pv.submittedDob || '');
            // Build result-like object to show success state
            setResult({
              verified: true,
              pan: pv.pan,
              panMasked: pv.panMasked,
              name: pv.verifiedName,
              dob: pv.verifiedDob,
              status: pv.panStatus,
              nameMatch: pv.nameMatch ?? true,
              dobMatch: pv.dobMatch ?? true,
              isSandbox: pv.isSandbox,
              verifiedAt: pv.verifiedAt,
              panVerification: pv,
            });
            setState('success');
          }
        }
      } catch {
        // Not yet verified — that's OK
      }
    })();
  }, [getToken]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    const panUpper = pan.toUpperCase().trim();
    if (!panUpper) errs.pan = 'PAN is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panUpper)) errs.pan = 'Invalid PAN format. Expected: ABCDE1234F';
    if (!name.trim()) errs.name = 'Full name is required';
    if (!dob) errs.dob = 'Date of birth is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleVerify = async () => {
    if (!validateForm()) return;
    setState('loading');
    setErrorMsg('');

    // Format DOB as DD/MM/YYYY for API
    const [year, month, day] = dob.split('-');
    const dobFormatted = `${day}/${month}/${year}`;

    try {
      const res = await individualApi.verifyPan(getToken, {
        pan: pan.toUpperCase().trim(),
        name: name.trim(),
        dob: dobFormatted,
        mobile: mobile.trim() || undefined,
      });
      setResult(res);
      setState('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'PAN verification failed. Please try again.');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setResult(null);
    setErrorMsg('');
    setExistingStatus(null);
  };

  return (
    <IndividualLayout currentStep={2}>
      <div className="bg-app-surface border border-app-border rounded-xl p-8 shadow-xs">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">verified_user</span>
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">Step 2 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary font-normal">Verify your PAN</h1>
          <p className="text-[15px] text-app-text-secondary mt-1">
            Let's verify your PAN before preparing your return.
          </p>
        </div>

        {/* Sandbox Banner */}
        <div className="mb-6">
          <SandboxBanner />
        </div>

        {/* ========== SUCCESS STATE ========== */}
        {state === 'success' && result && (
          <div className="space-y-6">
            {/* Success Card */}
            <div className="rounded-xl border-2 border-app-success/30 bg-app-success-bg p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 rounded-full bg-app-success flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </span>
                <div>
                  <h2 className="text-[18px] font-semibold text-app-text-primary">PAN Verified</h2>
                  {result.isSandbox && (
                    <p className="text-[12px] text-purple-600 font-medium">DEMO / SANDBOX — Not a real government verification</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[14px]">
                <div>
                  <p className="text-[12px] text-app-text-muted uppercase tracking-wider font-semibold mb-1">PAN</p>
                  <p className="font-mono text-app-text-primary text-[16px] font-medium">{maskPanDisplay(result.pan)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-app-text-muted uppercase tracking-wider font-semibold mb-1">PAN Status</p>
                  <p className="text-app-text-primary font-medium">{result.status || 'ACTIVE'}</p>
                </div>
                <div>
                  <p className="text-[12px] text-app-text-muted uppercase tracking-wider font-semibold mb-1">Name</p>
                  <p className="text-app-text-primary font-medium">{result.name || name}</p>
                </div>
                <div>
                  <p className="text-[12px] text-app-text-muted uppercase tracking-wider font-semibold mb-1">Date of Birth</p>
                  <p className="text-app-text-primary font-medium">{result.dob || dob}</p>
                </div>
              </div>

              {/* Verification details */}
              <div className="mt-5 flex flex-wrap gap-3">
                {result.nameMatch !== undefined && (
                  <StatusBadge
                    variant={result.nameMatch ? 'verified' : 'action-required'}
                    label={result.nameMatch ? 'Name matched' : 'Name mismatch'}
                    size="sm"
                  />
                )}
                {result.dobMatch !== undefined && (
                  <StatusBadge
                    variant={result.dobMatch ? 'verified' : 'action-required'}
                    label={result.dobMatch ? 'DOB matched' : 'DOB mismatch'}
                    size="sm"
                  />
                )}
                {result.isSandbox && <StatusBadge variant="sandbox" size="sm" />}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
                type="button"
              >
                Re-verify PAN
              </button>
              <button
                onClick={() => navigate('/individual/aadhaar')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm"
                type="button"
              >
                Continue to Aadhaar-PAN Status
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ========== INPUT STATE ========== */}
        {state !== 'success' && (
          <div className="space-y-6">
            {state === 'loading' && <LoadingSpinner message="Verifying PAN..." />}

            {state === 'error' && (
              <InlineError
                message={errorMsg}
                onRetry={() => setState('idle')}
              />
            )}

            {state !== 'loading' && (
              <>
                <div className="space-y-5">
                  {/* PAN */}
                  <div>
                    <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="pan">
                      PAN <span className="text-app-error">*</span>
                    </label>
                    <input
                      id="pan"
                      type="text"
                      value={pan}
                      onChange={e => {
                        setPan(e.target.value.toUpperCase());
                        if (fieldErrors.pan) setFieldErrors(p => ({ ...p, pan: '' }));
                      }}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className={`w-full font-mono px-3.5 py-2.5 rounded-lg border text-[16px] bg-white text-app-text-primary placeholder-app-text-muted outline-none uppercase tracking-widest transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 ${fieldErrors.pan ? 'border-app-error' : 'border-app-border'}`}
                    />
                    {fieldErrors.pan && <p className="mt-1 text-[12px] text-app-error">{fieldErrors.pan}</p>}
                    <p className="mt-1 text-[12px] text-app-text-muted">Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="panName">
                      Full Name (as on PAN) <span className="text-app-error">*</span>
                    </label>
                    <input
                      id="panName"
                      type="text"
                      value={name}
                      onChange={e => {
                        setName(e.target.value);
                        if (fieldErrors.name) setFieldErrors(p => ({ ...p, name: '' }));
                      }}
                      placeholder="Your full legal name"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] bg-white text-app-text-primary placeholder-app-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 ${fieldErrors.name ? 'border-app-error' : 'border-app-border'}`}
                    />
                    {fieldErrors.name && <p className="mt-1 text-[12px] text-app-error">{fieldErrors.name}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="panDob">
                      Date of Birth <span className="text-app-error">*</span>
                    </label>
                    <input
                      id="panDob"
                      type="date"
                      value={dob}
                      onChange={e => {
                        setDob(e.target.value);
                        if (fieldErrors.dob) setFieldErrors(p => ({ ...p, dob: '' }));
                      }}
                      max={new Date().toISOString().slice(0, 10)}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] bg-white text-app-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 ${fieldErrors.dob ? 'border-app-error' : 'border-app-border'}`}
                    />
                    {fieldErrors.dob && <p className="mt-1 text-[12px] text-app-error">{fieldErrors.dob}</p>}
                  </div>

                  {/* Mobile (optional) */}
                  <div>
                    <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="panMobile">
                      Mobile Number <span className="text-[12px] text-app-text-muted font-normal">(optional)</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-app-border bg-app-bg text-[13px] text-app-text-muted">+91</span>
                      <input
                        id="panMobile"
                        type="tel"
                        value={mobile}
                        onChange={e => setMobile(e.target.value)}
                        placeholder="10-digit mobile"
                        maxLength={10}
                        className="flex-1 px-3.5 py-2.5 rounded-r-lg border border-app-border text-[14px] bg-white text-app-text-primary placeholder-app-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-app-bg border border-app-border-light text-[12px] text-app-text-muted">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">lock</span>
                  <span>Your PAN details are transmitted securely. Sensitive identifiers are masked in our records. We never store unnecessary PAN data.</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => navigate('/individual/profile')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back
                  </button>
                  <button
                    onClick={handleVerify}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified_user</span>
                    Verify PAN
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </IndividualLayout>
  );
}
