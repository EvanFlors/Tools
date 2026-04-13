import { Link, useRouteLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_BASE } from "../../config/api";
import { showGlobalToast } from "../../components/Toast";

function CustomerDetailPage() {
    const customer = useRouteLoaderData("customer-detail");
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    function navigateHandler() {
        navigate(`edit`);
    }

    async function startDeleteHandling() {
        const proceed = window.confirm("Are you sure you want to delete this customer?");
        if (!proceed) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`${API_BASE}/admin/customers/${customer.data._id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.status === 422 || response.status === 400) {
                const errorData = await response.json();
                showGlobalToast(errorData.error || "Cannot delete this customer.", "error");
                setIsDeleting(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                showGlobalToast(errorData.error || "Failed to delete customer.", "error");
                setIsDeleting(false);
                return;
            }

            showGlobalToast("Customer deleted successfully.", "success");
            navigate("/customers", { replace: true });
        } catch (error) {
            console.error("Error deleting customer:", error);
            showGlobalToast("Unable to connect to the server. Please try again.", "error");
            setIsDeleting(false);
        }
    }

    if (!customer || !customer.data) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Customer Not Found</h1>
                <Link to="/customers" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    ← Back to Customers
                </Link>
            </div>
        );
    }

    const customerData = customer.data;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <Link to="../" relative="path" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6 inline-block">
                ← Back to Customers
            </Link>

            <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl overflow-hidden">
                <div className="p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-50 text-lg font-medium">
                                {(customerData.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">{customerData.name}</h1>
                                <span className="text-xs text-neutral-400">Customer</span>
                            </div>
                        </div>
                        <button
                            className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            aria-label="Delete"
                            onClick={startDeleteHandling}
                            disabled={isDeleting}
                        >
                            {isDeleting ? '…' : '✕'}
                        </button>
                    </div>

                    {/* Details */}
                    <div className="bg-neutral-100 border border-neutral-200/60 rounded-lg p-5 space-y-4 mb-6">
                        <div>
                            <p className="text-xs font-medium text-neutral-500 mb-1">Phone</p>
                            <p className="text-base font-medium text-neutral-900">{customerData.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-neutral-500 mb-1">Address</p>
                            <p className="text-base font-medium text-neutral-900">{customerData.address}</p>
                        </div>
                    </div>

                    <button
                        onClick={navigateHandler}
                        className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm"
                    >
                        Edit customer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CustomerDetailPage;

export async function CustomerDetailLoader({ request, params }) {
    const { customerId } = params;
    const response = await fetch(`${API_BASE}/admin/customers/${customerId}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw Response(
            JSON.stringify({ message: 'Could not fetch customer details.' }),
            { status: 500 }
        );
    }

    const resData = await response.json();
    return resData;
}