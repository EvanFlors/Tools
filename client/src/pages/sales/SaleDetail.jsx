import { Link, useRouteLoaderData, useNavigate, redirect } from "react-router-dom";
import { useState } from "react";
import { API_BASE } from "../../config/api";function SaleDetailPage() {
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
                window.alert(`Error: ${errorData.error || 'Validation error'}`);
                setIsDeleting(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                window.alert(`Error: ${errorData.error || 'Failed to delete sale'}`);
                setIsDeleting(false);
                return;
            }

            // Success - navigate to sales list
            navigate("/sales", { replace: true });
        } catch (error) {
            console.error("Error deleting sale:", error);
            window.alert("An error occurred while deleting the sale. Please try again.");
            setIsDeleting(false);
        }
    }

    const sale = data?.data || data;

    if (!sale || !sale._id) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Sale Not Found</h1>
                <Link to="/sales" className="text-blue-600 hover:underline">
                    Back to Sales
                </Link>
            </div>
        );
    }

    const saleData = sale;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="../" relative="path" className="text-blue-600 hover:underline mb-4 inline-block">
                ← Back to Sales
            </Link>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Sale Details</h1>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            saleData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {String(saleData.status).toUpperCase()}
                        </span>
                    </div>
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition disabled:bg-red-300 disabled:cursor-not-allowed"
                        aria-label="Delete"
                        onClick={startDeleteHandling}
                        disabled={isDeleting}
                    >
                        {isDeleting ? '...' : '✕'}
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Customer Info */}
                    <div className="border rounded-lg p-6 bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="text-lg font-medium text-gray-800">{saleData.customerId?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="text-lg font-medium text-gray-800">{saleData.customerId?.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="text-lg font-medium text-gray-800">{saleData.customerId?.address || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="border rounded-lg p-6 bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Information</h2>
                        {saleData.productId?.imageIds && saleData.productId.imageIds.length > 0 && (
                            <img
                                src={`${API_BASE}/images/${saleData.productId.imageIds[0]}`}
                                alt={saleData.productId.name}
                                className="w-full h-40 object-contain rounded-lg mb-4"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        )}
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Product Name</p>
                                <p className="text-lg font-medium text-gray-800">{saleData.productId?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="text-gray-700">{saleData.productId?.description || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Unit Price</p>
                                <p className="text-lg font-bold text-blue-600">
                                    ${typeof saleData.productId?.price === 'number' ? saleData.productId.price.toFixed(2) : saleData.productId?.price}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="border rounded-lg p-6 bg-blue-50 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-800">
                                ${typeof saleData.totalAmount === 'number' ? saleData.totalAmount.toFixed(2) : saleData.totalAmount}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Remaining Balance</p>
                            <p className="text-2xl font-bold text-red-600">
                                ${typeof saleData.remainingBalance === 'number' ? saleData.remainingBalance.toFixed(2) : saleData.remainingBalance}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Payment Type</p>
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mt-2 ${
                                saleData.paymentType === 'full' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {String(saleData.paymentType).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="flex justify-between text-sm text-gray-500 mb-6">
                    <p>Created: {new Date(saleData.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(saleData.updatedAt).toLocaleString()}</p>
                </div>

                <button
                    onClick={navigateHandler}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full font-semibold"
                >
                    Edit Sale
                </button>
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