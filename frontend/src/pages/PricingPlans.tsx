import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


export default function PricingPlans() {
  return (
    <>
      
<Navbar />
<main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]"><div className="flex flex-col w-full">

<section className="relative px-6 lg:px-12 py-16 lg:py-24 bg-surface max-w-7xl mx-auto w-full">

<div className="flex items-center gap-3 mb-6">
<span className="inline-flex items-center px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-label-caps text-label-caps tracking-widest uppercase">
        Statutory Pricing Architecture · AY 2026–27 · FY 2025–26
      </span>
<span className="h-px bg-outline-variant flex-1 max-w-xs"></span>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
<div className="lg:col-span-8 space-y-4">
<h1 className="font-display-hero text-display-hero-mobile lg:text-display-hero text-on-surface tracking-tight font-serif leading-[1.08]">
          Clear statutory pricing.<br/>
<span className="italic font-normal text-secondary">Zero hidden filing surcharges.</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
          Whether filing simple salary returns with dual-regime optimization, cross-reconciling complex multi-broker capital gains, or auditing enterprise GSTR-2B ledgers—pay only for the deterministic computational depth you require.
        </p>
</div>

<div className="lg:col-span-4 flex flex-col gap-2.5 bg-surface-container p-5 rounded-lg border border-outline-variant/60 shadow-sm">
<div className="flex items-center gap-2.5 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-primary text-[18px]">verified</span>
<span>100% Deterministic Filing Guarantee</span>
</div>
<div className="flex items-center gap-2.5 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-primary text-[18px]">lock_reset</span>
<span>Zero Dark Patterns · Flat Fixed Fees</span>
</div>
<div className="flex items-center gap-2.5 text-on-surface font-body-sm text-body-sm">
<span className="material-symbols-outlined text-primary text-[18px]">gavel</span>
<span>Court-Admissible SHA-256 Audit Packet</span>
</div>
</div>
</div>

<div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-surface-container-low border border-outline-variant">
<div className="flex items-center gap-3">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Billing Cadence</span>
<span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
<span className="font-body-sm text-body-sm text-on-surface">Lock rates before statutory peak-window deadline</span>
</div>

<div className="inline-flex items-center p-1 rounded-lg bg-surface-container-high border border-outline-variant/70" id="billing-toggle-container">
<button className="px-4 py-2 text-body-sm font-body-sm font-medium rounded transition-all bg-primary-container text-on-primary shadow-sm flex items-center gap-2" id="btn-prepaid" type="button">
<span>Pre-Filing Pass</span>
<span className="font-label-caps text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded tracking-wider uppercase">Save 20%</span>
</button>
<button className="px-4 py-2 text-body-sm font-body-sm font-medium rounded text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-2" id="btn-standard" type="button">
<span>Per Assessment Year</span>
</button>
</div>
</div>
</section>

<section className="px-6 lg:px-12 pb-20 bg-surface max-w-7xl mx-auto w-full">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">

<div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative">
<div className="space-y-4">
<div className="flex justify-between items-start">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">ITR-1 / ITR-2 Basic</span>
<span className="text-on-surface-variant text-[11px] font-mono">SCHEDULE-S</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">Individual Salaried</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
              For professionals with Form 16, interest earnings, and single/multiple house properties.
            </p>
</div>
<div className="pt-3 border-t border-outline-variant/60">
<div className="flex items-baseline gap-1.5">
<span className="font-display-hero text-[38px] leading-tight font-serif text-on-surface plan-price" data-prepaid="₹799" data-regular="₹999">₹799</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">/ return</span>
</div>
<p className="font-label-caps text-[11px] text-primary mt-1 price-subtext">Prepaid Pass · Save ₹200</p>
</div>
<ul className="space-y-2.5 pt-4 text-body-sm font-body-sm text-on-surface">
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Dual-Regime (115BAC vs Old) Arbitrage Engine</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Multi-Form 16 optical OCR &amp; deduplication</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Bank Interest (AIS SFT-006) 3-way match</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Standard deduction (₹75k) &amp; Sec 87A rebate</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Direct Aadhaar OTP e-filing pipeline</span>
</li>
</ul>
</div>
<div className="pt-8">
<a className="w-full bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline font-body-sm text-body-sm font-medium py-2.5 px-4 rounded text-center transition-all inline-block" href="#">
            Get Started with Salaried
          </a>
</div>
</div>

<div className="bg-surface-container-lowest border-2 border-primary-container rounded-lg p-6 flex flex-col justify-between shadow-lg relative transform lg:-translate-y-2">
<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary px-3 py-0.5 rounded-full font-label-caps text-label-caps uppercase tracking-wider shadow-sm whitespace-nowrap">
          Most Popular for Tech &amp; Markets
        </div>
<div className="space-y-4">
<div className="flex justify-between items-start pt-1">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-primary font-semibold">ITR-2 Advanced / Schedule FA</span>
<span className="text-primary font-mono text-[11px]">CAP-GAIN+</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">Premier Investor &amp; ESOP</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
              Equities, derivatives, crypto VDAs, foreign shares (US ESPP/RSU), and multi-broker books.
            </p>
</div>
<div className="pt-3 border-t border-primary-container/30">
<div className="flex items-baseline gap-1.5">
<span className="font-display-hero text-[38px] leading-tight font-serif text-on-surface plan-price" data-prepaid="₹1,999" data-regular="₹2,499">₹1,999</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">/ return</span>
</div>
<p className="font-label-caps text-[11px] text-primary font-semibold mt-1 price-subtext">Prepaid Pass · Save ₹500</p>
</div>
<ul className="space-y-2.5 pt-4 text-body-sm font-body-sm text-on-surface">
<li className="flex items-start gap-2.5 font-medium text-primary">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">add_circle</span>
<span>All Salaried Capabilities, plus:</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Unlimited broker ingestion (Zerodha, Groww, Angel, ICICI)</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Sec 112A grandfathering &amp; FY25 budget rate math (12.5% vs 20%)</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Schedule FA &amp; FSI compliance (Foreign Assets Act insulated)</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Evidentiary Audit Defense Packet (PDF + SHA-256)</span>
</li>
</ul>
</div>
<div className="pt-8">
<a className="w-full bg-primary-container hover:bg-tertiary-container text-on-primary font-body-sm text-body-sm font-medium py-3 px-4 rounded text-center transition-all shadow inline-block" href="#">
            Choose Premier Investor
          </a>
</div>
</div>

<div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative">
<div className="space-y-4">
<div className="flex justify-between items-start">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">ITR-3 / ITR-4 Presumptive</span>
<span className="text-on-surface-variant text-[11px] font-mono">SEC-44ADA</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">SME &amp; Presumptive</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
              Freelancers, tech consultants, agencies, boutique clinics, and businesses &lt; ₹3 Cr turnover.
            </p>
</div>
<div className="pt-3 border-t border-outline-variant/60">
<div className="flex items-baseline gap-1.5">
<span className="font-display-hero text-[38px] leading-tight font-serif text-on-surface plan-price" data-prepaid="₹4,999" data-regular="₹5,999">₹4,999</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">/ return</span>
</div>
<p className="font-label-caps text-[11px] text-primary mt-1 price-subtext">Prepaid Pass · Save ₹1,000</p>
</div>
<ul className="space-y-2.5 pt-4 text-body-sm font-body-sm text-on-surface">
<li className="flex items-start gap-2.5 font-medium text-secondary">
<span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">add_circle</span>
<span>All Investor Capabilities, plus:</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>44ADA (50% profit) vs 44AB CA Audit decision engine</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>GSTR-2B vs 3B vs Purchase Register 3-way ITC match</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Section 43B(h) MSME 45-day vendor payment audit</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Quarterly Advance Tax scheduler (Sec 234B/C mitigation)</span>
</li>
</ul>
</div>
<div className="pt-8">
<a className="w-full bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline font-body-sm text-body-sm font-medium py-2.5 px-4 rounded text-center transition-all inline-block" href="#">
            Select SME &amp; Presumptive
          </a>
</div>
</div>

<div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative">
<div className="space-y-4">
<div className="flex justify-between items-start">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Multi-Client Practice</span>
<span className="text-on-surface-variant text-[11px] font-mono">CA-COCKPIT</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">CA Firm Cockpit</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
              Chartered accountants and tax advisory boutiques managing extensive client portfolios.
            </p>
</div>
<div className="pt-3 border-t border-outline-variant/60">
<div className="flex items-baseline gap-1.5">
<span className="font-display-hero text-[38px] leading-tight font-serif text-on-surface plan-price" data-prepaid="₹14,999" data-regular="₹14,999">₹14,999</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">/ year</span>
</div>
<p className="font-label-caps text-[11px] text-secondary mt-1">Includes 25 client returns · then ₹399/return</p>
</div>
<ul className="space-y-2.5 pt-4 text-body-sm font-body-sm text-on-surface">
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Collaborative practice console with role access</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Bulk PAN AIS/TIS batch ingestion &amp; discrepancies</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>White-label client audit packets &amp; 3CD working papers</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>DSC batch hardware signing integration</span>
</li>
<li className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check</span>
<span>Dedicated Partner Relationship Manager</span>
</li>
</ul>
</div>
<div className="pt-8">
<a className="w-full bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline font-body-sm text-body-sm font-medium py-2.5 px-4 rounded text-center transition-all inline-block" href="#">
            Contact Firm Advisory
          </a>
</div>
</div>
</div>
</section>

<section className="px-6 lg:px-12 py-16 bg-surface-container-low border-y border-outline-variant">
<div className="max-w-7xl mx-auto">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
<div>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Deterministic Legal Assurances</span>
<h2 className="font-headline-md text-headline-md text-on-surface font-serif mt-1">Specialized Advisory &amp; Defense Add-Ons</h2>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
          Fixed hourly and per-case transparent rates. No open-ended billable retainers or ambiguous consultation estimates.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant flex flex-col justify-between">
<div>
<div className="flex justify-between items-start mb-3">
<span className="material-symbols-outlined text-primary text-[28px]">support_agent</span>
<span className="font-headline-sm text-headline-sm font-serif text-on-surface">₹1,499</span>
</div>
<h4 className="font-headline-sm text-[18px] text-on-surface font-serif mb-2">1-on-1 Senior CA Review</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              45-minute structured video session with an Empanelled CA. Comprehensive review of Schedule FA, capital gain carryforwards, or disputed withholding.
            </p>
</div>
<div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between text-body-sm font-body-sm">
<span className="text-on-surface-variant">Per 45-min consultation</span>
<a className="text-primary font-medium hover:underline flex items-center gap-1" href="#">Book Session <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant flex flex-col justify-between">
<div>
<div className="flex justify-between items-start mb-3">
<span className="material-symbols-outlined text-primary text-[28px]">policy</span>
<span className="font-headline-sm text-headline-sm font-serif text-on-surface">₹2,999</span>
</div>
<h4 className="font-headline-sm text-[18px] text-on-surface font-serif mb-2">Notice Defense u/s 143(1) &amp; 139(9)</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              Detailed evidentiary rebuttal docket generation for ITD automated adjustment intimations or defective return notifications with legal section precedents.
            </p>
</div>
<div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between text-body-sm font-body-sm">
<span className="text-on-surface-variant">Per formal response filing</span>
<a className="text-primary font-medium hover:underline flex items-center gap-1" href="#">Retain Defense <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant flex flex-col justify-between">
<div>
<div className="flex justify-between items-start mb-3">
<span className="material-symbols-outlined text-primary text-[28px]">history_edu</span>
<span className="font-headline-sm text-headline-sm font-serif text-on-surface">₹1,999</span>
</div>
<h4 className="font-headline-sm text-[18px] text-on-surface font-serif mb-2">Updated Return (ITR-U) Filing</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              Rectification and backdated statutory reporting under Section 139(8A) for the preceding 24 months to address undeclared capital gains or AIS mismatches.
            </p>
</div>
<div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between text-body-sm font-body-sm">
<span className="text-on-surface-variant">Per historical assessment year</span>
<a className="text-primary font-medium hover:underline flex items-center gap-1" href="#">File ITR-U <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
</div>
</div>
</div>
</div>
</section>

<section className="px-6 lg:px-12 py-20 bg-surface max-w-7xl mx-auto w-full">
<div className="mb-10 text-center max-w-2xl mx-auto">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Specification Index</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface font-serif mt-1">Granular Computational Capabilities</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">
        Compare core mathematical engines, documentary ingestion limits, and evidentiary guarantees side-by-side.
      </p>
</div>

<div className="overflow-x-auto border border-outline-variant rounded-lg bg-surface-container-lowest shadow-sm">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container border-b border-outline-variant">
<th className="p-4 pl-6 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant w-1/3">Statutory Specification</th>
<th className="p-4 text-center font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Salaried</th>
<th className="p-4 text-center font-label-caps text-label-caps uppercase tracking-wider text-primary font-bold bg-secondary-container/40">Investor</th>
<th className="p-4 text-center font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">SME / 44ADA</th>
<th className="p-4 pr-6 text-center font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">CA Cockpit</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/60 font-body-sm text-body-sm">

<tr className="bg-surface-container-low/60 font-medium">
<td className="p-3 pl-6 font-label-caps text-label-caps tracking-wider text-secondary uppercase" colSpan={5}>
              1. Document Ingestion &amp; Intelligence
            </td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Supported Form 16 Uploads</td>
<td className="p-3.5 text-center text-on-surface">Up to 3 Employers</td>
<td className="p-3.5 text-center text-on-surface bg-secondary-container/10 font-medium">Unlimited</td>
<td className="p-3.5 text-center text-on-surface">Unlimited</td>
<td className="p-3.5 pr-6 text-center text-on-surface">Batch Multi-Client</td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Broker Capital Gain Statements</td>
<td className="p-3.5 text-center text-on-surface-variant">—</td>
<td className="p-3.5 text-center text-on-surface bg-secondary-container/10 font-medium">Native (All Indian Brokers)</td>
<td className="p-3.5 text-center text-on-surface">Native (All Brokers)</td>
<td className="p-3.5 pr-6 text-center text-on-surface">Bulk Ingest + Custom CSV</td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Automated OCR PII Redaction</td>
<td className="p-3.5 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 text-center bg-secondary-container/10"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 pr-6 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
</tr>

<tr className="bg-surface-container-low/60 font-medium">
<td className="p-3 pl-6 font-label-caps text-label-caps tracking-wider text-secondary uppercase" colSpan={5}>
              2. Math &amp; Provision Engines
            </td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Dual Regime (115BAC vs Old) Comparison</td>
<td className="p-3.5 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 text-center bg-secondary-container/10"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 pr-6 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Sec 112A Grandfathering &amp; Bonus Stripping</td>
<td className="p-3.5 text-center text-on-surface-variant">—</td>
<td className="p-3.5 text-center text-on-surface bg-secondary-container/10 font-medium"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 pr-6 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Foreign RSUs / Schedule FA (Peak FMV &amp; WHT)</td>
<td className="p-3.5 text-center text-on-surface-variant">—</td>
<td className="p-3.5 text-center text-on-surface bg-secondary-container/10 font-medium"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 pr-6 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Presumptive Business 44AD / 44ADA Schedules</td>
<td className="p-3.5 text-center text-on-surface-variant">—</td>
<td className="p-3.5 text-center text-on-surface-variant bg-secondary-container/10">—</td>
<td className="p-3.5 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 pr-6 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
</tr>

<tr className="bg-surface-container-low/60 font-medium">
<td className="p-3 pl-6 font-label-caps text-label-caps tracking-wider text-secondary uppercase" colSpan={5}>
              3. Cross-Reconciliation &amp; Compliance
            </td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Form 26AS vs AIS vs TIS Variance Engine</td>
<td className="p-3.5 text-center text-on-surface">Basic (TDS Match)</td>
<td className="p-3.5 text-center text-on-surface bg-secondary-container/10 font-medium">Comprehensive (SFT + TDS)</td>
<td className="p-3.5 text-center text-on-surface">Complete (194J/C + SFT)</td>
<td className="p-3.5 pr-6 text-center text-on-surface">Automated Batch Rule Run</td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">GST ITC Reconciliation (Rule 36(4))</td>
<td className="p-3.5 text-center text-on-surface-variant">—</td>
<td className="p-3.5 text-center text-on-surface-variant bg-secondary-container/10">—</td>
<td className="p-3.5 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 pr-6 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Section 43B(h) MSME 45-day Disallowance Trace</td>
<td className="p-3.5 text-center text-on-surface-variant">—</td>
<td className="p-3.5 text-center text-on-surface-variant bg-secondary-container/10">—</td>
<td className="p-3.5 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 pr-6 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
</tr>

<tr className="bg-surface-container-low/60 font-medium">
<td className="p-3 pl-6 font-label-caps text-label-caps tracking-wider text-secondary uppercase" colSpan={5}>
              4. Evidence &amp; Filing Support
            </td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Court-Admissible SHA-256 Audit Packet</td>
<td className="p-3.5 text-center text-on-surface-variant">—</td>
<td className="p-3.5 text-center bg-secondary-container/10"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 text-center"><span className="material-symbols-outlined text-emerald-700 text-[18px]">check</span></td>
<td className="p-3.5 pr-6 text-center text-on-surface">White-label Firm Branded</td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Direct ITD Gateway e-Filing</td>
<td className="p-3.5 text-center text-on-surface">Aadhaar OTP</td>
<td className="p-3.5 text-center text-on-surface bg-secondary-container/10 font-medium">Aadhaar OTP / NetBanking</td>
<td className="p-3.5 text-center text-on-surface">Aadhaar / DSC</td>
<td className="p-3.5 pr-6 text-center text-on-surface">Bulk Batch DSC Signing</td>
</tr>
<tr>
<td className="p-3.5 pl-6 text-on-surface">Customer Support SLA</td>
<td className="p-3.5 text-center text-on-surface-variant">24h Email Response</td>
<td className="p-3.5 text-center text-on-surface bg-secondary-container/10 font-medium">4h Priority Chat &amp; Email</td>
<td className="p-3.5 text-center text-on-surface">2h Dedicated Lead</td>
<td className="p-3.5 pr-6 text-center text-on-surface">15m Dedicated Phone / WA</td>
</tr>
</tbody>
</table>
</div>
</section>

<section className="w-full bg-[#1E1714] text-[#EEE3D6] py-20 px-6 lg:px-12">
<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
<div className="lg:col-span-7 space-y-6">
<div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#342318] border border-[#5A4535] text-[#D8D1C9] font-label-caps text-label-caps uppercase tracking-wider">
          Enterprise Payroll · Form 12BB Automation
        </div>
<h2 className="font-headline-lg text-headline-lg text-[#EEE3D6] font-serif leading-tight">
          Automate tax regime arbitrage across your entire workforce.
        </h2>
<p className="font-body-lg text-body-lg text-[#D8D1C9] leading-relaxed max-w-xl">
          Empower 500 to 50,000+ employees with automated dual-regime simulations, instant Form 12BB proof validation, and zero HR spreadsheet overhead.
        </p>

<div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#5A4535]">
<div>
<div className="font-display-hero text-[36px] font-serif text-[#EEE3D6] leading-none">99.4%</div>
<div className="font-label-caps text-[11px] text-[#D8D1C9] uppercase mt-2">Employee Satisfaction</div>
</div>
<div>
<div className="font-display-hero text-[36px] font-serif text-[#EEE3D6] leading-none">₹3,400</div>
<div className="font-label-caps text-[11px] text-[#D8D1C9] uppercase mt-2">Avg. Tax Saved / Head</div>
</div>
<div>
<div className="font-display-hero text-[36px] font-serif text-[#EEE3D6] leading-none">0 hrs</div>
<div className="font-label-caps text-[11px] text-[#D8D1C9] uppercase mt-2">Manual Proof Verification</div>
</div>
</div>
<div className="flex flex-wrap gap-4 pt-4">
<a className="bg-[#EEE3D6] hover:bg-[#DFD2C2] text-[#24170F] font-body-sm text-body-sm font-medium px-6 py-3 rounded transition-colors inline-flex items-center gap-2" href="#">
<span>Schedule Enterprise Demo</span>
<span className="material-symbols-outlined text-[18px]">calendar_today</span>
</a>
<a className="bg-transparent hover:bg-[#342318] text-[#EEE3D6] border border-[#5A4535] font-body-sm text-body-sm font-medium px-6 py-3 rounded transition-colors inline-flex items-center gap-2" href="#">
<span>Download Payroll Whitepaper</span>
<span className="material-symbols-outlined text-[18px]">download</span>
</a>
</div>
</div>

<div className="lg:col-span-5 bg-[#2A1E18] border border-[#5A4535] rounded-lg p-6 space-y-5">
<div className="flex items-center justify-between pb-3 border-b border-[#5A4535]">
<span className="font-label-caps text-[11px] uppercase tracking-wider text-[#D8D1C9]">Batch Verification Terminal</span>
<span className="flex items-center gap-1.5 font-label-caps text-[10px] text-emerald-400">
<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE 12BB PIPELINE
          </span>
</div>
<div className="space-y-3 font-mono text-body-sm text-xs">
<div className="p-3 rounded bg-[#1E1714] border border-[#5A4535] flex items-center justify-between">
<div className="space-y-1">
<span className="text-[#EEE3D6] block">HRA Rent Receipt Validation</span>
<span className="text-[#84746c] text-[10px]">PAN owner check u/s 10(13A)</span>
</div>
<span className="text-emerald-400 font-semibold text-[11px]">VERIFIED (1,248)</span>
</div>
<div className="p-3 rounded bg-[#1E1714] border border-[#5A4535] flex items-center justify-between">
<div className="space-y-1">
<span className="text-[#EEE3D6] block">Home Loan Interest (Sec 24b)</span>
<span className="text-[#84746c] text-[10px]">Lender provisional certificate OCR</span>
</div>
<span className="text-emerald-400 font-semibold text-[11px]">RECONCILED (412)</span>
</div>
<div className="p-3 rounded bg-[#1E1714] border border-[#5A4535] flex items-center justify-between">
<div className="space-y-1">
<span className="text-[#EEE3D6] block">Dual-Regime Switch Optimizer</span>
<span className="text-[#84746c] text-[10px]">Form 10-IEA status check</span>
</div>
<span className="text-[#f7b995] font-semibold text-[11px]">OPTIMIZED (3,890)</span>
</div>
</div>
<div className="p-3 bg-[#342318] rounded border border-[#5A4535]/80 text-[#D8D1C9] text-xs leading-relaxed italic">
          "Integrated seamlessly with our Darwinbox &amp; Workday payroll cycles. Reduced our January tax declaration grievance tickets by 86%."
          <span className="block not-italic font-medium text-[#EEE3D6] mt-1.5">— VP People Operations, Tier-1 FinTech Unicorn</span>
</div>
</div>
</div>
</section>

<section className="px-6 lg:px-12 py-20 bg-surface max-w-4xl mx-auto w-full">
<div className="mb-12 text-center">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Inquiries &amp; Protocols</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface font-serif mt-1">Frequently Examined Questions</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">
        Transparent answers regarding plan upgrades, statutory updates, and audit representation.
      </p>
</div>
<div className="space-y-4">

<div className="border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden">
<button className="faq-toggle w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-surface-container-low transition-colors" type="button">
<span className="font-headline-sm text-[18px] text-on-surface font-serif">Are there any hidden fees if my return requires ITR-2 instead of ITR-1?</span>
<span className="material-symbols-outlined text-secondary transition-transform faq-icon">expand_more</span>
</button>
<div className="faq-content hidden p-5 pt-0 text-on-surface-variant font-body-sm text-body-sm leading-relaxed border-t border-outline-variant/40">
          No. TaxPilot operates on explicit, predetermined pricing. If you initially begin on the Salaried plan and subsequent Form 16 or broker statements reveal capital gains or foreign equity that necessitate an ITR-2 or Schedule FA, you only pay the incremental price differential. We never charge ad-hoc filing penalties or unexpected gateway surcharges.
        </div>
</div>

<div className="border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden">
<button className="faq-toggle w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-surface-container-low transition-colors" type="button">
<span className="font-headline-sm text-[18px] text-on-surface font-serif">How does TaxPilot guarantee compliance with the Finance Act 2024 amendments?</span>
<span className="material-symbols-outlined text-secondary transition-transform faq-icon">expand_more</span>
</button>
<div className="faq-content hidden p-5 pt-0 text-on-surface-variant font-body-sm text-body-sm leading-relaxed border-t border-outline-variant/40">
          Our computation engine is hardcoded to comply with all Finance (No. 2) Act 2024 statutory shifts: including the revision of long-term capital gains tax to 12.5%, short-term capital gains on listed securities to 20% post-July 23, 2024, the enhancement of standard deduction to ₹75,000 under the New Tax Regime (Section 115BAC), and revised slab thresholds.
        </div>
</div>

<div className="border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden">
<button className="faq-toggle w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-surface-container-low transition-colors" type="button">
<span className="font-headline-sm text-[18px] text-on-surface font-serif">What happens if the Income Tax Department issues a defective notice under Section 139(9)?</span>
<span className="material-symbols-outlined text-secondary transition-transform faq-icon">expand_more</span>
</button>
<div className="faq-content hidden p-5 pt-0 text-on-surface-variant font-body-sm text-body-sm leading-relaxed border-t border-outline-variant/40">
          Every tax return prepared by TaxPilot undergoes deterministic structural validation against the Income Tax Department’s official JSON schema before transmission. If a notice arises due to discrepancy between employer-reported TDS and Form 26AS, our platform provides our court-admissible Audit Defense Packet and guides response filing under our dedicated notice defense protocol.
        </div>
</div>

<div className="border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden">
<button className="faq-toggle w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-surface-container-low transition-colors" type="button">
<span className="font-headline-sm text-[18px] text-on-surface font-serif">Is my financial data stored or used to train external artificial intelligence models?</span>
<span className="material-symbols-outlined text-secondary transition-transform faq-icon">expand_more</span>
</button>
<div className="faq-content hidden p-5 pt-0 text-on-surface-variant font-body-sm text-body-sm leading-relaxed border-t border-outline-variant/40">
          Strictly no. TaxPilot implements zero-retention cryptographic data sovereignty. We utilize deterministic mathematical rules rather than probabilistic large language models for tax computation. Your PAN, salary registers, broker P&amp;L ledgers, and AIS extracts are encrypted at rest with AES-256 and never retained beyond statutory audit retention guidelines or used for model training.
        </div>
</div>

<div className="border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden">
<button className="faq-toggle w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-surface-container-low transition-colors" type="button">
<span className="font-headline-sm text-[18px] text-on-surface font-serif">Can Chartered Accountants use their own Digital Signature Certificate (DSC) tokens?</span>
<span className="material-symbols-outlined text-secondary transition-transform faq-icon">expand_more</span>
</button>
<div className="faq-content hidden p-5 pt-0 text-on-surface-variant font-body-sm text-body-sm leading-relaxed border-t border-outline-variant/40">
          Yes. The CA Firm Cockpit plan natively interfaces with USB token drivers (ePass2003, Watchdata, mToken) via our secure local DSC bridge helper, allowing CAs to batch-sign generated XML/JSON return dockets without manually extracting individual client files.
        </div>
</div>
</div>
</section>

<section className="px-6 lg:px-12 py-16 bg-surface-container border-t border-outline-variant">
<div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
<div className="space-y-2">
<h3 className="font-headline-md text-headline-md text-on-surface font-serif">
          Ready to experience deterministic filing accuracy?
        </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant max-w-xl">
          Lock in your pre-filing pass today. 100% money-back guarantee if our mathematical dual-regime arbiter fails to find your lowest lawful liability.
        </p>
</div>
<div className="flex items-center gap-3 shrink-0">
<a className="bg-primary-container hover:bg-tertiary-container text-on-primary font-body-sm text-body-sm font-medium px-6 py-3 rounded shadow transition-colors inline-block" href="#">
          Lock Pre-Filing Pass
        </a>
<a className="bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border border-outline font-body-sm text-body-sm font-medium px-5 py-3 rounded transition-colors inline-block" href="#">
          Talk to a Tax Specialist
        </a>
</div>
</div>
</section>
</div>
</main>
<Footer />

    </>
  );
}
