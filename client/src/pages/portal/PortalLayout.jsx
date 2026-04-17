import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { logout } from "../../utils/auth";

const linkBase =
  "px-3 py-1.5 rounded-md text-sm transition-colors";
const linkActive = `${linkBase} bg-neutral-200 text-neutral-900 font-medium`;
const linkInactive = `${linkBase} text-neutral-500 hover:bg-neutral-150 hover:text-neutral-800`;

function PortalLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-800">
        <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-50 border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
            <span className="text-neutral-900 font-semibold text-base tracking-tight">
              Herramientas
            </span>

            <ul className="hidden md:flex items-center gap-0.5">
              <li>
                <NavLink to="/portal" end
                  className={({ isActive }) => isActive ? linkActive : linkInactive}>
                  Products
                </NavLink>
              </li>
              <li>
                <NavLink to="/portal/sales"
                  className={({ isActive }) => isActive ? linkActive : linkInactive}>
                  My Sales
                </NavLink>
              </li>
              <li>
                <NavLink to="/portal/rewards"
                  className={({ isActive }) => isActive ? linkActive : linkInactive}>
                  Rewards
                </NavLink>
              </li>
            </ul>

            <div className="hidden md:block">
              <button onClick={logout}
                className="px-3 py-1.5 rounded-md text-sm text-neutral-500 hover:bg-neutral-150 hover:text-neutral-800 transition-colors">
                Log out
              </button>
            </div>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-150 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-neutral-200 px-4 pb-3 pt-2 space-y-0.5 bg-neutral-50">
              <NavLink to="/portal" end onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `block ${isActive ? linkActive : linkInactive}`}>
                Products
              </NavLink>
              <NavLink to="/portal/sales" onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `block ${isActive ? linkActive : linkInactive}`}>
                My Sales
              </NavLink>
              <NavLink to="/portal/rewards" onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `block ${isActive ? linkActive : linkInactive}`}>
                Rewards
              </NavLink>
              <div className="border-t border-neutral-200 pt-2 mt-2">
                <button onClick={logout}
                  className="px-3 py-1.5 rounded-md text-sm text-neutral-500 hover:bg-neutral-150 transition-colors">
                  Log out
                </button>
              </div>
            </div>
          )}
        </nav>
        <main className="pt-12">
          <Outlet />
        </main>
      </div>
  );
}

export default PortalLayout;
