import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';


export default function Home() {
  return (
    <>
      <Navbar /><main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]"><div className="flex flex-col w-full">

<section className="relative w-full overflow-hidden bg-surface-bright pt-12 pb-24 md:pt-16 md:pb-32">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

<div className="lg:col-span-7 flex flex-col items-start z-10">
<div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full mb-6">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
<span className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase">AI-Assisted · Source-Traceable · User Approved</span>
</div>
<h1 className="font-display-hero text-display-hero-mobile lg:text-display-hero text-on-surface tracking-tight font-serif mb-6 leading-[1.08]">
            Your taxes,<br/>
<span className="italic font-editorial-italic text-primary">finally intelligent.</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-8 leading-relaxed">
            TaxPilot turns documents, financial data, and intricate Indian tax provisions into a clear, reviewable filing workflow — with deterministic precision and AI assistance at every step.
          </p>
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-6">
<Link className="inline-flex items-center justify-center bg-primary-container hover:bg-tertiary-container text-on-primary font-body-md text-body-md font-medium px-7 py-3.5 rounded shadow-sm transition-all duration-150 text-center" data-path="start-filing" to="/start-filing">
              Start filing
              <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>
</Link>
<Link className="inline-flex items-center justify-center bg-surface-container-lowest hover:bg-surface-container text-on-surface font-body-md text-body-md font-medium px-6 py-3.5 rounded shadow-sm transition-all duration-150 text-center" data-path="how-it-works" to="/howitworks">
              See how it works
              <span className="material-symbols-outlined ml-2 text-[18px]">play_circle</span>
</Link>
</div>
<div className="flex items-center gap-2.5 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-primary text-[18px]">verified</span>
<span>Deterministic rule engine calculates. AI explains. You approve.</span>
</div>
</div>

<div className="lg:col-span-5 relative">
<div className="relative mx-auto w-full max-w-lg lg:max-w-none">

<div className="relative overflow-hidden rounded-xl shadow-xl bg-surface-container-low p-2">
<div className="overflow-hidden rounded-lg relative aspect-[4/3] w-full">
<img className="w-full h-full object-cover" data-alt="High quality cinematic portrait of a professional Indian tax consultant and chartered accountant working in a warm mahogany-toned corporate office with sunlit skyscrapers through floor-to-ceiling glass windows, reviewing fiscal schedules on an ultra-thin laptop beside organized paper ledgers" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLoXXt_8z56pcJQAfpOsTkU6g2qDA8vQ_CP8FVW3pHBUWvaJSX7SSa1sUGJ-ZQrnDRau6Cy7NVRfCW3FyqEg4KI1vUo5qaywl5MLkOCIdSxhm31gMLJwErPiQPqFAHLeYLZim-vFu8Tav38JmCFNSjVireZTDWe7bXTFzw26pgCtN3km-D6T1bLWvJkNCK50hD_NQoICUQ3ptRVmXOTSAFIcg2JtHMsQbswCktHefefM1iBBzXe8HwOA"/>
<div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent"></div>
<div className="absolute bottom-4 left-4 right-4 p-3 bg-surface/95 backdrop-blur-md rounded shadow-md flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-[22px]">policy</span>
<div>
<div className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider">ITD e-Filing Gateway</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">AIS / Form 16 Synchronized</div>
</div>
</div>
<span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-medium">99.8% Match</span>
</div>
</div>
</div>

<div className="-mt-8 -ml-4 sm:-ml-6 relative z-20 inline-block bg-surface-container-lowest p-4 rounded-xl shadow-lg max-w-xs">
<div className="flex items-center gap-3 mb-2">
<div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined text-[16px]">rule</span>
</div>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Engine Computation</span>
</div>
<p className="font-editorial-italic text-editorial-italic text-on-surface font-serif">"Zero black-box logic across AY 2025-26 provisions."</p>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-container-low py-6 shadow-sm">
<div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
<div className="flex items-center gap-3 text-on-surface">
<span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
<span className="font-body-sm text-body-sm font-medium">Built for individuals, chartered accountants, and modern enterprises across India</span>
</div>
<div className="flex flex-wrap items-center justify-center gap-2">
<span className="font-label-caps text-label-caps uppercase tracking-wider px-3 py-1 rounded bg-surface-container-lowest text-on-surface-variant shadow-sm">Salaried Individuals</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider px-3 py-1 rounded bg-surface-container-lowest text-on-surface-variant shadow-sm">Freelancers &amp; Consultants</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider px-3 py-1 rounded bg-surface-container-lowest text-on-surface-variant shadow-sm">Medical &amp; Legal Professionals</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider px-3 py-1 rounded bg-surface-container-lowest text-on-surface-variant shadow-sm">SMEs &amp; LLPs</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider px-3 py-1 rounded bg-surface-container-lowest text-on-surface-variant shadow-sm">Tech Startups</span>
</div>
</div>
</section>

<section className="w-full py-24 md:py-32 bg-surface">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="max-w-3xl mb-16">
<span className="font-label-caps text-label-caps tracking-widest text-primary uppercase block mb-3">Deterministic Architecture</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-on-surface tracking-tight mb-4">
          From complex source records to a filing-ready return.
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
          Tax filing designed from first principles around optical parsing accuracy, unbroken line-item traceability, and complete taxpayer verification.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

<div className="bg-surface-container-lowest p-8 rounded-xl shadow-md flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
<div>
<div className="flex items-center justify-between mb-8">
<span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-widest">01 / DOCUMENT EXTRACTION</span>
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">document_scanner</span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-3">Ingest &amp; Classify</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
              Drop Form 16 (Part A &amp; B), Annual Information Statement (AIS), TIS, capital gain statements, and P&amp;L ledgers. Structured directly into compliant Indian tax schemas.
            </p>
</div>
<div className="p-3 bg-surface-container-low rounded font-numeric-table text-numeric-table text-on-surface-variant flex items-center justify-between">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-600"></span>Form 16 Part B</span>
<span className="font-medium text-on-surface">Auto-Parsed</span>
</div>
</div>

<div className="bg-surface-container-lowest p-8 rounded-xl shadow-md flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
<div>
<div className="flex items-center justify-between mb-8">
<span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-widest">02 / SOURCE RECONCILIATION</span>
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">fact_check</span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-3">Line-Item Validation</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
              Every numerical field is corroborated against upstream government repositories. Discrepancies between employer TDS and AIS are surfaced before return compilation.
            </p>
</div>
<div className="p-3 bg-surface-container-low rounded font-numeric-table text-numeric-table text-on-surface-variant flex items-center justify-between">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-600"></span>TDS vs 26AS</span>
<span className="font-medium text-on-surface">Zero Variance</span>
</div>
</div>

<div className="bg-surface-container-lowest p-8 rounded-xl shadow-md flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
<div>
<div className="flex items-center justify-between mb-8">
<span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-widest">03 / COMPUTATION ENGINE</span>
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">calculate</span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-3">Deterministic Logic</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
              Tax rules calculate mathematically. AI generates contextual natural-language rationales. You maintain ultimate approval rights before XML or JSON generation.
            </p>
</div>
<div className="p-3 bg-surface-container-low rounded font-numeric-table text-numeric-table text-on-surface-variant flex items-center justify-between">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span>Regime Evaluation</span>
<span className="font-medium text-on-surface">Dual Optimal</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-20 bg-surface-container-low shadow-sm">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="text-center max-w-2xl mx-auto mb-16">
<span className="font-label-caps text-label-caps tracking-widest text-primary uppercase block mb-2">Sequential Verification</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-on-surface">The Six-Stage Filing Engine</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-3">An uncompromising pipeline that converts raw PDFs and CSV statements into an audit-proof, approved ITR filing.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">

<div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-label-caps text-label-caps text-primary font-bold">STAGE 01</span>
<span className="w-2 h-2 rounded-full bg-primary"></span>
</div>
<h4 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-1 text-[18px]">Upload</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">Drag &amp; drop Form 16, AIS, or bank statement PDFs.</p>
</div>
<div className="mt-4 pt-3 bg-surface-container-low px-2 py-1 rounded text-center">
<span className="font-label-caps text-label-caps text-on-surface-variant">PDF / JSON / Excel</span>
</div>
</div>

<div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-label-caps text-label-caps text-primary font-bold">STAGE 02</span>
<span className="w-2 h-2 rounded-full bg-primary"></span>
</div>
<h4 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-1 text-[18px]">Extract</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">Optical neural engine parses schedules and line items.</p>
</div>
<div className="mt-4 pt-3 bg-surface-container-low px-2 py-1 rounded text-center">
<span className="font-label-caps text-label-caps text-on-surface-variant">99.4% Parsing Rigor</span>
</div>
</div>

<div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-label-caps text-label-caps text-primary font-bold">STAGE 03</span>
<span className="w-2 h-2 rounded-full bg-primary"></span>
</div>
<h4 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-1 text-[18px]">Calculate</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">Deterministic statutory math runs in milliseconds.</p>
</div>
<div className="mt-4 pt-3 bg-surface-container-low px-2 py-1 rounded text-center">
<span className="font-label-caps text-label-caps text-on-surface-variant">Sec 115BAC Check</span>
</div>
</div>

<div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-label-caps text-label-caps text-primary font-bold">STAGE 04</span>
<span className="w-2 h-2 rounded-full bg-primary"></span>
</div>
<h4 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-1 text-[18px]">Validate</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">Continuous cross-check against 26AS &amp; AIS ledger data.</p>
</div>
<div className="mt-4 pt-3 bg-surface-container-low px-2 py-1 rounded text-center">
<span className="font-label-caps text-label-caps text-on-surface-variant">Variance Detection</span>
</div>
</div>

<div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-label-caps text-label-caps text-primary font-bold">STAGE 05</span>
<span className="w-2 h-2 rounded-full bg-primary"></span>
</div>
<h4 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-1 text-[18px]">Review</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">Inspect line-by-line proof cards with complete confidence.</p>
</div>
<div className="mt-4 pt-3 bg-surface-container-low px-2 py-1 rounded text-center">
<span className="font-label-caps text-label-caps text-on-surface-variant">Source Side-by-Side</span>
</div>
</div>

<div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-label-caps text-label-caps text-primary font-bold">STAGE 06</span>
<span className="w-2 h-2 rounded-full bg-emerald-600"></span>
</div>
<h4 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-1 text-[18px]">Approve</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">Sign off and transmit directly to the ITD e-Filing vault.</p>
</div>
<div className="mt-4 pt-3 bg-emerald-50 px-2 py-1 rounded text-center text-emerald-900">
<span className="font-label-caps text-label-caps">ITD Direct Relay</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-24 md:py-32 bg-[#24170F] text-[#EEE3D6] relative overflow-hidden">

<div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
<div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

<div className="lg:col-span-5">
<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#342318] rounded-full mb-6">
<span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
<span className="font-label-caps text-label-caps tracking-widest text-[#D8D1C9] uppercase">Source-To-Return Integrity</span>
</div>
<h2 className="font-headline-lg text-headline-lg font-serif text-[#EEE3D6] tracking-tight mb-6">
            Every single number has an audit trail.
          </h2>
<p className="font-body-lg text-body-lg text-[#D8D1C9] leading-relaxed mb-8">
            Black-box automation creates compliance liability. TaxPilot binds every calculated deduction and income head directly back to the physical page and line of your original tax certs.
          </p>
<div className="space-y-4">
<div className="flex items-start gap-3.5">
<span className="material-symbols-outlined text-primary-fixed text-[20px] mt-0.5">verified_user</span>
<div>
<div className="font-body-md text-body-md font-medium text-[#EEE3D6]">Cryptographic Fingerprinting</div>
<div className="font-body-sm text-body-sm text-[#D8D1C9]">Source document hash stored permanently alongside your ITR payload.</div>
</div>
</div>
<div className="flex items-start gap-3.5">
<span className="material-symbols-outlined text-primary-fixed text-[20px] mt-0.5">center_focus_strong</span>
<div>
<div className="font-body-md text-body-md font-medium text-[#EEE3D6]">Visual Proof Overlays</div>
<div className="font-body-sm text-body-sm text-[#D8D1C9]">Hover over any return line to immediately view the corresponding highlighted PDF coordinate.</div>
</div>
</div>
</div>
</div>

<div className="lg:col-span-7">
<div className="bg-[#1C120B] p-6 lg:p-8 rounded-xl shadow-2xl relative">
<div className="flex items-center justify-between pb-4 mb-6 border-b border-[#3D281B]">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-red-800"></span>
<span className="w-3 h-3 rounded-full bg-amber-800"></span>
<span className="w-3 h-3 rounded-full bg-emerald-800"></span>
<span className="font-label-caps text-label-caps text-[#84746c] ml-3 uppercase">ITR-1 / Form 16 Synchronizer</span>
</div>
<span className="font-label-caps text-label-caps px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-medium">Reconciled · 100%</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

<div className="bg-[#2E1D13] p-5 rounded-lg flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps uppercase text-[#D8D1C9] font-semibold">FORM NO. 16 · PART B</span>
<span className="font-body-sm text-body-sm text-[#84746c]">AY 2025-26</span>
</div>
<div className="text-[11px] text-[#84746c] uppercase mb-2">Certificate Under Section 203</div>

<div className="bg-[#3D281B] p-3 rounded mb-3">
<div className="flex justify-between items-center text-xs text-[#D8D1C9] mb-1">
<span>1. Gross Salary (Sec 17(1))</span>
<span className="font-numeric-table text-numeric-table font-semibold text-emerald-400">₹8,40,000</span>
</div>
<div className="text-[10px] text-[#84746c]">Line 1(a) · Employer TAN: BLRP02931D</div>
</div>
<div className="p-3 bg-[#24170F] rounded opacity-70">
<div className="flex justify-between items-center text-xs text-[#84746c]">
<span>2. Value of Perquisites (Sec 17(2))</span>
<span className="font-numeric-table text-numeric-table">₹0</span>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-[#3D281B] flex items-center justify-between text-xs text-[#84746c]">
<span>Source Document</span>
<span className="text-primary-fixed underline cursor-pointer">Preview Original PDF</span>
</div>
</div>

<div className="bg-[#2A1A10] p-5 rounded-lg flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps uppercase text-primary-fixed font-semibold">Extracted Tax Field</span>
<span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
</div>
<div className="space-y-3 font-body-sm text-body-sm">
<div>
<div className="text-xs text-[#84746c]">Field Name</div>
<div className="font-medium text-[#EEE3D6]">Gross Salary (Section 17(1))</div>
</div>
<div>
<div className="text-xs text-[#84746c]">Parsed Monetary Value</div>
<div className="font-headline-sm text-headline-sm font-numeric-table text-primary-fixed">₹8,40,000</div>
</div>
<div>
<div className="text-xs text-[#84746c]">OCR Model Confidence</div>
<div className="flex items-center gap-2 mt-1">
<div className="w-full bg-[#3D281B] h-1.5 rounded-full overflow-hidden">
<div className="bg-emerald-500 h-full w-[98.4%]"></div>
</div>
<span className="text-xs font-numeric-table text-[#D8D1C9]">98.4%</span>
</div>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-[#3D281B]">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-emerald-400 text-[16px]">link</span>
<span className="font-body-sm text-body-sm text-emerald-300">AIS Sequence: 2025/1109/B</span>
</div>
</div>
</div>
</div>

<div className="mt-4 pt-4 border-t border-[#3D281B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#84746c]">
<span>SHA-256 Checksum: c0f488f7b5a...9e4210a</span>
<span className="text-primary-fixed">Deterministic Rule Run #4092 Passed</span>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-24 md:py-32 bg-surface">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="max-w-2xl mb-16">
<span className="font-label-caps text-label-caps tracking-widest text-primary uppercase block mb-3">Architected for You</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-on-surface">Tailored workflows for distinct tax realities.</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mt-3">Whether you hold complex equity grants across startups or manage an operating SME with multi-state GST filings.</p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

<div className="bg-surface-container-lowest p-8 lg:p-10 rounded-xl shadow-md flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined text-[24px]">person</span>
</div>
<span className="font-label-caps text-label-caps text-primary uppercase tracking-widest block mb-2">FOR SALARIED &amp; INVESTORS</span>
<h3 className="font-headline-md text-headline-md font-serif text-on-surface mb-4">Personal taxes, without the paperwork.</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8">
              End-to-end reconciliation for Form 16, capital gains from Zerodha/Groww, foreign ESOP vesting, and dividend schedules with automated Old vs New regime optimization.
            </p>

<div className="space-y-3 mb-8">
<div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface">
<span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
<span>Automated Form 16 OCR &amp; AIS/TIS dividend matching</span>
</div>
<div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface">
<span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
<span>Section 80C, 80D, 80CCD(1B) optimization suggestions</span>
</div>
<div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface">
<span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
<span>Unlisted shares &amp; RSU capital gains indexation engine</span>
</div>
</div>
</div>
<Link className="inline-flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container rounded font-body-md text-body-md font-medium text-on-surface transition-colors" data-path="for-individuals" to="/for-individuals">
<span>Explore Individual Filing</span>
<span className="material-symbols-outlined text-primary text-[20px]">arrow_forward</span>
</Link>
</div>

<div className="bg-surface-container-lowest p-8 lg:p-10 rounded-xl shadow-md flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined text-[24px]">storefront</span>
</div>
<span className="font-label-caps text-label-caps text-primary uppercase tracking-widest block mb-2">FOR SMES &amp; CORPORATES</span>
<h3 className="font-headline-md text-headline-md font-serif text-on-surface mb-4">Business taxes, without the spreadsheet chaos.</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8">
              Consolidate P&amp;L ledgers, reconcile GSTR-2B vs purchase registers, optimize presumptive taxation under Section 44AD/44ADA, and automate 26Q/24Q TDS summaries.
            </p>

<div className="space-y-3 mb-8">
<div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface">
<span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
<span>GST vs Financial Books mismatch analysis</span>
</div>
<div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface">
<span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
<span>Section 44ADA Presumptive Tax calculators</span>
</div>
<div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface">
<span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
<span>Direct vendor TDS status &amp; 194C / 194J compliance</span>
</div>
</div>
</div>
<Link className="inline-flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container rounded font-body-md text-body-md font-medium text-on-surface transition-colors" data-path="for-smes" to="/for-smes">
<span>Explore SME Workspace</span>
<span className="material-symbols-outlined text-primary text-[20px]">arrow_forward</span>
</Link>
</div>
</div>
</div>
</section>

<section className="w-full py-24 md:py-32 bg-[#302016] text-[#EEE3D6]">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

<div className="lg:col-span-5">
<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#402C20] rounded-full mb-6">
<span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
<span className="font-label-caps text-label-caps tracking-widest text-[#D8D1C9] uppercase">Contextual Intelligence</span>
</div>
<h2 className="font-headline-lg text-headline-lg font-serif text-[#EEE3D6] tracking-tight mb-6">
            Ask your taxes a better question.
          </h2>
<p className="font-body-lg text-body-lg text-[#D8D1C9] leading-relaxed mb-8">
            Never a generic chatbot hallucinating legal definitions. TaxPilot Copilot operates strictly against grounded statutory tax code and your verified documents.
          </p>
<div className="p-4 bg-[#261911] rounded-lg mb-8">
<div className="flex items-center gap-2 text-primary-fixed mb-1">
<span className="material-symbols-outlined text-[18px]">shield</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider">Zero Training On Private Data</span>
</div>
<p className="font-body-sm text-body-sm text-[#D8D1C9]">Your returns and financial statements are strictly sandboxed and never used to fine-tune external foundation models.</p>
</div>
<Link className="inline-flex items-center text-primary-fixed hover:text-[#FFFFFF] font-body-md text-body-md font-medium gap-2 transition-colors" data-path="ai-copilot" to="/ai-copilot">
<span>Explore Tax Copilot capabilities</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</Link>
</div>

<div className="lg:col-span-7">
<div className="bg-[#24170F] rounded-xl shadow-2xl p-6 lg:p-8">

<div className="flex items-center justify-between pb-4 mb-6 border-b border-[#4A3426]">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
<span className="material-symbols-outlined text-[18px]">neurology</span>
</div>
<div>
<div className="font-body-md text-body-md font-medium text-[#EEE3D6]">TaxPilot Copilot</div>
<div className="font-label-caps text-label-caps text-[#84746c]">ITD Act 1961 · Grounded RAG Model</div>
</div>
</div>
<span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-[#4A3426] text-[#D8D1C9]">AY 2025-26 Mode</span>
</div>

<div className="space-y-6 mb-6">

<div className="flex justify-end">
<div className="bg-[#402C20] text-[#EEE3D6] p-4 rounded-xl max-w-lg shadow-sm">
<p className="font-body-md text-body-md">
                    Why is my taxable income ₹7,42,000 under the New Regime?
                  </p>
<span className="font-label-caps text-label-caps text-[#84746c] mt-2 block text-right">You · 14:32 IST</span>
</div>
</div>

<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-full bg-[#402C20] flex items-center justify-center text-primary-fixed shrink-0 mt-1">
<span className="material-symbols-outlined text-[18px]">auto_awesome</span>
</div>
<div className="bg-[#2A1A10] text-[#EEE3D6] p-5 rounded-xl max-w-xl shadow-sm">
<p className="font-body-md text-body-md leading-relaxed mb-4">
                    Your gross salary of <strong className="text-primary-fixed">₹8,40,000</strong> is adjusted through two statutory provisions under Section 115BAC:
                  </p>
<div className="space-y-2 mb-4 font-body-sm text-body-sm">
<div className="p-2.5 bg-[#1C120B] rounded flex justify-between items-center">
<span className="text-[#D8D1C9]">1. Standard Deduction (Sec 16(ia))</span>
<span className="font-numeric-table text-numeric-table text-[#EEE3D6]">- ₹75,000</span>
</div>
<div className="p-2.5 bg-[#1C120B] rounded flex justify-between items-center">
<span className="text-[#D8D1C9]">2. Employer NPS (Sec 80CCD(2))</span>
<span className="font-numeric-table text-numeric-table text-[#EEE3D6]">- ₹23,000</span>
</div>
<div className="p-2.5 bg-[#342318] rounded flex justify-between items-center font-medium">
<span className="text-primary-fixed">Net Taxable Income</span>
<span className="font-numeric-table text-numeric-table text-primary-fixed font-bold">₹7,42,000</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed mb-4">
                    Under the Finance Act 2024 revisions, standard deduction was enhanced from ₹50,000 to ₹75,000 for salaried employees under the default New Tax Regime.
                  </p>

<div className="pt-3 border-t border-[#4A3426] flex flex-wrap items-center gap-2">
<span className="font-label-caps text-label-caps text-[#84746c] uppercase">Verified Citations:</span>
<span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-[#3D281B] text-[#D8D1C9] hover:bg-primary-container cursor-pointer transition-colors">Form 16 Part B (Col 1)</span>
<span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-[#3D281B] text-[#D8D1C9] hover:bg-primary-container cursor-pointer transition-colors">Income Tax Act Sec 16(ia)</span>
<span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-[#3D281B] text-[#D8D1C9] hover:bg-primary-container cursor-pointer transition-colors">Deterministic Run #4092</span>
</div>
</div>
</div>
</div>

<div className="relative">
<input className="w-full bg-[#1C120B] border-none text-[#EEE3D6] font-body-sm text-body-sm px-4 py-3.5 rounded-lg pr-12 focus:ring-1 focus:ring-primary-fixed placeholder-[#84746c]" placeholder="Ask about capital gains, HRA exemptions, or foreign tax credits..." type="text"/>
<button className="absolute right-2 top-2 p-1.5 bg-primary-container hover:bg-tertiary-container text-on-primary rounded transition-colors">
<span className="material-symbols-outlined text-[18px]">send</span>
</button>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-24 md:py-32 bg-surface">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
<div>
<span className="font-label-caps text-label-caps tracking-widest text-primary uppercase block mb-3">Statutory Optimization</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-on-surface">Proactive tax strategy, fully compliant.</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Discover legitimate allowances and deductions evaluated continuously as you upload supporting receipts and salary certificates.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-md flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps text-primary uppercase font-bold">SECTION 80D</span>
<span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">Old Regime</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2">Health Insurance Exemption</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Claim deductions for premiums paid toward self, spouse, children, and senior citizen parents with verified 80D certificates.
            </p>
<div className="space-y-3 p-4 bg-surface-container-low rounded font-body-sm text-body-sm mb-6">
<div className="flex justify-between">
<span className="text-on-surface-variant">Potential Saving</span>
<span className="font-numeric-table font-semibold text-emerald-800">Up to ₹25,000</span>
</div>
<div className="flex justify-between">
<span className="text-on-surface-variant">Eligible Heads</span>
<span className="font-numeric-table text-on-surface">Medical + Preventative</span>
</div>
<div className="flex justify-between">
<span className="text-on-surface-variant">Documentation</span>
<span className="font-numeric-table text-on-surface">Insurer 80D Receipt</span>
</div>
</div>
</div>
<div className="flex items-center gap-2 text-primary font-body-sm text-body-sm font-medium">
<span className="material-symbols-outlined text-[16px]">visibility</span>
<span>Check your eligibility</span>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-md flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps text-primary uppercase font-bold">SECTION 80CCD(2)</span>
<span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">Both Regimes</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2">Employer NPS Contribution</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Corporate NPS contributions are fully exempt up to 14% of Basic + DA under both Old and New Tax Regimes without ceiling restrictions.
            </p>
<div className="space-y-3 p-4 bg-surface-container-low rounded font-body-sm text-body-sm mb-6">
<div className="flex justify-between">
<span className="text-on-surface-variant">Potential Saving</span>
<span className="font-numeric-table font-semibold text-emerald-800">Up to 14% Basic</span>
</div>
<div className="flex justify-between">
<span className="text-on-surface-variant">Eligible Heads</span>
<span className="font-numeric-table text-on-surface">Corporate NPS Tier 1</span>
</div>
<div className="flex justify-between">
<span className="text-on-surface-variant">Documentation</span>
<span className="font-numeric-table text-on-surface">Salary Slip &amp; PRAN</span>
</div>
</div>
</div>
<div className="flex items-center gap-2 text-primary font-body-sm text-body-sm font-medium">
<span className="material-symbols-outlined text-[16px]">visibility</span>
<span>Check your eligibility</span>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-md flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-4">
<span className="font-label-caps text-label-caps text-primary uppercase font-bold">REGIME OPTIMIZER</span>
<span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">FY 2025-26</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2">Old vs New Dual Comparator</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Automatic simultaneous calculation of both tax paths taking into account updated slab structures, rebates under 87A, and deductions.
            </p>
<div className="space-y-3 p-4 bg-surface-container-low rounded font-body-sm text-body-sm mb-6">
<div className="flex justify-between">
<span className="text-on-surface-variant">Average Delta</span>
<span className="font-numeric-table font-semibold text-emerald-800">₹18,400 Saved</span>
</div>
<div className="flex justify-between">
<span className="text-on-surface-variant">Break-Even Point</span>
<span className="font-numeric-table text-on-surface">₹4,25,000 Deductions</span>
</div>
<div className="flex justify-between">
<span className="text-on-surface-variant">Engine Status</span>
<span className="font-numeric-table text-on-surface">Real-Time Simulation</span>
</div>
</div>
</div>
<div className="flex items-center gap-2 text-primary font-body-sm text-body-sm font-medium">
<span className="material-symbols-outlined text-[16px]">tune</span>
<span>Run comparison model</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full py-24 md:py-32 bg-surface-container-low">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="text-center max-w-2xl mx-auto mb-16">
<span className="font-label-caps text-label-caps tracking-widest text-primary uppercase block mb-2">Institutional Confidentiality</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-on-surface">Your financial data deserves serious protection.</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-3">We engineered TaxPilot with the security posture of an institutional depository. Zero ad tracking, zero data brokering.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
<div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-4">
<span className="material-symbols-outlined text-[20px]">lock</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2 text-[18px]">Zero Knowledge AES-256</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Tax documents are encrypted at rest using unique taxpayer keys generated in hardware security modules.</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-4">
<span className="material-symbols-outlined text-[20px]">manage_accounts</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2 text-[18px]">Role-Based Isolation</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Strict tenant isolation guarantees CA firms, SME bookkeepers, and taxpayers access only assigned ledgers.</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-4">
<span className="material-symbols-outlined text-[20px]">history_edu</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2 text-[18px]">Immutable Audit Trail</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Every figure change, OCR extraction, and rule computation is cryptographically logged with timestamps.</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-4">
<span className="material-symbols-outlined text-[20px]">delete_forever</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-serif text-on-surface mb-2 text-[18px]">On-Demand Purging</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Exercise immediate right to be forgotten. Delete all extracted source PDFs and records with a single click.</p>
</div>
</div>

<div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">verified</span>
</div>
<div>
<div className="font-body-md text-body-md font-medium text-on-surface">Designed with privacy-first architecture. We never monetize or sell your tax data.</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">Meets the requirements of the Digital Personal Data Protection (DPDP) Act, 2023.</div>
</div>
</div>
<div className="flex items-center gap-6 shrink-0">
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">ISO 27001 Certified</span>
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">SOC 2 Type II Audited</span>
</div>
</div>
</div>
</section>

<section className="w-full py-24 md:py-32 bg-[#24170F] text-[#EEE3D6]">
<div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
<span className="font-label-caps text-label-caps tracking-widest text-[#D8D1C9] uppercase block mb-4">Ready for Assessment Year 2025–26</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-[#EEE3D6] tracking-tight mb-6 text-3xl md:text-5xl">
        Work smarter. File with total confidence.
      </h2>
<p className="font-body-lg text-body-lg text-[#D8D1C9] max-w-2xl mx-auto mb-10 leading-relaxed">
        Join forward-looking Indian professionals, high-earners, and SME financial heads simplifying their annual returns with intelligent, fully reviewable workflows.
      </p>
<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
<Link className="w-full sm:w-auto inline-flex items-center justify-center bg-[#EEE3D6] hover:bg-[#DFD2C2] text-[#24170F] font-body-md text-body-md font-medium px-8 py-4 rounded shadow-md transition-all" data-path="get-started" to="/get-started">
          Start your return now
          <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>
</Link>
<Link className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent hover:bg-[#342318] text-[#EEE3D6] font-body-md text-body-md font-medium px-8 py-4 rounded border border-[#5A4535] transition-all" data-path="how-it-works" to="/howitworks">
          Explore how it works
        </Link>
</div>
<div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[#84746c]">
<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>No credit card required to start</span>
<span>·</span>
<span>Free regime comparison report</span>
<span>·</span>
<span>Encrypted in transit &amp; rest</span>
</div>
</div>
</section>
</div></main><Footer />
    </>
  );
}
