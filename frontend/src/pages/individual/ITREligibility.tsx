import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { StatusBadge, LoadingSpinner, InlineError } from '../../components/individual/SharedComponents';
import { individualApi } from '../../services/individual.service';
import type { EligibilityResult } from '../../services/individual.service';

const ITR_DESCRIPTIONS: Record<string, { label: string; description: string; forWhom: string[] }> = {
  ITR1: {
    label: 'ITR-1 (Sahaj)',
    description: 'For individuals with income from salary/pension, one house property, and other sources.',
    forWhom: ['Salaried employees', 'Pensioners', 'Interest income', 'Agricultural income up to ₹5,000'],
  },
  ITR2: {
    label: 'ITR-2',
    description: 'For individuals and HUFs with income from capital gains, multiple house properties, or foreign assets.',
    forWhom: ['Capital gains income', 'Multiple house properties', 'Foreign assets/income', 'Directorship in companies'],
  },
  ITR3: {
    label: 'ITR-3',
    description: 'For individuals and HUFs with income from business or profession.',
    forWhom: ['Business income', 'Professional income (doctors, lawyers, etc.)', 'Freelancers with complex accounts'],
  },
  ITR4: {
    label: 'ITR-4 (Sugam)',
    description: 'For individuals/HUFs/firms with presumptive business income under sections 44AD, 44ADA, 44AE.',
    forWhom: ['Small businesses under 44AD', 'Professionals under 44ADA', 'Transporters under 44AE'],
  },
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export default function ITREligibilityPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [selectedITR, setSelectedITR] = useState<string>('ITR1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const eligibility = await individualApi.checkEligibility(getToken);
        setResult(eligibility);
        const saved = localStorage.getItem('taxpilot_selected_itr');
        if (saved && ITR_DESCRIPTIONS[saved]) {
          setSelectedITR(saved);
        } else if (eligibility.eligibleITR) {
          setSelectedITR(eligibility.eligibleITR);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to check eligibility');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleSwitchITR = async (newITR: string) => {
    setSelectedITR(newITR);
    localStorage.setItem('taxpilot_selected_itr', newITR);
    try {
      const token = await getToken();
      const statusRes = await fetch(`${BASE_URL}/api/v1/individual/return/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusJson = await statusRes.json();
      const returnId = statusJson.data?.taxReturn?.id;
      if (returnId) {
        await fetch(`${BASE_URL}/api/v1/tax-returns/${returnId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ returnType: newITR }),
        });
      }
    } catch (err) {
      console.warn('Note: returnType update on backend skipped or pending', err);
    }
  };

  if (loading) {
    return (
      <IndividualLayout currentStep={4}>
        <LoadingSpinner message="Checking ITR eligibility..." />
      </IndividualLayout>
    );
  }

  const itrInfo = ITR_DESCRIPTIONS[selectedITR] || (result ? ITR_DESCRIPTIONS[result.eligibleITR] : null);

  return (
    <IndividualLayout currentStep={4}>
      <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-8 shadow-xs">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">task_alt</span>
            <p className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider">Step 4 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary dark:text-app-surface font-normal">ITR Eligibility</h1>
          <p className="text-[15px] text-app-text-secondary dark:text-gray-300 mt-1">
            Based on your current information, we've determined your applicable ITR form. You can also manually switch to a different form below.
          </p>
        </div>

        {error && <div className="mb-5"><InlineError message={error} onRetry={() => window.location.reload()} /></div>}

        {result && itrInfo && (
          <div className="space-y-6">
            {/* Assessment Year */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-app-bg dark:bg-app-dark border border-app-border dark:border-app-dark-border text-[14px]">
              <span className="material-symbols-outlined text-[18px] text-app-accent">event</span>
              <span className="text-app-text-secondary dark:text-gray-300">Assessment Year:</span>
              <span className="font-semibold text-app-text-primary dark:text-app-surface">{result.assessmentYear}</span>
            </div>

            {/* Primary ITR card (Dynamic based on selected form) */}
            <div className="rounded-xl border-2 border-primary/30 bg-[#FDF9F7] dark:bg-app-dark p-6 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-xs">
                  <span className="text-white font-bold text-[16px]">{selectedITR.replace('ITR', '')}</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-[20px] font-semibold text-app-text-primary dark:text-app-surface">{itrInfo.label}</h2>
                    {selectedITR === result.eligibleITR ? (
                      <StatusBadge variant="verified" label="Recommended" size="sm" />
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        <span className="material-symbols-outlined text-[12px]">check</span>
                        Active Selection
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-app-text-secondary dark:text-gray-300 leading-relaxed">{itrInfo.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {itrInfo.forWhom.map(item => (
                      <span key={item} className="px-2.5 py-1 rounded-full bg-white dark:bg-app-dark-card border border-app-border dark:border-app-dark-border text-[12px] text-app-text-secondary dark:text-gray-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Non-ITR1 selection notice */}
            {selectedITR !== 'ITR1' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[13px] text-amber-900 dark:text-amber-200">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">info</span>
                  <div>
                    <span>Form switched to <strong>{itrInfo.label}</strong>. Standard salary, interest, and deductions will continue into the filing workflow.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchITR('ITR1')}
                  className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-app-dark-card border border-amber-300 dark:border-amber-700 rounded-md text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors shadow-2xs"
                >
                  Switch back to ITR-1 (Recommended)
                </button>
              </div>
            )}

            {/* Reasons */}
            <div>
              <h3 className="text-[14px] font-semibold text-app-text-primary dark:text-app-surface mb-3">Why this form?</h3>
              <ul className="space-y-2">
                {result.reasons.map((reason, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[14px] text-app-text-secondary dark:text-gray-300">
                    <span className="material-symbols-outlined text-[16px] text-app-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disqualifiers */}
            {result.disqualifiers.length > 0 && (
              <div>
                <h3 className="text-[14px] font-semibold text-app-text-primary dark:text-app-surface mb-3">Why not ITR-1?</h3>
                <ul className="space-y-2">
                  {result.disqualifiers.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] text-app-text-secondary dark:text-gray-300">
                      <span className="material-symbols-outlined text-[16px] text-app-warning mt-0.5">info</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Note */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-app-bg dark:bg-app-dark border border-app-border dark:border-app-dark-border text-[13px] text-app-text-muted dark:text-gray-400">
              <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
              <p>{result.note}</p>
            </div>

            {/* Other ITR options with switch button */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-semibold text-app-text-primary dark:text-app-surface">Other ITR forms</h3>
                <span className="text-xs text-app-text-muted dark:text-gray-400">Option to switch form</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(ITR_DESCRIPTIONS)
                  .filter(([key]) => key !== selectedITR)
                  .map(([key, itr]) => (
                    <div
                      key={key}
                      className="p-4 rounded-lg border border-app-border dark:border-app-dark-border bg-app-bg dark:bg-app-dark hover:border-primary/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[14px] font-semibold text-app-text-primary dark:text-app-surface">{itr.label}</p>
                          {key === result.eligibleITR && (
                            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-app-text-secondary dark:text-gray-300 mt-1 leading-relaxed">{itr.description}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-app-border/60 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleSwitchITR(key)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-app-surface dark:bg-app-dark-card hover:bg-primary hover:text-white border border-app-border dark:border-app-dark-border text-primary transition-all shadow-2xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                          Switch to {itr.label.split(' ')[0]}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-app-border dark:border-app-dark-border-light">
              <button
                onClick={() => navigate('/individual/aadhaar')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border dark:border-app-dark-border text-app-text-secondary dark:text-gray-300 hover:bg-app-bg dark:bg-app-dark text-[14px] font-medium transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back
              </button>
              <button
                onClick={() => navigate('/individual/documents')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm"
                type="button"
              >
                Proceed to Documents
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </IndividualLayout>
  );
}
