import { useRouteError, Link } from "react-router-dom";
import { logout } from "../utils/auth";

import PageContent from "../components/PageContent";

function PortalErrorPage() {
    const error = useRouteError();

    let title = "An Error Occurred!";
    let message = "Something went wrong!";

    if (error.status === 404) {
        title = "Not Found";
        message = "The requested resource could not be found.";
    }

    if (error.status === 500) {
        try {
            message = JSON.parse(error.data).message;
        } catch {
            message = error.data || "An unexpected error occurred.";
        }
    }

    return (
        <>
            <nav className="bg-black text-white p-4 shadow-md">
                <ul className="flex gap-6 justify-center items-center">
                    <li>
                        <Link to="/portal" className="hover:underline">
                            Products
                        </Link>
                    </li>
                    <li>
                        <Link to="/portal/sales" className="hover:underline">
                            My Sales
                        </Link>
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
            <PageContent title={title}>
                <p className="text-lg text-gray-600">{message}</p>
                <Link
                    to="/portal"
                    className="mt-4 inline-block text-brand-600 hover:underline font-semibold"
                >
                    ← Back to Portal
                </Link>
            </PageContent>
        </>
    );
}

export default PortalErrorPage;
