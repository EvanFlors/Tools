import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function PortalSaleDetailPage() {
  const data = useLoaderData();
  const sale = data?.data || data;

  if (!sale || !sale._id) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Sale Not Found</h1>
        <Link to="/portal/sales" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
          ← Back to My Sales
        </Link>
      </div>
    );
  }

  const payments = sale.payments || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/portal/sales" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6 inline-block">
        ← Back to My Sales
      </Link>

      <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl overflow-hidden">
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900 mb-2 tracking-tight">Sale Details</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                sale.status === "active" ? "bg-green-100 text-green-700" : sale.status === "cancelled" ? "bg-brand-100 text-brand-700" : "bg-neutral-200 text-neutral-600"
              }`}>
                {sale.status}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-neutral-100 border border-neutral-200/60 rounded-lg p-5 mb-6">
            <h2 className="text-xs font-medium text-neutral-500 mb-3">Product</h2>
            {sale.productId?.imageIds && sale.productId.imageIds.length > 0 && (
              <img
                src={`${API_BASE}/images/${sale.productId.imageIds[0]._id || sale.productId.imageIds[0]}`}
                alt={sale.productId.name}
                className="w-full h-36 object-contain bg-neutral-50 rounded-lg mb-3"
                crossOrigin="anonymous"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
            <div className="space-y-2.5">
              <div>
                <p className="text-xs text-neutral-400">Name</p>
                <p className="text-sm font-medium text-neutral-900">{sale.productId?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Description</p>
                <p className="text-sm text-neutral-600">{sale.productId?.description || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-neutral-100 border border-neutral-200/60 rounded-lg p-5 mb-6">
            <h2 className="text-xs font-medium text-neutral-500 mb-4">Payment Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
              <div>
                <p className="text-xs text-neutral-400">Total Amount</p>
                <p className="text-2xl font-semibold text-neutral-900">
                  ${typeof sale.totalAmount === "number" ? sale.totalAmount.toFixed(2) : sale.totalAmount}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Remaining Balance</p>
                <p className="text-2xl font-semibold text-brand-600">
                  ${typeof sale.remainingBalance === "number" ? sale.remainingBalance.toFixed(2) : sale.remainingBalance}
                </p>
              </div>
            </div>
            {(() => {
              const pct = sale.totalAmount > 0 ? Math.round(((sale.totalAmount - sale.remainingBalance) / sale.totalAmount) * 100) : 0;
              return (
                <div>
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>{pct}% paid</span>
                    <span>${typeof sale.totalAmount === "number" ? (sale.totalAmount - sale.remainingBalance).toFixed(2) : "—"} of ${typeof sale.totalAmount === "number" ? sale.totalAmount.toFixed(2) : sale.totalAmount}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Payment History */}
          <div className="bg-neutral-50 border border-neutral-200/60 rounded-lg p-5 mb-6">
            <h2 className="text-xs font-medium text-neutral-500 mb-4">Payment History</h2>
            {payments.length === 0 ? (
              <p className="text-neutral-400 text-center py-4 text-sm">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="pb-2 text-xs font-medium text-neutral-500">#</th>
                      <th className="pb-2 text-xs font-medium text-neutral-500">Date</th>
                      <th className="pb-2 text-xs font-medium text-neutral-500">Amount</th>
                      <th className="pb-2 text-xs font-medium text-neutral-500">Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={payment._id} className="border-b border-neutral-100 last:border-b-0">
                        <td className="py-2.5 text-neutral-400">{payments.length - index}</td>
                        <td className="py-2.5 text-neutral-700">
                          {new Date(payment.date || payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 font-semibold text-neutral-900">
                          ${typeof payment.amount === "number" ? payment.amount.toFixed(2) : payment.amount}
                        </td>
                        <td className="py-2.5 text-neutral-700">
                          ${typeof payment.newBalance === "number" ? payment.newBalance.toFixed(2) : payment.newBalance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-neutral-400 gap-1">
            <p>Created: {new Date(sale.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(sale.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortalSaleDetailPage;

export async function loader({ params }) {
  const { saleId } = params;
  const response = await fetch(
    `${API_BASE}/client/sales/${saleId}`,
    { credentials: "include" }
  );

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ message: "Could not fetch sale details." }),
      { status: 500 }
    );
  }

  return response.json();
}
