import { Outlet, NavLink } from "react-router-dom";
import { logout } from "../../utils/auth";

function PortalLayout() {
  return (
    <div>
      <nav className="bg-black text-white p-4 shadow-md">
        <ul className="flex gap-6 justify-center items-center">
          <li>
            <NavLink
              to="/portal"
              end
              className={({ isActive }) =>
                isActive ? "underline font-bold" : "hover:underline"
              }
            >
              Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/portal/sales"
              className={({ isActive }) =>
                isActive ? "underline font-bold" : "hover:underline"
              }
            >
              My Sales
            </NavLink>
          </li>
          <li className="ml-4">
            <button
              onClick={logout}
              className="px-3 py-1 bg-brand-600 rounded hover:bg-brand-700 transition text-sm font-semibold"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PortalLayout;
