/**
 * Income & Deductions page — connects to existing backend endpoints
 * GET/POST /tax-returns/:returnId/income
 * GET/POST /tax-returns/:returnId/deductions
 */
import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { StatusBadge, LoadingSpinner, InlineError } from '../../components/individual/SharedComponents';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const INCOME_TYPE_LABELS: Record<string, string> = {
  SALARY: 'Salary / Pension',
  HOUSE_PROPERTY: 'House Property',
  CAPITAL_GAINS_SHORT: 'Capital Gains (STCG)',
  CAPITAL_GAINS_LONG: 'Capital Gains (LTCG)',
  BUSINESS: 'Business / Professional',
  OTHER_SOURCES: 'Other Sources',
  FREELANCE: 'Freelance',
};

const DEDUCTION_LABELS: Record<string, string> = {
  SEC_80C: '80C — Investments (LIC, PPF, ELSS, etc.)',
  SEC_80CCD1B: '80CCD(1B) — NPS Additional',
  SEC_80CCD2: '80CCD(2) — Employer NPS',
  SEC_80D: '80D — Health Insurance',
  SEC_80E: '80E — Education Loan Interest',
  SEC_80G: '80G — Donations',
  SEC_80TTA: '80TTA — Savings Interest',
  SEC_24B: '24(b) — Home Loan Interest',
  STANDARD_DEDUCTION: 'Standard Deduction',
  HRA: 'HRA Exemption',
};

