import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { BrandLogo } from "../ui/BrandLogo";
import { UserAvatar } from "../ui/UserAvatar";

const navigation = [
  ["Dashboard", "/dashboard"],
  ["Insights", "/insights"],
  ["Rules", "/rules"],
  ["Shared", "/shared-accounts"],
  ["Transactions", "/transactions"],
  ["Budgets", "/budgets"],
  ["Goals", "/goals"],
  ["Reports", "/reports"],
  ["Recurring", "/recurring"],
  ["Accounts", "/accounts"],
  ["Settings", "/settings"],
] as const;

export function AppShell() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { mobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    setMobileMenuOpen(false);
    logout();
    navigate("/login");
  }

  function handleOpenSettings() {
    setMobileMenuOpen(false);
    navigate("/settings");
  }

  return (
    <div className="app-shell">
      {mobileMenuOpen ? <button className="sidebar-overlay" type="button" aria-label="Close menu overlay" onClick={() => setMobileMenuOpen(false)} /> : null}

      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-mobile-head">
          <button className="menu-close-button" type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>
            <span />
            <span />
          </button>
        </div>

        <button className="sidebar-user-card" type="button" onClick={handleOpenSettings}>
          <UserAvatar user={user} size={62} />
          <span className="sidebar-user-name">{user?.displayName ?? "Profile"}</span>
        </button>

        <nav className="nav-list">
          {navigation.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-mobile-logout" type="button" onClick={handleLogout}>Log Out</button>
      </aside>

      <div className="main-area">
        <header className="topbar app-topbar">
          <div className="mobile-menu-slot">
            <button className="menu-button hamburger-button" type="button" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span />
              <span />
              <span />
            </button>
          </div>

          <div className="topbar-brand-wrap">
            <BrandLogo size={50} withWordmark tagline="Clear, steady money habits" />
          </div>

          <div className="topbar-actions app-topbar-actions">
            <button className="primary-button desktop-action" onClick={() => navigate("/transactions")}>Add Transaction</button>
            <button className="user-chip desktop-user-chip" type="button" onClick={handleOpenSettings}>
              <UserAvatar user={user} size={38} />
              <span>{user?.displayName ?? "Profile"}</span>
            </button>
            <button className="topbar-logout-icon" type="button" aria-label="Log out" title="Log Out" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 17l5-5-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 12H4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>

        <footer className="site-footer">
          <div>
            <strong>Personal Finance Tracker</strong>
            <p>A calm place to manage spending, savings goals, budgets, recurring plans, and everyday money decisions.</p>
          </div>
          <span>Copyright (c) {currentYear} Personal Finance Tracker. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}
