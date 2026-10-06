import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';

const NavItem = ({ to, label }: { to: string, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative font-body-sm text-body-sm py-1.5 px-1 transition-colors ${
        isActive ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'
      } group`
    }
  >
    {({ isActive }) => (
      <>
        {label}
        <span
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-primary transition-transform duration-300 ${
            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </>
    )}
  </NavLink>
);

export default function Navbar() {
  // Dummy authentication state for UI demonstration
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F5F1] border-b border-[#D8D1C9]">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <img src="/icons/Minimal%20TaxPilot%20T%20Monogram%20Icon.png" alt="TaxPilot Logo" className="h-8 w-auto object-contain" />
            <span className="text-lg font-extrabold tracking-tight text-on-surface font-serif">TaxPilot</span>
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-7">
          <NavItem to="/" label="Home" />
          <NavItem to="/individuals" label="Individuals" />
          <NavItem to="/smes" label="SMEs" />
          <NavItem to="/howitworks" label="How It Works" />
          <NavItem to="/pricingplans" label="Pricing" />
        </nav>
        <div className="flex items-center gap-4 shrink-0">
          {!isLoggedIn ? (
            <>
              <button onClick={() => setIsLoggedIn(true)} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface font-medium transition-colors hidden sm:inline-block">Login</button>
              <Link className="bg-primary-container hover:bg-tertiary-container text-on-primary font-body-sm text-body-sm font-medium px-4 py-2 rounded-lg border border-[#784E34] transition-all duration-150 inline-flex items-center justify-center shadow-sm" data-path="get-started" to="/individualtaxdashboard">Get Started</Link>
            </>
          ) : (
            <>
              <button onClick={() => setIsLoggedIn(false)} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface font-medium transition-colors hidden sm:inline-block">Logout</button>
              <Link to="/individualtaxdashboard" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
