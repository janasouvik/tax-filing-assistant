import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { SandboxBanner, InlineError } from '../../components/individual/SharedComponents';
import { individualApi } from '../../services/individual.service';
import type { PANVerificationResult } from '../../services/individual.service';

function maskPanDisplay(pan?: string | null) {
  if (!pan || pan.length < 5) return pan || '—';
  return pan.slice(0, 4) + '••••' + pan.slice(-1);
}

// Convert DD/MM/YYYY or YYYY-MM-DD into YYYY-MM-DD for HTML input[type=date]
function toInputDate(val?: string | null): string {
  if (!val) return '';
  const s = val.trim();
  const dmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const ymd = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return '';
}

interface MockFixtureItem {
  id: string;
  group: string;
  pan: string;
  submittedName: string;
  submittedDobDisplay: string;
  submittedDob: string;
  aadhaarStatus: string;
  expectedResult: string;
  description: string;
}

export default function PANVerificationPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [pan, setPan] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [isMockFixture, setIsMockFixture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PANVerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fixtures, setFixtures] = useState<MockFixtureItem[]>([]);
  const [selectedFixtureId, setSelectedFixtureId] = useState('');

  // 1. Load existing PAN verification status from database
  useEffect(() => {
    (async () => {
      try {
        const status = await individualApi.getPanStatus(getToken);
        if (status.panVerification) {
          const pv = status.panVerification;
          if (pv.status === 'VERIFIED' || pv.status === 'SANDBOX') {
            setPan(pv.pan || '');
            setName(pv.submittedName || pv.verifiedName || '');
            setDob(toInputDate(pv.submittedDob || pv.verifiedDob));
            setIsMockFixture(pv.isSandbox);

            const isLinked = pv.aadhaarSeedingStatus === 'LINKED';
            setResult({
              success: true,
              verificationStatus: 'PAN_VERIFIED',
              panStatus: 'VALID',
              nameMatch: pv.nameMatch ?? true,
              dobMatch: pv.dobMatch ?? true,
              aadhaarLinkStatus: (pv.aadhaarSeedingStatus as any) || 'UNKNOWN',
              registeredName: pv.verifiedName || pv.submittedName || null,
              registeredDob: pv.verifiedDob || pv.submittedDob || null,
              submittedName: pv.submittedName || pv.verifiedName || '',
              submittedDob: pv.submittedDob || pv.verifiedDob || '',
              maskedPan: pv.panMasked || maskPanDisplay(pv.pan),
              provider: pv.verificationProvider ? pv.verificationProvider.toUpperCase() : 'MOCK',
              message: isLinked
                ? 'PAN verified successfully. Your name and date of birth match the registered records. Aadhaar-PAN linkage is confirmed.'
                : 'PAN verified successfully, but Aadhaar-PAN linkage is not confirmed. Please check your Aadhaar-PAN linking status. You may continue.',
              isMockResponse: pv.isSandbox,
              verifiedAt: pv.verifiedAt || new Date().toISOString(),
              panVerification: pv as any,
            });
          }
        }
      } catch {
        // Not yet verified
      }
    })();
  }, [getToken]);

  // 2. Load 25 synthetic fixtures for testing quick-loader
  useEffect(() => {
    (async () => {
      try {
        const res = await individualApi.getMockFixtures(getToken);
        if (res?.fixtures) {
          setFixtures(res.fixtures);
        }
      } catch {
        // Fallback or unauthenticated
      }
    })();
  }, [getToken]);

  // CRITICAL RULE: When any identity field changes:
  // - Clear previous verification result
  // - Clear previous success state
  // - Require verification again
  // - Disallow bypassing verification
  const handleFieldChange = (field: 'pan' | 'name' | 'dob' | 'mobile', value: string) => {
    setResult(null);
    setErrorMsg('');
    setFieldErrors(prev => ({ ...prev, [field]: '' }));

    if (field === 'pan') {
      const upper = value.toUpperCase();
      setPan(upper);
      // Auto-detect if user typed a synthetic mock fixture
      const match = fixtures.find(f => f.pan.toUpperCase() === upper);
      setIsMockFixture(Boolean(match));
      if (!match) setSelectedFixtureId('');
    } else if (field === 'name') {
      setName(value);
    } else if (field === 'dob') {
      setDob(value);
    } else if (field === 'mobile') {
      setMobile(value);
    }
  };

  const handleSelectFixture = (fixtureId: string) => {
    setSelectedFixtureId(fixtureId);
    setResult(null);
    setErrorMsg('');
    setFieldErrors({});

    if (!fixtureId) {
      setIsMockFixture(false);
      return;
    }

    const f = fixtures.find(item => item.id === fixtureId);
    if (f) {
      setPan(f.pan);
      setName(f.submittedName);
      setDob(toInputDate(f.submittedDobDisplay || f.submittedDob));
      setIsMockFixture(true);
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!pan.trim()) {
      errs.pan = 'PAN is required';
    }
    if (!name.trim()) {
      errs.name = 'Full legal name (as on PAN) is required';
    }
    if (!dob) {
      errs.dob = 'Date of birth is required';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleVerify = async () => {
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    // Format DOB as DD/MM/YYYY for backend identity verification
    const [year, month, day] = dob.split('-');
    const dobFormatted = `${day}/${month}/${year}`;

    try {
      const res = await individualApi.verifyPan(getToken, {
        pan: pan.toUpperCase().trim(),
        name: name.trim(),
        dob: dobFormatted,
        mobile: mobile.trim() || undefined,
        provider: isMockFixture ? 'mock' : undefined,
        isMockFixture,
      });

      setResult(res);
      // DO NOT automatically redirect. User inspects details and manually clicks Continue.
    } catch (err: any) {
      if (err?.code === 'INVALID_PAN_FORMAT') {
        setResult({
          success: false,
          verificationStatus: 'INVALID_PAN_FORMAT',
          panStatus: 'INVALID',
          nameMatch: false,
          dobMatch: false,
          aadhaarLinkStatus: 'UNKNOWN',
          registeredName: null,
          registeredDob: null,
          submittedName: name.trim(),
          submittedDob: dobFormatted,
          maskedPan: maskPanDisplay(pan),
          provider: isMockFixture ? 'MOCK' : 'SETU',
          message: 'Invalid PAN number. Please enter a valid 10-character PAN.',
          isMockResponse: isMockFixture,
          verifiedAt: new Date().toISOString(),
        });
      } else {
        setErrorMsg(err.message || 'Verification could not be completed. Provider error or unavailable status.');
        setResult({
          success: false,
          verificationStatus: 'ERROR',
          panStatus: 'INVALID',
          nameMatch: null,
          dobMatch: null,
          aadhaarLinkStatus: 'UNKNOWN',
          registeredName: null,
          registeredDob: null,
          submittedName: name.trim(),
          submittedDob: dobFormatted,
          maskedPan: maskPanDisplay(pan),
          provider: isMockFixture ? 'MOCK' : 'SETU',
          message: err.message || 'Verification could not be completed. Provider error or unavailable status.',
          isMockResponse: isMockFixture,
          verifiedAt: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMsg('');
    setFieldErrors({});
    setSelectedFixtureId('');
  };

  // Evaluation outcome flags
  const outcome = result?.verificationStatus;
  const isPanVerified = outcome === 'PAN_VERIFIED';
  const isAadhaarLinked = isPanVerified && result?.aadhaarLinkStatus === 'LINKED';
  const isAadhaarNotLinked = isPanVerified && result?.aadhaarLinkStatus === 'NOT_LINKED';

  // Navigation Rule: Progression is ONLY allowed if PAN is verified (Linked or Not Linked)
  // All other states (INVALID_PAN_FORMAT, INVALID_PAN, NAME_MISMATCH, DOB_MISMATCH, ERROR) BLOCK progression.
  const canContinue = isPanVerified;

  return (
    <IndividualLayout
      currentStep={2}
      canNavigateToStep={(stepId) => (stepId > 2 ? canContinue : true)}
    >
      <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-8 shadow-xs">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">verified_user</span>
            <p className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider">Step 2 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary dark:text-app-surface font-normal">PAN Identity Verification</h1>
          <p className="text-[15px] text-app-text-secondary dark:text-gray-300 mt-1">
            Verify your Permanent Account Number (PAN), name, and date of birth against authoritative records.
          </p>
        </div>

        {/* Sandbox Banner */}
        <div className="mb-6">
          <SandboxBanner />
        </div>

        {/* Test Fixture Quick Loader (Mock Mode Testing Presets) */}
        {fixtures.length > 0 && (
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-purple-700 dark:text-purple-300">science</span>
                <label htmlFor="fixtureSelector" className="text-[12px] font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  🧪 Test Fixture Quick-Loader (25 Synthetic Identities)
                </label>
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                Mock Provider Development Preset
              </span>
            </div>
            <select
              id="fixtureSelector"
              value={selectedFixtureId}
              onChange={(e) => handleSelectFixture(e.target.value)}
              className="w-full text-[13px] px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-app-dark text-app-text-primary dark:text-app-surface outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">— Select a synthetic test fixture (or enter details below) —</option>
              <optgroup label="Group A: V01–V05 (Aadhaar LINKED — Expected: PAN_VERIFIED)">
                {fixtures.filter(f => f.group === 'VERIFIED' && f.aadhaarStatus === 'LINKED').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.id}: {f.submittedName} — {f.pan} [Aadhaar Linked]
                  </option>
                ))}
              </optgroup>
              <optgroup label="Group A: V06–V10 (Aadhaar NOT LINKED — Expected: PAN_VERIFIED + Warning)">
                {fixtures.filter(f => f.group === 'VERIFIED' && f.aadhaarStatus === 'NOT_LINKED').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.id}: {f.submittedName} — {f.pan} [Aadhaar Not Linked]
                  </option>
                ))}
              </optgroup>
              <optgroup label="Group B: I01–I05 (Malformed Format — Expected: INVALID_PAN_FORMAT)">
                {fixtures.filter(f => f.group === 'INVALID_PAN').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.id}: {f.submittedName} — {f.pan} ({f.description})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Group C: N01–N05 (Name Mismatch — Expected: NAME_MISMATCH)">
                {fixtures.filter(f => f.group === 'NAME_MISMATCH').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.id}: {f.submittedName} (differs from reg) — {f.pan}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Group D: D01–D05 (DOB Mismatch — Expected: DOB_MISMATCH)">
                {fixtures.filter(f => f.group === 'DOB_MISMATCH').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.id}: {f.submittedName} (wrong DOB: {f.submittedDobDisplay}) — {f.pan}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RESULT PRESENTATION CARDS                                                 */}
        {/* ========================================================================= */}

        {/* 1. GREEN SUCCESS: V01–V05 (PAN_VERIFIED + Aadhaar LINKED) */}
        {isAadhaarLinked && result && (
          <div className="mb-6 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/20 p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-bold text-emerald-900 dark:text-emerald-200">
                    PAN VERIFIED
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-400">
                    Aadhaar Linked
                  </span>
                </div>
                <p className="text-[14px] text-emerald-800 dark:text-emerald-300 mt-1 font-medium">
                  PAN verified successfully. Your name and date of birth match the registered records. Aadhaar-PAN linkage is confirmed.
                </p>
              </div>
            </div>

            {/* Field-level results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[13px]">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-emerald-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">PAN</p>
                <p className="font-mono font-bold text-app-text-primary dark:text-app-surface">{maskPanDisplay(result.maskedPan)}</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span> Valid
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-emerald-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">Name</p>
                <p className="font-semibold text-app-text-primary dark:text-app-surface truncate">{result.submittedName}</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span> Match
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-emerald-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">DOB</p>
                <p className="font-semibold text-app-text-primary dark:text-app-surface">{result.submittedDob}</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span> Match
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-emerald-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">Aadhaar</p>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Linked</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">link</span> Confirmed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. YELLOW WARNING: V06–V10 (PAN_VERIFIED + Aadhaar NOT_LINKED) */}
        {isAadhaarNotLinked && result && (
          <div className="mb-6 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 dark:bg-amber-950/20 p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-bold text-amber-900 dark:text-amber-200">
                    PAN VERIFIED — AADHAAR NOT LINKED
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-400">
                    Action Recommended
                  </span>
                </div>
                <p className="text-[14px] text-amber-900 dark:text-amber-300 mt-1 font-medium">
                  PAN verified successfully, but Aadhaar-PAN linkage is not confirmed. Please check your Aadhaar-PAN linking status. You may continue.
                </p>
              </div>
            </div>

            {/* Field-level results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[13px]">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-amber-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">PAN</p>
                <p className="font-mono font-bold text-app-text-primary dark:text-app-surface">{maskPanDisplay(result.maskedPan)}</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span> Valid
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-amber-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">Name</p>
                <p className="font-semibold text-app-text-primary dark:text-app-surface truncate">{result.submittedName}</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span> Match
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-amber-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">DOB</p>
                <p className="font-semibold text-app-text-primary dark:text-app-surface">{result.submittedDob}</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span> Match
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-amber-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">Aadhaar</p>
                <p className="font-semibold text-amber-800 dark:text-amber-300">Not Linked</p>
                <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">link_off</span> Unlinked
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. RED ERROR: I01–I05 (INVALID_PAN_FORMAT) */}
        {outcome === 'INVALID_PAN_FORMAT' && result && (
          <div className="mb-6 rounded-xl border-2 border-rose-500/50 bg-rose-500/10 dark:bg-rose-950/20 p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  cancel
                </span>
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-bold text-rose-900 dark:text-rose-200">
                    INVALID PAN FORMAT
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-400">
                    Blocked
                  </span>
                </div>
                <p className="text-[14px] text-rose-900 dark:text-rose-300 mt-1 font-medium">
                  Invalid PAN number. Please enter a valid 10-character PAN.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[13px]">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">PAN</p>
                <p className="font-mono font-bold text-rose-600">{result.maskedPan || pan}</p>
                <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">close</span> Invalid Format
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">Name</p>
                <p className="text-gray-500 truncate">{result.submittedName || '—'}</p>
                <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">Unverified</span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">DOB</p>
                <p className="text-gray-500">{result.submittedDob || '—'}</p>
                <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">Unverified</span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">Aadhaar</p>
                <p className="text-gray-500">Unknown</p>
                <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">Suspended</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. RED ERROR: N01–N05 (NAME_MISMATCH) */}
        {outcome === 'NAME_MISMATCH' && result && (
          <div className="mb-6 rounded-xl border-2 border-rose-500/50 bg-rose-500/10 dark:bg-rose-950/20 p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person_alert
                </span>
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-bold text-rose-900 dark:text-rose-200">
                    NAME MISMATCH
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-400">
                    Blocked
                  </span>
                </div>
                <p className="text-[14px] text-rose-900 dark:text-rose-300 mt-1 font-medium">
                  The name entered does not match the name registered against this PAN. Please check the name and try again.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[13px]">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">PAN Existence</p>
                <p className="font-mono font-bold text-app-text-primary dark:text-app-surface">{maskPanDisplay(result.maskedPan)}</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span> FOUND
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">Name</p>
                <p className="font-semibold text-rose-600 truncate">{result.submittedName}</p>
                <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">close</span> MISMATCH
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">DOB</p>
                <p className="font-semibold text-app-text-primary dark:text-app-surface">{result.submittedDob}</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span> MATCH
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">Aadhaar Linkage</p>
                <p className="text-gray-500 font-semibold">UNKNOWN</p>
                <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">Suspended</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. RED ERROR: D01–D05 (DOB_MISMATCH) */}
        {outcome === 'DOB_MISMATCH' && result && (
          <div className="mb-6 rounded-xl border-2 border-rose-500/50 bg-rose-500/10 dark:bg-rose-950/20 p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  event_busy
                </span>
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-bold text-rose-900 dark:text-rose-200">
                    DOB MISMATCH
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-400">
                    Blocked
                  </span>
                </div>
                <p className="text-[14px] text-rose-900 dark:text-rose-300 mt-1 font-medium">
                  The date of birth entered does not match the date of birth registered against this PAN. Please check your date of birth.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[13px]">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">PAN Existence</p>
                <p className="font-mono font-bold text-app-text-primary dark:text-app-surface">{maskPanDisplay(result.maskedPan)}</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span> FOUND
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">Name</p>
                <p className="font-semibold text-app-text-primary dark:text-app-surface truncate">{result.submittedName}</p>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check</span> MATCH
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">DOB</p>
                <p className="font-semibold text-rose-600">{result.submittedDob}</p>
                <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">close</span> MISMATCH
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/80 dark:bg-app-dark/70 border border-rose-500/20">
                <p className="text-[11px] font-bold uppercase text-app-text-muted">Aadhaar Linkage</p>
                <p className="text-gray-500 font-semibold">UNKNOWN</p>
                <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">Suspended</span>
              </div>
            </div>
          </div>
        )}

        {/* 6. RED ERROR: Unknown PAN (INVALID_PAN) */}
        {outcome === 'INVALID_PAN' && result && (
          <div className="mb-6 rounded-xl border-2 border-rose-500/50 bg-rose-500/10 dark:bg-rose-950/20 p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px] text-white">cancel</span>
              </span>
              <div className="flex-1">
                <h2 className="text-[18px] font-bold text-rose-900 dark:text-rose-200">
                  PAN NOT FOUND
                </h2>
                <p className="text-[14px] text-rose-900 dark:text-rose-300 mt-1 font-medium">
                  {result.message || 'PAN number not found in authoritative records.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7. RED ERROR: System or Provider Error */}
        {(outcome === 'ERROR' || outcome === 'UNKNOWN' || errorMsg) && (
          <div className="mb-6">
            <InlineError
              message={errorMsg || result?.message || 'Verification could not be completed. Provider error or unavailable status.'}
              onRetry={handleVerify}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* INPUT FORM                                                                */}
        {/* ========================================================================= */}
        <div className="space-y-5">
          {/* PAN Input */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary dark:text-app-surface mb-1.5" htmlFor="pan">
              Permanent Account Number (PAN) <span className="text-app-error">*</span>
            </label>
            <input
              id="pan"
              type="text"
              value={pan}
              onChange={e => handleFieldChange('pan', e.target.value)}
              placeholder="ABCDE1234F"
              maxLength={15}
              disabled={loading}
              className={`w-full font-mono px-3.5 py-2.5 rounded-lg border text-[16px] bg-white dark:bg-app-dark-card text-app-text-primary dark:text-app-surface placeholder-app-text-muted outline-none uppercase tracking-widest transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:bg-gray-50 dark:bg-gray-900 ${
                fieldErrors.pan ? 'border-app-error' : 'border-app-border dark:border-app-dark-border'
              }`}
            />
            {fieldErrors.pan && <p className="mt-1 text-[12px] text-app-error">{fieldErrors.pan}</p>}
            <p className="mt-1 text-[12px] text-app-text-muted dark:text-gray-400">
              Format: 5 letters, 4 digits, 1 letter (e.g., <span className="font-mono">ABCDE1234F</span>)
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary dark:text-app-surface mb-1.5" htmlFor="panName">
              Full Name (as registered on PAN card) <span className="text-app-error">*</span>
            </label>
            <input
              id="panName"
              type="text"
              value={name}
              onChange={e => handleFieldChange('name', e.target.value)}
              placeholder="e.g. Aarav Sharma"
              disabled={loading}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] bg-white dark:bg-app-dark-card text-app-text-primary dark:text-app-surface placeholder-app-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:bg-gray-50 dark:bg-gray-900 ${
                fieldErrors.name ? 'border-app-error' : 'border-app-border dark:border-app-dark-border'
              }`}
            />
            {fieldErrors.name && <p className="mt-1 text-[12px] text-app-error">{fieldErrors.name}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary dark:text-app-surface mb-1.5" htmlFor="panDob">
              Date of Birth <span className="text-app-error">*</span>
            </label>
            <input
              id="panDob"
              type="date"
              value={dob}
              onChange={e => handleFieldChange('dob', e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              disabled={loading}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] bg-white dark:bg-app-dark-card text-app-text-primary dark:text-app-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:bg-gray-50 dark:bg-gray-900 ${
                fieldErrors.dob ? 'border-app-error' : 'border-app-border dark:border-app-dark-border'
              }`}
            />
            {fieldErrors.dob && <p className="mt-1 text-[12px] text-app-error">{fieldErrors.dob}</p>}
          </div>

          {/* Mobile (Optional) */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary dark:text-app-surface mb-1.5" htmlFor="panMobile">
              Mobile Number <span className="text-[12px] text-app-text-muted dark:text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-app-border dark:border-app-dark-border bg-app-bg dark:bg-app-dark text-[13px] text-app-text-muted dark:text-gray-400">
                +91
              </span>
              <input
                id="panMobile"
                type="tel"
                value={mobile}
                onChange={e => handleFieldChange('mobile', e.target.value)}
                placeholder="10-digit mobile"
                maxLength={10}
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 rounded-r-lg border border-app-border dark:border-app-dark-border text-[14px] bg-white dark:bg-app-dark-card text-app-text-primary dark:text-app-surface placeholder-app-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:bg-gray-50 dark:bg-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Statutory Security Note */}
        <div className="mt-6 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-app-bg dark:bg-app-dark border border-app-border dark:border-app-dark-border-light text-[12px] text-app-text-muted dark:text-gray-400">
          <span className="material-symbols-outlined text-[16px] mt-0.5">lock</span>
          <span>
            Your identity details are processed strictly per statutory guidelines. Modifying any field immediately invalidates previous verification results.
          </span>
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-app-border dark:border-app-dark-border">
          <button
            onClick={() => navigate('/individual/profile')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border dark:border-app-dark-border text-app-text-secondary dark:text-gray-300 hover:bg-app-bg dark:bg-app-dark text-[14px] font-medium transition-all disabled:opacity-50"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back
          </button>

          <div className="flex items-center gap-3">
            {result && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-app-border dark:border-app-dark-border text-app-text-muted hover:text-app-text-primary text-[13px] font-medium transition-all"
                type="button"
              >
                Clear
              </button>
            )}

            {/* Verify Identity Button */}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-app-bg dark:bg-app-dark-card border border-app-border dark:border-app-dark-border text-app-text-primary dark:text-app-surface hover:border-primary text-[14px] font-medium transition-all shadow-xs disabled:opacity-60"
              type="button"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  Verify Identity
                </>
              )}
            </button>

            {/* Next / Continue Button */}
            <button
              onClick={() => {
                if (canContinue) {
                  navigate('/individual/aadhaar');
                }
              }}
              disabled={!canContinue}
              title={canContinue ? 'Continue to Aadhaar-PAN Status' : 'PAN Verification required to continue'}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-[14px] font-medium transition-all shadow-sm ${
                canContinue
                  ? 'bg-primary hover:bg-[#52321c] cursor-pointer'
                  : 'bg-gray-400 dark:bg-gray-700 opacity-50 cursor-not-allowed'
              }`}
              type="button"
            >
              Continue
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </IndividualLayout>
  );
}
