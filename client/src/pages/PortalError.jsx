import { useState } from "react";
import { useRouteError, Link } from "react-router-dom";
import { logout } from "../utils/auth";
import PageContent from "../components/PageContent";

const linkBase =
  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";
const linkInactive = `${linkBase} text-neutral-500 hover:bg-neutral-150 hover:text-neutral-800`;

function PortalErrorPage() {
    const error = useRouteError();
    const [menuOpen, setMenuOpen] = useState(false);

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
            <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-50 border-b border-neutral-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
                    <span className="text-neutral-900 font-semibold text-base tracking-tight">Herramientas</span>
                    <ul className="hidden md:flex items-center gap-1">
                        <li><Link to="/portal" className={linkInactive}>Products</Link></li>
                        <li><Link to="/portal/sales" className={linkInactive}>My Sales</Link></li>
                    </ul>
                    <div className="hidden md:block">
                        <button onClick={logout}
                            className={`${linkBase} text-neutral-500 hover:bg-neutral-150 hover:text-neutral-800`}>
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
                    <div className="md:hidden border-t border-neutral-200 px-4 pb-4 pt-2 space-y-1 bg-neutral-50">
                        <Link to="/portal" className={`block ${linkInactive}`}>Products</Link>
                        <Link to="/portal/sales" className={`block ${linkInactive}`}>My Sales</Link>
                        <hr className="border-neutral-200 my-2" />
                        <button onClick={logout}
                            className={`${linkBase} text-neutral-500 hover:bg-neutral-150 hover:text-neutral-800`}>
                            Log out
                        </button>
                    </div>
                )}
            </nav>
            <div className="pt-12">
            <PageContent title={title}>
                <p className="text-sm text-neutral-500">{message}</p>
                <Link to="/portal" className="mt-4 inline-block text-sm text-neutral-500 hover:text-neutral-800 font-medium transition-colors">
                    ← Back to Portal
                </Link>
            </PageContent>
            </div>
        </>
    );
}

export default PortalErrorPage;
