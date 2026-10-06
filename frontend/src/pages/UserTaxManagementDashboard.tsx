import Navbar from '../components/Navbar';


export default function UserTaxManagementDashboard() {
  return (
    <>
      

<aside className="fixed left-0 top-0 h-screen w-[250px] bg-[#F7F5F1] border-r border-app-border-sidebar flex flex-col z-50 select-none">

<div className="h-[72px] px-6 flex items-center border-b border-app-border-sidebar/80">
<div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-md bg-app-text-primary flex items-center justify-center text-white font-serif text-[17px] font-medium leading-none">
          ¶
        </div>
<span className="font-serif text-[21px] tracking-tight font-medium text-app-text-primary">TaxPilot</span>
</div>
</div>

<nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6">

<div>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-app-accent-active text-app-text-primary font-medium text-[14px] border-l-[3px] border-app-accent transition-colors shadow-xs" href="#">
<span className="material-symbols-outlined text-[19px] text-app-accent" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
<span>Overview</span>
</a>
</div>

<div>
<div className="px-3 pb-2 text-[11px] font-semibold text-app-text-muted tracking-wider uppercase">
          My Tax Return
        </div>
<div className="space-y-0.5">
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" href="#">
<span className="material-symbols-outlined text-[19px]">assignment</span>
<span>Tax Return</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" href="#">
<span className="material-symbols-outlined text-[19px]">folder</span>
<span>Documents</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" href="#">
<span className="material-symbols-outlined text-[19px]">receipt_long</span>
<span>Income &amp; Deductions</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" href="#">
<span className="material-symbols-outlined text-[19px]">calculate</span>
<span>Tax Calculation</span>
</a>
</div>
</div>

<div>
<div className="px-3 pb-2 text-[11px] font-semibold text-app-text-muted tracking-wider uppercase">
          Tax Intelligence
        </div>
<div className="space-y-0.5">
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" href="#">
<span className="material-symbols-outlined text-[19px]">savings</span>
<span>Tax Savings</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" href="#">
<span className="material-symbols-outlined text-[19px]">auto_awesome</span>
<span>Tax Copilot</span>
</a>
</div>
</div>

<div>
<div className="px-3 pb-2 text-[11px] font-semibold text-app-text-muted tracking-wider uppercase">
          Validation
        </div>
<div className="space-y-0.5">
<a className="flex items-center justify-between px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" href="#">
<span className="flex items-center gap-3">
<span className="material-symbols-outlined text-[19px]">checklist</span>
<span>Issues &amp; Readiness</span>
</span>
<span className="px-1.5 py-0.5 text-[11px] font-medium rounded-full bg-app-warning-bg text-app-warning border border-app-warning/20">2</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" href="#">
<span className="material-symbols-outlined text-[19px]">send</span>
<span>Review &amp; File</span>
</a>
</div>
</div>

<div>
<div className="px-3 pb-2 text-[11px] font-semibold text-app-text-muted tracking-wider uppercase">
          System
        </div>
<div className="space-y-0.5">
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" href="#">
<span className="material-symbols-outlined text-[19px]">settings</span>
<span>Settings</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-app-text-secondary hover:text-app-text-primary hover:bg-black/[0.03] transition-colors text-[14px]" href="#">
<span className="material-symbols-outlined text-[19px]">help_outline</span>
<span>Help</span>
</a>
</div>
</div>
</nav>

<div className="p-4 border-t border-app-border-sidebar bg-white/40">
<div className="flex items-center justify-between text-[12px]">
<span className="text-app-text-muted">Assessment Year</span>
<span className="font-medium text-app-text-primary tabular-nums">AY 2026–27</span>
</div>
</div>
</aside>

<div className="pl-[250px] min-h-screen flex flex-col">

<Navbar />

<main className="flex-1 w-full py-10 px-12">
<div className="max-w-[1320px] mx-auto space-y-10">

<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
<div>
<h1 className="font-serif text-[40px] leading-[48px] text-app-text-primary font-normal tracking-tight">
              Tax Return Overview
            </h1>
<div className="flex items-center gap-3 mt-1.5">
<p className="text-[15px] text-app-text-secondary">Your FY 2025–26 filing at a glance.</p>
<span className="text-app-text-muted text-[13px]">·</span>
<span className="text-[13px] text-app-text-muted tabular-nums">Last updated: Today, 10:42 AM</span>
</div>
</div>
<div>
<button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-app-accent hover:bg-app-accent-hover text-white text-[14px] font-medium transition-all shadow-sm" type="button">
<span>Continue filing</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>

<section className="bg-app-surface border border-app-border rounded-xl p-8 shadow-xs">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
<div>
<span className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider block">Filing readiness</span>
<p className="text-[14px] text-app-text-secondary mt-0.5">Most of your return is ready for review.</p>
</div>
<div className="font-serif text-[34px] leading-none text-app-text-primary font-normal tabular-nums">
              82%
            </div>
</div>

<div className="w-full h-2 rounded-full bg-[#EFE9E2] overflow-hidden mb-7">
<div className="h-full bg-app-accent rounded-full transition-all duration-500" style={{ width: '82%' }}></div>
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-5 border-t border-app-border-light">
<div>
<span className="text-[12px] text-app-text-muted block">Documents</span>
<div className="mt-1 flex items-center gap-1.5 text-app-success font-medium text-[15px] tabular-nums">
<span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span>12 / 12</span>
</div>
</div>
<div>
<span className="text-[12px] text-app-text-muted block">Data verification</span>
<div className="mt-1 flex items-center gap-1.5 text-app-text-primary font-medium text-[15px] tabular-nums">
<span className="material-symbols-outlined text-[17px] text-app-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span>18 / 20</span>
</div>
</div>
<div>
<span className="text-[12px] text-app-text-muted block">Issues</span>
<div className="mt-1 flex items-center gap-1.5 text-app-warning font-medium text-[15px]">
<span className="material-symbols-outlined text-[17px]">error</span>
<span>2 remaining</span>
</div>
</div>
<div>
<span className="text-[12px] text-app-text-muted block">Review</span>
<div className="mt-1 flex items-center gap-1.5 text-app-text-muted text-[15px]">
<span className="material-symbols-outlined text-[17px]">radio_button_unchecked</span>
<span>Not started</span>
</div>
</div>
</div>
</section>

<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

<div className="bg-app-surface border border-app-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
<span className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider block">Estimated Tax</span>
<div className="mt-3 mb-2">
<span className="font-serif text-[32px] font-normal text-app-text-primary tabular-nums">₹42,840</span>
</div>
<p className="text-[13px] text-app-text-secondary">Based on New Regime (115BAC)</p>
</div>

<div className="bg-app-surface border border-app-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
<span className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider block">Tax Paid</span>
<div className="mt-3 mb-2">
<span className="font-serif text-[32px] font-normal text-app-text-primary tabular-nums">₹38,460</span>
</div>
<p className="text-[13px] text-app-text-secondary">Via TDS &amp; Advance tax</p>
</div>

<div className="bg-app-surface border border-app-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
<span className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider block">Refund / Payable</span>
<div className="mt-3 mb-2">
<span className="font-serif text-[32px] font-normal text-app-text-primary tabular-nums">₹4,380</span>
</div>
<p className="text-[13px] text-app-text-secondary">Net payable before relief</p>
</div>

<div className="bg-app-surface border border-app-border rounded-[10px] p-6 shadow-xs flex flex-col justify-between">
<span className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider block">Tax Savings</span>
<div className="mt-3 mb-2">
<span className="font-serif text-[32px] font-normal text-app-accent tabular-nums">₹12,700</span>
</div>
<p className="text-[13px] text-app-text-secondary">Potential additional deductions</p>
</div>
</section>

<section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

<div className="lg:col-span-8 bg-app-surface border border-app-border rounded-xl p-7 shadow-xs">
<div className="flex items-center justify-between pb-4 border-b border-app-border-light">
<h2 className="font-serif text-[22px] text-app-text-primary font-normal">Return Summary</h2>
<span className="text-[13px] text-app-text-muted">FY 2025–26 Computation</span>
</div>

<div className="divide-y divide-app-border-light text-[14px]">
<div className="py-4 flex items-center justify-between">
<span className="text-app-text-secondary">Gross Income</span>
<span className="text-app-text-primary font-medium tabular-nums">₹36,00,000</span>
</div>
<div className="py-4 flex items-center justify-between">
<span className="text-app-text-secondary">Deductions</span>
<span className="text-app-text-primary font-medium tabular-nums">-₹4,65,000</span>
</div>
<div className="py-4 flex items-center justify-between bg-app-bg/50 px-3 -mx-3 rounded">
<span className="text-app-text-primary font-semibold">Taxable Income</span>
<span className="text-app-text-primary font-semibold tabular-nums text-[15px]">₹31,35,000</span>
</div>
<div className="py-4 flex items-center justify-between">
<span className="text-app-text-secondary">Tax Liability</span>
<span className="text-app-text-primary font-medium tabular-nums">₹4,18,240</span>
</div>
<div className="py-4 flex items-center justify-between">
<span className="text-app-text-secondary">TDS / Advance Tax</span>
<span className="text-app-text-primary font-medium tabular-nums">₹4,26,640</span>
</div>
<div className="py-4 flex items-center justify-between">
<span className="text-app-success font-medium">Estimated Refund</span>
<span className="text-app-success font-semibold tabular-nums text-[16px]">₹8,400</span>
</div>
</div>
<div className="pt-5 mt-2 border-t border-app-border-light">
<a className="inline-flex items-center gap-1.5 text-[14px] font-medium text-app-accent hover:text-app-accent-hover hover:underline transition-colors" href="#">
<span>View full calculation</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>

<div className="lg:col-span-4 bg-app-surface border border-app-border rounded-xl p-7 shadow-xs">
<div className="flex items-center justify-between pb-4 border-b border-app-border-light">
<h2 className="text-[19px] font-medium text-app-text-primary">Needs your attention</h2>
<span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-app-warning-bg text-app-warning border border-app-warning/20">
                2 items
              </span>
</div>
<div className="space-y-6 pt-5">

<div className="space-y-2">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-md bg-app-warning-bg text-app-warning flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[16px]">warning</span>
</span>
<h3 className="text-[14px] font-medium text-app-text-primary">AIS / TDS discrepancy</h3>
</div>
<p className="text-[13px] text-app-text-secondary leading-relaxed pl-8">
                  Interest income differs from the available statement.
                </p>
<div className="pl-8 pt-1">
<a className="text-[13px] font-medium text-app-accent hover:underline inline-flex items-center gap-1" href="#">
<span>Review discrepancy</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</a>
</div>
</div>

<div className="border-t border-app-border-light"></div>

<div className="space-y-2">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-md bg-[#F4EFEB] text-app-accent flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[16px]">attach_file</span>
</span>
<h3 className="text-[14px] font-medium text-app-text-primary">Missing document</h3>
</div>
<p className="text-[13px] text-app-text-secondary leading-relaxed pl-8">
                  Investment proof required for Section 80C.
                </p>
<div className="pl-8 pt-1">
<a className="text-[13px] font-medium text-app-accent hover:underline inline-flex items-center gap-1" href="#">
<span>Upload document</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</a>
</div>
</div>
</div>
</div>
</section>

<section className="bg-app-surface border border-app-border rounded-xl p-7 shadow-xs">
<div className="flex items-center justify-between pb-5 border-b border-app-border-light">
<h2 className="font-serif text-[22px] text-app-text-primary font-normal">Recent Documents</h2>
<a className="text-[14px] font-medium text-app-accent hover:text-app-accent-hover hover:underline inline-flex items-center gap-1" href="#">
<span>View all documents</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="border-b border-app-border-light text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">
<th className="py-3 px-4">Document</th>
<th className="py-3 px-4">Type</th>
<th className="py-3 px-4">Status</th>
<th className="py-3 px-4">Updated</th>
<th className="py-3 px-4 text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-app-border-light text-[14px]">

<tr className="h-[54px] hover:bg-black/[0.01] transition-colors">
<td className="py-3 px-4 font-medium text-app-text-primary flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px] text-app-text-muted">description</span>
<span>Form 16 (Infosys Ltd)</span>
</td>
<td className="py-3 px-4 text-app-text-secondary">Income</td>
<td className="py-3 px-4">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-app-success-bg text-app-success border border-app-success/20">
<span className="w-1.5 h-1.5 rounded-full bg-app-success"></span>
                      Verified
                    </span>
</td>
<td className="py-3 px-4 text-app-text-muted text-[13px] tabular-nums">Today, 09:15 AM</td>
<td className="py-3 px-4 text-right">
<a className="font-medium text-app-accent hover:underline text-[13px]" href="#">View</a>
</td>
</tr>

<tr className="h-[54px] hover:bg-black/[0.01] transition-colors">
<td className="py-3 px-4 font-medium text-app-text-primary flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px] text-app-text-muted">account_balance</span>
<span>Bank Statement (HDFC)</span>
</td>
<td className="py-3 px-4 text-app-text-secondary">Interest</td>
<td className="py-3 px-4">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-app-success-bg text-app-success border border-app-success/20">
<span className="w-1.5 h-1.5 rounded-full bg-app-success"></span>
                      Verified
                    </span>
</td>
<td className="py-3 px-4 text-app-text-muted text-[13px]">Yesterday</td>
<td className="py-3 px-4 text-right">
<a className="font-medium text-app-accent hover:underline text-[13px]" href="#">View</a>
</td>
</tr>

<tr className="h-[54px] hover:bg-black/[0.01] transition-colors">
<td className="py-3 px-4 font-medium text-app-text-primary flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px] text-app-text-muted">shield_with_heart</span>
<span>Investment Proof (NPS)</span>
</td>
<td className="py-3 px-4 text-app-text-secondary">Deduction</td>
<td className="py-3 px-4">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-app-warning-bg text-app-warning border border-app-warning/20">
<span className="w-1.5 h-1.5 rounded-full bg-app-warning"></span>
                      Needs review
                    </span>
</td>
<td className="py-3 px-4 text-app-text-muted text-[13px]">Yesterday</td>
<td className="py-3 px-4 text-right">
<a className="font-medium text-app-accent hover:underline text-[13px]" href="#">Resolve</a>
</td>
</tr>
</tbody>
</table>
</div>
</section>

<section className="bg-app-dark text-[#F7F5F1] rounded-[14px] p-8 md:p-10 border border-app-dark-border shadow-md">
<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
<div>
<span className="text-[11px] font-semibold text-app-copper uppercase tracking-widest block mb-1">
                Statutory Assistance
              </span>
<h2 className="font-serif text-[26px] text-[#FFF8F5] font-normal">
                Tax Copilot
              </h2>
<p className="text-[14px] text-[#C7BFB7] mt-0.5">Need help understanding your return?</p>
</div>
<div>
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-app-copper hover:bg-app-copper-hover text-app-dark text-[13px] font-medium transition-colors" type="button">
<span>Ask Tax Copilot</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>

<div className="bg-app-dark-card border border-app-dark-border rounded-lg p-5 space-y-4">

<div className="flex items-start gap-3">
<span className="w-6 h-6 rounded-full bg-white/10 text-white/80 text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                Q
              </span>
<div>
<p className="text-[15px] font-medium text-[#FFF8F5]">
                  Why is my taxable income ₹31,35,000?
                </p>
</div>
</div>

<div className="flex items-start gap-3 pt-1 pl-1">
<span className="material-symbols-outlined text-[18px] text-app-copper shrink-0 mt-0.5">
                auto_awesome
              </span>
<div className="space-y-3">
<p className="text-[14px] text-[#DDD3CB] leading-relaxed">
                  Your taxable income is calculated from your verified income of <span className="text-white font-medium">₹36,00,000</span> after eligible deductions of <span className="text-white font-medium">₹4,65,000</span> (Standard Deduction ₹75,000 + Employer NPS u/s 80CCD(2) ₹2,40,000 + Schedule 112A ₹1,25,000).
                </p>

<div className="flex flex-wrap items-center gap-2 pt-1 text-[12px]">
<span className="text-[#9E958D]">Verified against:</span>
<span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#DDD3CB]">Form 16</span>
<span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#DDD3CB]">Investment documents</span>
<span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#DDD3CB]">Finance Act 2024 Rule Engine</span>
</div>
</div>
</div>
</div>
</section>
</div>
</main>
</div>

    </>
  );
}
