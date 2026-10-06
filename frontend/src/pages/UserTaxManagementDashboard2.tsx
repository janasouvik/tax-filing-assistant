import Navbar from '../components/Navbar';

export default function UserTaxManagementDashboard2() {
  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-low border-r border-outline-variant/40 flex flex-col z-50 overflow-y-auto"><div className="p-space-md border-b border-outline-variant/30"><div className="flex items-center gap-space-sm"><div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm">¶</div><div><div className="font-headline-sm text-headline-sm tracking-tight text-on-surface leading-none">TaxPilot</div><span className="font-label-caps text-label-caps text-on-surface-variant uppercase mt-1 block">Statutory Ledger</span></div></div><div className="mt-space-sm inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container border border-outline-variant/50"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span><span className="font-label-caps text-label-caps text-primary tracking-wider uppercase">Deterministic Rule Engine</span></div></div><div className="p-space-md bg-surface-container-lowest/60 border-b border-outline-variant/30"><div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1 tracking-wider">Assessee Dossier</div><div className="font-body-md text-body-md font-medium text-on-surface truncate">Vikramaditya Sen</div><div className="flex items-center justify-between mt-1 text-on-surface-variant font-label-md text-label-md"><span>PAN: <strong className="font-numeric-table text-numeric-table font-semibold text-on-surface">AABCS****K</strong></span><span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-numeric-table text-numeric-table">Ind.</span></div></div><nav className="flex-1 px-3 py-space-sm flex flex-col gap-0.5" data-active-classes="bg-primary-container text-on-primary-container font-medium rounded-lg"><div className="px-3 py-1 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Filings &amp; Reconciliation</div><a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="overview-dashboard" href="/overview-dashboard"><span className="material-symbols-outlined text-[19px]">account_balance</span><span>Overview &amp; Dashboard</span></a><a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="my-tax-filings" href="/my-tax-filings"><span className="material-symbols-outlined text-[19px]">history_edu</span><span>My Tax Filings</span></a><a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="income-and-pl-ledgers" href="/income-and-pl-ledgers"><span className="material-symbols-outlined text-[19px]">receipt_long</span><span>Income &amp; P&amp;L Ledgers</span></a><a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="deductions-and-regime-arbiter" href="/deductions-and-regime-arbiter"><span className="material-symbols-outlined text-[19px]">balance</span><span>Deductions &amp; Regime Arbiter</span></a><div className="px-3 pt-3 pb-1 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Compliance &amp; Intelligence</div><a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="document-vault-and-ocr" href="/document-vault-and-ocr"><span className="material-symbols-outlined text-[19px]">document_scanner</span><span>Document Vault &amp; OCR</span></a><a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="advance-tax-and-deadlines" href="/advance-tax-and-deadlines"><span className="material-symbols-outlined text-[19px]">calendar_clock</span><span>Advance Tax &amp; Deadlines</span></a><a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="tax-copilot" href="/tax-copilot"><span className="material-symbols-outlined text-[19px]">psychology_alt</span><span>Tax Copilot</span></a><div className="px-3 pt-3 pb-1 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">System</div><a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="settings-and-help" href="/settings-and-help"><span className="material-symbols-outlined text-[19px]">tune</span><span>Settings &amp; Help</span></a></nav><div className="p-space-md border-t border-outline-variant/30 bg-surface-container/40"><div className="flex items-center justify-between"><span className="font-label-caps text-label-caps text-on-surface-variant uppercase">ITD Schema 2.4</span><span className="font-label-caps text-label-caps text-primary uppercase font-semibold">Audited OK</span></div></div></aside><div className="pl-72"><Navbar /><main className="w-full pt-16 bg-surface"><div className="flex flex-col w-full">
<div className="px-space-md py-space-md max-w-[1400px] mx-auto w-full space-y-space-md">

<div className="bg-surface-container-low rounded-xl p-space-md shadow-sm relative overflow-hidden">
<div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary-container/40 pointer-events-none blur-2xl"></div>
<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-md relative z-10">
<div className="max-w-3xl space-y-2">
<div className="flex items-center gap-2">
<span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-caps text-label-caps uppercase tracking-wider">ITR-2 Dossier · Primary</span>
<span className="text-on-surface-variant font-label-caps text-label-caps uppercase">PAN: AABCS••••K</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Good afternoon, Vikramaditya.</h1>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Assessment Year 2026–27 (FY 2025–26) · Income Tax Return Form: <span className="text-on-surface font-medium">ITR-2 (Dual Schedule: Tech Equity &amp; Capital Gains)</span>. Your filing is <span className="text-primary font-numeric-table font-semibold">98.6%</span> complete with 1 reconciliation pending.
          </p>
</div>
<div className="flex flex-wrap items-center gap-2 self-start">
<button className="px-4 py-2.5 rounded-lg bg-primary hover:bg-tertiary text-on-primary transition-all shadow-sm font-label-md text-label-md flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-[18px]">play_circle</span>
<span>Resume ITR-2 Review</span>
</button>
<button className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-label-md text-label-md flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-[18px]">upload_file</span>
<span>Upload Form 16 / Statement</span>
</button>
<button className="px-3.5 py-2.5 rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md flex items-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[18px]">psychology</span>
<span>Ask Copilot</span>
</button>
</div>
</div>

<div className="mt-space-md pt-space-md bg-surface-container-lowest/80 rounded-xl p-space-sm shadow-sm">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
<div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low/60">
<div className="w-7 h-7 rounded-full bg-emerald-900/10 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[17px] text-emerald-800" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
</div>
<div className="min-w-0">
<p className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">1. Ingestion</p>
<p className="font-label-md text-label-md font-medium text-on-surface truncate">5/5 Sources Synced</p>
</div>
</div>
<div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low/60">
<div className="w-7 h-7 rounded-full bg-emerald-900/10 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[17px] text-emerald-800" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
</div>
<div className="min-w-0">
<p className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">2. AIS &amp; 26AS Match</p>
<p className="font-label-md text-label-md font-medium text-emerald-800 truncate">Reconciled (1 Notice)</p>
</div>
</div>
<div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10">
<div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[17px] text-on-primary">balance</span>
</div>
<div className="min-w-0">
<p className="font-label-caps text-label-caps text-primary uppercase truncate font-semibold">3. Regime Arbiter</p>
<p className="font-label-md text-label-md font-medium text-primary truncate">₹70,200 Saved (New)</p>
</div>
</div>
<div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low/60">
<div className="w-7 h-7 rounded-full bg-amber-900/10 flex items-center justify-center shrink-0 animate-pulse">
<span className="material-symbols-outlined text-[17px] text-amber-800">pending</span>
</div>
<div className="min-w-0">
<p className="font-label-caps text-label-caps text-amber-900 uppercase truncate">4. Human Gate</p>
<p className="font-label-md text-label-md font-medium text-on-surface truncate">In Verification (98.6%)</p>
</div>
</div>
<div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low/30 opacity-75">
<div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[17px] text-on-surface-variant">send</span>
</div>
<div className="min-w-0">
<p className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">5. E-Filing</p>
<p className="font-label-md text-label-md text-on-surface-variant truncate">Aadhaar OTP Ready</p>
</div>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-on-surface-variant mb-2">
<span className="font-label-caps text-label-caps uppercase tracking-wider">Gross Computed Income</span>
<span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-900/10 text-emerald-800 font-numeric-table text-numeric-table font-medium">+8.4% YoY</span>
</div>
<div className="font-display-hero-mobile text-display-hero-mobile text-on-surface font-normal tracking-tight">₹36,00,000</div>
</div>
<div className="mt-4 pt-3 bg-surface-container-low/60 rounded-lg p-2.5 space-y-1">
<div className="flex justify-between items-center font-label-md text-label-md text-on-surface-variant">
<span>Salary (Form 16)</span>
<span className="font-numeric-table text-numeric-table font-medium text-on-surface">₹26,50,000</span>
</div>
<div className="flex justify-between items-center font-label-md text-label-md text-on-surface-variant">
<span>STCG / LTCG Equity</span>
<span className="font-numeric-table text-numeric-table font-medium text-on-surface">₹7,50,000</span>
</div>
<div className="flex justify-between items-center font-label-md text-label-md text-on-surface-variant">
<span>Interest &amp; Other</span>
<span className="font-numeric-table text-numeric-table font-medium text-on-surface">₹2,00,000</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-on-surface-variant mb-2">
<span className="font-label-caps text-label-caps uppercase tracking-wider">Tax Liability (115BAC)</span>
<span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-caps text-label-caps uppercase font-semibold">New Regime</span>
</div>
<div className="font-display-hero-mobile text-display-hero-mobile text-on-surface font-normal tracking-tight">₹4,18,240</div>
</div>
<div className="mt-4 pt-3 bg-secondary-container/30 rounded-lg p-2.5 space-y-1.5">
<div className="flex items-center justify-between">
<span className="font-body-sm text-body-sm text-on-surface-variant">Old Regime benchmark</span>
<span className="font-numeric-table text-numeric-table text-on-surface-variant line-through">₹4,88,440</span>
</div>
<div className="flex items-center gap-1.5 text-primary">
<span className="material-symbols-outlined text-[16px]">savings</span>
<span className="font-label-caps text-label-caps font-semibold uppercase tracking-wider">₹70,200 Arbitrage Net Advantage</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-on-surface-variant mb-2">
<span className="font-label-caps text-label-caps uppercase tracking-wider">Prepaid Taxes (TDS / Advance)</span>
<span className="inline-flex items-center gap-1 text-emerald-800 font-label-caps text-label-caps uppercase">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>TRACES Match
            </span>
</div>
<div className="font-display-hero-mobile text-display-hero-mobile text-on-surface font-normal tracking-tight">₹4,56,700</div>
</div>
<div className="mt-4 pt-3 bg-surface-container-low/60 rounded-lg p-2.5 space-y-1">
<div className="flex justify-between items-center font-label-md text-label-md text-on-surface-variant">
<span>TDS Salary (Infosys Ltd)</span>
<span className="font-numeric-table text-numeric-table font-medium text-on-surface">₹3,42,180</span>
</div>
<div className="flex justify-between items-center font-label-md text-label-md text-on-surface-variant">
<span>TCS / Advance Tax Paid</span>
<span className="font-numeric-table text-numeric-table font-medium text-on-surface">₹1,14,520</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between text-on-surface-variant mb-2">
<span className="font-label-caps text-label-caps uppercase tracking-wider">Direct Refund Creditable</span>
<span className="px-2 py-0.5 rounded bg-emerald-900/10 text-emerald-800 font-label-caps text-label-caps uppercase font-semibold">ITD Approved</span>
</div>
<div className="font-display-hero-mobile text-display-hero-mobile text-emerald-900 font-normal tracking-tight">₹38,460</div>
</div>
<div className="mt-4 pt-3 bg-emerald-900/5 rounded-lg p-2.5 space-y-1">
<div className="flex items-center justify-between font-label-md text-label-md text-on-surface">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-emerald-800">account_balance</span>
<span>HDFC Bank ••••4912</span>
</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container font-label-caps text-label-caps text-on-surface-variant">Primary Validated</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Awaiting final Aadhaar OTP e-verification gate</p>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">

<div className="lg:col-span-8 space-y-space-md">

<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
<div className="flex items-start justify-between gap-4">
<div className="flex items-start gap-3">
<div className="w-9 h-9 rounded-lg bg-amber-900/10 flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[22px] text-amber-800">warning</span>
</div>
<div className="space-y-1">
<div className="flex items-center gap-2">
<h3 className="font-headline-sm text-headline-sm text-on-surface">1 Discrepancy Detected in AIS vs TRACES 26AS</h3>
<span className="px-2 py-0.5 rounded bg-amber-900/10 text-amber-900 font-label-caps text-label-caps uppercase font-semibold">Audit Notice Flag</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
                  Section 194J consulting fee from <strong className="text-on-surface">Fintech Corp Ltd</strong> reflects <span className="font-numeric-table font-semibold text-on-surface">₹45,000</span> on AIS JSON, but only <span className="font-numeric-table font-semibold text-on-surface">₹30,000</span> (TDS ₹3,000) is reported in TRACES 26AS Part A. Differential of <span className="text-error font-numeric-table font-semibold">₹15,000</span>.
                </p>
</div>
</div>
</div>
<div className="mt-4 pt-3 flex flex-wrap items-center gap-3">
<button className="px-3.5 py-2 rounded-lg bg-primary hover:bg-tertiary text-on-primary font-label-md text-label-md transition-colors flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-[17px]">verified</span>
<span>Apply Safe Harbor Election (Claim ₹30,000)</span>
</button>
<button className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-[17px]">visibility</span>
<span>Review Deductor Memo &amp; Invoices</span>
</button>
<button className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md ml-auto flex items-center gap-1" type="button">
<span>View AIS JSON Fragment</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div>
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Statutory Optimization Engine</span>
<h2 className="font-headline-md text-headline-md text-on-surface">Live Regime Arbitrage &amp; Deduction Matrix</h2>
</div>
<div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low font-label-md text-label-md text-primary">
<span className="material-symbols-outlined text-[18px]">calculate</span>
<button className="hover:underline font-medium" type="button">Recalculate with new deductions</button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

<div className="p-space-md rounded-xl bg-surface-container-low relative">
<div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-primary text-on-primary font-label-caps text-label-caps uppercase font-semibold">
                Recommended Choice
              </div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">New Tax Regime</h3>
<p className="font-label-caps text-label-caps text-on-surface-variant uppercase mt-0.5">Section 115BAC (Finance Act 2024)</p>
<div className="mt-4 space-y-2">
<div className="flex justify-between items-center text-body-sm">
<span className="text-on-surface-variant">Total Taxable Basis</span>
<span className="font-numeric-table text-numeric-table font-semibold text-on-surface">₹32,85,000</span>
</div>
<div className="flex justify-between items-center text-body-sm">
<span className="text-on-surface-variant">Effective Surcharge &amp; Cess</span>
<span className="font-numeric-table text-numeric-table font-medium text-on-surface">4% Health &amp; Ed Cess</span>
</div>
<div className="pt-2 bg-surface-container-lowest rounded-lg p-2.5 flex justify-between items-center">
<span className="font-label-md text-label-md font-semibold text-on-surface">Net Computed Liability</span>
<span className="font-headline-sm text-headline-sm text-primary font-normal">₹4,18,240</span>
</div>
</div>
</div>

<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm opacity-85">
<div className="flex items-center justify-between">
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Old Tax Regime</h3>
<p className="font-label-caps text-label-caps text-on-surface-variant uppercase mt-0.5">Standard Slabs + Chapter VI-A</p>
</div>
<span className="font-numeric-table text-numeric-table text-error font-medium">+₹70,200 higher</span>
</div>
<div className="mt-4 space-y-2">
<div className="flex justify-between items-center text-body-sm">
<span className="text-on-surface-variant">Total Deductions Claimed</span>
<span className="font-numeric-table text-numeric-table font-semibold text-on-surface">₹4,65,000</span>
</div>
<div className="flex justify-between items-center text-body-sm">
<span className="text-on-surface-variant">Tax Before Cess</span>
<span className="font-numeric-table text-numeric-table font-medium text-on-surface">₹4,69,654</span>
</div>
<div className="pt-2 bg-surface-container-low rounded-lg p-2.5 flex justify-between items-center">
<span className="font-label-md text-label-md font-semibold text-on-surface">Net Computed Liability</span>
<span className="font-headline-sm text-headline-sm text-on-surface-variant font-normal">₹4,88,440</span>
</div>
</div>
</div>
</div>

<div className="space-y-2 pt-2">
<h4 className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Applied Statutory Deductions &amp; Exemptions</h4>
<div className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm">
<table className="w-full text-left">
<thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase">
<tr>
<th className="py-2.5 px-3">Statutory Provision</th>
<th className="py-2.5 px-3">Category</th>
<th className="py-2.5 px-3 text-right">Eligible Amount</th>
<th className="py-2.5 px-3 text-right">Computed Benefit</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container text-body-sm">
<tr className="hover:bg-surface-container-low/40">
<td className="py-2.5 px-3">
<div className="font-medium text-on-surface">Standard Deduction u/s 16(ia)</div>
<div className="text-on-surface-variant font-label-caps text-label-caps">Finance Act 2024 Revised Limit</div>
</td>
<td className="py-2.5 px-3 text-on-surface-variant">Salary Schedule</td>
<td className="py-2.5 px-3 text-right font-numeric-table text-numeric-table text-on-surface">₹75,000</td>
<td className="py-2.5 px-3 text-right font-numeric-table text-numeric-table text-emerald-800 font-semibold">-₹23,400 Tax</td>
</tr>
<tr className="hover:bg-surface-container-low/40">
<td className="py-2.5 px-3">
<div className="font-medium text-on-surface">Employer NPS Contribution u/s 80CCD(2)</div>
<div className="text-on-surface-variant font-label-caps text-label-caps">14% Central Govt / Corporate Scheme</div>
</td>
<td className="py-2.5 px-3 text-on-surface-variant">Retirement Allowance</td>
<td className="py-2.5 px-3 text-right font-numeric-table text-numeric-table text-on-surface">₹2,40,000</td>
<td className="py-2.5 px-3 text-right font-numeric-table text-numeric-table text-emerald-800 font-semibold">-₹74,880 Tax</td>
</tr>
<tr className="hover:bg-surface-container-low/40">
<td className="py-2.5 px-3">
<div className="font-medium text-on-surface">Section 112A LTCG Equity Exemption</div>
<div className="text-on-surface-variant font-label-caps text-label-caps">Finance Act 2024 Threshold Adjusted</div>
</td>
<td className="py-2.5 px-3 text-on-surface-variant">Capital Schedule</td>
<td className="py-2.5 px-3 text-right font-numeric-table text-numeric-table text-on-surface">₹1,25,000</td>
<td className="py-2.5 px-3 text-right font-numeric-table text-numeric-table text-emerald-800 font-semibold">-₹15,625 Tax</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
<div className="flex items-center justify-between">
<div>
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Multi-Schedule Computation</span>
<h2 className="font-headline-md text-headline-md text-on-surface">Income Streams &amp; Capital Ledgers</h2>
</div>
<span className="px-2.5 py-1 rounded bg-surface-container font-numeric-table text-numeric-table text-on-surface-variant">4 Ledgers Active</span>
</div>
<div className="space-y-3">

<div className="p-3.5 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-on-surface font-headline-sm">
                  §
                </div>
<div>
<div className="flex items-center gap-2">
<h4 className="font-headline-sm text-headline-sm text-on-surface">Infosys Limited</h4>
<span className="px-1.5 py-0.5 rounded bg-emerald-900/10 text-emerald-800 font-label-caps text-label-caps uppercase font-semibold">Matched 26AS</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Primary Employment · Form 16 (Part A &amp; B) Verified</p>
</div>
</div>
<div className="flex items-center gap-6 justify-between md:justify-end">
<div className="text-right">
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Gross Income</div>
<div className="font-numeric-table text-numeric-table font-semibold text-on-surface">₹21,60,000</div>
</div>
<div className="text-right">
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">TDS Deducted</div>
<div className="font-numeric-table text-numeric-table font-semibold text-primary">₹3,42,180</div>
</div>
<span className="material-symbols-outlined text-[18px] text-on-surface-variant">chevron_right</span>
</div>
</div>

<div className="p-3.5 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-on-surface font-headline-sm">
                  $
                </div>
<div>
<div className="flex items-center gap-2">
<h4 className="font-headline-sm text-headline-sm text-on-surface">Morgan Stanley US RSU Vestings</h4>
<span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-label-caps text-label-caps uppercase font-semibold">Sch FA Foreign Asset</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Foreign Tax Credit Form 67 Drafted · Exchange Rate SBI TT Buying</p>
</div>
</div>
<div className="flex items-center gap-6 justify-between md:justify-end">
<div className="text-right">
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Gross Value</div>
<div className="font-numeric-table text-numeric-table font-semibold text-on-surface">₹4,90,000</div>
</div>
<div className="text-right">
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">FTC Relief</div>
<div className="font-numeric-table text-numeric-table font-semibold text-emerald-800">₹68,600</div>
</div>
<span className="material-symbols-outlined text-[18px] text-on-surface-variant">chevron_right</span>
</div>
</div>

<div className="p-3.5 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-on-surface font-headline-sm">
                  %
                </div>
<div>
<div className="flex items-center gap-2">
<h4 className="font-headline-sm text-headline-sm text-on-surface">Zerodha Broking Capital Gains</h4>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-label-caps text-label-caps uppercase">142 Trades Validated</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">STCG (20%) &amp; LTCG (12.5% u/s 112A) · P&amp;L Statement Clean</p>
</div>
</div>
<div className="flex items-center gap-6 justify-between md:justify-end">
<div className="text-right">
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Net Gain</div>
<div className="font-numeric-table text-numeric-table font-semibold text-on-surface">₹7,50,000</div>
</div>
<div className="text-right">
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Net Tax Impact</div>
<div className="font-numeric-table text-numeric-table font-semibold text-on-surface">₹78,125</div>
</div>
<span className="material-symbols-outlined text-[18px] text-on-surface-variant">chevron_right</span>
</div>
</div>

<div className="p-3.5 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
<div className="flex items-start gap-3">
<div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-on-surface font-headline-sm">
                  ₹
                </div>
<div>
<div className="flex items-center gap-2">
<h4 className="font-headline-sm text-headline-sm text-on-surface">ICICI &amp; HDFC Savings / Term Deposits</h4>
<span className="px-1.5 py-0.5 rounded bg-emerald-900/10 text-emerald-800 font-label-caps text-label-caps uppercase font-semibold">SFT-006 Match</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Schedule OS: Other Sources · 0 Mismatches with TIS</p>
</div>
</div>
<div className="flex items-center gap-6 justify-between md:justify-end">
<div className="text-right">
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Interest Income</div>
<div className="font-numeric-table text-numeric-table font-semibold text-on-surface">₹2,00,000</div>
</div>
<div className="text-right">
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">TDS Claimed</div>
<div className="font-numeric-table text-numeric-table font-semibold text-primary">₹20,000</div>
</div>
<span className="material-symbols-outlined text-[18px] text-on-surface-variant">chevron_right</span>
</div>
</div>
</div>
</div>
</div>

<div className="lg:col-span-4 space-y-space-md">

<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-4">
<div className="flex items-center justify-between">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Document Vault &amp; OCR</h3>
<span className="px-2 py-0.5 rounded bg-emerald-900/10 text-emerald-800 font-label-caps text-label-caps uppercase">E-Filing Vault</span>
</div>

<div className="p-5 rounded-lg bg-surface-container-low text-center space-y-2 cursor-pointer hover:bg-surface-container transition-colors">
<div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center mx-auto text-primary">
<span className="material-symbols-outlined text-[24px]">cloud_upload</span>
</div>
<div>
<p className="font-label-md text-label-md font-medium text-on-surface">Drop Form 16, Broker P&amp;L, or AIS JSON</p>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">PDF, Excel, JSON up to 25MB each</p>
</div>
<div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
<span className="material-symbols-outlined text-[13px] text-emerald-800">lock</span>
<span>Zero-Knowledge AES-256 Encryption</span>
</div>
</div>

<div className="space-y-2.5">
<p className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Synchronized Artifacts</p>
<div className="p-2.5 rounded-lg bg-surface-container-low/50 flex items-center justify-between">
<div className="flex items-center gap-2.5 min-w-0">
<span className="material-symbols-outlined text-[20px] text-primary">description</span>
<div className="truncate">
<p className="font-body-sm text-body-sm font-medium text-on-surface truncate">Form16_PartAB_Signed.pdf</p>
<p className="font-label-caps text-label-caps text-emerald-800">99.8% OCR Confidence · SHA-256</p>
</div>
</div>
<span className="material-symbols-outlined text-[18px] text-emerald-800" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
</div>
<div className="p-2.5 rounded-lg bg-surface-container-low/50 flex items-center justify-between">
<div className="flex items-center gap-2.5 min-w-0">
<span className="material-symbols-outlined text-[20px] text-primary">table_chart</span>
<div className="truncate">
<p className="font-body-sm text-body-sm font-medium text-on-surface truncate">Zerodha_TaxPnl_FY24-25.xlsx</p>
<p className="font-label-caps text-label-caps text-emerald-800">100% Parsed · 14 Trades Filtered</p>
</div>
</div>
<span className="material-symbols-outlined text-[18px] text-emerald-800" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
</div>
<div className="p-2.5 rounded-lg bg-surface-container-low/50 flex items-center justify-between">
<div className="flex items-center gap-2.5 min-w-0">
<span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
<div className="truncate">
<p className="font-body-sm text-body-sm font-medium text-on-surface truncate">HDFC_InterestCert_2025.pdf</p>
<p className="font-label-caps text-label-caps text-emerald-800">Parsed &amp; Reconciled</p>
</div>
</div>
<span className="material-symbols-outlined text-[18px] text-emerald-800" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
</div>

<div className="p-3 rounded-lg bg-primary-fixed/20 space-y-2">
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">notification_important</span>
<div>
<p className="font-label-md text-label-md font-semibold text-on-surface">Form 67 Documentation Recommended</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">Foreign Tax Credit Proof required for US Morgan Stanley RSU offset before ITR submission.</p>
</div>
</div>
<button className="w-full py-1.5 px-3 rounded bg-primary hover:bg-tertiary text-on-primary font-label-md text-label-md transition-colors flex items-center justify-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[16px]">file_upload</span>
<span>Upload Form 67 Proof</span>
</button>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-4">
<div className="flex items-center justify-between">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Compliance Schedule</h3>
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">FY 2025–26</span>
</div>
<div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">

<div className="relative">
<div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest"></div>
<div>
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps text-primary uppercase font-semibold">15 June 2025</span>
<span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-label-caps text-label-caps">Priority</span>
</div>
<p className="font-label-md text-label-md font-medium text-on-surface mt-0.5">Q1 Advance Tax Installment (15%)</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">₹62,736 Due u/s 208 statutory requirement</p>
</div>
</div>

<div className="relative">
<div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-surface-container-lowest"></div>
<div>
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase">31 July 2025</span>
<span className="px-1.5 py-0.2 rounded bg-amber-900/10 text-amber-900 font-label-caps text-label-caps font-medium">44 Days Left</span>
</div>
<p className="font-label-md text-label-md font-medium text-on-surface mt-0.5">ITR-2 Non-Audit Filing Deadline</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">Statutory window without Section 234A penalty interest</p>
</div>
</div>

<div className="relative">
<div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-surface-variant ring-4 ring-surface-container-lowest"></div>
<div>
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase">30 September 2025</span>
<p className="font-label-md text-label-md font-medium text-on-surface mt-0.5">Foreign Asset Schedule Disclosures</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">Final reconciliation window for Schedule FA</p>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-low rounded-xl p-space-md shadow-sm space-y-3 relative overflow-hidden">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
<span className="material-symbols-outlined text-[18px]">psychology_alt</span>
</div>
<div>
<h3 className="font-label-md text-label-md font-semibold text-on-surface">Tax Copilot Intelligence</h3>
<p className="font-label-caps text-label-caps text-primary uppercase">Finance Act 2024 Synthesis</p>
</div>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Your <span className="font-numeric-table font-semibold text-on-surface">₹1,25,000</span> LTCG exemption is fully exhausted across Section 112A equity trades. Exercising remaining US RSUs prior to Q3 may trigger additional Section 208 advance tax interest under Section 234C.
          </p>
<div className="pt-2 flex items-center gap-2">
<button className="w-full py-2 px-3 rounded-lg bg-primary hover:bg-tertiary text-on-primary font-label-md text-label-md transition-colors flex items-center justify-center gap-2" type="button">
<span className="material-symbols-outlined text-[17px]">forum</span>
<span>Chat with Copilot</span>
</button>
<button aria-label="Dismiss insight" className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">bookmark_border</span>
</button>
</div>
</div>
</div>
</div>
</div>
</div></main></div>
    </>
  );
}
