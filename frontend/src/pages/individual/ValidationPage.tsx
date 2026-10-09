/**
 * Validation & Issues Page (Phase 16)
 * Runs the backend validation engine and displays all issues/readiness.
 */
import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { LoadingSpinner, InlineError } from '../../components/individual/SharedComponents';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  criticalErrors: number;
  totalIssues: number;
}

const FIELD_LINKS: Record<string, string> = {
  pan: '/individual/pan',
  fullName: '/individual/profile',
  dateOfBirth: '/individual/profile',
  income: '/individual/income',
  tds: '/individual/income',
  aadhaarPan: '/individual/aadhaar',
};

export default function ValidationPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const runValidation = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/individual/validate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Validation failed');
      setResult(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to run validation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runValidation(); }, []);

  const severityIcon = (s: ValidationIssue['severity']) => {
    if (s === 'error') return { icon: 'cancel', color: 'text-app-error' };
    if (s === 'warning') return { icon: 'warning', color: 'text-app-warning' };
    return { icon: 'info', color: 'text-blue-500' };
  };

  const errors = result?.issues.filter(i => i.severity === 'error') || [];
  const warnings = result?.issues.filter(i => i.severity === 'warning') || [];
  const infos = result?.issues.filter(i => i.severity === 'info') || [];

  if (loading) return <IndividualLayout currentStep={9}><LoadingSpinner message="Validating your return..." /></IndividualLayout>;

  return (
    <IndividualLayout currentStep={9}>
      <div className="space-y-6">
        <div className="bg-app-surface border border-app-border rounded-xl p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">checklist</span>
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">Step 9 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary font-normal">Validation</h1>
          <p className="text-[15px] text-app-text-secondary mt-1">
            We check your return for completeness and consistency before review.
          </p>
        </div>

        {error && <InlineError message={error} onRetry={runValidation} />}

        {result && (
          <>
            {/* Summary card */}
            <div className={`rounded-xl border-2 p-6 ${result.isValid ? 'bg-app-success-bg border-app-success/30' : 'bg-[#FFF1F0] border-app-error/30'}`}>
              <div className="flex items-center gap-4">
                <span className={`w-12 h-12 rounded-full flex items-center justify-center ${result.isValid ? 'bg-app-success' : 'bg-app-error'}`}>
                  <span className="material-symbols-outlined text-[24px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {result.isValid ? 'check_circle' : 'error'}
                  </span>
                </span>
                <div>
                  <h2 className="text-[20px] font-semibold text-app-text-primary">
                    {result.isValid ? 'No critical errors found' : `${result.criticalErrors} critical error${result.criticalErrors > 1 ? 's' : ''} found`}
                  </h2>
                  <p className="text-[14px] text-app-text-secondary mt-0.5">
                    {result.isValid
                      ? result.totalIssues === 0 ? 'Your return is ready for final review.' : `${warnings.length} warning${warnings.length !== 1 ? 's' : ''} to review.`
                      : 'Please resolve critical errors before proceeding.'}
                  </p>
                </div>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-3 mt-5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${errors.length > 0 ? 'bg-app-error/10 text-app-error' : 'bg-app-success-bg text-app-success'}`}>
                  <span className="material-symbols-outlined text-[14px]">{errors.length > 0 ? 'cancel' : 'check'}</span>
                  {errors.length} error{errors.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-app-warning-bg text-app-warning">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Issues list */}
            {result.totalIssues > 0 && (
              <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs space-y-4">
                <h3 className="text-[15px] font-semibold text-app-text-primary">Issues</h3>
                <div className="space-y-2">
                  {[...errors, ...warnings, ...infos].map((issue, idx) => {
                    const cfg = severityIcon(issue.severity);
                    const link = FIELD_LINKS[issue.field];
                    return (
                      <div key={idx} className={`flex items-start justify-between gap-3 p-4 rounded-lg border ${
                        issue.severity === 'error' ? 'bg-[#FFF1F0] border-app-error/20' :
                        issue.severity === 'warning' ? 'bg-app-warning-bg border-app-warning/20' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          <span className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${cfg.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {cfg.icon}
                          </span>
                          <div>
                            <p className="text-[14px] font-medium text-app-text-primary">{issue.message}</p>
                            <p className="text-[12px] text-app-text-muted mt-0.5 capitalize">Field: {issue.field}</p>
                          </div>
                        </div>
                        {link && (
                          <Link
                            to={link}
                            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-app-border text-[12px] text-app-text-secondary hover:bg-white transition-all"
                          >
                            Fix
                            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All clear */}
            {result.isValid && result.totalIssues === 0 && (
              <div className="bg-app-surface border border-app-border rounded-xl p-8 shadow-xs text-center">
                <span className="material-symbols-outlined text-[52px] text-app-success block mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>
                  task_alt
                </span>
                <h3 className="text-[18px] font-semibold text-app-text-primary mb-1">Return is Clean</h3>
                <p className="text-[14px] text-app-text-secondary">No issues found. You can proceed to final review.</p>
              </div>
            )}

            {/* Readiness checklist */}
            <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs">
              <h3 className="text-[15px] font-semibold text-app-text-primary mb-4">Pre-Filing Checklist</h3>
              <ul className="space-y-3">
                {[
                  { label: 'PAN verified', done: errors.every(e => e.field !== 'pan'), link: '/individual/pan' },
                  { label: 'Personal profile complete', done: errors.every(e => e.field !== 'fullName' && e.field !== 'dateOfBirth'), link: '/individual/profile' },
                  { label: 'Aadhaar-PAN status checked', done: warnings.every(w => w.field !== 'aadhaarPan'), link: '/individual/aadhaar' },
                  { label: 'Income sources added', done: errors.every(e => e.field !== 'income'), link: '/individual/income' },
                  { label: 'Tax calculated', done: true, link: '/individual/tax' },
                  { label: 'No critical validation errors', done: result.isValid },
                ].map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-[14px]">
                      <span className={`material-symbols-outlined text-[16px] ${item.done ? 'text-app-success' : 'text-app-error'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {item.done ? 'check_circle' : 'cancel'}
                      </span>
                      <span className={item.done ? 'text-app-text-secondary' : 'text-app-error'}>{item.label}</span>
                    </div>
                    {!item.done && item.link && (
                      <Link to={item.link} className="text-[12px] text-primary hover:underline">Fix →</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => navigate('/individual/tax')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={runValidation}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Re-validate
                </button>
                <button
                  onClick={() => navigate('/individual/review')}
                  disabled={!result.isValid && errors.length > 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  title={!result.isValid ? 'Resolve critical errors first' : ''}
                >
                  Proceed to Review
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </IndividualLayout>
  );
}
