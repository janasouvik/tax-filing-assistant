import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


export default function TaxCalendarComplianceDeadlines() {
  return (
    <>
      
<Navbar />
<main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]"><div className="flex flex-col w-full">

<div className="w-full bg-[#24170F] text-[#EEE3D6] border-b border-[#5A4535] py-2.5 px-6 lg:px-12">
<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
<div className="flex items-center gap-2.5 font-label-caps uppercase tracking-wider text-[11px]">
<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span className="text-[#EFEAE3] font-semibold">CBDT &amp; GST Council Protocol Active</span>
<span className="text-[#84746c]">|</span>
<span className="text-[#D8D1C9]">AY 2026–27 Master Chronicle In Sync</span>
</div>
<div className="flex items-center gap-4 text-[#D8D1C9] font-body-sm text-[12px]">
<span>Next Statutory Window: <strong className="text-[#EEE3D6] font-medium">15 June 2025 (Q1 Advance Tax)</strong></span>
<span className="hidden md:inline text-[#84746c]">•</span>
<span className="hidden md:inline font-mono text-[11px] bg-[#342318] px-2 py-0.5 rounded text-[#dac2b5]">Sec 208–211 Enforced</span>
</div>
</div>
</div>

<section className="w-full bg-[#F7F5F1] border-b border-[#D8D1C9] pt-12 pb-16 px-6 lg:px-12 relative overflow-hidden">
<div className="max-w-7xl mx-auto">

<div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#D8D1C9]/60">
<div className="flex items-center gap-3">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container font-semibold bg-secondary-container/50 px-2.5 py-1 rounded">
            Statutory Chronology · AY 2026–27 / FY 2025–26
          </span>
<span className="text-[#84746c] text-xs">/</span>
<span className="font-body-sm text-body-sm text-secondary">Master Compliance Matrix</span>
</div>
<div className="flex items-center gap-2 text-xs font-mono text-secondary">
<span className="material-symbols-outlined text-[15px] text-primary">verified</span>
<span>Gazette Verification: In Sync (120s TTL)</span>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
<div className="lg:col-span-8 space-y-5">
<h1 className="font-display-hero text-display-hero text-[#171310] tracking-tight font-serif leading-[1.08]">
            Every statutory deadline. <br/>
<span className="font-editorial-italic italic font-serif text-[#6e4327]">Zero interest penalties.</span>
</h1>
<p className="font-body-lg text-body-lg text-secondary max-w-2xl leading-relaxed">
            TaxPilot dynamically maps Indian direct and indirect tax deadlines to your exact fiscal profile — from quarterly Section 234C advance tax installments to Section 139(1) return cutoffs, GST 3B filings, and TDS depositions.
          </p>
<div className="pt-3 flex flex-wrap items-center gap-4">
<button className="bg-[#8A5A3C] hover:bg-[#784E34] text-white font-body-sm text-body-sm font-medium px-5 py-3 rounded border border-[#784E34] transition-all flex items-center gap-2.5 shadow-sm">
<span className="material-symbols-outlined text-[18px]">calendar_month</span>
              Sync with My Calendar (.ics / Google / Outlook)
            </button>
<button className="bg-white hover:bg-[#EFEAE3] text-[#171310] font-body-sm text-body-sm font-medium px-5 py-3 rounded border border-[#D8D1C9] transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">download</span>
              Download AY 2026–27 Master Wallchart (PDF)
            </button>
</div>
</div>

<div className="lg:col-span-4 bg-white border border-[#D8D1C9] rounded p-6 shadow-sm space-y-5">
<div className="border-b border-[#D8D1C9] pb-3 flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Filing Telemetry</span>
<span className="font-mono text-xs text-primary font-semibold">CBDT LIVE</span>
</div>
<div className="space-y-4">
<div className="p-3.5 bg-[#FAF9F7] border border-[#D8D1C9]/80 rounded">
<div className="font-display-hero text-[32px] leading-none font-serif text-[#171310] font-normal mb-1">₹0</div>
<div className="font-body-sm text-body-sm text-secondary leading-snug">
                Sec 234B/234C Penal Interest incurred by monitored active entities.
              </div>
</div>
<div className="p-3.5 bg-[#FAF9F7] border border-[#D8D1C9]/80 rounded">
<div className="font-display-hero text-[32px] leading-none font-serif text-primary font-normal mb-1">100%</div>
<div className="font-body-sm text-body-sm text-secondary leading-snug">
                CBDT Circular &amp; Notification sync speed within 120 seconds of Gazette release.
              </div>
</div>
<div className="p-3.5 bg-[#FAF9F7] border border-[#D8D1C9]/80 rounded">
<div className="font-display-hero text-[32px] leading-none font-serif text-[#171310] font-normal mb-1">48-Hour</div>
<div className="font-body-sm text-body-sm text-secondary leading-snug">
                Proactive cashflow buffer warnings prior to scheduled quarterly tax outflows.
              </div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#EFEAE3] border-b border-[#D8D1C9] py-4 px-6 lg:px-12 sticky top-16 z-30 shadow-sm">
<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

<div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs scrollbar-none" id="personaFilterGroup">
<button className="bg-[#24170F] text-[#EEE3D6] font-body-sm text-[13px] px-3.5 py-1.5 rounded font-medium whitespace-nowrap transition-colors" data-persona="all">
          All Deadlines (Master)
        </button>
<button className="bg-white hover:bg-[#FAF9F7] text-[#171310] border border-[#D8D1C9] font-body-sm text-[13px] px-3.5 py-1.5 rounded whitespace-nowrap transition-colors" data-persona="salaried">
          Salaried &amp; Tech (ITR-1/2 · FA · ESOP)
        </button>
<button className="bg-white hover:bg-[#FAF9F7] text-[#171310] border border-[#D8D1C9] font-body-sm text-[13px] px-3.5 py-1.5 rounded whitespace-nowrap transition-colors" data-persona="consultants">
          Freelancers &amp; Sec 44ADA
        </button>
<button className="bg-white hover:bg-[#FAF9F7] text-[#171310] border border-[#D8D1C9] font-body-sm text-[13px] px-3.5 py-1.5 rounded whitespace-nowrap transition-colors" data-persona="smes">
          SMEs &amp; Corporate (TDS · GST · 43B(h))
        </button>
<button className="bg-white hover:bg-[#FAF9F7] text-[#171310] border border-[#D8D1C9] font-body-sm text-[13px] px-3.5 py-1.5 rounded whitespace-nowrap transition-colors" data-persona="cas">
          CA Practice Ledgers
        </button>
</div>

<div className="flex items-center gap-5 text-xs text-secondary shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#D8D1C9]">
<label className="flex items-center gap-2 cursor-pointer select-none">
<input className="w-4 h-4 rounded border-[#84746c] text-[#8A5A3C] focus:ring-0 focus:ring-offset-0" id="togglePastEvents" type="checkbox"/>
<span className="font-body-sm text-body-sm text-on-surface">Show Past FY 2024–25 Entries</span>
</label>
<label className="flex items-center gap-2 cursor-pointer select-none">
<input defaultChecked className="w-4 h-4 rounded border-[#84746c] text-[#8A5A3C] focus:ring-0 focus:ring-offset-0" id="toggleArbitrageOverlay" type="checkbox"/>
<span className="font-body-sm text-body-sm text-on-surface font-medium text-primary">Interest Impact Overlay</span>
</label>
</div>
</div>
</section>

<section className="w-full bg-[#FAF9F7] py-16 px-6 lg:px-12 border-b border-[#D8D1C9]">
<div className="max-w-7xl mx-auto space-y-10">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<div className="font-label-caps text-label-caps uppercase tracking-wider text-primary font-semibold mb-1">
            Chronological Statutory Trajectory
          </div>
<h2 className="font-headline-lg text-headline-lg font-serif text-[#171310]">
            Upcoming Compliance Obligations &amp; Deadlines
          </h2>
</div>
<div className="text-right text-xs text-secondary font-mono">
<span>Current Active Anchor: <strong>FY 2025–26 (Quarter 1)</strong></span>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

<div className="bg-white border-2 border-[#8A5A3C] rounded p-5 relative shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-0.5">
<div className="absolute -top-3 right-4 bg-[#8A5A3C] text-white font-label-caps text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded">
            Imminent · Due in 18 Days
          </div>
<div>
<div className="font-mono text-xs text-secondary mb-1">SCHEDULE I · Q1 ADVANCE TAX</div>
<div className="font-headline-md text-headline-md font-serif text-[#171310] mb-2">15 June 2025</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
              First Advance Tax installment: Cumulative <strong>15% of estimated net tax liability</strong> for corporates and individual non-presumptive taxpayers (u/s 208-211).
            </p>
<div className="p-3 bg-[#FAF2EC] border border-[#f4dbcd] rounded text-xs space-y-1 mb-4">
<div className="font-semibold text-primary flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px]">warning</span>
<span>Section 234C Statutory Penalty</span>
</div>
<p className="text-secondary leading-normal">
                1% simple interest per month levied for 3 months on shortfall if paid amount is below 12% threshold.
              </p>
</div>
</div>
<div className="pt-3 border-t border-[#D8D1C9] flex items-center justify-between">
<button className="text-xs font-semibold text-primary hover:text-[#784E34] flex items-center gap-1">
              Calculate Q1 Burden <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
<span className="font-label-caps text-[10px] uppercase text-secondary">Sec 234C</span>
</div>
</div>

<div className="bg-white border border-[#D8D1C9] rounded p-5 relative shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
<div>
<div className="font-mono text-xs text-secondary mb-1">SCHEDULE II · CERTIFICATE ISSUANCE</div>
<div className="font-headline-md text-headline-md font-serif text-[#171310] mb-2">15 July 2025</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
              Mandatory issuance of <strong>Form 16 (Part A &amp; B)</strong> by employers and Form 16A by banks/deductors for Q4 tax deductions.
            </p>
<div className="p-3 bg-[#FAF9F7] border border-[#D8D1C9] rounded text-xs space-y-1 mb-4">
<div className="font-semibold text-on-surface flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-secondary">sync_alt</span>
<span>Form 26AS &amp; AIS Verification</span>
</div>
<p className="text-secondary leading-normal">
                Taxpayers must cross-reference TDS certificates with TRACES credits prior to filing annual returns.
              </p>
</div>
</div>
<div className="pt-3 border-t border-[#D8D1C9] flex items-center justify-between">
<button className="text-xs font-semibold text-secondary hover:text-[#171310] flex items-center gap-1">
              Audit 26AS Pipeline <span className="material-symbols-outlined text-[14px]">open_in_new</span>
</button>
<span className="font-label-caps text-[10px] uppercase text-secondary">Rule 31</span>
</div>
</div>

<div className="bg-white border-2 border-[#ba1a1a]/40 rounded p-5 relative shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
<div className="absolute -top-3 right-4 bg-[#ba1a1a] text-white font-label-caps text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded">
            Statutory Peak Cutoff
          </div>
<div>
<div className="font-mono text-xs text-[#ba1a1a] font-semibold mb-1">CRITICAL CUTOFF · NON-AUDIT ITR</div>
<div className="font-headline-md text-headline-md font-serif text-[#171310] mb-2">31 July 2025</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
              Statutory return filing deadline u/s 139(1) for individuals, salaried employees, HUFs, and non-audit business entities for AY 2025–26.
            </p>
<div className="p-3 bg-[#fff1f0] border border-[#ffdad6] rounded text-xs space-y-1 mb-4">
<div className="font-semibold text-[#ba1a1a] flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px]">gavel</span>
<span>Default Penal Consequences</span>
</div>
<p className="text-secondary leading-normal">
                Sec 234F fee up to ₹5,000 + Sec 234A interest (1%/mo). Loss of right to carry forward capital/business losses.
              </p>
</div>
</div>
<div className="pt-3 border-t border-[#D8D1C9] flex items-center justify-between">
<button className="text-xs font-semibold text-[#ba1a1a] hover:text-[#93000a] flex items-center gap-1">
              Launch ITR Filing Engine <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
<span className="font-label-caps text-[10px] uppercase text-secondary">Sec 139(1)</span>
</div>
</div>

<div className="bg-white border border-[#D8D1C9] rounded p-5 relative shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
<div>
<div className="font-mono text-xs text-secondary mb-1">SCHEDULE III · Q2 ADVANCE TAX</div>
<div className="font-headline-md text-headline-md font-serif text-[#171310] mb-2">15 Sept 2025</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
              Second Advance Tax installment: Cumulative <strong>45% of estimated net liability</strong>. Sec 44AD/ADA filers exempt until Q4.
            </p>
<div className="p-3 bg-[#FAF9F7] border border-[#D8D1C9] rounded text-xs space-y-1 mb-4">
<div className="font-semibold text-on-surface flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-secondary">analytics</span>
<span>Section 234C Benchmark</span>
</div>
<p className="text-secondary leading-normal">
                Requires minimum 36% paid to avoid 1% monthly interest surcharge across the subsequent quarter.
              </p>
</div>
</div>
<div className="pt-3 border-t border-[#D8D1C9] flex items-center justify-between">
<button className="text-xs font-semibold text-secondary hover:text-[#171310] flex items-center gap-1">
              Review Q2 Ledger <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
<span className="font-label-caps text-[10px] uppercase text-secondary">Sec 211(1)(b)</span>
</div>
</div>

<div className="bg-white border border-[#D8D1C9] rounded p-5 relative shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
<div>
<div className="font-mono text-xs text-secondary mb-1">SCHEDULE IV · AUDIT &amp; CORPORATE</div>
<div className="font-headline-md text-headline-md font-serif text-[#171310] mb-2">30 Sep / 31 Oct</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
              Tax Audit Report u/s 44AB (30 Sep) &amp; Corporate / Firm ITR submission under Sec 139(1) (31 Oct).
            </p>
<div className="p-3 bg-[#FAF9F7] border border-[#D8D1C9] rounded text-xs space-y-1 mb-4">
<div className="font-semibold text-on-surface flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-secondary">fact_check</span>
<span>Clause 26 / 43B(h) Audit</span>
</div>
<p className="text-secondary leading-normal">
                Mandatory disclosure of overdue payments to micro/small enterprises past the 45-day payment statutory window.
              </p>
</div>
</div>
<div className="pt-3 border-t border-[#D8D1C9] flex items-center justify-between">
<span className="text-xs text-secondary">Audit Portal Active</span>
<span className="font-label-caps text-[10px] uppercase text-secondary">Sec 44AB</span>
</div>
</div>

<div className="bg-white border border-[#D8D1C9] rounded p-5 relative shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
<div>
<div className="font-mono text-xs text-secondary mb-1">SCHEDULE V · Q3 ADVANCE TAX</div>
<div className="font-headline-md text-headline-md font-serif text-[#171310] mb-2">15 Dec 2025</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
              Third Advance Tax installment: Cumulative <strong>75% of estimated total tax liability</strong> to prevent 234C accrual.
            </p>
<div className="p-3 bg-[#FAF9F7] border border-[#D8D1C9] rounded text-xs space-y-1 mb-4">
<div className="font-semibold text-on-surface flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-secondary">calculate</span>
<span>Capital Gains Sprints</span>
</div>
<p className="text-secondary leading-normal">
                Includes taxes on realized capital gains up to 15th December across equity, mutual funds, and immovable property.
              </p>
</div>
</div>
<div className="pt-3 border-t border-[#D8D1C9] flex items-center justify-between">
<span className="text-xs text-secondary">Reconciliation Scheduled</span>
<span className="font-label-caps text-[10px] uppercase text-secondary">Sec 234C</span>
</div>
</div>

<div className="bg-white border border-[#D8D1C9] rounded p-5 relative shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
<div>
<div className="font-mono text-xs text-secondary mb-1">SCHEDULE VI · Q4 FINAL INSTALLMENT</div>
<div className="font-headline-md text-headline-md font-serif text-[#171310] mb-2">15 March 2026</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
              Final Advance Tax tranche: <strong>100% of tax liability</strong>. Presumptive filers (Sec 44AD/44ADA) must deposit full 100% liability.
            </p>
<div className="p-3 bg-[#FAF9F7] border border-[#D8D1C9] rounded text-xs space-y-1 mb-4">
<div className="font-semibold text-on-surface flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-secondary">shield</span>
<span>Section 234B Safe Harbor</span>
</div>
<p className="text-secondary leading-normal">
                Ensures at least 90% of assessed tax is deposited before 31 March to stop Section 234B 1% recurring interest.
              </p>
</div>
</div>
<div className="pt-3 border-t border-[#D8D1C9] flex items-center justify-between">
<span className="text-xs text-secondary">Advance Tax Radar</span>
<span className="font-label-caps text-[10px] uppercase text-secondary">Sec 211(1)(d)</span>
</div>
</div>

<div className="bg-white border border-[#D8D1C9] rounded p-5 relative shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
<div>
<div className="font-mono text-xs text-secondary mb-1">SCHEDULE VII · FISCAL CURTAIN</div>
<div className="font-headline-md text-headline-md font-serif text-[#171310] mb-2">31 March 2026</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
              Final statutory cutoff for filing Belated ITR (Sec 139(4)) &amp; Revised ITR (Sec 139(5)) for AY 2025–26. Last day for Sec 80C/80D investments.
            </p>
<div className="p-3 bg-[#FAF9F7] border border-[#D8D1C9] rounded text-xs space-y-1 mb-4">
<div className="font-semibold text-on-surface flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-secondary">lock</span>
<span>Absolute Guillotine</span>
</div>
<p className="text-secondary leading-normal">
                After this timestamp, AY 2025–26 returns can only be filed as an Updated Return (ITR-U) with severe 25%–50% penalty additions.
              </p>
</div>
</div>
<div className="pt-3 border-t border-[#D8D1C9] flex items-center justify-between">
<span className="text-xs text-secondary">Year End Closing</span>
<span className="font-label-caps text-[10px] uppercase text-secondary">Sec 139(4)/(5)</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#F7F5F1] py-16 px-6 lg:px-12 border-b border-[#D8D1C9]">
<div className="max-w-7xl mx-auto">
<div className="mb-10 text-center max-w-3xl mx-auto">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-primary font-semibold">Deterministic Exposure Audit</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-[#171310] mt-1 mb-3">
          Section 234A, 234B &amp; 234C Statutory Interest Simulator
        </h2>
<p className="font-body-md text-body-md text-secondary">
          Simulate statutory interest penalties incurred from deferred advance tax installments versus TaxPilot autonomous automated cashflow scheduling.
        </p>
</div>
<div className="bg-white border border-[#D8D1C9] rounded shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">

<div className="lg:col-span-5 p-6 lg:p-8 bg-[#FAF9F7] border-b lg:border-b-0 lg:border-r border-[#D8D1C9] space-y-6">
<div className="flex items-center justify-between border-b border-[#D8D1C9] pb-3">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Taxpayer Baseline Parameters</span>
<span className="font-mono text-xs bg-secondary-container px-2 py-0.5 rounded text-on-secondary-container">AY 2026–27 Profile</span>
</div>

<div>
<label className="block font-body-sm text-body-sm font-medium text-on-surface mb-1.5">
              Annual Professional Gross Income / Turnover
            </label>
<div className="relative">
<span className="absolute left-3 top-2.5 text-secondary font-mono text-sm">₹</span>
<input className="w-full pl-8 pr-4 py-2 bg-white border border-[#D8D1C9] rounded font-mono text-sm focus:border-primary focus:outline-none" id="simIncome" type="text" value="28,00,000"/>
</div>
<p className="text-xs text-secondary mt-1">Presumptive taxation eligible u/s 44ADA (50% deemed profit = ₹14,00,000).</p>
</div>

<div>
<label className="block font-body-sm text-body-sm font-medium text-on-surface mb-1.5">
              Estimated Total Net Tax Liability (FY 2025–26)
            </label>
<div className="relative">
<span className="absolute left-3 top-2.5 text-secondary font-mono text-sm">₹</span>
<input className="w-full pl-8 pr-4 py-2 bg-white border border-[#D8D1C9] rounded font-mono text-sm focus:border-primary focus:outline-none" id="simTax" type="text" value="4,80,000"/>
</div>
<p className="text-xs text-secondary mt-1">Exceeds the ₹10,000 statutory advance tax threshold under Sec 208.</p>
</div>

<div>
<label className="block font-body-sm text-body-sm font-medium text-on-surface mb-1.5">
              Advance Tax Paid Before Q4 (15 March)
            </label>
<div className="relative">
<span className="absolute left-3 top-2.5 text-secondary font-mono text-sm">₹</span>
<input className="w-full pl-8 pr-4 py-2 bg-white border border-[#D8D1C9] rounded font-mono text-sm focus:border-primary focus:outline-none" id="simPaid" type="text" value="1,00,000"/>
</div>
<div className="mt-2 text-xs text-[#9A4540] flex items-center gap-1 font-medium">
<span className="material-symbols-outlined text-[14px]">error</span>
              Deficit of ₹3,80,000 against assessed statutory liability.
            </div>
</div>
<div className="pt-2">
<button className="w-full bg-[#8A5A3C] hover:bg-[#784E34] text-white font-body-sm text-body-sm font-medium py-2.5 px-4 rounded border border-[#784E34] transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[16px]">sync</span> Recalculate Statutory Penalties
            </button>
</div>
</div>

<div className="lg:col-span-7 p-6 lg:p-8 space-y-6 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between border-b border-[#D8D1C9] pb-3 mb-6">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Computed Statutory Penalty Ledger</span>
<span className="font-label-caps text-label-caps text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold uppercase">Rule Engine Certified</span>
</div>

<div className="border border-[#D8D1C9] rounded overflow-hidden mb-6">
<table className="w-full text-left font-body-sm text-body-sm">
<thead className="bg-[#EFEAE3] text-secondary font-label-caps text-[11px] uppercase tracking-wider border-b border-[#D8D1C9]">
<tr>
<th className="py-2.5 px-4">Statutory Clause</th>
<th className="py-2.5 px-4">Shortfall Baseline</th>
<th className="py-2.5 px-4">Rate &amp; Period</th>
<th className="py-2.5 px-4 text-right">Penal Amount</th>
</tr>
</thead>
<tbody className="divide-y divide-[#D8D1C9] text-on-surface">
<tr className="hover:bg-[#FAF9F7]">
<td className="py-3 px-4 font-medium">
                      Sec 234C (Q1 Shortfall)
                      <span className="block text-[11px] text-secondary font-normal">Target: 15% (₹72,000) · Paid: ₹0</span>
</td>
<td className="py-3 px-4 font-mono">₹72,000</td>
<td className="py-3 px-4 text-xs">1% × 3 mos</td>
<td className="py-3 px-4 font-mono text-right text-[#9A4540]">₹2,160</td>
</tr>
<tr className="hover:bg-[#FAF9F7]">
<td className="py-3 px-4 font-medium">
                      Sec 234C (Q2 Shortfall)
                      <span className="block text-[11px] text-secondary font-normal">Target: 45% (₹2,16,000) · Paid: ₹50,000</span>
</td>
<td className="py-3 px-4 font-mono">₹1,66,000</td>
<td className="py-3 px-4 text-xs">1% × 3 mos</td>
<td className="py-3 px-4 font-mono text-right text-[#9A4540]">₹4,980</td>
</tr>
<tr className="hover:bg-[#FAF9F7]">
<td className="py-3 px-4 font-medium">
                      Sec 234C (Q3 Shortfall)
                      <span className="block text-[11px] text-secondary font-normal">Target: 75% (₹3,60,000) · Paid: ₹1,00,000</span>
</td>
<td className="py-3 px-4 font-mono">₹2,60,000</td>
<td className="py-3 px-4 text-xs">1% × 3 mos</td>
<td className="py-3 px-4 font-mono text-right text-[#9A4540]">₹7,800</td>
</tr>
<tr className="hover:bg-[#FAF9F7]">
<td className="py-3 px-4 font-medium">
                      Sec 234B (Default &lt;90% Pre-April)
                      <span className="block text-[11px] text-secondary font-normal">Shortfall on ₹4,80,000 assessed tax</span>
</td>
<td className="py-3 px-4 font-mono">₹3,80,000</td>
<td className="py-3 px-4 text-xs">1% per mo until ITR</td>
<td className="py-3 px-4 font-mono text-right text-[#9A4540]">₹3,460</td>
</tr>
<tr className="bg-[#FAF9F7] font-semibold text-on-surface border-t-2 border-[#171310]">
<td className="py-3 px-4" colSpan={3}>Total Unplanned Statutory Interest Outflow</td>
<td className="py-3 px-4 font-mono text-right text-[#9A4540] text-base">₹18,400</td>
</tr>
</tbody>
</table>
</div>

<div className="p-4 bg-emerald-50 border border-emerald-200 rounded flex items-start gap-3">
<span className="material-symbols-outlined text-emerald-800 text-[22px] shrink-0 mt-0.5">verified_user</span>
<div className="space-y-1">
<div className="font-semibold text-emerald-950 text-sm">TaxPilot Autonomous Advance Cushion: ₹18,400 Protected</div>
<p className="text-xs text-emerald-900 leading-relaxed">
                  TaxPilot’s predictive withholding triggers phased challan deposits exactly on the 14th of each June, September, December, and March — completely eliminating Section 234C exposure.
                </p>
</div>
</div>
</div>
<div className="pt-4 flex items-center justify-between">
<span className="text-xs text-secondary font-mono">Challan ITNS 280 API Sync Ready</span>
<button className="bg-[#24170F] hover:bg-[#342318] text-[#EEE3D6] font-body-sm text-body-sm font-medium px-4 py-2 rounded transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">alarm_on</span>
              Schedule Autonomous Reminders
            </button>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#1c1512] text-[#EEE3D6] py-20 px-6 lg:px-12 border-b border-[#5A4535]">
<div className="max-w-7xl mx-auto space-y-12">

<div className="max-w-3xl space-y-3">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-[#f7b995] font-semibold">
          Architectural Integrity
        </span>
<h2 className="font-headline-lg text-headline-lg font-serif text-[#EEE3D6]">
          Statutory Defense Protocols &amp; Regulatory Ingestion
        </h2>
<p className="font-body-md text-body-md text-[#D8D1C9] leading-relaxed">
          The TaxPilot chronometer does not rely on static checklists. Four autonomous subsystems parse statutory changes, enforce MSME trade cycles, and reconcile digital footprints in real-time.
        </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

<div className="bg-[#261d18] border border-[#5A4535] rounded p-6 space-y-4 hover:border-[#8A5A3C] transition-colors flex flex-col justify-between">
<div className="space-y-3">
<div className="flex items-center justify-between">
<span className="font-mono text-xs text-[#f7b995] font-semibold">PROTOCOL 01</span>
<span className="material-symbols-outlined text-[#f7b995] text-[20px]">rss_feed</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-[#EEE3D6]">Gazetted Notification Sentinel</h3>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed">
              Automated parser monitoring the Official Gazette, CBDT circulars, and GST Council advisories. Ingests statutory deadline extensions directly into user active schedules within 120 seconds.
            </p>
</div>
<div className="pt-4 border-t border-[#5A4535]/80 flex items-center justify-between text-xs text-[#D8D1C9]">
<span className="font-mono">Sync: 120s TTL</span>
<span className="text-emerald-400">● Live</span>
</div>
</div>

<div className="bg-[#261d18] border border-[#5A4535] rounded p-6 space-y-4 hover:border-[#8A5A3C] transition-colors flex flex-col justify-between">
<div className="space-y-3">
<div className="flex items-center justify-between">
<span className="font-mono text-xs text-[#f7b995] font-semibold">PROTOCOL 02</span>
<span className="material-symbols-outlined text-[#f7b995] text-[20px]">schedule</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-[#EEE3D6]">Sec 43B(h) MSME 45-Day Radar</h3>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed">
              Continuous invoice aging scanner enforcing mandatory supplier payment windows (15/45 days under the MSMED Act, 2006) to prevent disallowance of operating deductions during tax audit.
            </p>
</div>
<div className="pt-4 border-t border-[#5A4535]/80 flex items-center justify-between text-xs text-[#D8D1C9]">
<span className="font-mono">Clause 26 Linked</span>
<span className="text-emerald-400">● Enforced</span>
</div>
</div>

<div className="bg-[#261d18] border border-[#5A4535] rounded p-6 space-y-4 hover:border-[#8A5A3C] transition-colors flex flex-col justify-between">
<div className="space-y-3">
<div className="flex items-center justify-between">
<span className="font-mono text-xs text-[#f7b995] font-semibold">PROTOCOL 03</span>
<span className="material-symbols-outlined text-[#f7b995] text-[20px]">difference</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-[#EEE3D6]">26AS &amp; AIS Reconciliation Sprints</h3>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed">
              Quarterly TRACES synchronizer matching Section 194J/194C withholding credits against client ledger receivables before each advance tax payment cutoff, avoiding double taxation.
            </p>
</div>
<div className="pt-4 border-t border-[#5A4535]/80 flex items-center justify-between text-xs text-[#D8D1C9]">
<span className="font-mono">TDS Verification</span>
<span className="text-emerald-400">● Continuous</span>
</div>
</div>

<div className="bg-[#261d18] border border-[#5A4535] rounded p-6 space-y-4 hover:border-[#8A5A3C] transition-colors flex flex-col justify-between">
<div className="space-y-3">
<div className="flex items-center justify-between">
<span className="font-mono text-xs text-[#f7b995] font-semibold">PROTOCOL 04</span>
<span className="material-symbols-outlined text-[#f7b995] text-[20px]">history</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-serif text-[#EEE3D6]">ITR-U 24-Month Clock</h3>
<p className="font-body-sm text-body-sm text-[#D8D1C9] leading-relaxed">
              Precision statutory chronometer under Section 139(8A) calculating dynamic 25% (Months 1–12) and 50% (Months 13–24) additional tax rates on missed income disclosures before scrutiny notices arrive.
            </p>
</div>
<div className="pt-4 border-t border-[#5A4535]/80 flex items-center justify-between text-xs text-[#D8D1C9]">
<span className="font-mono">Sec 139(8A) Ready</span>
<span className="text-[#f7b995]">● Auto-Tax</span>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-[#FAF9F7] py-16 px-6 lg:px-12 border-b border-[#D8D1C9]">
<div className="max-w-7xl mx-auto space-y-8">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-primary font-semibold">Statutory Reference Matrix</span>
<h2 className="font-headline-lg text-headline-lg font-serif text-[#171310] mt-1">
            Master Fiscal Taxonomy · FY 2025–26 (AY 2026–27)
          </h2>
</div>
<div className="flex items-center gap-3">
<span className="font-body-sm text-body-sm text-secondary">Export Format:</span>
<button className="bg-white border border-[#D8D1C9] text-xs font-mono px-3 py-1.5 rounded hover:bg-[#EFEAE3] transition-colors">CSV</button>
<button className="bg-white border border-[#D8D1C9] text-xs font-mono px-3 py-1.5 rounded hover:bg-[#EFEAE3] transition-colors">JSON</button>
<button className="bg-white border border-[#D8D1C9] text-xs font-mono px-3 py-1.5 rounded hover:bg-[#EFEAE3] transition-colors">PDF Ledger</button>
</div>
</div>

<div className="bg-white border border-[#D8D1C9] rounded shadow-sm overflow-x-auto">
<table className="w-full text-left font-body-sm text-body-sm border-collapse">
<thead className="bg-[#EFEAE3] text-[#51443d] font-label-caps text-[11px] uppercase tracking-wider border-b border-[#D8D1C9]">
<tr>
<th className="py-3.5 px-4">Statutory Clause</th>
<th className="py-3.5 px-4">Section / Form</th>
<th className="py-3.5 px-4">Cadence</th>
<th className="py-3.5 px-4">Mandatory Due Date</th>
<th className="py-3.5 px-4">Statutory Non-Compliance Penalty</th>
<th className="py-3.5 px-4 text-right">TaxPilot Automation Shield</th>
</tr>
</thead>
<tbody className="divide-y divide-[#D8D1C9] text-on-surface">

<tr className="hover:bg-[#FAF9F7] transition-colors">
<td className="py-3 px-4 font-medium text-on-surface">Advance Tax (Tranche 1)</td>
<td className="py-3 px-4 font-mono text-xs text-secondary">Sec 208, 211(1)(a)</td>
<td className="py-3 px-4 text-xs">Quarterly (15%)</td>
<td className="py-3 px-4 font-mono font-medium text-primary">15 June 2025</td>
<td className="py-3 px-4 text-xs text-[#9A4540]">1% simple interest/month u/s 234C for 3 months</td>
<td className="py-3 px-4 text-right font-mono text-xs text-emerald-800 font-medium">Challan 280 Auto-Stage</td>
</tr>

<tr className="hover:bg-[#FAF9F7] transition-colors">
<td className="py-3 px-4 font-medium text-on-surface">Non-Audit Return Filing</td>
<td className="py-3 px-4 font-mono text-xs text-secondary">Sec 139(1) / ITR-1, 2, 4</td>
<td className="py-3 px-4 text-xs">Annual</td>
<td className="py-3 px-4 font-mono font-medium text-[#ba1a1a]">31 July 2025</td>
<td className="py-3 px-4 text-xs text-[#9A4540]">₹5,000 late fee u/s 234F + 1%/mo u/s 234A + loss carry-forward forfeiture</td>
<td className="py-3 px-4 text-right font-mono text-xs text-emerald-800 font-medium">Direct E-File Gateway</td>
</tr>

<tr className="hover:bg-[#FAF9F7] transition-colors">
<td className="py-3 px-4 font-medium text-on-surface">Advance Tax (Tranche 2)</td>
<td className="py-3 px-4 font-mono text-xs text-secondary">Sec 211(1)(b)</td>
<td className="py-3 px-4 text-xs">Quarterly (45%)</td>
<td className="py-3 px-4 font-mono font-medium">15 Sept 2025</td>
<td className="py-3 px-4 text-xs text-[#9A4540]">1% interest/mo on shortfall below 36% for 3 months</td>
<td className="py-3 px-4 text-right font-mono text-xs text-emerald-800 font-medium">AIS/26AS Ingestion Check</td>
</tr>

<tr className="hover:bg-[#FAF9F7] transition-colors">
<td className="py-3 px-4 font-medium text-on-surface">Tax Audit Report</td>
<td className="py-3 px-4 font-mono text-xs text-secondary">Sec 44AB / Form 3CA/3CD</td>
<td className="py-3 px-4 text-xs">Annual</td>
<td className="py-3 px-4 font-mono font-medium">30 Sept 2025</td>
<td className="py-3 px-4 text-xs text-[#9A4540]">0.5% of turnover or ₹1,50,000 u/s 271B</td>
<td className="py-3 px-4 text-right font-mono text-xs text-emerald-800 font-medium">Working Paper Generator</td>
</tr>

<tr className="hover:bg-[#FAF9F7] transition-colors">
<td className="py-3 px-4 font-medium text-on-surface">Corporate / Audit ITR</td>
<td className="py-3 px-4 font-mono text-xs text-secondary">Sec 139(1) / ITR-5, 6</td>
<td className="py-3 px-4 text-xs">Annual</td>
<td className="py-3 px-4 font-mono font-medium">31 Oct 2025</td>
<td className="py-3 px-4 text-xs text-[#9A4540]">Sec 234F fee + 234A penal surcharge</td>
<td className="py-3 px-4 text-right font-mono text-xs text-emerald-800 font-medium">MCA-ITD XML Bridge</td>
</tr>

<tr className="hover:bg-[#FAF9F7] transition-colors">
<td className="py-3 px-4 font-medium text-on-surface">Monthly TDS Remittance</td>
<td className="py-3 px-4 font-mono text-xs text-secondary">Sec 200 / Challan 281</td>
<td className="py-3 px-4 text-xs">Monthly</td>
<td className="py-3 px-4 font-mono font-medium">7th of following month</td>
<td className="py-3 px-4 text-xs text-[#9A4540]">1.5% interest/month from date of deduction u/s 201(1A)</td>
<td className="py-3 px-4 text-right font-mono text-xs text-emerald-800 font-medium">Bank Auto-Debit Webhook</td>
</tr>

<tr className="hover:bg-[#FAF9F7] transition-colors">
<td className="py-3 px-4 font-medium text-on-surface">Quarterly TDS Filing</td>
<td className="py-3 px-4 font-mono text-xs text-secondary">Form 24Q, 26Q, 27Q</td>
<td className="py-3 px-4 text-xs">Quarterly</td>
<td className="py-3 px-4 font-mono font-medium">31 July / Oct / Jan / May</td>
<td className="py-3 px-4 text-xs text-[#9A4540]">₹200 per day statutory late fee u/s 234E</td>
<td className="py-3 px-4 text-right font-mono text-xs text-emerald-800 font-medium">FVU File Auto-Validator</td>
</tr>

<tr className="hover:bg-[#FAF9F7] transition-colors">
<td className="py-3 px-4 font-medium text-on-surface">Belated / Revised Cutoff</td>
<td className="py-3 px-4 font-mono text-xs text-secondary">Sec 139(4) / 139(5)</td>
<td className="py-3 px-4 text-xs">Terminal AY Cutoff</td>
<td className="py-3 px-4 font-mono font-medium text-[#ba1a1a]">31 Dec 2025 / 31 Mar 2026</td>
<td className="py-3 px-4 text-xs text-[#9A4540]">Permanent loss of standard return filing; shifted to ITR-U + 25-50% tax penalty</td>
<td className="py-3 px-4 text-right font-mono text-xs text-emerald-800 font-medium">Red-Line Warning Bell</td>
</tr>
</tbody>
</table>
</div>
</div>
</section>

<section className="w-full bg-[#F7F5F1] py-16 px-6 lg:px-12 border-b border-[#D8D1C9]">
<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

<div className="lg:col-span-7 bg-white border border-[#D8D1C9] rounded p-6 lg:p-8 space-y-6 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between border-b border-[#D8D1C9] pb-3 mb-6">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Ecosystem Bridges</span>
<span className="font-mono text-xs text-primary font-medium">RFC 5545 iCalendar Compliant</span>
</div>
<h3 className="font-headline-md text-headline-md font-serif text-[#171310] mb-2">
            One-Click Calendar Sync &amp; ERP Hooks
          </h3>
<p className="font-body-sm text-body-sm text-secondary leading-relaxed mb-6">
            Export dynamically filtered compliance schedules directly to your organization's calendar and enterprise resource planning environments. Never depend on human memory for statutory deadlines.
          </p>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
<button className="flex items-center justify-center gap-2 p-3 bg-[#FAF9F7] hover:bg-[#EFEAE3] border border-[#D8D1C9] rounded text-xs font-medium text-[#171310] transition-colors">
<span className="material-symbols-outlined text-[18px] text-primary">event_available</span>
              Google Calendar
            </button>
<button className="flex items-center justify-center gap-2 p-3 bg-[#FAF9F7] hover:bg-[#EFEAE3] border border-[#D8D1C9] rounded text-xs font-medium text-[#171310] transition-colors">
<span className="material-symbols-outlined text-[18px] text-primary">mail</span>
              Microsoft Outlook
            </button>
<button className="flex items-center justify-center gap-2 p-3 bg-[#FAF9F7] hover:bg-[#EFEAE3] border border-[#D8D1C9] rounded text-xs font-medium text-[#171310] transition-colors">
<span className="material-symbols-outlined text-[18px] text-primary">devices_other</span>
              Apple iCal (.ics)
            </button>
</div>
<div className="p-4 bg-[#FAF9F7] border border-[#D8D1C9] rounded space-y-2">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">ERP &amp; Practice Automation Webhooks</span>
<span className="font-mono text-[11px] text-emerald-800">REST API v2</span>
</div>
<p className="text-xs text-secondary leading-relaxed">
              Native synchronization drivers available for Darwinbox, Zoho Books, Tally Prime, and ClearTax enterprise instances.
            </p>
</div>
</div>
<div className="pt-4 border-t border-[#D8D1C9] flex items-center justify-between text-xs text-secondary">
<span>Continuous feed: Updates push automatically upon CBDT circulars.</span>
<span className="font-mono text-primary font-medium">Sync Active</span>
</div>
</div>

<div className="lg:col-span-5 bg-white border border-[#D8D1C9] rounded p-6 lg:p-8 space-y-6 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between border-b border-[#D8D1C9] pb-3 mb-6">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Dispatch Channels</span>
<span className="font-mono text-xs text-primary font-medium">256-Bit Bank Grade</span>
</div>
<h3 className="font-headline-md text-headline-md font-serif text-[#171310] mb-2">
            Multi-Tier Notification Matrix
          </h3>
<p className="font-body-sm text-body-sm text-secondary leading-relaxed mb-6">
            Configure how and when your finance team or advisory practice receives escalation alerts prior to statutory cutoffs.
          </p>
<div className="space-y-3">
<div className="flex items-center justify-between p-3 bg-[#FAF9F7] border border-[#D8D1C9] rounded">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-secondary text-[20px]">mark_email_read</span>
<div>
<div className="text-xs font-medium text-on-surface">Executive Email Dispatches</div>
<div className="text-[11px] text-secondary">T-14, T-7, and T-2 day countdown digests</div>
</div>
</div>
<input defaultChecked className="w-4 h-4 rounded border-[#84746c] text-[#8A5A3C]" type="checkbox"/>
</div>
<div className="flex items-center justify-between p-3 bg-[#FAF9F7] border border-[#D8D1C9] rounded">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-secondary text-[20px]">chat</span>
<div>
<div className="text-xs font-medium text-on-surface">WhatsApp Business API</div>
<div className="text-[11px] text-secondary">Direct challan alerts with instant payment deep-links</div>
</div>
</div>
<input defaultChecked className="w-4 h-4 rounded border-[#84746c] text-[#8A5A3C]" type="checkbox"/>
</div>
<div className="flex items-center justify-between p-3 bg-[#FAF9F7] border border-[#D8D1C9] rounded">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-secondary text-[20px]">hub</span>
<div>
<div className="text-xs font-medium text-on-surface">Slack &amp; Microsoft Teams Webhooks</div>
<div className="text-[11px] text-secondary">Finance team channel alerts for SME bill clearance</div>
</div>
</div>
<input defaultChecked className="w-4 h-4 rounded border-[#84746c] text-[#8A5A3C]" type="checkbox"/>
</div>
</div>
</div>
<button className="w-full bg-[#8A5A3C] hover:bg-[#784E34] text-white font-body-sm text-body-sm font-medium py-2.5 px-4 rounded border border-[#784E34] transition-colors">
          Save Notification Architecture
        </button>
</div>
</div>
</section>

<section className="w-full bg-[#24170F] text-[#EEE3D6] py-16 px-6 lg:px-12 border-b border-[#5A4535]">
<div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
<div className="space-y-3 max-w-2xl text-center lg:text-left">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-[#f7b995] font-semibold">
          Filing Armor for AY 2026–27
        </span>
<h2 className="font-headline-lg text-headline-lg font-serif text-[#EEE3D6]">
          Never miss a statutory window. Protect your cashflow.
        </h2>
<p className="font-body-md text-body-md text-[#D8D1C9] leading-relaxed">
          Arm your personal balance sheet or corporate finance desk with deterministic statutory vigilance. Automated calculation of Section 234 installments and frictionless ITD filing.
        </p>
</div>
<div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
<button className="bg-[#8A5A3C] hover:bg-[#784E34] text-white font-body-sm text-body-sm font-medium px-6 py-3.5 rounded border border-[#784E34] transition-all flex items-center gap-2 shadow-sm">
<span className="material-symbols-outlined text-[18px]">lock_reset</span>
          Activate Compliance Calendar
        </button>
<button className="bg-[#342318] hover:bg-[#453022] text-[#EEE3D6] font-body-sm text-body-sm font-medium px-6 py-3.5 rounded border border-[#5A4535] transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">verified</span>
          Book Enterprise Schedule Audit
        </button>
</div>
</div>
</section>

<section className="w-full bg-[#FAF9F7] py-8 px-6 lg:px-12 border-b border-[#D8D1C9]">
<div className="max-w-7xl mx-auto text-xs text-secondary leading-relaxed space-y-2">
<p className="font-mono text-[11px] uppercase tracking-wider text-[#51443d] font-semibold">
        Statutory References &amp; Legal Authorities:
      </p>
<p>
        Income Tax Act, 1961: Section 139(1) (Filing of Returns), Section 139(4) (Belated Returns), Section 139(5) (Revised Returns), Section 139(8A) (Updated Returns / ITR-U), Section 208–211 (Advance Tax Liability &amp; Installment Schedules), Section 234A (Interest for default in furnishing return), Section 234B (Interest for default in payment of advance tax), Section 234C (Interest for deferment of advance tax), Section 234F (Fee for default in return submission), Section 43B(h) (MSME payment disallowance).
      </p>
<p className="italic text-[11px] text-[#84746c]">
        Disclaimer: Statutory dates reflect standard timelines under the Finance Act, 2024 and notifications issued by the Central Board of Direct Taxes (CBDT) and Central Board of Indirect Taxes &amp; Customs (CBIC). Any subsequent Gazette notification extending statutory deadlines will be automatically reflected within your active schedule.
      </p>
</div>
</section>
</div>
</main>
<Footer />

    </>
  );
}
