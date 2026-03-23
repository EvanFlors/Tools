import { NavLink } from "react-router-dom";
import { logout } from "../utils/auth";

function MainNavigation() {
    return (
        <nav className="bg-blue-600 text-white p-4 shadow-md">
            <ul className="flex gap-6 justify-center items-center">
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) => (isActive ? "underline" : "hover:underline")}
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/products"
                        className={({ isActive }) => (isActive ? "underline" : "hover:underline")}
                    >
                        Products
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/customers"
                        className={({ isActive }) => (isActive ? "underline" : "hover:underline")}
                    >
                        Customers
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/sales"
                        className={({ isActive }) => (isActive ? "underline" : "hover:underline")}
                    >
                        Sales
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/payments"
                        className={({ isActive }) => (isActive ? "underline" : "hover:underline")}
                    >
                        Payments
                    </NavLink>
                </li>
                <li className="ml-4">
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => (isActive ? "underline" : "hover:underline")}
                    >
                        Profile
                    </NavLink>
                </li>
                <li>
                    <button
                        onClick={logout}
                        className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition text-sm font-semibold"
                    >
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default MainNavigation;
