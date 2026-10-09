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

export default function ITREligibilityPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const eligibility = await individualApi.checkEligibility(getToken);
        setResult(eligibility);
      } catch (err: any) {
        setError(err.message || 'Failed to check eligibility');
      } finally {
        setLoading(false);
      }
    })();
    }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <IndividualLayout currentStep={4}>
        <LoadingSpinner message="Checking ITR eligibility..." />
      </IndividualLayout>
    );
  }

  const itrInfo = result ? ITR_DESCRIPTIONS[result.eligibleITR] : null;

  return (
    <IndividualLayout currentStep={4}>
      <div className="bg-app-surface border border-app-border rounded-xl p-8 shadow-xs">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">task_alt</span>
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">Step 4 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary font-normal">ITR Eligibility</h1>
          <p className="text-[15px] text-app-text-secondary mt-1">
            Based on your current information, we've determined your applicable ITR form.
          </p>
        </div>

        {error && <div className="mb-5"><InlineError message={error} onRetry={() => window.location.reload()} /></div>}

        {result && itrInfo && (
          <div className="space-y-6">
            {/* Assessment Year */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-app-bg border border-app-border text-[14px]">
              <span className="material-symbols-outlined text-[18px] text-app-accent">event</span>
              <span className="text-app-text-secondary">Assessment Year:</span>
              <span className="font-semibold text-app-text-primary">{result.assessmentYear}</span>
            </div>

            {/* Primary ITR recommendation */}
            <div className="rounded-xl border-2 border-primary/30 bg-[#FDF9F7] p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-[16px]">{result.eligibleITR.replace('ITR', '')}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[20px] font-semibold text-app-text-primary">{itrInfo.label}</h2>
                    <StatusBadge variant="verified" label="Recommended" size="sm" />
                  </div>
                  <p className="text-[14px] text-app-text-secondary leading-relaxed">{itrInfo.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {itrInfo.forWhom.map(item => (
                      <span key={item} className="px-2.5 py-1 rounded-full bg-white border border-app-border text-[12px] text-app-text-secondary">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reasons */}
            <div>
              <h3 className="text-[14px] font-semibold text-app-text-primary mb-3">Why this form?</h3>
              <ul className="space-y-2">
                {result.reasons.map((reason, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[14px] text-app-text-secondary">
                    <span className="material-symbols-outlined text-[16px] text-app-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disqualifiers */}
            {result.disqualifiers.length > 0 && (
              <div>
                <h3 className="text-[14px] font-semibold text-app-text-primary mb-3">Why not ITR-1?</h3>
                <ul className="space-y-2">
                  {result.disqualifiers.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] text-app-text-secondary">
                      <span className="material-symbols-outlined text-[16px] text-app-warning mt-0.5">info</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Note */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-app-bg border border-app-border text-[13px] text-app-text-muted">
              <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
              <p>{result.note}</p>
            </div>

            {/* All ITR options */}
            <div>
              <h3 className="text-[14px] font-semibold text-app-text-primary mb-3">Other ITR forms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(ITR_DESCRIPTIONS).filter(([key]) => key !== result.eligibleITR).map(([key, itr]) => (
                  <div key={key} className="p-4 rounded-lg border border-app-border bg-app-bg opacity-60">
                    <p className="text-[13px] font-semibold text-app-text-primary">{itr.label}</p>
                    <p className="text-[12px] text-app-text-secondary mt-1">{itr.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-app-border-light">
              <button
                onClick={() => navigate('/individual/aadhaar')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
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
