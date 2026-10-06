import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


export default function SMETaxDashboard() {
  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-[250px] bg-surface-container-low border-r border-outline-variant z-50 flex flex-col justify-between select-none"><div className="flex flex-col h-full overflow-hidden"><div className="h-[72px] px-space-md flex items-center border-b border-outline-variant bg-surface-container-low"><div className="flex items-center gap-space-sm"><div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">account_balance</span></div><div className="flex flex-col"><span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">TaxPilot</span><span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mt-0.5">Fiscal OS</span></div></div></div><div className="p-space-md border-b border-outline-variant bg-surface-container-high/40"><div className="flex items-center justify-between mb-1"><span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Workspace</span><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span></div><button className="w-full flex items-center justify-between text-left group p-1.5 rounded-lg hover:bg-surface-container-high transition-colors" type="button"><div className="truncate"><div className="font-label-md text-label-md text-on-surface font-medium truncate">ABC Technologies</div><div className="font-body-sm text-body-sm text-on-surface-variant">SME Workspace</div></div><span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface text-[18px] transition-colors">unfold_more</span></button></div><div className="flex-1 overflow-y-auto px-space-sm py-space-sm space-y-4"><nav className="space-y-4" data-active-classes="bg-secondary-container text-on-surface font-medium"><div><div className="px-2 mb-1.5 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Overview</div><div className="space-y-0.5"><a aria-current="page" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors bg-secondary-container text-on-surface font-medium" data-path="dashboard" href="/dashboard"><span className="material-symbols-outlined text-[18px]">dashboard</span><span>Dashboard</span></a></div></div><div><div className="px-2 mb-1.5 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Business</div><div className="space-y-0.5"><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="business-profile" href="/business-profile"><span className="material-symbols-outlined text-[18px]">domain</span><span>Business Profile</span></a><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="financial-data" href="/financial-data"><span className="material-symbols-outlined text-[18px]">account_balance_wallet</span><span>Financial Data</span></a><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="income-and-expenses" href="/income-and-expenses"><span className="material-symbols-outlined text-[18px]">receipt_long</span><span>Income &amp; Expenses</span></a><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="documents" href="/documents"><span className="material-symbols-outlined text-[18px]">folder_open</span><span>Documents</span></a></div></div><div><div className="px-2 mb-1.5 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Tax</div><div className="space-y-0.5"><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="tax-calculation" href="/tax-calculation"><span className="material-symbols-outlined text-[18px]">calculate</span><span>Tax Calculation</span></a><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="tax-savings" href="/tax-savings"><span className="material-symbols-outlined text-[18px]">trending_up</span><span>Tax Savings</span></a><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="gst-tds" href="/gst-tds"><span className="material-symbols-outlined text-[18px]">percent</span><span>GST / TDS</span></a></div></div><div><div className="px-2 mb-1.5 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Intelligence</div><div className="space-y-0.5"><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="tax-copilot" href="/tax-copilot"><span className="material-symbols-outlined text-[18px]">psychology</span><span>Tax Copilot</span></a><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="issues-and-readiness" href="/issues-and-readiness"><span className="material-symbols-outlined text-[18px]">verified</span><span>Issues &amp; Readiness</span></a></div></div><div><div className="px-2 mb-1.5 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Filing</div><div className="space-y-0.5"><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="review-and-file" href="/review-and-file"><span className="material-symbols-outlined text-[18px]">task_alt</span><span>Review &amp; File</span></a></div></div><div><div className="px-2 mb-1.5 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">System</div><div className="space-y-0.5"><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="settings" href="/settings"><span className="material-symbols-outlined text-[18px]">settings</span><span>Settings</span></a><a className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-sm text-body-sm transition-colors" data-path="help" href="/help"><span className="material-symbols-outlined text-[18px]">help_outline</span><span>Help</span></a></div></div></nav></div><div className="p-space-md border-t border-outline-variant bg-surface-container-low"><div className="flex items-center justify-between text-on-surface-variant"><div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">date_range</span><span className="font-label-caps text-label-caps tracking-wider">FY 2025–26 | AY 2026–27</span></div></div></div></div></aside><div className="pl-[250px]"><Navbar /><main className="relative pt-[72px] bg-surface min-h-screen"><div className="flex flex-col w-full px-gutter-desktop py-space-xl space-y-space-xl max-w-[1400px] mx-auto text-on-surface">

<header className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-md border-b border-[#E8E0D9]">
<div className="space-y-1">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Enterprise Fiscal Audit</span>
<h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Business Tax Overview</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
        Your business finances, tax position and compliance status at a glance.
      </p>
</div>
<div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
<button className="inline-flex items-center gap-2 bg-[#8A5A3C] hover:bg-[#7A4F34] text-white font-label-md text-label-md px-5 py-2.5 rounded-lg shadow-sm transition-all duration-150 active:scale-[0.99]" type="button">
<span>Continue Filing</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-[#4F6B52]"></span>
        Last updated Today, 10:42 AM
      </span>
</div>
</header>

<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">

<div className="bg-surface-container-lowest p-6 rounded-xl border border-[#E8E0D9] shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
<div className="flex items-center justify-between mb-3">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Revenue</span>
<span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded text-[#4F6B52] bg-[rgba(79,107,82,0.12)]">
          +12.4% YoY
        </span>
</div>
<div className="my-1">
<div className="font-headline-md text-headline-md text-on-surface tracking-tight">₹48.6 L</div>
</div>
<div className="mt-3 pt-3 border-t border-[#F0EAE4] flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[15px] text-[#4F6B52]">verified</span>
<span>Verified financial data</span>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl border border-[#E8E0D9] shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
<div className="flex items-center justify-between mb-3">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Expenses</span>
<span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded text-on-surface-variant bg-surface-container-high">
          +6.8% YoY
        </span>
</div>
<div className="my-1">
<div className="font-headline-md text-headline-md text-on-surface tracking-tight">₹31.2 L</div>
</div>
<div className="mt-3 pt-3 border-t border-[#F0EAE4] flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[15px]">category</span>
<span>Across 18 categories</span>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl border border-[#E8E0D9] shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
<div className="flex items-center justify-between mb-3">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Taxable Profit</span>
<span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded text-primary bg-secondary-container">
          35.8% margin
        </span>
</div>
<div className="my-1">
<div className="font-headline-md text-headline-md text-on-surface tracking-tight">₹17.4 L</div>
</div>
<div className="mt-3 pt-3 border-t border-[#F0EAE4] flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[15px]">savings</span>
<span>After eligible expenses</span>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl border border-[#E8E0D9] shadow-sm flex flex-col justify-between hover:border-outline-variant transition-colors">
<div className="flex items-center justify-between mb-3">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Estimated Tax</span>
<span className="material-symbols-outlined text-outline text-[18px]">info</span>
</div>
<div className="my-1">
<div className="font-headline-md text-headline-md text-primary tracking-tight">₹4.18 L</div>
</div>
<div className="mt-3 pt-3 border-t border-[#F0EAE4] flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[15px]">gavel</span>
<span className="truncate">Current estimate (u/s 115BAA/44AD)</span>
</div>
</div>
</section>

<section className="bg-surface-container-lowest p-6 rounded-xl border border-[#E8E0D9] shadow-sm">
<div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 mb-4">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Filing Readiness</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Most business records are ready for review.</p>
</div>
<div className="font-headline-md text-headline-md text-[#8A5A3C] font-normal leading-none">
        92%
      </div>
</div>

<div className="w-full bg-[#EFEAE3] rounded-full h-2.5 overflow-hidden mb-6">
<div className="bg-[#8A5A3C] h-2.5 rounded-full transition-all duration-700 ease-out" style={{ width: '92%' }}></div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">

<div className="p-3.5 bg-surface-container-low rounded-lg flex flex-col justify-between">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Documents</span>
<span className="text-on-surface font-numeric-table text-numeric-table font-semibold">28 / 28</span>
</div>
<div className="flex items-center gap-1.5 text-[12px] font-medium text-[#4F6B52] bg-[rgba(79,107,82,0.12)] px-2 py-0.5 rounded w-fit">
<span className="material-symbols-outlined text-[14px]">check</span>
<span>Verified</span>
</div>
</div>

<div className="p-3.5 bg-surface-container-low rounded-lg flex flex-col justify-between">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Financial Data</span>
<span className="text-on-surface font-numeric-table text-numeric-table font-semibold">42 / 45</span>
</div>
<div className="flex items-center gap-1.5 text-[12px] font-medium text-[#9A6A32] bg-[rgba(154,106,50,0.12)] px-2 py-0.5 rounded w-fit">
<span className="material-symbols-outlined text-[14px]">pending</span>
<span>3 items pending</span>
</div>
</div>

<div className="p-3.5 bg-surface-container-low rounded-lg flex flex-col justify-between">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Tax Validation</span>
<span className="text-on-surface font-numeric-table text-numeric-table font-semibold">18 / 20</span>
</div>
<div className="flex items-center gap-1.5 text-[12px] font-medium text-[#9A6A32] bg-[rgba(154,106,50,0.12)] px-2 py-0.5 rounded w-fit">
<span className="material-symbols-outlined text-[14px]">schedule</span>
<span>2 checks pending</span>
</div>
</div>

<div className="p-3.5 bg-surface-container-low rounded-lg flex flex-col justify-between">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Compliance</span>
<span className="text-on-surface font-numeric-table text-numeric-table font-semibold">14 / 16</span>
</div>
<div className="flex items-center gap-1.5 text-[12px] font-medium text-[#9A4540] bg-[rgba(154,69,64,0.12)] px-2 py-0.5 rounded w-fit">
<span className="material-symbols-outlined text-[14px]">error_outline</span>
<span>2 actions required</span>
</div>
</div>
</div>
</section>

<section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

<div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-[#E8E0D9] shadow-sm flex flex-col justify-between space-y-6">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Financial Overview</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Comparative fiscal ledger breakdown for FY 2025–26</p>
</div>

<div className="inline-flex p-1 bg-[#EFEAE3] rounded-lg text-xs font-label-md">
<button className="px-3 py-1 text-on-surface-variant hover:text-on-surface rounded transition-colors" type="button">Monthly</button>
<button className="px-3 py-1 bg-surface-container-lowest text-primary font-semibold shadow-xs rounded" type="button">Quarterly</button>
<button className="px-3 py-1 text-on-surface-variant hover:text-on-surface rounded transition-colors" type="button">Yearly</button>
</div>
</div>

<div className="space-y-3">
<div className="flex items-center justify-end gap-5 font-body-sm text-body-sm">
<div className="flex items-center gap-1.5">
<span className="w-3 h-3 rounded-xs bg-[#8A5A3C]"></span>
<span className="text-on-surface-variant">Revenue</span>
</div>
<div className="flex items-center gap-1.5">
<span className="w-3 h-3 rounded-xs bg-[#D4BBA5]"></span>
<span className="text-on-surface-variant">Expenses</span>
</div>
<div className="flex items-center gap-1.5">
<span className="w-3 h-3 rounded-xs bg-[#24170F]"></span>
<span className="text-on-surface-variant">Taxable Profit</span>
</div>
</div>

<div className="w-full h-56 pt-2">
<svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 220">

<line stroke="#E8E0D9" stroke-dasharray="3 3" x1="50" x2="690" y1="20" y2="20"></line>
<line stroke="#E8E0D9" stroke-dasharray="3 3" x1="50" x2="690" y1="65" y2="65"></line>
<line stroke="#E8E0D9" stroke-dasharray="3 3" x1="50" x2="690" y1="110" y2="110"></line>
<line stroke="#E8E0D9" stroke-dasharray="3 3" x1="50" x2="690" y1="155" y2="155"></line>
<line stroke="#D8D1C9" x1="50" x2="690" y1="195" y2="195"></line>

<text fill="#84746c" font-family="Geist" font-size="11" text-anchor="end" x="40" y="24">₹50L</text>
<text fill="#84746c" font-family="Geist" font-size="11" text-anchor="end" x="40" y="69">₹37.5L</text>
<text fill="#84746c" font-family="Geist" font-size="11" text-anchor="end" x="40" y="114">₹25L</text>
<text fill="#84746c" font-family="Geist" font-size="11" text-anchor="end" x="40" y="159">₹12.5L</text>
<text fill="#84746c" font-family="Geist" font-size="11" text-anchor="end" x="40" y="198">₹0</text>

<g transform="translate(110, 0)">

<rect fill="#8A5A3C" height="40" rx="2" width="22" x="0" y="155"></rect>

<rect fill="#D4BBA5" height="26" rx="2" width="22" x="25" y="169"></rect>

<rect fill="#24170F" height="14" rx="2" width="22" x="50" y="181"></rect>
<text fill="#51443d" font-family="Geist" font-size="12" text-anchor="middle" x="36" y="212">Q1 (Apr–Jun)</text>
</g>

<g transform="translate(260, 0)">

<rect fill="#8A5A3C" height="46" rx="2" width="22" x="0" y="149"></rect>

<rect fill="#D4BBA5" height="30" rx="2" width="22" x="25" y="165"></rect>

<rect fill="#24170F" height="16" rx="2" width="22" x="50" y="179"></rect>
<text fill="#51443d" font-family="Geist" font-size="12" text-anchor="middle" x="36" y="212">Q2 (Jul–Sep)</text>
</g>

<g transform="translate(410, 0)">

<rect fill="#8A5A3C" height="49" rx="2" width="22" x="0" y="146"></rect>

<rect fill="#D4BBA5" height="31" rx="2" width="22" x="25" y="164"></rect>

<rect fill="#24170F" height="18" rx="2" width="22" x="50" y="177"></rect>
<text fill="#51443d" font-family="Geist" font-size="12" text-anchor="middle" x="36" y="212">Q3 (Oct–Dec)</text>
</g>

<g transform="translate(560, 0)">

<rect fill="#8A5A3C" height="56" rx="2" width="22" x="0" y="139"></rect>

<rect fill="#D4BBA5" height="35" rx="2" width="22" x="25" y="160"></rect>

<rect fill="#24170F" height="21" rx="2" width="22" x="50" y="174"></rect>
<text fill="#51443d" font-family="Geist" font-size="12" text-anchor="middle" x="36" y="212">Q4 (Jan–Mar)</text>
</g>
</svg>
</div>
</div>

<div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#F0EAE4] bg-surface-container-low p-4 rounded-lg">
<div>
<div className="font-label-caps text-label-caps uppercase text-on-surface-variant">Annual Revenue</div>
<div className="font-numeric-table text-[18px] text-on-surface font-semibold">₹48.6 L</div>
</div>
<div>
<div className="font-label-caps text-label-caps uppercase text-on-surface-variant">Annual Expenses</div>
<div className="font-numeric-table text-[18px] text-on-surface font-semibold">₹31.2 L</div>
</div>
<div>
<div className="font-label-caps text-label-caps uppercase text-on-surface-variant">Taxable Profit</div>
<div className="font-numeric-table text-[18px] text-primary font-semibold">₹17.4 L</div>
</div>
</div>
<div className="pt-2">
<a className="inline-flex items-center gap-1.5 font-label-md text-label-md text-[#8A5A3C] hover:text-primary transition-colors font-medium" href="#">
<span>View Financial Data</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>

<div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-[#E8E0D9] shadow-sm flex flex-col justify-between space-y-5">
<div className="flex items-center justify-between pb-3 border-b border-[#F0EAE4]">
<h2 className="font-headline-sm text-headline-sm text-on-surface">Needs Attention</h2>
<span className="text-[11px] font-label-caps tracking-wider uppercase bg-[rgba(154,106,50,0.12)] text-[#9A6A32] px-2.5 py-0.5 rounded-full font-semibold">
          3 items
        </span>
</div>
<div className="space-y-3.5">

<div className="p-3.5 rounded-lg border border-[#EFEAE3] bg-surface hover:border-[#D8D1C9] transition-colors space-y-2">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface font-medium">
<span className="material-symbols-outlined text-[#9A6A32] text-[18px]">receipt</span>
<span>GST Reconciliation</span>
</div>
<span className="text-[10px] font-label-caps uppercase bg-[rgba(154,106,50,0.12)] text-[#9A6A32] px-1.5 py-0.5 rounded">
              Review required
            </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
            2 purchase invoices do not match available GST records.
          </p>
<div className="pt-1 flex justify-end">
<button className="text-xs font-medium text-[#8A5A3C] hover:underline flex items-center gap-1" type="button">
<span>Review</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>

<div className="p-3.5 rounded-lg border border-[#EFEAE3] bg-surface hover:border-[#D8D1C9] transition-colors space-y-2">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface font-medium">
<span className="material-symbols-outlined text-[#9A6A32] text-[18px]">paid</span>
<span>TDS Reconciliation</span>
</div>
<span className="text-[10px] font-label-caps uppercase bg-[rgba(154,106,50,0.12)] text-[#9A6A32] px-1.5 py-0.5 rounded">
              Action required
            </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
            One payment requires vendor verification against Form 26AS.
          </p>
<div className="pt-1 flex justify-end">
<button className="text-xs font-medium text-[#8A5A3C] hover:underline flex items-center gap-1" type="button">
<span>Review</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>

<div className="p-3.5 rounded-lg border border-[#EFEAE3] bg-surface hover:border-[#D8D1C9] transition-colors space-y-2">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface font-medium">
<span className="material-symbols-outlined text-[#9A4540] text-[18px]">cloud_upload</span>
<span>Missing Document</span>
</div>
<span className="text-[10px] font-label-caps uppercase bg-[rgba(154,69,64,0.12)] text-[#9A4540] px-1.5 py-0.5 rounded">
              Pending upload
            </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
            March bank statement is missing for account ending in #4092.
          </p>
<div className="pt-1 flex justify-end">
<button className="text-xs font-medium text-[#8A5A3C] hover:underline flex items-center gap-1" type="button">
<span>Upload</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
</div>
<div className="pt-2 text-center text-xs text-on-surface-variant">
        No critical audit penalties pending clearance.
      </div>
</div>
</section>

<section className="bg-surface-container-lowest p-6 rounded-xl border border-[#E8E0D9] shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E0D9] gap-2">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Tax Position</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Statutory computation breakdown for Assessment Year 2026–27</p>
</div>
<span className="text-xs font-mono text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded">
        Schedule BPC • Standard Surcharge 7%
      </span>
</div>

<div className="divide-y divide-[#F0EAE4] font-body-md text-body-md my-2">
<div className="py-3 flex items-center justify-between">
<span className="text-on-surface">Gross Business Revenue</span>
<span className="font-numeric-table font-medium text-on-surface">₹48,60,000</span>
</div>
<div className="py-3 flex items-center justify-between text-on-surface-variant">
<span className="flex items-center gap-1.5">
<span>Allowable Business Expenses</span>
<span className="text-xs text-outline">(u/s 30 to 37)</span>
</span>
<span className="font-numeric-table font-medium text-[#9A4540]">− ₹31,20,000</span>
</div>
<div className="py-3 flex items-center justify-between text-on-surface-variant">
<span className="flex items-center gap-1.5">
<span>Deductions &amp; Statutory Adjustments</span>
<span className="text-xs text-outline">(Depreciation &amp; Cessation)</span>
</span>
<span className="font-numeric-table font-medium text-[#9A4540]">− ₹45,000</span>
</div>
<div className="py-3.5 flex items-center justify-between bg-surface-container-low/50 px-2 rounded">
<span className="font-medium text-on-surface">Taxable Business Profit</span>
<span className="font-numeric-table font-semibold text-[17px] text-on-surface">₹17,40,000</span>
</div>
<div className="py-3 flex items-center justify-between text-on-surface-variant">
<span>Estimated Base Tax Liability (incl. Cess)</span>
<span className="font-numeric-table font-medium text-on-surface">₹4,18,000</span>
</div>
<div className="py-3 flex items-center justify-between text-on-surface-variant">
<span className="flex items-center gap-1.5">
<span>Prepaid TDS &amp; Advance Tax Credits</span>
<span className="text-xs text-[#4F6B52] bg-[rgba(79,107,82,0.12)] px-1 rounded">26AS matched</span>
</span>
<span className="font-numeric-table font-medium text-[#4F6B52]">− ₹3,80,000</span>
</div>

<div className="py-4 flex items-center justify-between border-t-2 border-b-2 border-on-surface/20 bg-secondary-container/30 px-3 rounded">
<div className="flex flex-col">
<span className="font-headline-sm text-[18px] text-on-surface font-semibold">Net Estimated Tax Payable</span>
<span className="text-xs text-on-surface-variant font-body-sm">Balance before self-assessment submission</span>
</div>
<div className="flex items-center gap-3">
<span className="inline-flex items-center text-xs font-label-caps uppercase bg-[#8A5A3C] text-white px-2 py-0.5 rounded">
            Self-Assessment Due
          </span>
<span className="font-numeric-table font-bold text-headline-sm text-primary">₹38,000</span>
</div>
</div>
</div>
<div className="pt-4 flex items-center justify-between">
<a className="inline-flex items-center gap-1.5 font-label-md text-label-md text-[#8A5A3C] hover:text-primary transition-colors font-medium" href="#">
<span>View Full Tax Calculation</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
<span className="text-xs text-on-surface-variant font-body-sm">Computed per Income Tax Act, 1961 provisions</span>
</div>
</section>

<section className="bg-surface-container-lowest p-6 rounded-xl border border-[#E8E0D9] shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E0D9] gap-2">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Compliance Overview</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Statutory schedules, periodic filings, and critical deadlines.</p>
</div>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-[#4F6B52] bg-[rgba(79,107,82,0.12)] px-2.5 py-1 rounded">
        Audit Safe Score: 94/100
      </span>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse mt-2">
<thead>
<tr className="border-b border-[#E8E0D9] bg-[#EFEAE3]/50">
<th className="py-3 px-4 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Obligation</th>
<th className="py-3 px-4 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Status</th>
<th className="py-3 px-4 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Last Updated</th>
<th className="py-3 px-4 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant text-right">Next Action</th>
</tr>
</thead>
<tbody className="divide-y divide-[#F0EAE4] font-body-sm text-body-sm">

<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-3.5 px-4 font-medium text-on-surface flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-[#4F6B52]"></span>
<span>Goods &amp; Services Tax (GST)</span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4F6B52] bg-[rgba(79,107,82,0.12)] px-2 py-0.5 rounded">
<span className="material-symbols-outlined text-[13px]">check</span>
<span>On track</span>
</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">20 May 2025</td>
<td className="py-3.5 px-4 text-right font-medium text-on-surface">GSTR-3B due 20 June</td>
</tr>

<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-3.5 px-4 font-medium text-on-surface flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-[#9A6A32]"></span>
<span>Tax Deducted at Source (TDS)</span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9A6A32] bg-[rgba(154,106,50,0.12)] px-2 py-0.5 rounded">
<span className="material-symbols-outlined text-[13px]">warning</span>
<span>Review required</span>
</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Yesterday</td>
<td className="py-3.5 px-4 text-right font-medium text-[#9A6A32]">Verify Q4 deduction challans</td>
</tr>

<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-3.5 px-4 font-medium text-on-surface flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-[#4F6B52]"></span>
<span>Corporate Income Tax</span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4F6B52] bg-[rgba(79,107,82,0.12)] px-2 py-0.5 rounded">
<span className="material-symbols-outlined text-[13px]">check</span>
<span>On track</span>
</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Today</td>
<td className="py-3.5 px-4 text-right font-medium text-on-surface">Q1 Advance tax due 15 June</td>
</tr>

<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-3.5 px-4 font-medium text-on-surface flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-outline"></span>
<span>Other Statutory Compliance</span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-[11px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
<span>Upcoming</span>
</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">12 May 2025</td>
<td className="py-3.5 px-4 text-right font-medium text-on-surface">MSME Form 1 filing</td>
</tr>
</tbody>
</table>
</div>
<div className="pt-4 border-t border-[#F0EAE4] flex items-center justify-between">
<a className="inline-flex items-center gap-1.5 font-label-md text-label-md text-[#8A5A3C] hover:text-primary transition-colors font-medium" href="#">
<span>View Compliance Center</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
<span className="text-xs text-on-surface-variant">All statutory submissions require verified Director approval</span>
</div>
</section>

<section className="bg-surface-container-lowest p-6 rounded-xl border border-[#E8E0D9] shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E0D9] gap-2">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Recent Business Documents</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Extracted financial records, OCR logs, and ledger reconciliations.</p>
</div>
<button className="inline-flex items-center gap-1.5 text-xs font-medium border border-[#D8D1C9] bg-white hover:bg-surface-container-high px-3 py-1.5 rounded transition-colors" type="button">
<span className="material-symbols-outlined text-[15px]">upload_file</span>
<span>Upload New Folio</span>
</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse mt-2">
<thead>
<tr className="border-b border-[#E8E0D9] bg-[#EFEAE3]/50">
<th className="py-3 px-4 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Document</th>
<th className="py-3 px-4 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Type</th>
<th className="py-3 px-4 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Status</th>
<th className="py-3 px-4 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Updated</th>
<th className="py-3 px-4 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-[#F0EAE4] font-body-sm text-body-sm">

<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-3.5 px-4 font-medium text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">picture_as_pdf</span>
<span className="font-mono text-xs">Sales_Invoices_March.pdf</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Sales</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4F6B52] bg-[rgba(79,107,82,0.12)] px-2 py-0.5 rounded">
<span className="material-symbols-outlined text-[12px]">check_circle</span>
<span>Verified</span>
</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Today</td>
<td className="py-3.5 px-4 text-right">
<button className="text-xs font-medium text-[#8A5A3C] hover:underline" type="button">View</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-3.5 px-4 font-medium text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
<span className="font-mono text-xs">Bank_Statement_March.pdf</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Bank</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4F6B52] bg-[rgba(79,107,82,0.12)] px-2 py-0.5 rounded">
<span className="material-symbols-outlined text-[12px]">check_circle</span>
<span>Verified</span>
</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Yesterday</td>
<td className="py-3.5 px-4 text-right">
<button className="text-xs font-medium text-[#8A5A3C] hover:underline" type="button">View</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-3.5 px-4 font-medium text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">table_chart</span>
<span className="font-mono text-xs">Purchase_Register.xlsx</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Purchases</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4F6B52] bg-[rgba(79,107,82,0.12)] px-2 py-0.5 rounded">
<span className="material-symbols-outlined text-[12px]">check_circle</span>
<span>Verified</span>
</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Yesterday</td>
<td className="py-3.5 px-4 text-right">
<button className="text-xs font-medium text-[#8A5A3C] hover:underline" type="button">View</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-3.5 px-4 font-medium text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-[#9A6A32] text-[18px]">description</span>
<span className="font-mono text-xs">TDS_Report_Q4.pdf</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">TDS</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9A6A32] bg-[rgba(154,106,50,0.12)] px-2 py-0.5 rounded">
<span className="material-symbols-outlined text-[12px]">report_problem</span>
<span>Review Required</span>
</span>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">2 days ago</td>
<td className="py-3.5 px-4 text-right">
<button className="text-xs font-semibold text-[#9A6A32] hover:underline" type="button">Resolve</button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="pt-4 border-t border-[#F0EAE4] flex items-center justify-between">
<a className="inline-flex items-center gap-1.5 font-label-md text-label-md text-[#8A5A3C] hover:text-primary transition-colors font-medium" href="#">
<span>View All Documents</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
<span className="text-xs text-on-surface-variant">Encrypted at rest with SHA-256 integrity verification</span>
</div>
</section>

<section className="space-y-4">
<div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Potential Tax Savings</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Opportunities identified from your current business data.</p>
</div>
<a className="font-label-md text-label-md text-[#8A5A3C] hover:text-primary font-medium flex items-center gap-1" href="#">
<span>Explore Tax Savings</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

<div className="bg-surface-container-lowest p-5 rounded-xl border border-[#E8E0D9] shadow-sm flex flex-col justify-between hover:border-outline transition-colors">
<div className="space-y-2.5">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Section 37 Optimization</span>
<span className="text-headline-sm font-headline-sm font-semibold text-[#4F6B52]">₹18,000</span>
</div>
<h3 className="font-headline-sm text-[17px] text-on-surface">Business Expense Optimization</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
            Reclassify utility and high-speed internet charges under fully allowable Section 37 business deductions.
          </p>
</div>
<div className="mt-4 pt-3 border-t border-[#F0EAE4] space-y-1">
<div className="font-label-caps text-[10px] uppercase text-outline">Required Documentation</div>
<div className="font-body-sm text-[12px] text-on-surface">Updated expense ledger &amp; vendor GSTIN bills.</div>
</div>
</div>

<div className="bg-surface-container-lowest p-5 rounded-xl border border-[#E8E0D9] shadow-sm flex flex-col justify-between hover:border-outline transition-colors">
<div className="space-y-2.5">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Asset Depreciation</span>
<span className="text-headline-sm font-headline-sm font-semibold text-[#4F6B52]">₹32,000</span>
</div>
<h3 className="font-headline-sm text-[17px] text-on-surface">Depreciation Opportunity</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
            Claim 40% additional block depreciation on newly commissioned IT workstations and server hardware.
          </p>
</div>
<div className="mt-4 pt-3 border-t border-[#F0EAE4] space-y-1">
<div className="font-label-caps text-[10px] uppercase text-outline">Required Documentation</div>
<div className="font-body-sm text-[12px] text-on-surface">Fixed asset register &amp; purchase tax invoice.</div>
</div>
</div>

<div className="bg-surface-container-lowest p-5 rounded-xl border border-[#E8E0D9] shadow-sm flex flex-col justify-between hover:border-outline transition-colors">
<div className="space-y-2.5">
<div className="flex items-center justify-between">
<span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Section 80JJAA Incentive</span>
<span className="text-headline-sm font-headline-sm font-semibold text-[#4F6B52]">₹24,000</span>
</div>
<h3 className="font-headline-sm text-[17px] text-on-surface">Eligible Business Deduction</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
            Section 80JJAA tax incentive for qualifying newly hired software engineering personnel.
          </p>
</div>
<div className="mt-4 pt-3 border-t border-[#F0EAE4] space-y-1">
<div className="font-label-caps text-[10px] uppercase text-outline">Required Documentation</div>
<div className="font-body-sm text-[12px] text-on-surface">Form 10DA audit report &amp; payroll register.</div>
</div>
</div>
</div>
</section>

<section className="p-8 rounded-2xl bg-[#24170F] text-[#FFF8F5] shadow-md border border-[#3E2D22] flex flex-col space-y-6">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">psychology</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-primary-fixed-dim">Conversational Intelligence</span>
</div>
<h2 className="font-headline-md text-headline-md text-[#FFF8F5]">Tax Copilot</h2>
<p className="font-body-md text-body-md text-[#FFF8F5]/80">Understand your business taxes in plain language.</p>
</div>
<button className="shrink-0 bg-[#8A5A3C] hover:bg-[#784E34] text-white font-label-md text-label-md px-5 py-2.5 rounded-lg border border-[#A26D4A] shadow-sm transition-colors flex items-center gap-2" type="button">
<span>Ask Tax Copilot</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>

<div className="space-y-3.5 bg-[#1C120C]/80 p-5 rounded-xl border border-[#3E2D22]">

<div className="flex items-start gap-3">
<div className="w-7 h-7 rounded-full bg-[#3E2D22] flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[14px] text-[#FFF8F5]">person</span>
</div>
<div className="bg-[#2E1F16] border border-[#3E2D22] p-3.5 rounded-lg max-w-xl text-sm leading-relaxed text-[#FFF8F5]">
          Why did my estimated tax increase this quarter?
        </div>
</div>

<div className="flex items-start gap-3">
<div className="w-7 h-7 rounded-full bg-[#8A5A3C] flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[15px] text-white">auto_awesome</span>
</div>
<div className="bg-[#1C120C] border border-[#3E2D22] p-4 rounded-lg flex-1 text-sm leading-relaxed text-[#FFF8F5]/90 space-y-3">
<p>
            Your estimated taxable profit increased by <strong className="text-white font-medium">₹2.4L</strong>. Revenue increased by <strong className="text-white font-medium">12.4%</strong>, while deductible expenses only grew by <strong className="text-white font-medium">6.8%</strong>, resulting in a higher net margin for Q4.
          </p>
<div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#3E2D22]/60">
<span className="text-[11px] font-label-caps uppercase text-primary-fixed-dim">Citations &amp; Grounding:</span>
<span className="text-[11px] font-mono bg-[#2E1F16] border border-[#3E2D22] px-2 py-0.5 rounded text-[#FFF8F5]/80">[Financial Data]</span>
<span className="text-[11px] font-mono bg-[#2E1F16] border border-[#3E2D22] px-2 py-0.5 rounded text-[#FFF8F5]/80">[Expense Records]</span>
<span className="text-[11px] font-mono bg-[#2E1F16] border border-[#3E2D22] px-2 py-0.5 rounded text-[#FFF8F5]/80">[Tax Rule Engine]</span>
</div>
</div>
</div>
</div>
</section>

<section className="bg-surface-container-lowest p-5 rounded-xl border border-[#E8E0D9] shadow-sm">
<div className="flex flex-col lg:flex-row items-center justify-between gap-4">
<div className="flex items-center gap-2 font-label-md text-label-md text-on-surface font-medium shrink-0">
<span className="material-symbols-outlined text-primary text-[18px]">flash_on</span>
<span>Quick Workflows</span>
</div>
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full lg:w-auto">
<button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-container-high border border-[#E8E0D9] rounded-lg text-xs font-medium text-on-surface transition-colors" type="button">
<span className="material-symbols-outlined text-[15px] text-primary">add</span>
<span>Upload Document</span>
</button>
<button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-container-high border border-[#E8E0D9] rounded-lg text-xs font-medium text-on-surface transition-colors" type="button">
<span className="material-symbols-outlined text-[15px] text-[#9A6A32]">checklist</span>
<span>Review Issues</span>
</button>
<button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-container-high border border-[#E8E0D9] rounded-lg text-xs font-medium text-on-surface transition-colors" type="button">
<span className="material-symbols-outlined text-[15px] text-primary">calculate</span>
<span>Tax Calculation</span>
</button>
<button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-container-high border border-[#E8E0D9] rounded-lg text-xs font-medium text-on-surface transition-colors" type="button">
<span className="material-symbols-outlined text-[15px] text-[#4F6B52]">verified_user</span>
<span>Check Compliance</span>
</button>
<button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-container-high border border-[#E8E0D9] rounded-lg text-xs font-medium text-on-surface transition-colors col-span-2 sm:col-span-1" type="button">
<span className="material-symbols-outlined text-[15px] text-primary">chat</span>
<span>Ask Tax Copilot</span>
</button>
</div>
</div>
</section>

<Footer />
</div></main></div>
    </>
  );
}
