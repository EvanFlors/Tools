import { Outlet, NavLink } from "react-router-dom";
import { logout } from "../../utils/auth";

function PortalLayout() {
  return (
    <div>
      <nav className="bg-emerald-600 text-white p-4 shadow-md">
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
              className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition text-sm font-semibold"
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
