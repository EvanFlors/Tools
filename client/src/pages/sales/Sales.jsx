import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function SalesPage() {
    const data = useLoaderData();

    if (!data || data.status === 500) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Error</h1>
                <p className="text-sm text-neutral-500">{data.message}</p>
            </div>
        );
    }

    const sales = data.data || data;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Sales</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        {sales && sales.length > 0
                            ? `${sales.length} sale${sales.length !== 1 ? "s" : ""}`
                            : "No sales yet"}
                    </p>
                </div>
                <Link
                    to="/sales/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition text-sm font-medium"
                >
                    <span className="text-base leading-none">+</span>
                    New sale
                </Link>
            </div>

            {!sales || sales.length === 0 ? (
                <div className="text-center text-neutral-400 py-20">
                    <p>No sales available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sales.map((sale) => (
                        <Link
                            key={sale._id}
                            to={`/sales/${sale._id}`}
                            className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 hover:border-neutral-300 transition-all"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-xs font-medium text-neutral-400">Customer</p>
                                    <h3 className="text-base font-semibold text-neutral-900">{sale.customerId?.name || 'N/A'}</h3>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    sale.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-600'
                                }`}>
                                    {sale.status}
                                </span>
                            </div>

                            {sale.productId?.imageIds && sale.productId.imageIds.length > 0 && (
                                <img
                                    src={`${API_BASE}/images/${sale.productId.imageIds[0]}`}
                                    alt={sale.productId.name}
                                    className="w-full h-36 object-contain bg-neutral-100 rounded-lg mb-3"
                                    crossOrigin="anonymous"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}

                            <div className="mb-3">
                                <p className="text-xs font-medium text-neutral-400">Product</p>
                                <p className="text-sm font-medium text-neutral-700">{sale.productId?.name || 'N/A'}</p>
                            </div>

                            <div className="border-t border-neutral-200/60 pt-3 space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Total:</span>
                                    <span className="font-semibold text-neutral-900">
                                        ${typeof sale.totalAmount === 'number' ? sale.totalAmount.toFixed(2) : sale.totalAmount}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Remaining:</span>
                                    <span className="font-semibold text-neutral-900">
                                        ${typeof sale.remainingBalance === 'number' ? sale.remainingBalance.toFixed(2) : sale.remainingBalance}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        sale.paymentType === 'full' ? 'bg-neutral-200 text-neutral-700' : 'bg-yellow-50 text-yellow-700'
                                    }`}>
                                        {sale.paymentType}
                                    </span>
                                    <span className="text-xs text-neutral-400">
                                        {new Date(sale.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SalesPage;

export async function loader() {
    const response = await fetch(`${API_BASE}/admin/sales`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Response(
            JSON.stringify({ message: 'Could not fetch sales. Please try again later.' }),
            { status: 500 }
        );
    }

    const resData = await response.json();
    return resData;
}