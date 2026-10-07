/**
 * Shared components for the Individual Tax Filing workflow.
 *
 * Components:
 * - StatusBadge
 * - FilingStepper
 * - TaxpayerVerificationCard
 * - FilingReadinessCard
 * - SandboxBanner
 */

import React from 'react';

// ========== StatusBadge ==========

type BadgeVariant = 'verified' | 'pending' | 'action-required' | 'failed' | 'processing' | 'linked' | 'exempt' | 'unknown' | 'sandbox';

const BADGE_CONFIG: Record<BadgeVariant, { icon: string; label: string; classes: string }> = {
  verified:          { icon: 'check_circle', label: 'Verified',         classes: 'bg-app-success-bg text-app-success border-app-success/20' },
  linked:            { icon: 'check_circle', label: 'Linked',           classes: 'bg-app-success-bg text-app-success border-app-success/20' },
  pending:           { icon: 'schedule',     label: 'Pending',          classes: 'bg-app-warning-bg text-app-warning border-app-warning/20' },
  'action-required': { icon: 'warning',      label: 'Action Required',  classes: 'bg-[#FEF3EC] text-[#C2410C] border-[#C2410C]/20' },
  failed:            { icon: 'cancel',       label: 'Failed',           classes: 'bg-[#FFF1F0] text-app-error border-app-error/20' },
  processing:        { icon: 'sync',         label: 'Processing',       classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  exempt:            { icon: 'info',         label: 'Exempt',           classes: 'bg-app-success-bg text-app-success border-app-success/20' },
  unknown:           { icon: 'help_outline', label: 'Unknown',          classes: 'bg-gray-50 text-gray-600 border-gray-200' },
  sandbox:           { icon: 'science',      label: 'Demo / Sandbox',   classes: 'bg-purple-50 text-purple-700 border-purple-200' },
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ variant, label, size = 'md' }: StatusBadgeProps) {
  const cfg = BADGE_CONFIG[variant] || BADGE_CONFIG.unknown;
  const iconSize = size === 'sm' ? 'text-[14px]' : 'text-[15px]';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-[12px]';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 ${padding} rounded-full font-medium border ${cfg.classes} ${textSize}`}>
      <span className={`material-symbols-outlined ${iconSize}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        {cfg.icon}
      </span>
      {label || cfg.label}
    </span>
  );
}

// ========== FilingStepper ==========

export interface FilingStep {
  id: number;
  label: string;
  shortLabel: string;
  status: 'completed' | 'current' | 'pending' | 'error';
  path?: string;
}

export const FILING_STEPS: Omit<FilingStep, 'status'>[] = [
  { id: 1,  label: 'Personal Profile',       shortLabel: 'Profile',     path: '/individual/profile' },
  { id: 2,  label: 'PAN Verification',       shortLabel: 'PAN',         path: '/individual/pan' },
  { id: 3,  label: 'Aadhaar–PAN Status',     shortLabel: 'Aadhaar',     path: '/individual/aadhaar' },
  { id: 4,  label: 'ITR Eligibility',        shortLabel: 'Eligibility', path: '/individual/eligibility' },
  { id: 5,  label: 'Documents',              shortLabel: 'Documents',   path: '/individual/documents' },
  { id: 6,  label: 'Income',                 shortLabel: 'Income',      path: '/individual/income' },
  { id: 7,  label: 'Deductions',             shortLabel: 'Deductions',  path: '/individual/deductions' },
  { id: 8,  label: 'Tax Calculation',        shortLabel: 'Tax',         path: '/individual/tax' },
  { id: 9,  label: 'Validation',             shortLabel: 'Validation',  path: '/individual/validation' },
  { id: 10, label: 'Final Review',           shortLabel: 'Review',      path: '/individual/review' },
  { id: 11, label: 'Filing',                 shortLabel: 'File',        path: '/individual/filing' },
  { id: 12, label: 'e-Verification',         shortLabel: 'Verify',      path: '/individual/everify' },
];

interface FileStepperProps {
  currentStep: number;
  completedSteps?: number[];
  errorSteps?: number[];
  onStepClick?: (step: typeof FILING_STEPS[0]) => void;
}

export function FilingStepper({ currentStep, completedSteps = [], errorSteps = [], onStepClick }: FileStepperProps) {
  const getStatus = (stepId: number): FilingStep['status'] => {
    if (errorSteps.includes(stepId)) return 'error';
    if (stepId === currentStep) return 'current';
    if (completedSteps.includes(stepId) || stepId < currentStep) return 'completed';
    return 'pending';
  };

  return (
    <nav className="w-full overflow-x-auto" aria-label="Tax filing progress">
      <ol className="flex items-start gap-0 min-w-max">
        {FILING_STEPS.map((step, idx) => {
          const status = getStatus(step.id);
          const isLast = idx === FILING_STEPS.length - 1;

          return (
            <li key={step.id} className="flex items-center">
              <button
                onClick={() => onStepClick?.(step)}
                className="flex flex-col items-center gap-1.5 px-2 group"
                aria-label={`Step ${step.id}: ${step.label} — ${status}`}
                aria-current={status === 'current' ? 'step' : undefined}
                type="button"
              >
                {/* Circle indicator */}
                <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold border-2 transition-all
                  ${status === 'completed' ? 'bg-app-success border-app-success text-white' : ''}
                  ${status === 'current'   ? 'bg-primary border-primary text-white shadow-sm' : ''}
                  ${status === 'pending'   ? 'bg-white border-app-border text-app-text-muted' : ''}
                  ${status === 'error'     ? 'bg-app-error border-app-error text-white' : ''}
                `}>
                  {status === 'completed' && (
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  )}
                  {status === 'error' && (
                    <span className="material-symbols-outlined text-[16px]">!</span>
                  )}
                  {(status === 'current' || status === 'pending') && step.id}
                </div>
                {/* Label */}
                <span className={`text-[10px] font-medium text-center leading-tight whitespace-nowrap max-w-[52px] truncate
                  ${status === 'current'   ? 'text-primary font-semibold' : ''}
                  ${status === 'completed' ? 'text-app-success' : ''}
                  ${status === 'pending'   ? 'text-app-text-muted' : ''}
                  ${status === 'error'     ? 'text-app-error' : ''}
                `}>
                  {step.shortLabel}
                </span>
              </button>
              {/* Connector line */}
              {!isLast && (
                <div className={`flex-1 h-[2px] w-4 mb-5 rounded-full transition-colors
                  ${getStatus(step.id) === 'completed' ? 'bg-app-success' : 'bg-app-border'}
                `} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ========== TaxpayerVerificationCard ==========

export type PANStatusValue = 'VERIFIED' | 'PENDING' | 'FAILED' | 'INACTIVE' | 'NAME_MISMATCH' | 'DOB_MISMATCH' | 'SERVICE_UNAVAILABLE' | 'SANDBOX' | null;
export type AadhaarStatusValue = 'LINKED' | 'NOT_LINKED' | 'PENDING' | 'FAILED' | 'PAN_INOPERATIVE' | 'EXEMPT' | 'UNKNOWN' | 'SERVICE_UNAVAILABLE' | null;

interface TaxpayerVerificationCardProps {
  panStatus: PANStatusValue;
  panMasked?: string;
  aadhaarStatus: AadhaarStatusValue;
  onContinue?: () => void;
  onResolveAadhaar?: () => void;
  onCheckAgain?: () => void;
  loading?: boolean;
  compact?: boolean;
}

function getPanBadge(status: PANStatusValue): BadgeVariant {
  if (status === 'VERIFIED') return 'verified';
  if (status === 'PENDING' || status === 'SANDBOX') return 'pending';
  if (status === 'INACTIVE') return 'action-required';
  return 'pending';
}

function getAadhaarBadge(status: AadhaarStatusValue): BadgeVariant {
  if (status === 'LINKED' || status === 'EXEMPT') return 'linked';
  if (status === 'PENDING') return 'pending';
  if (status === 'NOT_LINKED' || status === 'PAN_INOPERATIVE' || status === 'FAILED') return 'action-required';
  return 'unknown';
}

export function TaxpayerVerificationCard({
  panStatus,
  panMasked,
  aadhaarStatus,
  onContinue,
  onResolveAadhaar,
  onCheckAgain,
  loading,
  compact = false,
}: TaxpayerVerificationCardProps) {
  const panVerified = panStatus === 'VERIFIED' || panStatus === 'SANDBOX';
  const aadhaarLinked = aadhaarStatus === 'LINKED' || aadhaarStatus === 'EXEMPT';
  const aadhaarActionRequired = aadhaarStatus === 'NOT_LINKED' || aadhaarStatus === 'PAN_INOPERATIVE' || aadhaarStatus === 'FAILED';
  const identityReady = panVerified && aadhaarLinked;

  const cardClass = compact
    ? 'bg-app-surface border border-app-border rounded-xl p-5'
    : 'bg-app-surface border border-app-border rounded-xl p-6 shadow-xs';

  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-app-text-primary">Taxpayer Verification</h3>
        {identityReady && (
          <StatusBadge variant="verified" label="Identity Ready" size="sm" />
        )}
        {!identityReady && aadhaarActionRequired && (
          <StatusBadge variant="action-required" size="sm" />
        )}
      </div>

      <div className="space-y-4">
        {/* PAN Row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] text-app-text-muted font-medium uppercase tracking-wider">PAN</p>
            {panMasked && (
              <p className="text-[13px] font-mono text-app-text-primary mt-0.5">{panMasked}</p>
            )}
            {panStatus === 'VERIFIED' && (
              <p className="text-[12px] text-app-text-secondary mt-0.5">Name & DOB matched</p>
            )}
          </div>
          <StatusBadge variant={getPanBadge(panStatus)} label={panStatus === 'VERIFIED' ? 'Verified' : (panStatus || 'Pending')} size="sm" />
        </div>

        <div className="border-t border-app-border-light" />

        {/* Aadhaar Row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] text-app-text-muted font-medium uppercase tracking-wider">Aadhaar–PAN Link</p>
            {aadhaarStatus && (
              <p className="text-[12px] text-app-text-secondary mt-0.5">
                {aadhaarLinked ? 'Your PAN and Aadhaar are linked' :
                 aadhaarStatus === 'PENDING' ? 'Link request is under validation' :
                 aadhaarStatus === 'NOT_LINKED' ? 'Linkage required — resolve on IT portal' :
                 aadhaarStatus === 'PAN_INOPERATIVE' ? 'PAN appears inoperative' :
                 'Status unknown'}
              </p>
            )}
          </div>
          <StatusBadge variant={getAadhaarBadge(aadhaarStatus)} size="sm"
            label={aadhaarLinked ? 'Linked' : aadhaarStatus === 'PENDING' ? 'Pending' : 'Action Required'}
          />
        </div>

        <div className="border-t border-app-border-light" />

        {/* Identity Status */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] text-app-text-muted font-medium uppercase tracking-wider">Identity Status</p>
            <p className="text-[12px] text-app-text-secondary mt-0.5">
              {identityReady ? 'Ready for tax filing' : 'Verification incomplete'}
            </p>
          </div>
          <StatusBadge
            variant={identityReady ? 'verified' : aadhaarActionRequired ? 'action-required' : 'pending'}
            label={identityReady ? 'Ready' : aadhaarActionRequired ? 'Needs Attention' : 'In Progress'}
            size="sm"
          />
        </div>

        {/* CTAs */}
        {!compact && (
          <div className="pt-1 flex flex-wrap gap-2">
            {identityReady && onContinue && (
              <button
                onClick={onContinue}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[13px] font-medium transition-all disabled:opacity-50"
                type="button"
              >
                Continue →
              </button>
            )}
            {aadhaarActionRequired && (
              <button
                onClick={onResolveAadhaar}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[#C2410C] text-[#C2410C] hover:bg-[#FEF3EC] text-[13px] font-medium transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                Resolve on IT Portal
              </button>
            )}
            {(aadhaarStatus === 'PENDING' || aadhaarActionRequired) && onCheckAgain && (
              <button
                onClick={onCheckAgain}
                disabled={loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[13px] transition-all disabled:opacity-50"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Check Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== FilingReadinessCard ==========

interface ReadinessItem {
  label: string;
  status: 'done' | 'warning' | 'pending';
  detail?: string;
}

interface FilingReadinessCardProps {
  items: ReadinessItem[];
  onContinue?: () => void;
}

export function FilingReadinessCard({ items, onContinue }: FilingReadinessCardProps) {
  const doneCount = items.filter(i => i.status === 'done').length;
  const pct = Math.round((doneCount / items.length) * 100);
  const hasWarnings = items.some(i => i.status === 'warning');

  return (
    <div className="bg-app-surface border border-app-border rounded-xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-semibold text-app-text-primary">Filing Readiness</h3>
        <span className="font-serif text-[28px] leading-none text-app-text-primary tabular-nums">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#EFE9E2] rounded-full overflow-hidden mb-5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-app-success' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Readiness items */}
      <ul className="space-y-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2.5 text-[13px]">
            {item.status === 'done' && (
              <span className="material-symbols-outlined text-[16px] text-app-success shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            )}
            {item.status === 'warning' && (
              <span className="material-symbols-outlined text-[16px] text-app-warning shrink-0">warning</span>
            )}
            {item.status === 'pending' && (
              <span className="material-symbols-outlined text-[16px] text-app-text-muted shrink-0">radio_button_unchecked</span>
            )}
            <span className={item.status === 'pending' ? 'text-app-text-muted' : 'text-app-text-secondary'}>
              {item.label}
              {item.detail && <span className="text-app-text-muted ml-1">— {item.detail}</span>}
            </span>
          </li>
        ))}
      </ul>

      {onContinue && (
        <button
          onClick={onContinue}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all"
          type="button"
        >
          {hasWarnings ? 'Continue (resolve issues)' : pct === 100 ? 'File Return' : 'Continue Filing'}
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      )}
    </div>
  );
}

// ========== SandboxBanner ==========

export function SandboxBanner() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-purple-50 border border-purple-200 text-[13px] text-purple-800">
      <span className="material-symbols-outlined text-[18px] text-purple-600 mt-0.5 shrink-0">science</span>
      <div>
        <span className="font-semibold">DEMO / SANDBOX MODE</span>
        <p className="mt-0.5 text-purple-700">
          Verification results are simulated for demonstration. No real PAN/Aadhaar verification is performed.
          To enable real government verification, configure the appropriate API credentials.
        </p>
      </div>
    </div>
  );
}

// ========== LoadingSpinner ==========

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="w-8 h-8 border-2 border-app-border border-t-primary rounded-full animate-spin" />
      {message && <p className="text-[13px] text-app-text-secondary">{message}</p>}
    </div>
  );
}

// ========== InlineError ==========

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#FFF1F0] border border-app-error/20 text-[13px] text-app-error">
      <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
      <div className="flex-1">
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-1.5 text-[12px] font-medium underline underline-offset-2" type="button">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