function formatCurrency(amount: number | string) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export default function IncomeDeductionsPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'income' | 'deductions'>('income');

  const [returnId, setReturnId] = useState<string>('');
  const [incomeEntries, setIncomeEntries] = useState<any[]>([]);
  const [deductions, setDeductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddDeduction, setShowAddDeduction] = useState(false);

  // New entry form state
  const [newIncome, setNewIncome] = useState({ incomeType: 'SALARY', source: '', amount: '', tdsDeducted: '' });
  const [newDeduction, setNewDeduction] = useState({ section: 'SEC_80C', description: '', claimedAmount: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        // Get profile for workspaceId
        const profileRes = await fetch(`${BASE_URL}/api/v1/individual/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        const wsId = profileData.data?.workspaceId;
        if (!wsId) { setError('Please complete profile setup'); setLoading(false); return; }


        // Get or create tax return
        const returnsRes = await fetch(`${BASE_URL}/api/v1/workspaces/${wsId}/tax-returns`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const returnsData = await returnsRes.json();
        let retId = returnsData.data?.[0]?.id;

        if (!retId) {
          // Create a tax return
          const createRes = await fetch(`${BASE_URL}/api/v1/workspaces/${wsId}/tax-returns`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ financialYear: '2025-26', returnType: 'ITR1', regime: 'NEW' }),
          });
          const createData = await createRes.json();
          retId = createData.data?.id;
        }

        if (!retId) { setError('Could not create tax return'); setLoading(false); return; }
        setReturnId(retId);

        // Load income and deductions
        const [incRes, dedRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/tax-returns/${retId}/income`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/v1/tax-returns/${retId}/deductions`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [incData, dedData] = await Promise.all([incRes.json(), dedRes.json()]);
        setIncomeEntries(incData.data || []);
        setDeductions(dedData.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const addIncome = async () => {
    if (!newIncome.source || !newIncome.amount) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/tax-returns/${returnId}/income`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomeType: newIncome.incomeType,
          source: newIncome.source,
          amount: parseFloat(newIncome.amount),
          tdsDeducted: newIncome.tdsDeducted ? parseFloat(newIncome.tdsDeducted) : undefined,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setIncomeEntries(prev => [...prev, data.data]);
        setNewIncome({ incomeType: 'SALARY', source: '', amount: '', tdsDeducted: '' });
        setShowAddIncome(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addDeduction = async () => {
    if (!newDeduction.description || !newDeduction.claimedAmount) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/tax-returns/${returnId}/deductions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: newDeduction.section,
          description: newDeduction.description,
          claimedAmount: parseFloat(newDeduction.claimedAmount),
        }),
      });
      const data = await res.json();
      if (data.data) {
        setDeductions(prev => [...prev, data.data]);
        setNewDeduction({ section: 'SEC_80C', description: '', claimedAmount: '' });
        setShowAddDeduction(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalIncome = incomeEntries.reduce((s, e) => s + Number(e.amount), 0);
  const totalTds = incomeEntries.reduce((s, e) => s + Number(e.tdsDeducted || 0), 0);
  const totalDeductions = deductions.reduce((s, d) => s + Number(d.claimedAmount), 0);

  if (loading) return <IndividualLayout currentStep={6}><LoadingSpinner message="Loading income data..." /></IndividualLayout>;

  return (
    <IndividualLayout currentStep={6}>
      <div className="bg-app-surface border border-app-border rounded-xl overflow-hidden shadow-xs">
        {/* Header */}
        <div className="p-8 pb-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">receipt_long</span>
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">Steps 6–7 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary font-normal mb-1">Income & Deductions</h1>
          <p className="text-[15px] text-app-text-secondary mb-6">Add your income sources and eligible deductions for FY 2025-26.</p>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-app-border-light">
            {(['income', 'deductions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-[14px] font-medium border-b-2 transition-all capitalize ${activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-app-text-muted hover:text-app-text-primary'
                  }`}
                type="button"
              >
                {tab}
                <span className={`ml-2 px-1.5 py-0.5 text-[11px] rounded-full ${activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-app-bg text-app-text-muted'}`}>
                  {tab === 'income' ? incomeEntries.length : deductions.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-8">
          {error && <div className="mb-4"><InlineError message={error} onRetry={() => setError('')} /></div>}

          {/* ===== INCOME TAB ===== */}
          {activeTab === 'income' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-app-bg rounded-lg p-4 border border-app-border-light">
                  <p className="text-[12px] text-app-text-muted">Total Income</p>
                  <p className="font-serif text-[24px] text-app-text-primary mt-1 tabular-nums">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-app-bg rounded-lg p-4 border border-app-border-light">
                  <p className="text-[12px] text-app-text-muted">Total TDS</p>
                  <p className="font-serif text-[24px] text-app-text-primary mt-1 tabular-nums">{formatCurrency(totalTds)}</p>
                </div>
                <div className="bg-app-bg rounded-lg p-4 border border-app-border-light">
                  <p className="text-[12px] text-app-text-muted">Entries</p>
                  <p className="font-serif text-[24px] text-app-text-primary mt-1 tabular-nums">{incomeEntries.length}</p>
                </div>
              </div>

              {/* Income list */}
              {incomeEntries.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-app-border hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-app-accent mt-0.5">payments</span>
                    <div>
                      <p className="text-[14px] font-semibold text-app-text-primary">{entry.source}</p>
                      <p className="text-[12px] text-app-text-muted mt-0.5">{INCOME_TYPE_LABELS[entry.incomeType] || entry.incomeType}</p>
                      {entry.tdsDeducted && entry.tdsDeducted > 0 && (
                        <p className="text-[12px] text-app-text-muted mt-0.5">TDS: {formatCurrency(entry.tdsDeducted)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-semibold text-app-text-primary tabular-nums">{formatCurrency(entry.amount)}</p>
                    <StatusBadge variant="verified" label="Verified" size="sm" />
                  </div>
                </div>
              ))}

              {incomeEntries.length === 0 && !showAddIncome && (
                <div className="text-center py-10 border-2 border-dashed border-app-border rounded-xl text-app-text-muted">
                  <span className="material-symbols-outlined text-[40px] block mb-2">payments</span>
                  <p className="text-[14px]">No income sources added yet</p>
                </div>
              )}

              {/* Add income form */}
              {showAddIncome && (
                <div className="p-5 rounded-xl border-2 border-primary/30 bg-[#FDF9F7] space-y-4">
                  <h3 className="text-[15px] font-semibold text-app-text-primary">Add Income Source</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-app-text-primary mb-1">Income Type</label>
                      <select
                        value={newIncome.incomeType}
                        onChange={e => setNewIncome(p => ({ ...p, incomeType: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-app-border text-[14px] bg-white outline-none focus:border-primary"
                      >
                        {Object.entries(INCOME_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-app-text-primary mb-1">Source (e.g. employer name)</label>
                      <input
                        type="text"
                        value={newIncome.source}
                        onChange={e => setNewIncome(p => ({ ...p, source: e.target.value }))}
                        placeholder="ABC Technologies Ltd"
                        className="w-full px-3 py-2 rounded-lg border border-app-border text-[14px] bg-white outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-app-text-primary mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={newIncome.amount}
                        onChange={e => setNewIncome(p => ({ ...p, amount: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-app-border text-[14px] bg-white outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-app-text-primary mb-1">TDS Deducted (₹)</label>
                      <input
                        type="number"
                        value={newIncome.tdsDeducted}
                        onChange={e => setNewIncome(p => ({ ...p, tdsDeducted: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-app-border text-[14px] bg-white outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addIncome} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium disabled:opacity-60">
                      {saving ? 'Saving...' : 'Add Income'}
                    </button>
                    <button onClick={() => setShowAddIncome(false)} className="px-4 py-2 rounded-lg border border-app-border text-app-text-secondary text-[13px]">Cancel</button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowAddIncome(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-app-border text-app-text-muted hover:border-primary hover:text-primary transition-all text-[14px]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Income Source
              </button>
            </div>
          )}

          {/* ===== DEDUCTIONS TAB ===== */}
          {activeTab === 'deductions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-app-bg rounded-lg p-4 border border-app-border-light">
                  <p className="text-[12px] text-app-text-muted">Total Deductions</p>
                  <p className="font-serif text-[24px] text-app-success mt-1 tabular-nums">{formatCurrency(totalDeductions)}</p>
                </div>
                <div className="bg-app-bg rounded-lg p-4 border border-app-border-light">
                  <p className="text-[12px] text-app-text-muted">Claimed</p>
                  <p className="font-serif text-[24px] text-app-text-primary mt-1 tabular-nums">{deductions.length} items</p>
                </div>
              </div>

              {deductions.map((ded) => (
                <div key={ded.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-app-border">
                  <div>
                    <p className="text-[14px] font-semibold text-app-text-primary">{ded.description}</p>
                    <p className="text-[12px] text-app-text-muted mt-0.5">{DEDUCTION_LABELS[ded.section] || ded.section}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-semibold text-app-success tabular-nums">-{formatCurrency(ded.claimedAmount)}</p>
                    <StatusBadge variant="verified" label="Claimed" size="sm" />
                  </div>
                </div>
              ))}

              {deductions.length === 0 && !showAddDeduction && (
                <div className="text-center py-10 border-2 border-dashed border-app-border rounded-xl text-app-text-muted">
                  <span className="material-symbols-outlined text-[40px] block mb-2">savings</span>
                  <p className="text-[14px]">No deductions added yet</p>
                </div>
              )}

              {showAddDeduction && (
                <div className="p-5 rounded-xl border-2 border-primary/30 bg-[#FDF9F7] space-y-4">
                  <h3 className="text-[15px] font-semibold text-app-text-primary">Add Deduction</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-app-text-primary mb-1">Section</label>
                      <select
                        value={newDeduction.section}
                        onChange={e => setNewDeduction(p => ({ ...p, section: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-app-border text-[14px] bg-white outline-none focus:border-primary"
                      >
                        {Object.entries(DEDUCTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-app-text-primary mb-1">Description</label>
                      <input
                        type="text"
                        value={newDeduction.description}
                        onChange={e => setNewDeduction(p => ({ ...p, description: e.target.value }))}
                        placeholder="LIC Premium, PPF, etc."
                        className="w-full px-3 py-2 rounded-lg border border-app-border text-[14px] bg-white outline-none focus:border-primary"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[12px] font-medium text-app-text-primary mb-1">Claimed Amount (₹)</label>
                      <input
                        type="number"
                        value={newDeduction.claimedAmount}
                        onChange={e => setNewDeduction(p => ({ ...p, claimedAmount: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-app-border text-[14px] bg-white outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addDeduction} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium disabled:opacity-60">
                      {saving ? 'Saving...' : 'Add Deduction'}
                    </button>
                    <button onClick={() => setShowAddDeduction(false)} className="px-4 py-2 rounded-lg border border-app-border text-app-text-secondary text-[13px]">Cancel</button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowAddDeduction(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-app-border text-app-text-muted hover:border-primary hover:text-primary transition-all text-[14px]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Deduction
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-app-border-light">
            <button
              onClick={() => navigate('/individual/documents')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back
            </button>
            <button
              onClick={() => navigate('/individual/tax')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm"
              type="button"
            >
              Calculate Tax
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </IndividualLayout>
  );
}
