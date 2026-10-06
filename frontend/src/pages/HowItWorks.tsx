import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


export default function HowItWorks() {
  return (
    <>
      <Navbar /><main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]"><div className="flex flex-col w-full">

<section className="w-full bg-[#24170F] text-[#EEE3D6] border-b border-[#5A4535] relative overflow-hidden">
<div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28 relative z-10">
<div className="max-w-4xl space-y-6">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#342318] border border-[#5A4535] text-[#D8D1C9]">
<span className="w-1.5 h-1.5 rounded-full bg-[#8A5A3C]"></span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[11px]">The TaxPilot Architecture · FY 2025–26 / AY 2026–27</span>
</div>
<h1 className="font-display-hero text-headline-lg lg:text-display-hero text-[#EEE3D6] font-serif leading-[1.08] tracking-tight">
          From messy documents to a filing-ready return.
        </h1>
<p className="font-body-lg text-body-lg text-[#D8D1C9] max-w-2xl leading-relaxed">
          An unbending, 6-stage deterministic pipeline where source documents never lose their line-by-line connection to your final ITR tax schedule. The rule engine computes, validation verifies, AI explains, and you approve.
        </p>
<div className="pt-4 flex flex-wrap items-center gap-4">
<a className="bg-[#8A5A3C] hover:bg-[#784E34] text-white font-body-sm text-body-sm font-medium px-6 py-3 rounded-lg border border-[#784E34] transition-all shadow-sm flex items-center gap-2" href="#pipeline">
<span>Explore the interactive demo</span>
<span className="material-symbols-outlined text-[16px]">arrow_downward</span>
</a>
<a className="bg-[#342318] hover:bg-[#3D2C20] text-[#EEE3D6] font-body-sm text-body-sm font-medium px-6 py-3 rounded-lg border border-[#5A4535] transition-all flex items-center gap-2" href="#whitepaper">
<span>Read architectural whitepaper</span>
<span className="material-symbols-outlined text-[16px]">article</span>
</a>
</div>

<div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#5A4535]/60 text-body-sm">
<div className="flex items-center gap-2 text-[#D8D1C9]">
<span className="material-symbols-outlined text-[#8A5A3C] text-[18px]">verified</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[10px]">Deterministic Rule Verification</span>
</div>
<div className="flex items-center gap-2 text-[#D8D1C9]">
<span className="material-symbols-outlined text-[#8A5A3C] text-[18px]">lock</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[10px]">Zero-Knowledge Encryption</span>
</div>
<div className="flex items-center gap-2 text-[#D8D1C9]">
<span className="material-symbols-outlined text-[#8A5A3C] text-[18px]">fingerprint</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[10px]">SHA-256 Audit Trail</span>
</div>
<div className="flex items-center gap-2 text-[#D8D1C9]">
<span className="material-symbols-outlined text-[#8A5A3C] text-[18px]">how_to_reg</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[10px]">Human-In-The-Loop Sign-off</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#EFEAE3] border-b border-[#D8D1C9] py-8 sticky top-16 z-40 backdrop-blur-sm bg-opacity-95" id="pipeline">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4 pb-2 lg:pb-0">
<a className="group flex items-center gap-3 shrink-0 py-1.5 px-3 rounded hover:bg-white/60 transition-colors" href="#stage-01">
<span className="font-label-caps text-label-caps text-xs px-2 py-0.5 rounded bg-[#24170F] text-[#EEE3D6]">01</span>
<div className="flex flex-col">
<span className="font-label-caps text-label-caps uppercase font-semibold text-[#171310] tracking-wide text-xs">Upload</span>
<span className="font-body-sm text-[11px] text-[#6D5B50]">Multi-source Ingestion</span>
</div>
</a>
<span className="material-symbols-outlined text-[#84746C] text-[16px] shrink-0">chevron_right</span>
<a className="group flex items-center gap-3 shrink-0 py-1.5 px-3 rounded hover:bg-white/60 transition-colors" href="#stage-02">
<span className="font-label-caps text-label-caps text-xs px-2 py-0.5 rounded bg-[#24170F] text-[#EEE3D6]">02</span>
<div className="flex flex-col">
<span className="font-label-caps text-label-caps uppercase font-semibold text-[#171310] tracking-wide text-xs">Extract</span>
<span className="font-body-sm text-[11px] text-[#6D5B50]">Fiscal Entity Classification</span>
</div>
</a>
<span className="material-symbols-outlined text-[#84746C] text-[16px] shrink-0">chevron_right</span>
<a className="group flex items-center gap-3 shrink-0 py-1.5 px-3 rounded hover:bg-white/60 transition-colors" href="#stage-03">
<span className="font-label-caps text-label-caps text-xs px-2 py-0.5 rounded bg-[#24170F] text-[#EEE3D6]">03</span>
<div className="flex flex-col">
<span className="font-label-caps text-label-caps uppercase font-semibold text-[#171310] tracking-wide text-xs">Calculate</span>
<span className="font-body-sm text-[11px] text-[#6D5B50]">Deterministic CBDT Math</span>
</div>
</a>
<span className="material-symbols-outlined text-[#84746C] text-[16px] shrink-0">chevron_right</span>
<a className="group flex items-center gap-3 shrink-0 py-1.5 px-3 rounded hover:bg-white/60 transition-colors" href="#stage-04">
<span className="font-label-caps text-label-caps text-xs px-2 py-0.5 rounded bg-[#24170F] text-[#EEE3D6]">04</span>
<div className="flex flex-col">
<span className="font-label-caps text-label-caps uppercase font-semibold text-[#171310] tracking-wide text-xs">Validate</span>
<span className="font-body-sm text-[11px] text-[#6D5B50]">26AS / AIS Sentinel</span>
</div>
</a>
<span className="material-symbols-outlined text-[#84746C] text-[16px] shrink-0">chevron_right</span>
<a className="group flex items-center gap-3 shrink-0 py-1.5 px-3 rounded hover:bg-white/60 transition-colors" href="#stage-05">
<span className="font-label-caps text-label-caps text-xs px-2 py-0.5 rounded bg-[#24170F] text-[#EEE3D6]">05</span>
<div className="flex flex-col">
<span className="font-label-caps text-label-caps uppercase font-semibold text-[#171310] tracking-wide text-xs">Review</span>
<span className="font-body-sm text-[11px] text-[#6D5B50]">Contextual Line Rationale</span>
</div>
</a>
<span className="material-symbols-outlined text-[#84746C] text-[16px] shrink-0">chevron_right</span>
<a className="group flex items-center gap-3 shrink-0 py-1.5 px-3 rounded hover:bg-white/60 transition-colors" href="#stage-06">
<span className="font-label-caps text-label-caps text-xs px-2 py-0.5 rounded bg-[#8A5A3C] text-white">06</span>
<div className="flex flex-col">
<span className="font-label-caps text-label-caps uppercase font-semibold text-[#171310] tracking-wide text-xs">Approve</span>
<span className="font-body-sm text-[11px] text-[#6D5B50]">Cryptographic ITD Export</span>
</div>
</a>
</div>
</div>
</section>


<section className="w-full bg-[#F7F5F1] py-20 lg:py-28 border-b border-[#D8D1C9]" id="stage-01">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
<div className="lg:col-span-5 space-y-6">
<div className="flex items-center gap-3">
<span className="font-label-caps text-label-caps text-[#8A5A3C] font-semibold text-xs tracking-wider">STAGE 01 · UNIVERSAL NORMALIZATION</span>
</div>
<h2 className="font-headline-md text-headline-md text-[#171310] font-serif leading-tight">
            Ingest every ledger, salary annexure, and portfolio extract without pre-formatting.
          </h2>
<p className="font-body-md text-body-md text-[#51443D] leading-relaxed">
            Real Indian financial lives rarely arrive in clean templates. TaxPilot accepts password-protected bank PDFs (ICICI, HDFC, SBI), multi-employer Form 16 Part A and B fragments, Zerodha/Groww capital gains CSVs, and raw AIS JSON files directly from the ITD portal.
          </p>
<div className="space-y-3 pt-2">
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-[#8A5A3C] text-[20px] mt-0.5">lock_clock</span>
<p className="font-body-sm text-body-sm text-[#51443D]"><strong className="font-medium text-[#171310]">Automated Password Resolution:</strong> Secure local decrypters parse standard PAN/DOB patterns locally in sandbox memory without persisting plaintext credentials.</p>
</div>
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-[#8A5A3C] text-[20px] mt-0.5">verified_user</span>
<p className="font-body-sm text-body-sm text-[#51443D]"><strong className="font-medium text-[#171310]">Payload SHA-256 Checksums:</strong> Every raw byte receives an immutable SHA-256 fingerprint anchored to the taxpayer session audit ledger.</p>
</div>
</div>
</div>

<div className="lg:col-span-7">
<div className="bg-white rounded border border-[#D8D1C9] shadow-sm overflow-hidden">
<div className="bg-[#EFEAE3] px-6 py-4 border-b border-[#D8D1C9] flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#6D5B50] text-[18px]">folder_zip</span>
<span className="font-label-caps text-label-caps uppercase text-[#171310] tracking-wider">Session Ingestion Registry · FY 2025–26</span>
</div>
<span className="font-label-caps text-label-caps text-[#4F6B52] bg-[rgba(79,107,82,0.1)] px-2 py-0.5 rounded border border-[rgba(79,107,82,0.25)]">4 Sources Mounted</span>
</div>
<div className="p-6 space-y-4">

<div className="p-4 rounded border border-[#D8D1C9] bg-[#FAF9F7] flex items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded bg-[#EFEAE3] flex items-center justify-center border border-[#D8D1C9]">
<span className="material-symbols-outlined text-[#8A5A3C]">description</span>
</div>
<div>
<div className="font-label-md text-label-md font-medium text-[#171310]">Form16_PartAB_Signed_Infosys.pdf</div>
<div className="font-body-sm text-[12px] text-[#6D5B50]">Parsed: TAN BLRI01294F · Gross: ₹38,40,000 · TDS: ₹4,82,190</div>
</div>
</div>
<div className="text-right">
<span className="font-label-caps text-label-caps text-[#4F6B52] bg-[rgba(79,107,82,0.1)] px-2 py-0.5 rounded border border-[rgba(79,107,82,0.25)]">VERIFIED ENCRYPTED</span>
<div className="font-body-sm text-[11px] text-[#84746C] mt-1 font-mono">sha256: 7b9e...4a01</div>
</div>
</div>

<div className="p-4 rounded border border-[#D8D1C9] bg-[#FAF9F7] flex items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded bg-[#EFEAE3] flex items-center justify-center border border-[#D8D1C9]">
<span className="material-symbols-outlined text-[#8A5A3C]">account_balance</span>
</div>
<div>
<div className="font-label-md text-label-md font-medium text-[#171310]">ICICI_Bank_Statement_FY24-25.pdf</div>
<div className="font-body-sm text-[12px] text-[#6D5B50]">512 txns auto-categorized · Interest Income u/s 56(2): ₹32,490</div>
</div>
</div>
<div className="text-right">
<span className="font-label-caps text-label-caps text-[#4F6B52] bg-[rgba(79,107,82,0.1)] px-2 py-0.5 rounded border border-[rgba(79,107,82,0.25)]">DECRYPTED OK</span>
<div className="font-body-sm text-[11px] text-[#84746C] mt-1 font-mono">sha256: 9f12...bc39</div>
</div>
</div>

<div className="p-4 rounded border border-[#D8D1C9] bg-[#FAF9F7] flex items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded bg-[#EFEAE3] flex items-center justify-center border border-[#D8D1C9]">
<span className="material-symbols-outlined text-[#8A5A3C]">candlestick_chart</span>
</div>
<div>
<div className="font-label-md text-label-md font-medium text-[#171310]">Zerodha_TaxPnL_Equity_FY25.xlsx</div>
<div className="font-body-sm text-[12px] text-[#6D5B50]">LTCG u/s 112A: ₹1,84,300 · STCG u/s 111A: ₹42,100</div>
</div>
</div>
<div className="text-right">
<span className="font-label-caps text-label-caps text-[#4F6B52] bg-[rgba(79,107,82,0.1)] px-2 py-0.5 rounded border border-[rgba(79,107,82,0.25)]">PARSED JSON</span>
<div className="font-body-sm text-[11px] text-[#84746C] mt-1 font-mono">sha256: a12d...09fe</div>
</div>
</div>

<div className="pt-2 flex items-center justify-between text-[#84746C] text-xs">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#4F6B52]"></span> Isolated Sandboxed Storage</span>
<span>Ready for Entity Extraction →</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#24170F] text-[#EEE3D6] py-20 lg:py-28 border-b border-[#5A4535]" id="stage-02">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

<div className="lg:col-span-7 order-2 lg:order-1">
<div className="bg-[#1C120C] rounded border border-[#5A4535] shadow-lg p-6 font-mono text-xs">
<div className="flex items-center justify-between border-b border-[#5A4535] pb-4 mb-5">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-[#8A5A3C]"></span>
<span className="font-label-caps text-label-caps text-[#D8D1C9] uppercase">Optical Parser · Bounding Box Telemetry</span>
</div>
<span className="text-[#D8D1C9] bg-[#342318] px-2 py-0.5 rounded text-[11px] border border-[#5A4535]">Confidence Score: 99.8%</span>
</div>

<div className="space-y-4">
<div className="p-3 bg-[#2E1D13] border border-[#8A5A3C]/40 rounded relative">
<div className="text-[10px] uppercase tracking-wider text-[#8A5A3C] mb-1">[BOX 1a · MATCH: 17(1) SALARY]</div>
<div className="flex justify-between items-center text-[#EEE3D6] text-sm">
<span>Gross Salary as per provisions contained in sec. 17(1)</span>
<span className="font-bold text-[#EEE3D6]">₹ 38,40,000.00</span>
</div>
<div className="text-[11px] text-[#D8D1C9]/70 mt-1">Anchor: Line 1(a) Page 2 · Deductions u/s 16 verified</div>
</div>
<div className="p-3 bg-[#2E1D13] border border-[#4F6B52]/50 rounded relative">
<div className="text-[10px] uppercase tracking-wider text-[#4F6B52] mb-1">[BOX 2b · MATCH: TDS 192 CREDITED]</div>
<div className="flex justify-between items-center text-[#EEE3D6] text-sm">
<span>Total Tax Deducted and Deposited to Central Govt.</span>
<span className="font-bold text-[#EEE3D6]">₹ 4,82,190.00</span>
</div>
<div className="text-[11px] text-[#D8D1C9]/70 mt-1">Receipt Hash: 001928472901 · Quarter IV Challan Matched</div>
</div>
<div className="p-3 bg-[#2E1D13] border border-[#5A4535] rounded">
<div className="text-[10px] uppercase tracking-wider text-[#D8D1C9] mb-1">[METADATA · ENTITY RESOLUTION]</div>
<div className="grid grid-cols-2 gap-2 text-[11px] text-[#D8D1C9]">
<div>Employer: <span className="text-[#EEE3D6]">Infosys Limited</span></div>
<div>TAN: <span className="text-[#EEE3D6]">BLRI01294F</span></div>
<div>PAN of Employee: <span className="text-[#EEE3D6]">ABCDE1234F</span></div>
<div>Assessment Year: <span className="text-[#EEE3D6]">2026–27</span></div>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-[#5A4535] flex items-center justify-between text-[11px] text-[#D8D1C9]">
<span>Geometry Model: LayoutLMv3-Fiscal</span>
<span className="text-[#4F6B52]">Zero OCR Hallucination Guard Active</span>
</div>
</div>
</div>
<div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
<div className="flex items-center gap-3">
<span className="font-label-caps text-label-caps text-[#f7b995] font-semibold text-xs tracking-wider">STAGE 02 · OPTICAL PARSING &amp; FISCAL GRAMMAR</span>
</div>
<h2 className="font-headline-md text-headline-md text-[#EEE3D6] font-serif leading-tight">
            Why OCR alone fails without Fiscal Grammar.
          </h2>
<p className="font-body-md text-body-md text-[#D8D1C9] leading-relaxed">
            Standard OCR tools blindly convert pixels to characters without understanding tax law. When an Indian employer prints a revised TDS schedule in an irregular footnote or a bank groups fixed deposit reinvestment under internal codes, generic AI hallucinates.
          </p>
<p className="font-body-md text-body-md text-[#D8D1C9] leading-relaxed">
            TaxPilot applies a compiled <em>Fiscal Grammar</em> that treats financial forms as strict relational schemas. If a computed subtotal fails an arithmetic identity, the parsing engine pauses and demands manual corroboration instead of guessing.
          </p>
<div className="pt-2">
<span className="inline-flex items-center gap-2 font-label-caps text-label-caps text-[11px] uppercase tracking-wider text-[#EEE3D6] bg-[#342318] px-3 py-1.5 rounded border border-[#5A4535]">
<span className="material-symbols-outlined text-[16px] text-[#f7b995]">terminal</span>
              Deterministic Table Topology Reconstruction
            </span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#F7F5F1] py-20 lg:py-28 border-b border-[#D8D1C9]" id="stage-03">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
<div className="lg:col-span-5 space-y-6">
<div className="flex items-center gap-3">
<span className="font-label-caps text-label-caps text-[#8A5A3C] font-semibold text-xs tracking-wider">STAGE 03 · CBDT RULE ENGINE</span>
</div>
<h2 className="font-headline-md text-headline-md text-[#171310] font-serif leading-tight">
            Why tax computations must never run on probabilistic LLMs.
          </h2>
<p className="font-body-md text-body-md text-[#51443D] leading-relaxed">
            Large Language Models are non-deterministic: ask them twice, and you may receive two distinct tax liabilities. For fiscal compliance, that is completely unacceptable.
          </p>
<p className="font-body-md text-body-md text-[#51443D] leading-relaxed">
            TaxPilot calculates taxes via hardcoded, unit-tested deterministic state machines that mirror Central Board of Direct Taxes (CBDT) test suites. Both Section 115BAC (New Regime) and the Old Regime run concurrently across 14,000 edge cases with 0.00% numerical variance.
          </p>
<div className="p-4 rounded bg-[#EFEAE3] border border-[#D8D1C9] space-y-2">
<div className="font-label-caps text-label-caps uppercase text-[#171310] font-semibold text-[11px]">Finance Act 2024 Hardcoded Provisions</div>
<p className="font-body-sm text-[12px] text-[#51443D]">Standard Deduction u/s 16(ia) raised to ₹75,000 for salaried taxpayers under Section 115BAC; revised slab thresholds (0-3L, 3-7L, 7-10L, 10-12L, 12-15L, &gt;15L) rigorously mapped.</p>
</div>
</div>

<div className="lg:col-span-7">
<div className="bg-white rounded border border-[#D8D1C9] shadow-sm overflow-hidden">
<div className="bg-[#EFEAE3] px-6 py-4 border-b border-[#D8D1C9] flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-[#171310] tracking-wider">Parallel Engine Output · AY 2026–27</span>
<span className="font-label-caps text-label-caps text-[#8A5A3C] font-bold text-[11px]">DELTA: ₹ 54,620 SAVED</span>
</div>
<div className="p-6">
<div className="grid grid-cols-2 gap-4 pb-6 border-b border-[#D8D1C9]">

<div className="p-4 rounded border-2 border-[#8A5A3C] bg-[#FAF9F7]">
<div className="flex items-center justify-between mb-2">
<span className="font-label-caps text-label-caps font-semibold text-[#8A5A3C]">Section 115BAC (Default)</span>
<span className="font-label-caps text-label-caps text-[#4F6B52] bg-[rgba(79,107,82,0.1)] px-1.5 py-0.5 rounded text-[10px]">RECOMMENDED</span>
</div>
<div className="text-2xl font-serif text-[#171310] font-bold mb-1">₹ 4,27,570</div>
<div className="text-[12px] text-[#6D5B50]">Total Tax Payable (incl. Cess)</div>
<div className="mt-3 space-y-1 text-[11px] text-[#51443D] border-t border-[#D8D1C9] pt-2">
<div className="flex justify-between"><span>Std Deduction:</span><span className="font-mono">₹ 75,000</span></div>
<div className="flex justify-between"><span>Rebate u/s 87A:</span><span className="font-mono">₹ 0 (Taxable &gt; ₹7L)</span></div>
<div className="flex justify-between"><span>4% Cess:</span><span className="font-mono">₹ 16,445</span></div>
</div>
</div>

<div className="p-4 rounded border border-[#D8D1C9] bg-white opacity-80">
<div className="flex items-center justify-between mb-2">
<span className="font-label-caps text-label-caps font-semibold text-[#6D5B50]">Old Tax Regime</span>
<span className="font-label-caps text-label-caps text-[#84746C] text-[10px]">ALTERNATIVE</span>
</div>
<div className="text-2xl font-serif text-[#171310] font-bold mb-1">₹ 4,82,190</div>
<div className="text-[12px] text-[#6D5B50]">Total Tax Payable (incl. Cess)</div>
<div className="mt-3 space-y-1 text-[11px] text-[#51443D] border-t border-[#D8D1C9] pt-2">
<div className="flex justify-between"><span>Std Deduction:</span><span className="font-mono">₹ 50,000</span></div>
<div className="flex justify-between"><span>Ch. VI-A Deductions:</span><span className="font-mono">₹ 2,00,000</span></div>
<div className="flex justify-between"><span>4% Cess:</span><span className="font-mono">₹ 18,546</span></div>
</div>
</div>
</div>

<div className="mt-4">
<div className="font-label-caps text-label-caps uppercase text-[#51443D] mb-3 text-[11px]">Slab Breakdown for New Regime (Compiled Formula Stack)</div>
<table className="w-full text-left font-body-sm text-[12px]">
<thead>
<tr className="text-[#84746C] border-b border-[#D8D1C9]">
<th className="py-1">Income Band</th>
<th className="py-1">Rate</th>
<th className="py-1 text-right">Tax Component</th>
</tr>
</thead>
<tbody className="divide-y divide-[#EFEAE3] font-mono">
<tr><td className="py-1.5 font-sans">₹0 to ₹3,00,000</td><td>Nil</td><td className="text-right">₹ 0</td></tr>
<tr><td className="py-1.5 font-sans">₹3,00,001 to ₹7,00,000</td><td>5%</td><td className="text-right">₹ 20,000</td></tr>
<tr><td className="py-1.5 font-sans">₹7,00,001 to ₹10,00,000</td><td>10%</td><td className="text-right">₹ 30,000</td></tr>
<tr><td className="py-1.5 font-sans">₹10,00,001 to ₹12,00,000</td><td>15%</td><td className="text-right">₹ 30,000</td></tr>
<tr><td className="py-1.5 font-sans">₹12,00,001 to ₹15,00,000</td><td>20%</td><td className="text-right">₹ 60,000</td></tr>
<tr><td className="py-1.5 font-sans">&gt; ₹15,00,000 (Remaining)</td><td>30%</td><td className="text-right">₹ 2,71,125</td></tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#24170F] text-[#EEE3D6] py-20 lg:py-28 border-b border-[#5A4535]" id="stage-04">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="max-w-3xl space-y-4 mb-12">
<div className="flex items-center gap-3">
<span className="font-label-caps text-label-caps text-[#f7b995] font-semibold text-xs tracking-wider">STAGE 04 · CROSS-LEDGER RECONCILIATION</span>
</div>
<h2 className="font-headline-md text-headline-md text-[#EEE3D6] font-serif leading-tight">
          3-Way reconciliation against AIS, 26AS, and Portal Repositories.
        </h2>
<p className="font-body-md text-body-md text-[#D8D1C9] leading-relaxed">
          The Income Tax Department knows what you earned before you even file. TaxPilot runs preemptive reconciliation against the government’s Annual Information Statement (AIS), Taxpayer Information Summary (TIS), and Form 26AS so discrepancies never result in automated scrutiny notices.
        </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<div className="bg-[#2E1D13] p-6 rounded border border-[#5A4535] space-y-4">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-[#D8D1C9] text-[11px]">TDS Mismatch Sentinel</span>
<span className="font-label-caps text-label-caps text-[#9A4540] bg-[rgba(154,69,64,0.15)] px-2 py-0.5 rounded border border-[rgba(154,69,64,0.3)]">ALERT FLAG</span>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs text-[#D8D1C9]">
<span>Form 16 TDS Claimed:</span>
<span className="font-mono text-[#EEE3D6]">₹ 1,42,000</span>
</div>
<div className="flex justify-between text-xs text-[#D8D1C9]">
<span>26AS Actual Credited:</span>
<span className="font-mono text-[#EEE3D6]">₹ 1,32,000</span>
</div>
<div className="p-3 bg-[#3D231F] rounded border border-[#9A4540]/50 text-xs text-[#EEE3D6] space-y-1">
<div className="font-medium text-[#f7b995]">₹10,000 Uncredited TDS Detected</div>
<div className="text-[11px] text-[#D8D1C9]">Employer did not deposit Q4 TDS before 31 May deadline. Filing now will trigger a Demand Notice u/s 143(1a).</div>
</div>
</div>
</div>

<div className="bg-[#2E1D13] p-6 rounded border border-[#5A4535] space-y-4">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-[#D8D1C9] text-[11px]">SFT Interest Reconciliation</span>
<span className="font-label-caps text-label-caps text-[#4F6B52] bg-[rgba(79,107,82,0.15)] px-2 py-0.5 rounded border border-[rgba(79,107,82,0.3)]">100% MATCHED</span>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs text-[#D8D1C9]">
<span>AIS Reported Savings Int:</span>
<span className="font-mono text-[#EEE3D6]">₹ 42,800</span>
</div>
<div className="flex justify-between text-xs text-[#D8D1C9]">
<span>Bank Statement Sum:</span>
<span className="font-mono text-[#EEE3D6]">₹ 42,800</span>
</div>
<div className="p-3 bg-[#1C261E] rounded border border-[#4F6B52]/50 text-xs text-[#EEE3D6] space-y-1">
<div className="font-medium text-[#82C98A]">Full Alignment Confirmed</div>
<div className="text-[11px] text-[#D8D1C9]">3 Bank Accounts (HDFC, SBI, ICICI) reconciled against SFT-005 reporting tags without remainder.</div>
</div>
</div>
</div>

<div className="bg-[#2E1D13] p-6 rounded border border-[#5A4535] space-y-4">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-[#D8D1C9] text-[11px]">GSTR-2B vs Purchase Ledger</span>
<span className="font-label-caps text-label-caps text-[#9A6A32] bg-[rgba(154,106,50,0.15)] px-2 py-0.5 rounded border border-[rgba(154,106,50,0.3)]">INELIGIBLE ITC</span>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs text-[#D8D1C9]">
<span>GSTR-3B Auto Inward:</span>
<span className="font-mono text-[#EEE3D6]">₹ 3,45,200</span>
</div>
<div className="flex justify-between text-xs text-[#D8D1C9]">
<span>Supplier GSTR-1 Matches:</span>
<span className="font-mono text-[#EEE3D6]">₹ 3,18,000</span>
</div>
<div className="p-3 bg-[#382B1B] rounded border border-[#9A6A32]/50 text-xs text-[#EEE3D6] space-y-1">
<div className="font-medium text-[#ffdcc2]">Rule 36(4) Restriction Applied</div>
<div className="text-[11px] text-[#D8D1C9]">Vendor 07AABCU9603R1ZM filed late; ₹27,200 ITC deferred to subsequent tax period.</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#F7F5F1] py-20 lg:py-28 border-b border-[#D8D1C9]" id="stage-05">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
<div className="lg:col-span-5 space-y-6">
<div className="flex items-center gap-3">
<span className="font-label-caps text-label-caps text-[#8A5A3C] font-semibold text-xs tracking-wider">STAGE 05 · HUMAN &amp; COPILOT INSPECTION</span>
</div>
<h2 className="font-headline-md text-headline-md text-[#171310] font-serif leading-tight">
            Line-by-line traceability. Every single rupee links to a verified document origin.
          </h2>
<p className="font-body-md text-body-md text-[#51443D] leading-relaxed">
            Never wonder where a deduction came from. Click any row in the TaxPilot schedule to reveal its cryptographic source path, relevant section in the Indian Income Tax Act 1961, and contextual AI rationale explaining why this calculation is audit-safe.
          </p>
<div className="space-y-3 pt-2">
<div className="p-3 bg-white rounded border border-[#D8D1C9] flex items-center gap-3">
<span className="material-symbols-outlined text-[#4F6B52]">verified</span>
<span className="font-body-sm text-body-sm text-[#171310]">Click-to-highlight source line on uploaded PDF facsimile</span>
</div>
<div className="p-3 bg-white rounded border border-[#D8D1C9] flex items-center gap-3">
<span className="material-symbols-outlined text-[#8A5A3C]">psychology</span>
<span className="font-body-sm text-body-sm text-[#171310]">Statutory references directly cited from CBDT circulars</span>
</div>
</div>
</div>

<div className="lg:col-span-7">
<div className="bg-white rounded border border-[#D8D1C9] shadow-sm overflow-hidden">
<div className="bg-[#EFEAE3] px-6 py-4 border-b border-[#D8D1C9] flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-[#171310] tracking-wider">Schedule VIA &amp; NPS Inspector</span>
<span className="font-label-caps text-label-caps text-[#8A5A3C] font-mono text-xs">AY 2026–27 / ITR-2</span>
</div>
<div className="p-6 space-y-6">

<div className="border border-[#D8D1C9] rounded overflow-hidden">
<table className="w-full text-left font-body-sm text-[13px]">
<thead className="bg-[#FAF9F7] border-b border-[#D8D1C9] text-[#51443D] font-label-caps text-label-caps">
<tr>
<th className="py-2.5 px-4">Section</th>
<th className="py-2.5 px-4">Provision Description</th>
<th className="py-2.5 px-4 text-right">Amount (₹)</th>
<th className="py-2.5 px-4 text-center">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-[#EFEAE3]">
<tr className="hover:bg-[#F7F5F1]">
<td className="py-3 px-4 font-mono font-medium">80C</td>
<td className="py-3 px-4">EPF, PPF &amp; ELSS Contributions</td>
<td className="py-3 px-4 text-right font-mono">1,50,000</td>
<td className="py-3 px-4 text-center"><span className="font-label-caps text-label-caps text-[#4F6B52] bg-[rgba(79,107,82,0.1)] px-2 py-0.5 rounded">Capped</span></td>
</tr>
<tr className="bg-[#FAF9F7] border-l-2 border-l-[#8A5A3C]">
<td className="py-3 px-4 font-mono font-medium text-[#8A5A3C]">80CCD(1B)</td>
<td className="py-3 px-4 font-medium text-[#171310]">National Pension System (Tier I)</td>
<td className="py-3 px-4 text-right font-mono font-medium">50,000</td>
<td className="py-3 px-4 text-center"><span className="font-label-caps text-label-caps text-[#4F6B52] bg-[rgba(79,107,82,0.1)] px-2 py-0.5 rounded">Verified Trace</span></td>
</tr>
<tr className="hover:bg-[#F7F5F1]">
<td className="py-3 px-4 font-mono font-medium">80CCD(2)</td>
<td className="py-3 px-4">Employer Contribution to NPS</td>
<td className="py-3 px-4 text-right font-mono">1,20,000</td>
<td className="py-3 px-4 text-center"><span className="font-label-caps text-label-caps text-[#4F6B52] bg-[rgba(79,107,82,0.1)] px-2 py-0.5 rounded">14% Allowed</span></td>
</tr>
</tbody>
</table>
</div>

<div className="p-4 rounded border border-[#D8D1C9] bg-[#FAF9F7] space-y-3">
<div className="flex items-center gap-2 text-xs font-label-caps text-label-caps text-[#8A5A3C]">
<span className="material-symbols-outlined text-[16px]">chat</span>
<span>Copilot Statutory Legal Citation · Section 80CCD(1B) vs (2)</span>
</div>
<p className="font-body-sm text-[12px] text-[#51443D] leading-relaxed">
                  "Your voluntary Tier-I NPS investment of ₹50,000 is claimed under <strong>Section 80CCD(1B)</strong> as an exclusive deduction above the 80C limit. Separately, Infosys contributed ₹1,20,000 under <strong>80CCD(2)</strong>. Since this is 10% of your Basic+DA (within the statutory 14% ceiling for state/central or 10% for private entities), both deductions are compliant simultaneously under Finance Act 2024."
                </p>
<div className="flex items-center justify-between pt-2 border-t border-[#D8D1C9] text-[11px] text-[#84746C]">
<span>Source: Infosys Form 16 Part B (Item 9c) + PRAN Statement #1100293817</span>
<a className="text-[#8A5A3C] hover:underline flex items-center gap-1" href="#">View IT Act §80CCD text →</a>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#FAF9F7] py-20 lg:py-28 border-b border-[#D8D1C9]" id="stage-06">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#EFEAE3] border border-[#D8D1C9] text-[#6D5B50]">
<span className="material-symbols-outlined text-[#8A5A3C] text-[16px]">gavel</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[11px]">Stage 06 · The Human-in-the-Loop Covenant</span>
</div>
<h2 className="font-headline-md text-headline-md text-[#171310] font-serif leading-tight">
          TaxPilot never files without your explicit, auditable command.
        </h2>
<p className="font-body-md text-body-md text-[#51443D] leading-relaxed max-w-2xl mx-auto">
          We reject fully autonomous "black box" filing bots. Before a single packet is dispatched to the e-Filing gateway, you inspect every deduction schedule, review the manifest hash, and authenticate via Aadhaar OTP or DSC token.
        </p>
</div>

<div className="max-w-3xl mx-auto bg-white rounded border border-[#D8D1C9] shadow-sm p-8 space-y-6">
<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#D8D1C9] gap-4">
<div>
<div className="font-headline-sm text-headline-sm font-serif text-[#171310]">ITR-2 Filing Manifest</div>
<div className="font-body-sm text-[12px] text-[#6D5B50]">Assessment Year 2026–27 · PAN: ABCDE1234F</div>
</div>
<div className="text-right">
<span className="font-label-caps text-label-caps text-[#4F6B52] bg-[rgba(79,107,82,0.1)] px-3 py-1 rounded border border-[rgba(79,107,82,0.25)]">
              ALL 14 VALIDATIONS PASSED
            </span>
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
<div className="p-3 bg-[#FAF9F7] rounded border border-[#D8D1C9]">
<span className="text-[#84746C] block uppercase font-label-caps text-[10px]">Net Tax Liability</span>
<span className="text-lg font-mono font-bold text-[#171310]">₹ 4,27,570</span>
</div>
<div className="p-3 bg-[#FAF9F7] rounded border border-[#D8D1C9]">
<span className="text-[#84746C] block uppercase font-label-caps text-[10px]">TDS Paid (26AS Reconciled)</span>
<span className="text-lg font-mono font-bold text-[#4F6B52]">₹ 4,82,190</span>
</div>
<div className="p-3 bg-[#FAF9F7] rounded border border-[#D8D1C9]">
<span className="text-[#84746C] block uppercase font-label-caps text-[10px]">Net Refund Due u/s 237</span>
<span className="text-lg font-mono font-bold text-[#8A5A3C]">₹ 54,620</span>
</div>
<div className="p-3 bg-[#FAF9F7] rounded border border-[#D8D1C9]">
<span className="text-[#84746C] block uppercase font-label-caps text-[10px]">Cryptographic Payload Hash</span>
<span className="font-mono text-[#51443D] truncate block">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
</div>
</div>

<div className="pt-4 border-t border-[#D8D1C9] flex flex-col sm:flex-row items-center justify-between gap-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#4F6B52]">shield</span>
<span className="font-body-sm text-[12px] text-[#51443D]">Direct ITD API handshake ready via NSDL / Protean gateway</span>
</div>
<div className="flex items-center gap-3">
<button className="bg-white hover:bg-[#EFEAE3] text-[#171310] font-body-sm text-body-sm px-4 py-2 rounded border border-[#D8D1C9]">
              Download ITD JSON
            </button>
<button className="bg-[#8A5A3C] hover:bg-[#784E34] text-white font-body-sm text-body-sm px-5 py-2 rounded border border-[#784E34]">
              Sign &amp; Dispatch e-Return
            </button>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#F7F5F1] py-20 lg:py-28 border-b border-[#D8D1C9]">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="max-w-3xl space-y-4 mb-12">
<span className="font-label-caps text-label-caps text-[#8A5A3C] font-semibold text-xs tracking-wider uppercase">Systematic Benchmark</span>
<h2 className="font-headline-md text-headline-md text-[#171310] font-serif leading-tight">
          How TaxPilot compares across three fiscal preparation paradigms.
        </h2>
</div>
<div className="bg-white rounded border border-[#D8D1C9] shadow-sm overflow-x-auto">
<table className="w-full text-left font-body-sm text-[13px] border-collapse min-w-[700px]">
<thead>
<tr className="bg-[#EFEAE3] border-b border-[#D8D1C9]">
<th className="py-4 px-6 font-label-caps text-label-caps uppercase text-[#51443D]">Architectural Criteria</th>
<th className="py-4 px-6 font-label-caps text-label-caps uppercase text-[#8A5A3C] font-bold bg-[#FAF9F7]">TaxPilot Engine</th>
<th className="py-4 px-6 font-label-caps text-label-caps uppercase text-[#51443D]">Traditional CAs</th>
<th className="py-4 px-6 font-label-caps text-label-caps uppercase text-[#51443D]">Generic LLM / Chatbots</th>
</tr>
</thead>
<tbody className="divide-y divide-[#D8D1C9]">
<tr>
<td className="py-4 px-6 font-medium text-[#171310]">Deterministic Math Accuracy</td>
<td className="py-4 px-6 bg-[#FAF9F7] font-semibold text-[#4F6B52]">100% (CBDT compiled vectors)</td>
<td className="py-4 px-6 text-[#51443D]">High (Subject to human manual error)</td>
<td className="py-4 px-6 text-[#9A4540]">Unreliable (Floating hallucinatory output)</td>
</tr>
<tr>
<td className="py-4 px-6 font-medium text-[#171310]">Document Line-Item Traceability</td>
<td className="py-4 px-6 bg-[#FAF9F7] font-semibold text-[#4F6B52]">Direct coordinate bounding-box link</td>
<td className="py-4 px-6 text-[#51443D]">Manual folder binders &amp; notes</td>
<td className="py-4 px-6 text-[#9A4540]">None (Zero source attribution)</td>
</tr>
<tr>
<td className="py-4 px-6 font-medium text-[#171310]">AY 2026–27 Rules (Finance Act 2024)</td>
<td className="py-4 px-6 bg-[#FAF9F7] font-semibold text-[#4F6B52]">Hardcoded &amp; instant day-zero logic</td>
<td className="py-4 px-6 text-[#51443D]">Requires continued professional education</td>
<td className="py-4 px-6 text-[#9A4540]">Training cutoffs often reference outdated slabs</td>
</tr>
<tr>
<td className="py-4 px-6 font-medium text-[#171310]">Hallucination Risk</td>
<td className="py-4 px-6 bg-[#FAF9F7] font-semibold text-[#4F6B52]">0.00% (Deterministic engine constraint)</td>
<td className="py-4 px-6 text-[#51443D]">N/A</td>
<td className="py-4 px-6 text-[#9A4540]">Severe (Fictitious deductions invented)</td>
</tr>
<tr>
<td className="py-4 px-6 font-medium text-[#171310]">Automated AIS/26AS Reconciliation</td>
<td className="py-4 px-6 bg-[#FAF9F7] font-semibold text-[#4F6B52]">Instant automated 3-way check</td>
<td className="py-4 px-6 text-[#51443D]">2-4 hours of manual comparison</td>
<td className="py-4 px-6 text-[#9A4540]">No cross-database validation ability</td>
</tr>
<tr>
<td className="py-4 px-6 font-medium text-[#171310]">Defense-Ready Audit Trail</td>
<td className="py-4 px-6 bg-[#FAF9F7] font-semibold text-[#4F6B52]">SHA-256 session manifest export</td>
<td className="py-4 px-6 text-[#51443D]">Paper / Excel archives</td>
<td className="py-4 px-6 text-[#9A4540]">Ephemeral session logs without proof</td>
</tr>
</tbody>
</table>
</div>
</div>
</section>

<section className="w-full bg-[#24170F] text-[#EEE3D6] py-20 lg:py-28 relative overflow-hidden">
<div className="max-w-7xl mx-auto px-6 lg:px-12 text-center space-y-6 relative z-10">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#342318] border border-[#5A4535] text-[#D8D1C9]">
<span className="w-1.5 h-1.5 rounded-full bg-[#4F6B52]"></span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[11px]">AY 2026–27 Returns Active</span>
</div>
<h2 className="font-display-hero text-headline-lg lg:text-display-hero font-serif text-[#EEE3D6] leading-tight max-w-3xl mx-auto">
        Experience deterministic tax intelligence.
      </h2>
<p className="font-body-lg text-body-lg text-[#D8D1C9] max-w-xl mx-auto leading-relaxed">
        Join thousands of Indian professionals, chartered accountants, and businesses filing returns with absolute mathematical certainty.
      </p>
<div className="pt-4 flex flex-wrap items-center justify-center gap-4">
<a className="bg-[#8A5A3C] hover:bg-[#784E34] text-white font-body-sm text-body-sm font-medium px-8 py-3.5 rounded-lg border border-[#784E34] transition-all shadow-md" href="#">
          Start your return now
        </a>
<a className="bg-[#342318] hover:bg-[#3D2C20] text-[#EEE3D6] font-body-sm text-body-sm font-medium px-8 py-3.5 rounded-lg border border-[#5A4535] transition-all" href="#">
          Book an architecture walkthrough
        </a>
</div>
<div className="pt-8 text-body-sm text-[#84746C] text-xs">
<span>Zero credit card required to start</span>
<span className="mx-2">·</span>
<span>AES-256 encrypted</span>
<span className="mx-2">·</span>
<span>CBDT compliant logic</span>
</div>
</div>
</section>
</div></main><Footer />
    </>
  );
}
