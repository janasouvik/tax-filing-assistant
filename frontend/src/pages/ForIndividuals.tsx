import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';


export default function ForIndividuals() {
  return (
    <>
      <Navbar /><main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]"><div className="flex flex-col w-full">

<section className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-24">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

<div className="lg:col-span-7 flex flex-col justify-between pt-2">
<div>

<div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded border border-outline-variant mb-8">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
<span className="font-label-caps text-label-caps tracking-widest text-secondary uppercase">TaxPilot for Individuals · FY 2025–26 / AY 2026–27</span>
</div>

<h1 className="font-display-hero text-headline-lg lg:text-display-hero text-on-surface tracking-tight font-serif mb-6 leading-tight">
            Personal tax filing,<br/>
<span className="italic font-editorial-italic font-normal text-primary">without the paperwork.</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed">
            From multiple Form 16s and broker P&amp;L statements to automated Old vs New Regime optimization. Experience deterministic calculation with source-traceable audit trails.
          </p>

<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
<Link className="bg-primary-container hover:bg-tertiary-container text-on-primary font-body-md text-body-md font-medium px-6 py-3.5 rounded shadow-sm transition-all duration-150 text-center flex items-center justify-center gap-2" to="/individualtaxdashboard">
<span>Start your individual return</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</Link>
<a className="bg-surface-container-lowest hover:bg-surface-container text-on-surface font-body-md text-body-md font-medium px-6 py-3.5 rounded border border-outline-variant transition-colors text-center flex items-center justify-center gap-2" href="#regime-comparator">
<span>Calculate regime savings</span>
<span className="material-symbols-outlined text-[18px]">calculate</span>
</a>
</div>
</div>

<div className="pt-8 border-t border-outline-variant/60 flex flex-wrap items-center gap-y-3 gap-x-8 text-on-surface-variant font-body-sm text-body-sm">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">lock_reset</span>
<span>Zero data selling</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
<span>AES-256 bank-grade encryption</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">fingerprint</span>
<span>Human approval at every milestone</span>
</div>
</div>
</div>

<div className="lg:col-span-5 relative mt-4 lg:mt-0">
<div className="relative rounded overflow-hidden shadow-xl bg-surface-container-high border border-outline-variant">
<img className="w-full h-[460px] object-cover object-top" data-alt="A focused Indian woman reviewing personal financial tax documents, Form 16 schedules, and a laptop spreadsheet in an elegant, sunlit study with warm walnut wooden furniture and coffee cup, shot in an editorial documentary style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8mSMyL8y5QhhykH1hft9ijl4swZJdXsnV9VxbAAPPivvvbbcrqC831fd4JjMouryxTff2kjuTo7_DvptWuiHEXIYcE9mBNTtWn5jeBN_b5BS9r8n-ihPfdDOI2F83qMF2UFOJ6J3ojozS_LN56i2g7-uyuFY8_iW6YuvBgRPOFZr2xSrN8IKHKPkeOpodPDGXLJ7HlAlbsha6sc9fUfr8GJGF7cXMIS90q0biLmnfiEaUt64eaS4hRw"/>

<div className="absolute bottom-4 left-4 right-4 bg-surface-container-lowest/95 backdrop-blur-sm p-4 rounded border border-outline-variant shadow-lg">
<div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/50">
<span className="font-label-caps text-label-caps uppercase text-secondary tracking-wider">Filing Ledger Status</span>
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                100% RECONCILED
              </span>
</div>
<div className="space-y-1.5 text-on-surface font-body-sm text-body-sm">
<div className="flex justify-between items-center">
<span className="text-on-surface-variant">Sources Synced</span>
<span className="font-numeric-table text-numeric-table font-medium">Form 16 (Part A/B) + Zerodha P&amp;L</span>
</div>
<div className="flex justify-between items-center">
<span className="text-on-surface-variant">Exempt Allowances (Sec 10)</span>
<span className="font-numeric-table text-numeric-table text-secondary">₹1,84,000 verified</span>
</div>
<div className="flex justify-between items-center pt-1 border-t border-outline-variant/40">
<span className="font-medium text-primary">Regime Arbitrage Delta</span>
<span className="font-numeric-table text-numeric-table font-semibold text-primary">₹38,400 advantage (New)</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-container-low py-20 border-y border-outline-variant">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="max-w-2xl mb-14">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-semibold block mb-2">Deterministic Process</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-on-surface tracking-tight">The 6-stage individual verification trail.</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-3">From raw fiscal paperwork to digitally verified Central Board of Direct Taxes (CBDT) filing, governed entirely by deterministic rules.</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<div className="bg-surface-container-lowest p-6 rounded border border-outline-variant shadow-sm flex flex-col justify-between hover:border-primary/60 transition-colors">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-numeric-table text-label-caps font-semibold text-primary uppercase tracking-widest">Stage 01</span>
<span className="material-symbols-outlined text-secondary text-[22px]">upload_file</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2">Document Ingestion</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              Drop native PDF files of Form 16 (Part A &amp; B), Annual Information Statement (AIS), Taxpayer Information Summary (TIS), and Zerodha or Groww capital gain schedules.
            </p>
</div>
<div className="pt-3 border-t border-outline-variant/40 text-[12px] text-secondary font-medium flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Direct ITD e-Portal pull supported
          </div>
</div>

<div className="bg-surface-container-lowest p-6 rounded border border-outline-variant shadow-sm flex flex-col justify-between hover:border-primary/60 transition-colors">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-numeric-table text-label-caps font-semibold text-primary uppercase tracking-widest">Stage 02</span>
<span className="material-symbols-outlined text-secondary text-[22px]">document_scanner</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2">Optical Field Parsing</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              High-fidelity neural OCR extracts employer TAN, PAN validation, TDS line records under Section 192, and flags discrepancies against Central Processing Center tables.
            </p>
</div>
<div className="pt-3 border-t border-outline-variant/40 text-[12px] text-secondary font-medium flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            SHA-256 fingerprint validation
          </div>
</div>

<div className="bg-surface-container-lowest p-6 rounded border border-outline-variant shadow-sm flex flex-col justify-between hover:border-primary/60 transition-colors">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-numeric-table text-label-caps font-semibold text-primary uppercase tracking-widest">Stage 03</span>
<span className="material-symbols-outlined text-secondary text-[22px]">account_balance</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2">Income Aggregation</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              Automated reconciliation across Salary Sec 17(1), STCG Sec 111A, LTCG Sec 112A, Savings Interest Sec 56, and Foreign RSUs with Rule 115 currency conversion.
            </p>
</div>
<div className="pt-3 border-t border-outline-variant/40 text-[12px] text-secondary font-medium flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Automated schedule segregation
          </div>
</div>

<div className="bg-surface-container-lowest p-6 rounded border border-outline-variant shadow-sm flex flex-col justify-between hover:border-primary/60 transition-colors">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-numeric-table text-label-caps font-semibold text-primary uppercase tracking-widest">Stage 04</span>
<span className="material-symbols-outlined text-secondary text-[22px]">fact_check</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2">Deduction Detection</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              Algorithmic scanning for eligible allowances under Sec 10(13A) HRA, 80C caps, 80D medical coverage tiers, 80CCD(1B) Tier 1 NPS, and Section 24(b) home loan interest.
            </p>
</div>
<div className="pt-3 border-t border-outline-variant/40 text-[12px] text-secondary font-medium flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Evidentiary audit checks passed
          </div>
</div>

<div className="bg-surface-container-lowest p-6 rounded border border-outline-variant shadow-sm flex flex-col justify-between hover:border-primary/60 transition-colors">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-numeric-table text-label-caps font-semibold text-primary uppercase tracking-widest">Stage 05</span>
<span className="material-symbols-outlined text-secondary text-[22px]">balance</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2">Deterministic Computation</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              Parallel zero-error simulation of New Tax Regime (Section 115BAC with ₹75,000 standard deduction) versus the Old Tax Regime with full Chapter VI-A itemization.
            </p>
</div>
<div className="pt-3 border-t border-outline-variant/40 text-[12px] text-secondary font-medium flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Arbitrage delta calculated
          </div>
</div>

<div className="bg-surface-container-lowest p-6 rounded border border-outline-variant shadow-sm flex flex-col justify-between hover:border-primary/60 transition-colors">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-numeric-table text-label-caps font-semibold text-primary uppercase tracking-widest">Stage 06</span>
<span className="material-symbols-outlined text-secondary text-[22px]">send_and_archive</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2">Taxpayer Approval &amp; Filing</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              Inspect the computation line-by-line. Confirm the return, generate standard ITR-1 or ITR-2 JSON, and submit directly to the ITD portal with instant Aadhaar OTP e-verification.
            </p>
</div>
<div className="pt-3 border-t border-outline-variant/40 text-[12px] text-secondary font-medium flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Direct CBDT API integration
          </div>
</div>
</div>
</div>
</section>

<section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
<div className="lg:col-span-5">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-semibold block mb-2">Source Traceability</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-on-surface tracking-tight mb-5">
          Intelligent ingestion.<br/>Zero manual data re-entry.
        </h2>
<p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
          TaxPilot reads your original bank and employer PDFs without loss of fidelity. Every number inside your computed tax schedule links directly back to the exact page, line, and row of the verified document.
        </p>
<div className="space-y-4 font-body-sm text-body-sm">
<div className="flex items-start gap-3 p-3 bg-surface-container-low rounded border border-outline-variant">
<span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">description</span>
<div>
<div className="font-medium text-on-surface">Form 16 Part A &amp; Part B Integration</div>
<div className="text-on-surface-variant text-[12px]">Employer TANs, TDS deductions under 192, and Section 10 allowances extracted cleanly.</div>
</div>
</div>
<div className="flex items-start gap-3 p-3 bg-surface-container-low rounded border border-outline-variant">
<span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">show_chart</span>
<div>
<div className="font-medium text-on-surface">Unified Broker P&amp;L Statements</div>
<div className="text-on-surface-variant text-[12px]">Zerodha, Groww, Upstox, and ICICI Direct capital gains mapped accurately across STCG and LTCG.</div>
</div>
</div>
<div className="flex items-start gap-3 p-3 bg-surface-container-low rounded border border-outline-variant">
<span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">hub</span>
<div>
<div className="font-medium text-on-surface">AIS &amp; TIS Discrepancy Matching</div>
<div className="text-on-surface-variant text-[12px]">Cross-checks declared dividend and interest income against ITD database records before submission.</div>
</div>
</div>
</div>
</div>

<div className="lg:col-span-7 bg-surface-container-lowest rounded border border-outline-variant shadow-md overflow-hidden">
<div className="bg-surface-container px-4 py-3 border-b border-outline-variant flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-outline-variant"></span>
<span className="w-3 h-3 rounded-full bg-outline-variant"></span>
<span className="w-3 h-3 rounded-full bg-outline-variant"></span>
<span className="ml-2 font-label-caps text-label-caps text-secondary uppercase tracking-wider">Document Inspector · Optical Facsimile vs Normalized Ledger</span>
</div>
<span className="font-numeric-table text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-medium">99.8% Confidence</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant">

<div className="p-5 bg-surface-container-low/40">
<div className="text-[11px] font-label-caps uppercase tracking-wider text-secondary mb-3 flex items-center justify-between">
<span>Source: Form_16_Part_B_Infosys.pdf</span>
<span className="text-primary font-mono text-[10px]">p. 02 / § 17(1)</span>
</div>
<div className="p-3 bg-white rounded border border-outline-variant font-mono text-[11px] text-on-surface space-y-2 leading-relaxed opacity-90 shadow-sm">
<div className="border-b border-dashed border-outline-variant pb-1.5">
<span className="text-secondary">1. Gross Salary:</span><br/>
                (a) Salary as per Sec 17(1): <span className="font-semibold text-on-surface">₹ 21,80,000</span><br/>
                (b) Value of perquisites u/s 17(2): <span className="font-semibold text-on-surface">₹ 42,500</span>
</div>
<div className="border-b border-dashed border-outline-variant pb-1.5">
<span className="text-secondary">2. Less: Allowances u/s 10:</span><br/>
                (a) House Rent Allowance u/s 10(13A): <span className="font-semibold text-emerald-700">₹ 1,20,000</span>
</div>
<div>
<span className="text-secondary">5. Aggregate Deductions:</span><br/>
                Standard Deduction u/s 16(ia): <span className="font-semibold text-on-surface">₹ 50,000</span>
</div>
</div>
<div className="mt-4 flex items-center justify-between text-[11px] text-secondary">
<span>Hash: <code className="text-primary text-[10px]">e3b0c44...a98b</code></span>
<span className="text-emerald-700 flex items-center gap-1 font-medium">
<span className="material-symbols-outlined text-[14px]">check_circle</span> Verified Digitally
              </span>
</div>
</div>

<div className="p-5 bg-white">
<div className="text-[11px] font-label-caps uppercase tracking-wider text-secondary mb-3 flex items-center justify-between">
<span>Normalized Tax Schedule</span>
<span className="text-secondary font-mono text-[10px]">JSON Tree</span>
</div>
<div className="space-y-3 font-body-sm text-body-sm">
<div className="p-2.5 rounded bg-surface-container-low border border-outline-variant/60">
<div className="text-[11px] text-secondary font-medium">Employer PAN &amp; Name</div>
<div className="flex justify-between items-center mt-0.5">
<span className="font-medium text-on-surface">INFOSYS LTD · BLR</span>
<span className="font-label-caps text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">MATCHED 100%</span>
</div>
</div>
<div className="p-2.5 rounded bg-surface-container-low border border-outline-variant/60">
<div className="text-[11px] text-secondary font-medium">Total Chargeable Salary</div>
<div className="flex justify-between items-center mt-0.5">
<span className="font-numeric-table font-semibold text-on-surface">₹21,02,500</span>
<span className="text-[11px] text-secondary">Pre-Standard Ded.</span>
</div>
</div>
<div className="p-2.5 rounded bg-surface-container-low border border-outline-variant/60">
<div className="text-[11px] text-secondary font-medium">Verified Tax Deducted (TDS Sec 192)</div>
<div className="flex justify-between items-center mt-0.5">
<span className="font-numeric-table font-semibold text-emerald-800">₹3,42,180</span>
<span className="text-[11px] text-emerald-700">Matches Form 26AS</span>
</div>
</div>
<div className="p-2.5 rounded bg-amber-50/70 border border-amber-200">
<div className="flex items-center gap-1.5 text-amber-900 text-[12px] font-medium">
<span className="material-symbols-outlined text-[16px] text-amber-700">info</span>
<span>Notice: AIS shows ₹14,200 Bank Savings Interest</span>
</div>
<div className="text-[11px] text-amber-800 mt-1">Automatically routed to Schedule Other Sources (Sec 56).</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-container py-24 border-y border-outline-variant" id="regime-comparator">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="max-w-3xl mb-12">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-semibold block mb-2">Automated Dual Simulation</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-on-surface tracking-tight mb-4">
          Old vs. New Tax Regime: Zero guesswork.
        </h2>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          The Finance Act 2024 revised New Regime tax slabs and increased the standard deduction to ₹75,000 under Section 115BAC. TaxPilot calculates both side-by-side using your real deductions to certify the exact optimal regime.
        </p>
</div>

<div className="bg-surface-container-lowest rounded border border-outline-variant shadow-md overflow-hidden mb-8">
<div className="grid grid-cols-12 bg-surface-container-high px-6 py-4 border-b border-outline-variant font-label-caps text-label-caps text-secondary uppercase tracking-wider">
<div className="col-span-6 md:col-span-6">Fiscal Component (FY 2025–26)</div>
<div className="col-span-3 md:col-span-3 text-right">Old Tax Regime</div>
<div className="col-span-3 md:col-span-3 text-right text-primary font-semibold">New Regime (Sec 115BAC)</div>
</div>
<div className="divide-y divide-outline-variant font-body-sm text-body-sm">

<div className="grid grid-cols-12 px-6 py-4 items-center hover:bg-surface-container-low transition-colors">
<div className="col-span-6">
<div className="font-medium text-on-surface">Gross Total Income</div>
<div className="text-[12px] text-secondary">Salary + Verified Capital Gains (Zerodha)</div>
</div>
<div className="col-span-3 text-right font-numeric-table text-numeric-table text-on-surface">₹24,50,000</div>
<div className="col-span-3 text-right font-numeric-table text-numeric-table font-medium text-on-surface">₹24,50,000</div>
</div>

<div className="grid grid-cols-12 px-6 py-4 items-center bg-surface-container-low/30 hover:bg-surface-container-low transition-colors">
<div className="col-span-6">
<div className="font-medium text-on-surface">Standard Deduction u/s 16(ia)</div>
<div className="text-[12px] text-secondary">Statutory deduction for salaried personnel</div>
</div>
<div className="col-span-3 text-right font-numeric-table text-numeric-table text-on-surface">₹50,000</div>
<div className="col-span-3 text-right font-numeric-table text-numeric-table font-semibold text-emerald-800">₹75,000</div>
</div>

<div className="grid grid-cols-12 px-6 py-4 items-center hover:bg-surface-container-low transition-colors">
<div className="col-span-6">
<div className="font-medium text-on-surface">Chapter VI-A Deductions</div>
<div className="text-[12px] text-secondary">Sec 80C (₹1.5L) + 80D (₹75k) + 80CCD(1B) (₹50k)</div>
</div>
<div className="col-span-3 text-right font-numeric-table text-numeric-table text-emerald-800 font-medium">₹2,75,000</div>
<div className="col-span-3 text-right font-numeric-table text-numeric-table text-secondary">₹0 <span className="text-[10px] text-outline font-normal">(Disallowed)</span></div>
</div>

<div className="grid grid-cols-12 px-6 py-4 items-center bg-surface-container-low/30 hover:bg-surface-container-low transition-colors">
<div className="col-span-6">
<div className="font-medium text-on-surface">Net Taxable Income</div>
<div className="text-[12px] text-secondary">Base income subjected to slab rates</div>
</div>
<div className="col-span-3 text-right font-numeric-table text-numeric-table text-on-surface">₹21,25,000</div>
<div className="col-span-3 text-right font-numeric-table text-numeric-table font-medium text-on-surface">₹23,75,000</div>
</div>

<div className="grid grid-cols-12 px-6 py-5 items-center bg-surface-container-high/40">
<div className="col-span-6">
<div className="font-medium text-on-surface text-body-md">Total Tax Liability (Incl. 4% Health &amp; Education Cess)</div>
<div className="text-[12px] text-secondary">Final tax obligation computed strictly per FY 2025–26 schedules</div>
</div>
<div className="col-span-3 text-right font-numeric-table text-body-md text-on-surface">₹4,75,800</div>
<div className="col-span-3 text-right font-numeric-table text-headline-sm font-serif text-primary">₹4,48,500</div>
</div>
</div>
</div>

<div className="p-6 rounded bg-surface-container-lowest border border-primary/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
<div className="flex items-start gap-4">
<div className="w-10 h-10 rounded bg-primary-container text-on-primary flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[24px]">savings</span>
</div>
<div>
<div className="font-headline-sm text-headline-sm font-serif text-on-surface">
              New Tax Regime saves <span className="text-primary font-bold">₹27,300</span> for this taxpayer profile
            </div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Despite ₹2,75,000 of itemized deductions under Old Regime, the lower slab brackets under Section 115BAC (specifically 10% up to ₹10L and 15% up to ₹12L) plus the higher standard deduction of ₹75,000 yield a decisive net advantage.
            </p>
</div>
</div>
<button className="bg-primary text-on-primary hover:bg-primary/90 font-body-sm text-body-sm font-medium px-5 py-2.5 rounded shrink-0 transition-colors">
          Lock New Regime for Return
        </button>
</div>
</div>
</section>

<section className="w-full bg-[#24170F] text-[#EEE3D6] py-24 border-t border-[#5A4535]">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="max-w-3xl mb-16">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-[#B18A6B] font-semibold block mb-3">Audit Defense Engine</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-[#EEE3D6] tracking-tight mb-4">
          Every single deduction backed by evidentiary proof.
        </h2>
<p className="font-body-md text-body-md text-[#D8D1C9] leading-relaxed">
          TaxPilot flags eligible deductions under Indian tax law while ensuring audit-proof documentation for every claimed rupee. Never face an Income Tax Intimation u/s 143(1) with unsubstantiated numbers.
        </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

<div className="bg-[#302016] p-7 rounded border border-[#5A4535] flex flex-col justify-between hover:border-[#8A5A3C] transition-colors">
<div>
<div className="flex items-center justify-between mb-6">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[#B18A6B] bg-[#3C281D] px-2.5 py-1 rounded">Section 80D</span>
<span className="material-symbols-outlined text-[#B18A6B]">health_and_safety</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-[#EEE3D6] mb-3">Health Insurance &amp; Preventative Checks</h3>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed mb-6">
              Multi-tier policy allocation: Claim up to ₹25,000 for self/family, plus an additional ₹50,000 for senior citizen parents. Automatic extraction of GST receipts with policyholder age cross-validation.
            </p>
</div>
<div className="pt-4 border-t border-[#5A4535] text-[12px] text-[#B18A6B] font-medium flex items-center justify-between">
<span>Max Deductible: ₹75,000</span>
<span className="text-[#D8D1C9]">Receipt audit required</span>
</div>
</div>

<div className="bg-[#302016] p-7 rounded border border-[#5A4535] flex flex-col justify-between hover:border-[#8A5A3C] transition-colors">
<div>
<div className="flex items-center justify-between mb-6">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[#B18A6B] bg-[#3C281D] px-2.5 py-1 rounded">Section 80CCD(2)</span>
<span className="material-symbols-outlined text-[#B18A6B]">corporate_fare</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-[#EEE3D6] mb-3">Employer Corporate NPS Contribution</h3>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed mb-6">
              One of the few powerful deductions available under both Old and New Tax Regimes. Deduct up to 14% of Basic + DA contributed directly by your organization to Tier-1 NPS accounts.
            </p>
</div>
<div className="pt-4 border-t border-[#5A4535] text-[12px] text-[#B18A6B] font-medium flex items-center justify-between">
<span>Available in New Regime</span>
<span className="text-[#D8D1C9]">Sec 115BAC eligible</span>
</div>
</div>

<div className="bg-[#302016] p-7 rounded border border-[#5A4535] flex flex-col justify-between hover:border-[#8A5A3C] transition-colors">
<div>
<div className="flex items-center justify-between mb-6">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[#B18A6B] bg-[#3C281D] px-2.5 py-1 rounded">Section 112A &amp; 111A</span>
<span className="material-symbols-outlined text-[#B18A6B]">trending_up</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-[#EEE3D6] mb-3">Capital Gains Offset &amp; Exemption</h3>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed mb-6">
              Automatic application of the ₹1,25,000 LTCG threshold under updated Section 112A provisions. Meticulous loss harvesting carry-forward matching to offset unabsorbed STCG against LTCG.
            </p>
</div>
<div className="pt-4 border-t border-[#5A4535] text-[12px] text-[#B18A6B] font-medium flex items-center justify-between">
<span>₹1.25L Base Exemption</span>
<span className="text-[#D8D1C9]">Loss schedules verified</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24" id="workspace-preview">
<div className="text-center max-w-2xl mx-auto mb-14">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-semibold block mb-2">The Individual Workspace</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-on-surface tracking-tight">An interface designed for clarity.</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-3">All your schedules, reconciliation checks, and tax refund states presented without clutter or retail marketing noise.</p>
</div>

<div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl overflow-hidden">

<div className="bg-surface-container px-6 py-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-serif text-lg">
            AM
          </div>
<div>
<div className="font-headline-sm text-headline-sm font-serif text-on-surface">Arjun Mehta</div>
<div className="text-on-surface-variant font-body-sm text-body-sm">Senior Engineering Lead · PAN: ABCPM****F · AY 2026–27</div>
</div>
</div>
<div className="flex items-center gap-3">
<div className="text-right">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary block">Readiness Score</span>
<span className="font-numeric-table font-semibold text-emerald-800">92% · Audit Ready</span>
</div>
<div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700">
<span className="material-symbols-outlined text-[20px]">verified</span>
</div>
</div>
</div>

<div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

<div className="lg:col-span-4 space-y-4">
<div className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Verified Tax Documents (4/4)</div>
<div className="p-3.5 rounded bg-surface-container-low border border-outline-variant flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[20px]">badge</span>
<div>
<div className="font-body-sm text-body-sm font-medium text-on-surface">Form 16 · Google India</div>
<div className="text-[11px] text-secondary">TDS: ₹4,12,000 reconciled</div>
</div>
</div>
<span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
</div>
<div className="p-3.5 rounded bg-surface-container-low border border-outline-variant flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[20px]">query_stats</span>
<div>
<div className="font-body-sm text-body-sm font-medium text-on-surface">AIS / TIS Statement 2025</div>
<div className="text-[11px] text-secondary">37 transaction events matched</div>
</div>
</div>
<span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
</div>
<div className="p-3.5 rounded bg-surface-container-low border border-outline-variant flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
<div>
<div className="font-body-sm text-body-sm font-medium text-on-surface">Zerodha Equity &amp; F&amp;O P&amp;L</div>
<div className="text-[11px] text-secondary">STCG Sec 111A: ₹84,200</div>
</div>
</div>
<span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
</div>
<div className="p-3.5 rounded bg-surface-container-low border border-outline-variant flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
<div>
<div className="font-body-sm text-body-sm font-medium text-on-surface">HDFC Interest Certificate</div>
<div className="text-[11px] text-secondary">Savings: ₹18,400 u/s 56</div>
</div>
</div>
<span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
</div>
</div>

<div className="lg:col-span-8 bg-surface-container-low rounded-lg p-6 border border-outline-variant flex flex-col justify-between">
<div>
<div className="flex items-center justify-between pb-4 border-b border-outline-variant">
<div>
<span className="font-label-caps text-label-caps uppercase text-secondary">Regime Selection</span>
<div className="font-headline-sm text-headline-sm font-serif text-on-surface">New Tax Regime (Section 115BAC)</div>
</div>
<span className="font-label-caps text-label-caps uppercase px-2.5 py-1 rounded bg-primary-container text-on-primary font-semibold">Recommended</span>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
<div className="p-3 bg-surface-container-lowest rounded border border-outline-variant">
<span className="font-label-caps text-label-caps text-secondary block mb-1">Gross Total</span>
<span className="font-numeric-table text-body-lg font-semibold text-on-surface">₹32,40,000</span>
</div>
<div className="p-3 bg-surface-container-lowest rounded border border-outline-variant">
<span className="font-label-caps text-label-caps text-secondary block mb-1">TDS Already Paid</span>
<span className="font-numeric-table text-body-lg font-semibold text-emerald-800">₹4,82,000</span>
</div>
<div className="p-3 bg-surface-container-lowest rounded border border-outline-variant">
<span className="font-label-caps text-label-caps text-secondary block mb-1">Net Final Liability</span>
<span className="font-numeric-table text-body-lg font-semibold text-primary">₹4,49,280</span>
</div>
</div>

<div className="p-4 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-emerald-700 text-[26px]">account_balance_wallet</span>
<div>
<div className="font-medium text-emerald-950 font-body-md text-body-md">Expected Tax Refund: ₹32,720</div>
<div className="text-[12px] text-emerald-800">Excess TDS paid across Q1-Q4. Direct credit to HDFC Account ****4091.</div>
</div>
</div>
<span className="font-label-caps text-label-caps text-emerald-800 uppercase font-semibold">Ready for E-Filing</span>
</div>
</div>
<div className="mt-8 pt-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
<span className="text-[12px] text-secondary flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-primary">shield</span>
              ITR-2 JSON package generated with cryptographic checksum
            </span>
<div className="flex items-center gap-3 w-full sm:w-auto">
<button className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm font-medium px-4 py-2 rounded hover:bg-surface-container transition-colors w-full sm:w-auto">
                Download Computation
              </button>
<button className="bg-primary-container hover:bg-tertiary-container text-on-primary font-body-sm text-body-sm font-medium px-5 py-2 rounded shadow-sm transition-colors w-full sm:w-auto">
                Submit Return to ITD
              </button>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-container-low py-24 border-t border-outline-variant">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="max-w-3xl mb-16">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-semibold block mb-2">Bespoke Handling</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-on-surface tracking-tight mb-4">
          Architected for modern compensation structures.
        </h2>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          Indian tax scenarios have evolved far beyond single-employer salary slips. TaxPilot provides dedicated processing rules tailored to your exact professional profile.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

<div className="bg-surface-container-lowest p-8 rounded border border-outline-variant shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined text-[28px]">corporate_fare</span>
</div>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Persona 01</span>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mt-1 mb-3">The Corporate Leader</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6">
              Mid-year job switches with dual Form 16s, ESOP vesting schedules, foreign stock grants (Schedule FA disclosure), car perquisites under Rule 3, and executive deferred compensation.
            </p>
</div>
<ul className="pt-4 border-t border-outline-variant space-y-2 text-[12px] text-secondary">
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-emerald-700">check</span>
              Dual employer salary de-duplication
            </li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-emerald-700">check</span>
              Schedule FA foreign asset filing
            </li>
</ul>
</div>

<div className="bg-surface-container-lowest p-8 rounded border border-outline-variant shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined text-[28px]">candlestick_chart</span>
</div>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Persona 02</span>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mt-1 mb-3">The Active Investor</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6">
              High-volume equity trading across Zerodha and Groww, intra-day speculation (Section 43(5)), unlisted private equity deals, mutual fund redemptions, and dividend income reconciliation.
            </p>
</div>
<ul className="pt-4 border-t border-outline-variant space-y-2 text-[12px] text-secondary">
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-emerald-700">check</span>
              Automated grandfathering (Jan 31, 2018)
            </li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-emerald-700">check</span>
              Loss set-off &amp; 8-year carry-forward ledger
            </li>
</ul>
</div>

<div className="bg-surface-container-lowest p-8 rounded border border-outline-variant shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined text-[28px]">design_services</span>
</div>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Persona 03</span>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mt-1 mb-3">The Freelance Consultant</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6">
              Independent software architects, doctors, and legal advisors claiming Section 44ADA presumptive taxation (50% deemed profit), cross-checking client TDS deductions under Section 194J.
            </p>
</div>
<ul className="pt-4 border-t border-outline-variant space-y-2 text-[12px] text-secondary">
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-emerald-700">check</span>
              Sec 44ADA 50% profit ceiling engine
            </li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-emerald-700">check</span>
              Client 194J TDS reconciliation against 26AS
            </li>
</ul>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#24170F] text-[#EEE3D6] py-24 border-t border-[#5A4535]">
<div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#302016] rounded border border-[#5A4535] mb-8">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
<span className="font-label-caps text-label-caps uppercase tracking-widest text-[#B18A6B]">Now Open for FY 2025–26 Submissions</span>
</div>
<h2 className="font-headline-lg text-headline-lg lg:text-display-hero font-serif text-[#EEE3D6] tracking-tight mb-6">
        File your personal taxes with absolute certainty.
      </h2>
<p className="font-body-lg text-body-lg text-[#D8D1C9] max-w-2xl mx-auto mb-10 leading-relaxed">
        Upload your Form 16 and let our deterministic engine compute your exact tax obligations in under 3 minutes. No data monetization. No surprise intimations.
      </p>
<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
<button className="bg-[#EEE3D6] hover:bg-[#DFD2C2] text-[#24170F] font-body-md text-body-md font-medium px-8 py-3.5 rounded shadow transition-colors w-full sm:w-auto">
          Start filing for free
        </button>
<button className="border border-[#5A4535] hover:bg-[#302016] text-[#EEE3D6] font-body-md text-body-md font-medium px-8 py-3.5 rounded transition-colors w-full sm:w-auto">
          Explore How It Works
        </button>
</div>
<div className="flex flex-wrap items-center justify-center gap-8 text-[12px] text-[#B18A6B]">
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">lock</span> Zero-knowledge encryption
        </span>
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">security</span> No tax data sold
        </span>
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">sync</span> Automatic Form 16 &amp; AIS sync
        </span>
</div>
</div>
</section>
</div></main><Footer />
    </>
  );
}
