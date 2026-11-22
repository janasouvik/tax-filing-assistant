import { Link, NavLink, useLocation } from 'react-router-dom';
import { UserButton, useAuth } from '@clerk/react';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';

const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <>{children}</> : null;
};

const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useAuth();
  return !isSignedIn ? <>{children}</> : null;
};

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative font-body-sm text-body-sm py-1.5 px-1 transition-colors ${
        isActive
          ? 'text-primary dark:text-amber-400 font-semibold'
          : 'text-on-surface-variant hover:text-on-surface dark:text-gray-300 dark:hover:text-white'
      } group`
    }
  >
    {({ isActive }) => (
      <>
        {label}
        <span
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-[2px] bg-primary dark:bg-amber-400 transition-transform duration-300 rounded-full ${
            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </>
    )}
  </NavLink>
);

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="group relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-[#EAE2D7] hover:bg-[#E0D5C7] dark:bg-[#2C1D13] dark:hover:bg-[#362418] border border-[#D3C3B3] dark:border-[#543A28] shadow-xs cursor-pointer select-none hover:scale-105 active:scale-95"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle light or dark theme"
    >
      {/* Precision Sliding Knob (No background glyphs behind to eliminate double-moon overlapping) */}
      <span
        className={`${
          isDark
            ? 'translate-x-6 bg-[#181008] text-amber-300 border-[#694830] shadow-[0_0_8px_rgba(245,158,11,0.25)]'
            : 'translate-x-0 bg-white text-amber-500 border-[#D8C7BA] shadow-sm'
        } inline-flex h-6 w-6 transform items-center justify-center rounded-full border transition-all duration-300 ease-out`}
      >
        {isDark ? (
          <svg className="h-3.5 w-3.5 fill-amber-300 transform transition-transform duration-300 rotate-[-10deg]" viewBox="0 0 24 24">
            <path d="M12.3 2a10 10 0 0 0-.19 14 10 10 0 0 0 11.51 3.5 10 10 0 1 1-11.32-17.5z"/>
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 fill-amber-500 transform transition-transform duration-300 rotate-0" viewBox="0 0 24 24">
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
          </svg>
        )}
      </span>
    </button>
  );
};

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDashboardRoute =
    location.pathname.includes('dashboard') ||
    location.pathname.startsWith('/individual') ||
    location.pathname.startsWith('/sme');

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-app-bg dark:bg-app-dark border-b border-app-border dark:border-app-dark-border transition-colors">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <img
              src="/icons/Minimal%20TaxPilot%20T%20Monogram%20Icon.png"
              alt="TaxPilot Logo"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-on-surface font-serif">
              TaxPilot
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          <NavItem to="/" label="Home" />
          <NavItem to="/individuals" label="Individuals" />
          <NavItem to="/smes" label="SMEs" />
          <NavItem to="/howitworks" label="How It Works" />
          <NavItem to="/pricingplans" label="Pricing" />
        </nav>

        {/* Header Right Action Items */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <ThemeToggle />

          <SignedOut>
            <Link
              to="/sign-in"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface font-medium transition-colors hidden sm:inline-block"
            >
              Login
            </Link>
            <Link
              className="bg-primary hover:bg-[#72462a] text-white font-body-sm text-body-sm font-medium px-3.5 sm:px-4 py-2 rounded-lg transition-all duration-150 inline-flex items-center justify-center shadow-xs"
              data-path="get-started"
              to="/sign-up"
            >
              Get Started
            </Link>
          </SignedOut>

          <SignedIn>
            {!isDashboardRoute && (
              <Link
                to="/dashboard-router"
                className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface font-medium transition-colors hidden sm:inline-block mr-1"
              >
                Dashboard
              </Link>
            )}
            <UserButton />
          </SignedIn>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-app-bg dark:bg-app-dark border-b border-app-border dark:border-app-dark-border px-5 py-4 space-y-4 shadow-xl transition-all">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-on-surface hover:bg-black/5 dark:hover:bg-white/5 font-medium text-[15px]"
            >
              Home
            </Link>
            <Link
              to="/individuals"
              className="px-3 py-2 rounded-lg text-on-surface hover:bg-black/5 dark:hover:bg-white/5 font-medium text-[15px]"
            >
              Individuals
            </Link>
            <Link
              to="/smes"
              className="px-3 py-2 rounded-lg text-on-surface hover:bg-black/5 dark:hover:bg-white/5 font-medium text-[15px]"
            >
              SMEs
            </Link>
            <Link
              to="/howitworks"
              className="px-3 py-2 rounded-lg text-on-surface hover:bg-black/5 dark:hover:bg-white/5 font-medium text-[15px]"
            >
              How It Works
            </Link>
            <Link
              to="/pricingplans"
              className="px-3 py-2 rounded-lg text-on-surface hover:bg-black/5 dark:hover:bg-white/5 font-medium text-[15px]"
            >
              Pricing
            </Link>
            <Link
              to="/individualtaxdashboard"
              className="px-3 py-2 rounded-lg text-primary font-semibold text-[15px]"
            >
              Tax Dashboard
            </Link>
          </nav>

          <div className="pt-3 border-t border-app-border dark:border-app-dark-border flex items-center justify-between">
            <SignedOut>
              <Link
                to="/sign-in"
                className="text-on-surface font-medium text-[14px] hover:text-primary"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="bg-primary hover:bg-[#72462a] text-white text-[13px] font-medium px-4 py-2 rounded-lg"
              >
                Create Account
              </Link>
            </SignedOut>
            <SignedIn>
              <span className="text-[13px] text-app-text-muted">Active Session</span>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
}
