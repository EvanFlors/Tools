import { Link, useRouteLoaderData, useNavigate, redirect } from "react-router-dom";
import { useState } from "react";
import { API_BASE } from "../../config/api";
import { showGlobalToast } from "../../components/Toast";

function SaleDetailPage() {
    const data = useRouteLoaderData("sale-detail");
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    function navigateHandler() {
        navigate(`edit`);
    }

    async function startDeleteHandling() {
        const proceed = window.confirm("Are you sure you want to delete this sale?");
        if (!proceed) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`${API_BASE}/admin/sales/${saleData._id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.status === 422) {
                const errorData = await response.json();
                showGlobalToast(errorData.error || "Validation error", "error");
                setIsDeleting(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                showGlobalToast(errorData.error || "Failed to delete sale.", "error");
                setIsDeleting(false);
                return;
            }

            showGlobalToast("Sale deleted successfully.", "success");
            navigate("/sales", { replace: true });
        } catch (error) {
            console.error("Error deleting sale:", error);
            showGlobalToast("Unable to connect to the server. Please try again.", "error");
            setIsDeleting(false);
        }
    }

    const sale = data?.data || data;

    if (!sale || !sale._id) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Sale Not Found</h1>
                <Link to="/sales" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    ← Back to Sales
                </Link>
            </div>
        );
    }

    const saleData = sale;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <Link to="../" relative="path" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6 inline-block">
                ← Back to Sales
            </Link>

            <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl overflow-hidden">
                <div className="p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-xl font-semibold text-neutral-900 mb-2 tracking-tight">Sale Details</h1>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                saleData.status === 'active' ? 'bg-green-100 text-green-700' : saleData.status === 'cancelled' ? 'bg-brand-100 text-brand-700' : 'bg-neutral-200 text-neutral-600'
                            }`}>
                                {saleData.status}
                            </span>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Customer Info */}
                        <div className="bg-neutral-100 border border-neutral-200/60 rounded-lg p-5">
                            <h2 className="text-xs font-medium text-neutral-500 mb-3">Customer</h2>
                            <div className="space-y-2.5">
                                <div>
                                    <p className="text-xs text-neutral-400">Name</p>
                                    <p className="text-sm font-medium text-neutral-900">{saleData.customerId?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400">Phone</p>
                                    <p className="text-sm font-medium text-neutral-900">{saleData.customerId?.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400">Address</p>
                                    <p className="text-sm font-medium text-neutral-900">{saleData.customerId?.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="bg-neutral-100 border border-neutral-200/60 rounded-lg p-5">
                            <h2 className="text-xs font-medium text-neutral-500 mb-3">Product</h2>
                            {saleData.productId?.imageIds && saleData.productId.imageIds.length > 0 && (
                                <img
                                    src={`${API_BASE}/images/${saleData.productId.imageIds[0]}`}
                                    alt={saleData.productId.name}
                                    className="w-full h-32 object-contain bg-neutral-50 rounded-lg mb-3"
                                    crossOrigin="anonymous"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                            <div className="space-y-2.5">
                                <div>
                                    <p className="text-xs text-neutral-400">Name</p>
                                    <p className="text-sm font-medium text-neutral-900">{saleData.productId?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400">Description</p>
                                    <p className="text-sm text-neutral-600">{saleData.productId?.description || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400">Unit Price</p>
                                    <p className="text-sm font-semibold text-neutral-900">
                                        ${typeof saleData.productId?.price === 'number' ? saleData.productId.price.toFixed(2) : saleData.productId?.price}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-neutral-100 border border-neutral-200/60 rounded-lg p-5 mb-6">
                        <h2 className="text-xs font-medium text-neutral-500 mb-4">Payment Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
                            <div>
                                <p className="text-xs text-neutral-400">Total Amount</p>
                                <p className="text-2xl font-semibold text-neutral-900">
                                    ${typeof saleData.totalAmount === 'number' ? saleData.totalAmount.toFixed(2) : saleData.totalAmount}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400">Remaining Balance</p>
                                <p className="text-2xl font-semibold text-brand-600">
                                    ${typeof saleData.remainingBalance === 'number' ? saleData.remainingBalance.toFixed(2) : saleData.remainingBalance}
                                </p>
                            </div>
                        </div>
                        {(() => {
                            const pct = saleData.totalAmount > 0 ? Math.round(((saleData.totalAmount - saleData.remainingBalance) / saleData.totalAmount) * 100) : 0;
                            return (
                                <div>
                                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                                        <span>{pct}% paid</span>
                                        <span>${typeof saleData.totalAmount === 'number' ? (saleData.totalAmount - saleData.remainingBalance).toFixed(2) : '—'} of ${typeof saleData.totalAmount === 'number' ? saleData.totalAmount.toFixed(2) : saleData.totalAmount}</span>
                                    </div>
                                    <div className="w-full bg-neutral-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-neutral-400 mb-6 gap-1">
                        <p>Created: {new Date(saleData.createdAt).toLocaleString()}</p>
                        <p>Updated: {new Date(saleData.updatedAt).toLocaleString()}</p>
                    </div>

                    <button
                        onClick={navigateHandler}
                        className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm"
                    >
                        Edit sale
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SaleDetailPage;

export async function SaleDetailLoader({ request, params }) {
    const { saleId } = params;
    const response = await fetch(`${API_BASE}/admin/sales/${saleId}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Response(
            JSON.stringify({ message: 'Could not fetch sale details.' }),
            { status: 500 }
        );
    }

    const resData = await response.json();
    return resData;
}