import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';


export default function ForSMEs() {
  return (
    <>
      <Navbar /><main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]"><div className="flex flex-col w-full">



<section className="w-full bg-surface py-16 lg:py-24">
<div className="max-w-7xl mx-auto px-6 lg:px-12">

<div className="inline-flex items-center gap-2 mb-6">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
<span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant font-medium">TaxPilot for SMEs &amp; Enterprises — FY 2025–26 / AY 2026–27</span>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

<div className="lg:col-span-7 space-y-6">
<h1 className="font-display-hero text-display-hero tracking-tight text-on-surface leading-[1.08]">
            Business taxes, without the spreadsheet chaos.
          </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-2xl">
            Consolidate multi-entity P&amp;Ls, reconcile GSTR-2B vs 3B with purchase registers in minutes, and optimize presumptive tax under Section 44AD/44ADA with source-traceable audit defense.
          </p>

<div className="flex flex-wrap items-center gap-4 pt-2">
<Link className="bg-primary-container hover:bg-tertiary-container text-on-primary font-body-sm text-body-sm font-medium px-6 py-3 rounded-lg shadow-sm transition-all duration-150 inline-flex items-center gap-2" to="/smetaxdashboard">
<span>Create an SME workspace</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</Link>
<a className="bg-surface-container-lowest hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-medium px-6 py-3 rounded-lg shadow-sm transition-all duration-150 inline-flex items-center gap-2" href="#">
<span className="material-symbols-outlined text-[18px] text-secondary">calculate</span>
<span>Calculate business tax liability</span>
</a>
</div>

<div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[20px]">shield_person</span>
<span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">Zero-knowledge corporate vault</span>
</div>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
<span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">Multi-GSTIN ledger reconciliation</span>
</div>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[20px]">group</span>
<span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">CA &amp; Tax Auditor collaboration access</span>
</div>
</div>
</div>

<div className="lg:col-span-5 relative">

<div className="absolute -top-3 -right-3 w-full h-full bg-surface-container rounded-xl shadow-sm"></div>

<div className="relative bg-surface-container-lowest rounded-xl shadow-xl p-6 lg:p-7 space-y-6">

<div className="flex items-center justify-between pb-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Live Audit Schedule — FY25 Q4</span>
</div>
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                Rule Engine Live
              </span>
</div>

<div className="p-5 bg-surface-container-low rounded-lg space-y-2">
<span className="font-label-caps text-label-caps uppercase text-secondary">Audit Ledger Readiness Score</span>
<div className="flex items-baseline justify-between">
<span className="font-display-hero text-headline-lg font-headline-lg text-primary tracking-tight">96.4%</span>
<span className="font-label-caps text-label-caps uppercase text-emerald-700 bg-emerald-100 px-2 py-1 rounded">Fully Reconciled</span>
</div>

<div className="w-full bg-surface-dim h-1.5 rounded-full overflow-hidden mt-2">
<div className="bg-primary h-full rounded-full" style={{ width: '96.4%' }}></div>
</div>
</div>

<div className="space-y-3 font-body-sm text-body-sm">
<div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded hover:bg-surface-container transition-colors">
<span className="text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-emerald-700">task_alt</span>
                  Reconciled Sources
                </span>
<span className="font-numeric-table text-numeric-table text-on-surface font-medium">GSTR-2B + 26AS + Stripe P&amp;L</span>
</div>
<div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded hover:bg-surface-container transition-colors">
<span className="text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-emerald-700">verified_user</span>
                  Detected ITC Mismatches
                </span>
<span className="font-numeric-table text-numeric-table text-emerald-800 font-medium">0 (All vendors verified)</span>
</div>
<div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded hover:bg-surface-container transition-colors">
<span className="text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-primary">event_upcoming</span>
                  Estimated Advance Tax Q4
                </span>
<span className="font-numeric-table text-numeric-table text-primary font-semibold">₹3,14,200</span>
</div>
</div>

<div className="pt-2 flex items-center justify-between text-secondary">
<span className="font-label-caps text-label-caps uppercase">Section 44AD Status</span>
<span className="font-label-caps text-label-caps uppercase text-on-surface">Digital Turnover 84.2%</span>
</div>
</div>
</div>
</div>
</div>
</section>



<section className="w-full bg-surface-container-low py-20">
<div className="max-w-7xl mx-auto px-6 lg:px-12">

<div className="max-w-3xl mb-12 space-y-3">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Deterministic Data Processing Pipeline</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">The 6-Stage SME Reconciliation Engine</h2>
<p className="font-body-md text-body-md text-on-surface-variant">From unformatted raw bank dumps and multi-state GST JSON returns to an airtight, audit-certified corporate schedule.</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">STAGE 01</span>
<span className="material-symbols-outlined text-secondary text-[22px]">cloud_sync</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Multi-Stream Ingestion</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Real-time API integrations across Tally Prime, Zoho Books, raw bank statements (ICICI, HDFC, Axis), Razorpay/Stripe payouts, and direct GST portal JSON payloads.
            </p>
</div>
<div className="pt-4 text-secondary font-label-caps text-label-caps uppercase flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Bank Feeds &amp; Books Sync
          </div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">STAGE 02</span>
<span className="material-symbols-outlined text-secondary text-[22px]">document_scanner</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">OCR &amp; Vendor Verification</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Optical character extraction of complex PDF/physical B2B tax invoices. Instant algorithmic validation of vendor GSTIN, active filing compliance, and SAC/HSN tariff accuracy.
            </p>
</div>
<div className="pt-4 text-secondary font-label-caps text-label-caps uppercase flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            99.4% Field Confidence
          </div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">STAGE 03</span>
<span className="material-symbols-outlined text-secondary text-[22px]">compare_arrows</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">ITC &amp; GSTR Reconciliation</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Automated 3-way match: Purchase Register vs GSTR-2B vs 3B. Pinpoints non-filing vendors, invoice number variations, and credit note mismatches under Rule 36(4).
            </p>
</div>
<div className="pt-4 text-secondary font-label-caps text-label-caps uppercase flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Rule 36(4) Compliant
          </div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">STAGE 04</span>
<span className="material-symbols-outlined text-secondary text-[22px]">fact_check</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">TDS &amp; TCS Cross-Matching</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Correlates client deductions against Form 26AS &amp; AIS ledger records u/s 194C (contractors), 194J (professional), and 194Q (goods purchase) to ensure no tax credits slip through.
            </p>
</div>
<div className="pt-4 text-secondary font-label-caps text-label-caps uppercase flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Section 194C/J/Q Covered
          </div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">STAGE 05</span>
<span className="material-symbols-outlined text-secondary text-[22px]">architecture</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Deterministic P&amp;L Matrix</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Applies ITD depreciation schedules (Block of Assets) and compares Presumptive rules (44AD 6%/8%, 44ADA 50%) directly against audited actuals to guarantee minimum statutory tax.
            </p>
</div>
<div className="pt-4 text-secondary font-label-caps text-label-caps uppercase flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Block Asset Depreciation
          </div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">STAGE 06</span>
<span className="material-symbols-outlined text-secondary text-[22px]">send_and_archive</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Auditor Review &amp; Direct Filing</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Export audit-ready Workpapers or grant your CA read/annotate access. Direct one-click e-filing to the Income Tax &amp; GST portals via DSC (Digital Signature) or Aadhaar OTP.
            </p>
</div>
<div className="pt-4 text-secondary font-label-caps text-label-caps uppercase flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            DSC / EVC E-Filing
          </div>
</div>
</div>
</div>
</section>



<section className="w-full bg-surface py-20">
<div className="max-w-7xl mx-auto px-6 lg:px-12">

<div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Airtight Evidentiary Trail</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Source Traceability: Vendor Invoice to Taxable Expense</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Every deduction claimed on ITR-3 or ITR-6 maintains unbroken bidirectional references directly back to source purchase vouchers.</p>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

<div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl shadow-md flex flex-col justify-between">
<div>

<div className="flex items-center justify-between pb-4 bg-surface-container-low -mx-6 -mt-6 p-4 rounded-t-xl mb-4">
<span className="font-label-caps text-label-caps uppercase text-secondary">Document Facsimile OCR</span>
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Confidence 99.4%
              </span>
</div>

<div className="bg-surface-container-low p-5 rounded-lg space-y-4">
<div className="flex justify-between items-start">
<div>
<h4 className="font-headline-sm text-headline-sm text-on-surface">OctaCloud Systems Pvt Ltd</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">GSTIN: 27AABCO4921E1Z3</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">Bandra-Kurla Complex, Mumbai, MH</p>
</div>
<div className="text-right">
<span className="font-label-caps text-label-caps uppercase text-secondary block">Tax Invoice No.</span>
<span className="font-numeric-table text-numeric-table font-semibold text-on-surface">INV-2025-0891</span>
<span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">Date: 14 Jan 2025</span>
</div>
</div>

<div className="pt-3">
<table className="w-full text-left font-body-sm text-body-sm">
<thead>
<tr className="text-secondary font-label-caps text-label-caps uppercase">
<th className="py-2">Description</th>
<th className="py-2">SAC</th>
<th className="py-2 text-right">Amount (₹)</th>
</tr>
</thead>
<tbody>
<tr>
<td className="py-2.5 text-on-surface">Cloud Infrastructure &amp; SaaS Consulting</td>
<td className="py-2.5 text-on-surface-variant">998313</td>
<td className="py-2.5 text-right font-numeric-table text-numeric-table text-on-surface">2,40,000.00</td>
</tr>
<tr>
<td className="py-2 text-on-surface-variant">CGST (9%)</td>
<td className="py-2 text-on-surface-variant">-</td>
<td className="py-2 text-right font-numeric-table text-numeric-table text-on-surface-variant">21,600.00</td>
</tr>
<tr>
<td className="py-2 text-on-surface-variant">SGST (9%)</td>
<td className="py-2 text-on-surface-variant">-</td>
<td className="py-2 text-right font-numeric-table text-numeric-table text-on-surface-variant">21,600.00</td>
</tr>
</tbody>
<tfoot>
<tr>
<th className="pt-3 font-semibold text-on-surface">Total Payable</th>
<th></th>
<th className="pt-3 text-right font-numeric-table text-numeric-table text-primary font-semibold">₹2,83,200.00</th>
</tr>
</tfoot>
</table>
</div>
</div>
</div>

<div className="mt-6 pt-4 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-emerald-700">check_circle</span>
              GSTIN Active on GSTN Master
            </span>
<span className="font-numeric-table text-numeric-table">Filing Status: GSTR-1 Filed</span>
</div>
</div>

<div className="lg:col-span-7 bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-md flex flex-col justify-between space-y-6">
<div>

<div className="flex items-center justify-between pb-4">
<div>
<span className="font-label-caps text-label-caps uppercase text-secondary">Autonomous Tax Accounting Entry</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Synthesized Fiscal Ledger Record</h3>
</div>
<span className="font-label-caps text-label-caps uppercase px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container">
                Ready for ITR-6 Schedule
              </span>
</div>

<div className="space-y-4 pt-4">

<div className="p-4 bg-surface-container-low rounded-lg flex items-start justify-between">
<div>
<div className="flex items-center gap-2">
<span className="font-headline-sm text-[16px] text-on-surface font-semibold">Input Tax Credit Eligibility</span>
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                      Rule 36(4) Verified
                    </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Matched against GSTR-2B Statement for Jan 2025. Unblocked under Sec 17(5).</p>
</div>
<div className="text-right">
<span className="font-numeric-table text-numeric-table text-emerald-800 font-semibold block">₹43,200.00</span>
<span className="font-label-caps text-label-caps uppercase text-secondary">Eligible ITC</span>
</div>
</div>

<div className="p-4 bg-surface-container-low rounded-lg flex items-start justify-between">
<div>
<div className="flex items-center gap-2">
<span className="font-headline-sm text-[16px] text-on-surface font-semibold">TDS Under Section 194J</span>
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface">
                      Tech Services (2%)
                    </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Sub-clause (ba) applicable. Form 26Q schedule generated for Challan 281.</p>
</div>
<div className="text-right">
<span className="font-numeric-table text-numeric-table text-primary font-semibold block">₹4,800.00</span>
<span className="font-label-caps text-label-caps uppercase text-secondary">TDS Retained</span>
</div>
</div>

<div className="p-4 bg-surface-container-low rounded-lg flex items-start justify-between">
<div>
<div className="flex items-center gap-2">
<span className="font-headline-sm text-[16px] text-on-surface font-semibold">ITR Expense Head Mapping</span>
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface">
                      Schedule P&amp;L Part A
                    </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Directly assigned to 'Software &amp; Server Hosting Fees'. MSME Sec 43B(h) timer armed.</p>
</div>
<div className="text-right">
<span className="font-numeric-table text-numeric-table text-on-surface font-semibold block">₹2,40,000.00</span>
<span className="font-label-caps text-label-caps uppercase text-secondary">Allowable Deduction</span>
</div>
</div>
</div>
</div>

<div className="p-4 bg-surface-container rounded-lg flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">verified</span>
<span className="font-body-sm text-body-sm text-on-surface">Full Audit Trail hash: <code className="font-numeric-table text-numeric-table text-primary">#SHA256:7a9f...32d1</code></span>
</div>
<a className="font-body-sm text-body-sm text-primary hover:text-tertiary font-medium flex items-center gap-1" href="#">
<span>Inspect Raw Voucher</span>
<span className="material-symbols-outlined text-[16px]">open_in_new</span>
</a>
</div>
</div>
</div>
</div>
</section>



<section className="w-full bg-surface-container-low py-20">
<div className="max-w-7xl mx-auto px-6 lg:px-12">

<div className="max-w-3xl mb-12 space-y-3">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Statutory Regime Comparison Engine</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Presumptive vs Regular Corporate Tax Engine</h2>
<p className="font-body-md text-body-md text-on-surface-variant">TaxPilot simultaneously simulates Section 44AD/44ADA Presumptive Taxation against Normal Book Profit with Tax Audit under Section 44AB.</p>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">

<div className="bg-primary p-4 lg:px-8 text-on-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[24px]">recommend</span>
<div>
<span className="font-body-sm text-body-sm font-medium">Optimal Filing Strategy Found:</span>
<span className="font-body-sm text-body-sm opacity-90 block">SME Tax Engine certifies ₹84,600 tax optimization while eliminating mandatory Tax Audit requirement under 44AB.</span>
</div>
</div>
<span className="font-label-caps text-label-caps uppercase bg-on-primary text-primary px-3 py-1.5 rounded shrink-0 font-semibold">Recommended Path</span>
</div>

<div className="overflow-x-auto">
<table className="w-full text-left font-body-sm text-body-sm">
<thead>
<tr className="bg-surface-container text-secondary font-label-caps text-label-caps uppercase">
<th className="py-4 px-6 w-1/3">Provision / Dimension</th>
<th className="py-4 px-6 w-1/3 bg-surface-container-low text-primary font-semibold">Section 44AD / 44ADA Presumptive Mode</th>
<th className="py-4 px-6 w-1/3 text-on-surface">Regular P&amp;L (Audit u/s 44AB)</th>
</tr>
</thead>
<tbody className="divide-y-0">
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="py-4 px-6 font-medium text-on-surface">Turnover / Gross Receipts</td>
<td className="py-4 px-6 bg-surface-container-low/50 font-numeric-table text-numeric-table text-on-surface">₹1,42,80,000 (Digital Banking Turnover)</td>
<td className="py-4 px-6 font-numeric-table text-numeric-table text-on-surface">₹1,42,80,000</td>
</tr>
<tr className="bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<td className="py-4 px-6 font-medium text-on-surface">Allowable Deductions &amp; Expenses</td>
<td className="py-4 px-6 bg-surface-container-low/50 font-body-sm text-body-sm text-on-surface-variant">Deemed Profit rate applied (6% digital, all book expenses deemed claimed)</td>
<td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant">Itemized vouchers required (salaries, depreciation, vendor invoices)</td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="py-4 px-6 font-medium text-on-surface">Computed Taxable Income</td>
<td className="py-4 px-6 bg-surface-container-low/50 font-numeric-table text-numeric-table text-primary font-semibold">₹8,56,800 (6% Deemed Income)</td>
<td className="py-4 px-6 font-numeric-table text-numeric-table text-on-surface">₹11,40,000 (Audited Book Net Profit)</td>
</tr>
<tr className="bg-surface-container-lowest hover:bg-surface-container-low/30 transition-colors">
<td className="py-4 px-6 font-medium text-on-surface">Tax Audit &amp; Form 3CA/3CD</td>
<td className="py-4 px-6 bg-surface-container-low/50 text-emerald-800 font-medium flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Exempt from Section 44AB
                </td>
<td className="py-4 px-6 text-on-surface-variant">Mandatory if profit &lt; 6% or threshold exceeded</td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="py-4 px-6 font-medium text-on-surface">Advance Tax Obligations</td>
<td className="py-4 px-6 bg-surface-container-low/50 text-on-surface">Single payment on or before 15th March</td>
<td className="py-4 px-6 text-on-surface-variant">4 mandatory quarterly installments (15%, 45%, 75%, 100%)</td>
</tr>
<tr className="bg-surface-container font-semibold">
<td className="py-5 px-6 text-on-surface">Net Statutory Tax Liability</td>
<td className="py-5 px-6 bg-surface-container-high font-numeric-table text-numeric-table text-primary text-[16px]">₹89,280 + Surcharge/Cess</td>
<td className="py-5 px-6 font-numeric-table text-numeric-table text-on-surface text-[16px]">₹1,73,880 + CA Audit Cost</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</section>



<section className="w-full bg-[#24170F] text-[#EEE3D6] py-24">
<div className="max-w-7xl mx-auto px-6 lg:px-12">

<div className="max-w-3xl mb-16 space-y-4">
<div className="inline-flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-amber-500"></span>
<span className="font-label-caps text-label-caps uppercase tracking-widest text-[#D8D1C9]">Statutory Safeguards</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-[#EEE3D6]">
          Every rupee of Input Tax Credit backed by evidentiary proof.
        </h2>
<p className="font-body-md text-body-md text-[#D8D1C9] leading-relaxed">
          The Income Tax Department and GSTN now cross-verify company filings through automated data exchanges. TaxPilot insulates your enterprise with three defense sentinels.
        </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

<div className="bg-[#2E1D13] p-8 rounded-xl shadow-lg space-y-4 hover:shadow-xl transition-all">
<div className="w-12 h-12 rounded-lg bg-[#3D271B] flex items-center justify-center text-amber-400 mb-2">
<span className="material-symbols-outlined text-[28px]">block</span>
</div>
<span className="font-label-caps text-label-caps uppercase text-amber-400">Section 17(5) Safeguard</span>
<h3 className="font-headline-sm text-headline-sm text-[#EEE3D6]">Ineligible ITC Segregation</h3>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed">
            Automatically isolates blocked credits under GST law—such as motor vehicles, executive travel, catering, and employee club memberships. Ensures high-risk vouchers never leak into GSTR-3B Table 4(A).
          </p>
<div className="pt-4 flex items-center gap-2 text-[#EEE3D6] font-numeric-table text-numeric-table">
<span className="material-symbols-outlined text-[16px] text-emerald-400">check</span>
            Penalty Notice Exposure: 0%
          </div>
</div>

<div className="bg-[#2E1D13] p-8 rounded-xl shadow-lg space-y-4 hover:shadow-xl transition-all">
<div className="w-12 h-12 rounded-lg bg-[#3D271B] flex items-center justify-center text-amber-400 mb-2">
<span className="material-symbols-outlined text-[28px]">hourglass_top</span>
</div>
<span className="font-label-caps text-label-caps uppercase text-amber-400">Section 43B(h) Enforcement</span>
<h3 className="font-headline-sm text-headline-sm text-[#EEE3D6]">Delayed MSME Payment Tracker</h3>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed">
            Tracks registered micro and small enterprise suppliers against the mandatory 45-day payment statutory window. Prevents sudden expense disallowances and retrospective interest liabilities in your taxable P&amp;L.
          </p>
<div className="pt-4 flex items-center gap-2 text-[#EEE3D6] font-numeric-table text-numeric-table">
<span className="material-symbols-outlined text-[16px] text-emerald-400">check</span>
            UDYAM Verification Synced
          </div>
</div>

<div className="bg-[#2E1D13] p-8 rounded-xl shadow-lg space-y-4 hover:shadow-xl transition-all">
<div className="w-12 h-12 rounded-lg bg-[#3D271B] flex items-center justify-center text-amber-400 mb-2">
<span className="material-symbols-outlined text-[28px]">policy</span>
</div>
<span className="font-label-caps text-label-caps uppercase text-amber-400">Sec 194C vs 194J Arbiter</span>
<h3 className="font-headline-sm text-headline-sm text-[#EEE3D6]">TDS Misclassification Sentinel</h3>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed">
            Detects common disputes between 1%–2% contractor rates (194C) and 10% technical service rates (194J). Automatically correlates vendor invoice scope clauses with AIS reporting to eliminate Sec 201 interest demands.
          </p>
<div className="pt-4 flex items-center gap-2 text-[#EEE3D6] font-numeric-table text-numeric-table">
<span className="material-symbols-outlined text-[16px] text-emerald-400">check</span>
            AIS Discrepancy Prevention
          </div>
</div>
</div>
</div>
</section>



<section className="w-full bg-surface py-20">
<div className="max-w-7xl mx-auto px-6 lg:px-12">

<div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
<div className="space-y-3 max-w-2xl">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">The Enterprise Dashboard</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Unified SME Collaborative Workspace</h2>
<p className="font-body-md text-body-md text-on-surface-variant">A shared, high-security command center for founders, internal finance leads, and external audit partners.</p>
</div>
<div className="flex items-center gap-3 shrink-0">
<button className="bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors inline-flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">person_add</span>
            Invite External CA
          </button>
<button className="bg-primary-container hover:bg-tertiary-container text-on-primary font-body-sm text-body-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors inline-flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">download</span>
            Download Audit Schedule
          </button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden">

<div className="bg-surface-container p-6 flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-serif text-[18px] font-bold">
              ND
            </div>
<div>
<div className="flex items-center gap-2">
<h3 className="font-headline-sm text-[18px] text-on-surface font-semibold">Nexus Digital Labs Private Limited</h3>
<span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Active Corp</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">GSTIN: 27AABCN1234F1Z5 • PAN: AABCN1234F • ROC Mumbai</p>
</div>
</div>
<div className="flex items-center gap-4">
<div className="text-right">
<span className="font-label-caps text-label-caps uppercase text-secondary">Filing Window Status</span>
<span className="font-body-sm text-body-sm text-on-surface font-medium block">Q4 Advance Tax Due in 18 Days</span>
</div>
<span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
</div>
</div>

<div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0">
<div className="p-6 space-y-1">
<span className="font-label-caps text-label-caps uppercase text-secondary">Aggregate Turnover</span>
<div className="font-numeric-table text-headline-sm font-headline-sm text-on-surface font-semibold">₹1,42,80,000</div>
<span className="font-body-sm text-body-sm text-emerald-700 flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              +24% vs FY24
            </span>
</div>
<div className="p-6 space-y-1">
<span className="font-label-caps text-label-caps uppercase text-secondary">Net Profit Margin</span>
<div className="font-numeric-table text-headline-sm font-headline-sm text-on-surface font-semibold">18.4%</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">Post-depreciation</span>
</div>
<div className="p-6 space-y-1">
<span className="font-label-caps text-label-caps uppercase text-secondary">Eligible ITC Claimed</span>
<div className="font-numeric-table text-headline-sm font-headline-sm text-emerald-800 font-semibold">₹8,64,200</div>
<span className="font-body-sm text-body-sm text-emerald-700">100% GSTR-2B Verified</span>
</div>
<div className="p-6 space-y-1">
<span className="font-label-caps text-label-caps uppercase text-secondary">TDS Receivable Asset</span>
<div className="font-numeric-table text-headline-sm font-headline-sm text-primary font-semibold">₹3,20,500</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">Matched with 26AS Part A</span>
</div>
</div>

<div className="p-6 lg:p-8 bg-surface-container-low">
<h4 className="font-headline-sm text-[16px] text-on-surface font-semibold mb-4">Statutory Document Reconciliation Health</h4>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm space-y-2">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-secondary">Purchase Invoices</span>
<span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
</div>
<div className="font-numeric-table text-headline-sm text-[18px] text-on-surface font-medium">842 Synced</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">OCR extracted &amp; categorized</p>
</div>
<div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm space-y-2">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-secondary">GSTR-2B Auto-Fetch</span>
<span className="material-symbols-outlined text-emerald-600 text-[18px]">sync</span>
</div>
<div className="font-numeric-table text-headline-sm text-[18px] text-emerald-800 font-medium">Reconciled</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Zero credit lapses detected</p>
</div>
<div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm space-y-2">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-secondary">Form 26AS Ledger</span>
<span className="material-symbols-outlined text-emerald-600 text-[18px]">fact_check</span>
</div>
<div className="font-numeric-table text-headline-sm text-[18px] text-on-surface font-medium">Matched</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">₹3,20,500 credit unblocked</p>
</div>
<div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm space-y-2">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-secondary">Bank Statements</span>
<span className="material-symbols-outlined text-emerald-600 text-[18px]">account_balance</span>
</div>
<div className="font-numeric-table text-headline-sm text-[18px] text-on-surface font-medium">12 / 12 Months</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">All payouts classified</p>
</div>
</div>
</div>
</div>
</div>
</section>



<section className="w-full bg-surface-container-low py-20">
<div className="max-w-7xl mx-auto px-6 lg:px-12">

<div className="max-w-3xl mb-14 space-y-3">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Domain Specific Tax Architectures</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Engineered for your exact commercial model</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Whether you are building cross-border cloud software, scaling multi-channel physical goods, or running a specialized advisory firm.</p>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

<div className="bg-surface-container-lowest p-8 rounded-xl shadow-md flex flex-col justify-between space-y-6">
<div className="space-y-4">
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[28px]">code</span>
</div>
<span className="font-label-caps text-label-caps uppercase text-secondary">Venture-Backed &amp; Bootstrapped Tech</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">The Modern SaaS &amp; Tech Startup</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Handles multi-currency Stripe/Razorpay invoicing (USD, EUR, INR) with LUT exports under zero-rated GST. Tracks ESOP vesting perquisite taxes under Section 17(2) and prepares compliance filings for Section 80-IAC 3-year tax holidays.
            </p>
</div>
<div className="pt-4 space-y-2">
<div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">done</span>
              LUT &amp; FIRC Export Reconciliation
            </div>
<div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">done</span>
              ESOP Perquisite Tax Deductions
            </div>
<div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">done</span>
              Section 80-IAC Holiday Modeling
            </div>
</div>
</div>

<div className="bg-surface-container-lowest p-8 rounded-xl shadow-md flex flex-col justify-between space-y-6">
<div className="space-y-4">
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[28px]">storefront</span>
</div>
<span className="font-label-caps text-label-caps uppercase text-secondary">Omnichannel Commerce</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">The D2C &amp; Omnichannel Brand</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Consolidates multi-state GSTIN filings across warehouses (Amazon FBA, Delhivery, Shopify). Reconciles marketplace TCS (Tax Collected at Source u/s 52) against cash payouts and automates Section 43B inventory write-downs.
            </p>
</div>
<div className="pt-4 space-y-2">
<div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">done</span>
              Amazon &amp; Flipkart TCS Recovery
            </div>
<div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">done</span>
              Cross-State Stock Transfer Accounting
            </div>
<div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">done</span>
              Damaged / Expired Inventory Write-Offs
            </div>
</div>
</div>

<div className="bg-surface-container-lowest p-8 rounded-xl shadow-md flex flex-col justify-between space-y-6">
<div className="space-y-4">
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[28px]">design_services</span>
</div>
<span className="font-label-caps text-label-caps uppercase text-secondary">Consulting, Legal &amp; Creative</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Professional Services &amp; Agencies</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Maximizes Section 44ADA presumptive 50% profit recognition for eligible professions with receipts up to ₹75 Lakhs. Reconciles aggressive 10% client TDS deductions u/s 194J and manages partner drawings and remuneration under Section 40(b).
            </p>
</div>
<div className="pt-4 space-y-2">
<div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">done</span>
              Section 44ADA 50% Benchmark Engine
            </div>
<div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">done</span>
              Partner Remuneration u/s 40(b)
            </div>
<div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">done</span>
              High-Value TDS Refund Acceleration
            </div>
</div>
</div>
</div>
</div>
</section>



<section className="w-full bg-[#24170F] text-[#EEE3D6] py-24">
<div className="max-w-4xl mx-auto px-6 lg:px-12 text-center space-y-8">
<div className="inline-flex items-center gap-2">
<span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
<span className="font-label-caps text-label-caps uppercase tracking-widest text-[#D8D1C9]">Enterprise Fiscal Architecture</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-[#EEE3D6] leading-tight">
        Streamline your enterprise tax governance with absolute certainty.
      </h2>
<p className="font-body-lg text-body-lg text-[#D8D1C9] max-w-2xl mx-auto leading-relaxed">
        Deploy TaxPilot alongside your existing accounting stack. Protect every Input Tax Credit rupee, eliminate audit notice exposure, and file on schedule.
      </p>
<div className="flex flex-wrap items-center justify-center gap-4 pt-4">
<a className="bg-[#EEE3D6] hover:bg-[#DFD2C2] text-[#24170F] font-body-sm text-body-sm font-semibold px-8 py-3.5 rounded-lg shadow-md transition-all duration-150 inline-flex items-center gap-2" href="#">
<span>Create your SME workspace</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
<a className="bg-transparent hover:bg-[#342318] text-[#EEE3D6] font-body-sm text-body-sm font-medium px-8 py-3.5 rounded-lg shadow-sm transition-all duration-150 inline-flex items-center gap-2" href="#">
<span className="material-symbols-outlined text-[18px]">calendar_month</span>
<span>Book an Enterprise Architecture Demo</span>
</a>
</div>
<div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-[#D8D1C9] font-body-sm text-body-sm">
<span className="flex items-center gap-2">
<span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          ITD &amp; GSTN Compliant API
        </span>
<span className="flex items-center gap-2">
<span className="material-symbols-outlined text-emerald-400 text-[18px]">lock</span>
          256-Bit Encrypted Ledger Vault
        </span>
<span className="flex items-center gap-2">
<span className="material-symbols-outlined text-emerald-400 text-[18px]">support_agent</span>
          Dedicated CA Concierge Support
        </span>
</div>
</div>
</section>
</div></main><Footer />
    </>
  );
}
