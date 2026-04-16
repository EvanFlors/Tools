import { useState } from "react";
import { NavLink, useRouteLoaderData } from "react-router-dom";
import { logout } from "../utils/auth";

const linkBase =
  "px-3 py-1.5 rounded-md text-sm transition-colors";
const linkActive = `${linkBase} bg-neutral-200 text-neutral-900 font-medium`;
const linkInactive = `${linkBase} text-neutral-500 hover:bg-neutral-150 hover:text-neutral-800`;

function MainNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useRouteLoaderData("root");
  const isOwner = user?.role === "owner";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-1.5">
          <span className="text-neutral-900 font-semibold text-base tracking-tight">
            Herramientas
          </span>
        </NavLink>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-0.5">
          <li>
            <NavLink to="/" end
              className={({ isActive }) => (isActive ? linkActive : linkInactive)}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/products"
              className={({ isActive }) => (isActive ? linkActive : linkInactive)}>
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers"
              className={({ isActive }) => (isActive ? linkActive : linkInactive)}>
              Customers
            </NavLink>
          </li>
          <li>
            <NavLink to="/sales"
              className={({ isActive }) => (isActive ? linkActive : linkInactive)}>
              Sales
            </NavLink>
          </li>
          <li>
            <NavLink to="/payments"
              className={({ isActive }) => (isActive ? linkActive : linkInactive)}>
              Payments
            </NavLink>
          </li>
          {isOwner && (
            <li>
              <NavLink to="/users"
                className={({ isActive }) => (isActive ? linkActive : linkInactive)}>
                Users
              </NavLink>
            </li>
          )}
        </ul>

        {/* Desktop Right side */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/profile"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-neutral-200 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:bg-neutral-150 hover:text-neutral-800"
              }`
            }>
            Profile
          </NavLink>
          <button onClick={logout}
            className="px-3 py-1.5 rounded-md text-sm text-neutral-500 hover:bg-neutral-150 hover:text-neutral-800 transition-colors">
            Log out
          </button>
        </div>

        {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-200 px-4 pb-3 pt-2 space-y-0.5 bg-neutral-50">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `block ${isActive ? linkActive : linkInactive}`}>
            Dashboard
          </NavLink>
          <NavLink to="/products" onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `block ${isActive ? linkActive : linkInactive}`}>
            Products
          </NavLink>
          <NavLink to="/customers" onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `block ${isActive ? linkActive : linkInactive}`}>
            Customers
          </NavLink>
          <NavLink to="/sales" onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `block ${isActive ? linkActive : linkInactive}`}>
            Sales
          </NavLink>
          <NavLink to="/payments" onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `block ${isActive ? linkActive : linkInactive}`}>
            Payments
          </NavLink>
          {isOwner && (
            <NavLink to="/users" onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `block ${isActive ? linkActive : linkInactive}`}>
              Users
            </NavLink>
          )}
          <div className="border-t border-neutral-200 pt-2 mt-2 flex items-center gap-1">
            <NavLink to="/profile" onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive ? "bg-neutral-200 text-neutral-900 font-medium" : "text-neutral-500 hover:bg-neutral-150"
                }`
              }>
              Profile
            </NavLink>
            <button onClick={logout}
              className="px-3 py-1.5 rounded-md text-sm text-neutral-500 hover:bg-neutral-150 transition-colors">
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default MainNavigation;
