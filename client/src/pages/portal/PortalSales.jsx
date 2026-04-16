import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";
import { fetchWithAuth } from "../../utils/auth";

function PortalSalesPage() {
  const data = useLoaderData();
  const sales = data?.data || data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">My Purchases</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {sales.length > 0 ? `${sales.length} purchase${sales.length !== 1 ? "s" : ""}` : "No purchases yet"}
        </p>
      </div>

      {!sales || sales.length === 0 ? (
        <div className="text-center text-neutral-400 py-20">
          <p>You don't have any purchases yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sales.map((sale) => {
            const paid = sale.totalAmount - sale.remainingBalance;
            const progress = sale.totalAmount > 0 ? Math.round((paid / sale.totalAmount) * 100) : 0;

            return (
              <Link
                key={sale._id}
                to={`/portal/sales/${sale._id}`}
                className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 hover:border-neutral-300 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-medium text-neutral-400">Product</p>
                    <h3 className="text-base font-semibold text-neutral-900">{sale.productId?.name || "N/A"}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    sale.status === "active" ? "bg-green-100 text-green-700" :
                    sale.status === "cancelled" ? "bg-brand-50 text-brand-600" :
                    "bg-neutral-200 text-neutral-600"
                  }`}>
                    {sale.status}
                  </span>
                </div>

                {sale.productId?.imageIds && sale.productId.imageIds.length > 0 && (
                  <img
                    src={`${API_BASE}/images/${sale.productId.imageIds[0]._id || sale.productId.imageIds[0]}`}
                    alt={sale.productId.name}
                    className="w-full h-36 object-contain bg-neutral-100 rounded-lg mb-3"
                    crossOrigin="anonymous"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>Paid: ${paid.toFixed(2)}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        progress === 100 ? "bg-green-500" : "bg-neutral-700"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-200/60 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Total:</span>
                    <span className="font-semibold text-neutral-900">
                      ${typeof sale.totalAmount === "number" ? sale.totalAmount.toFixed(2) : sale.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Remaining:</span>
                    <span className="font-semibold text-brand-600">
                      ${typeof sale.remainingBalance === "number" ? sale.remainingBalance.toFixed(2) : sale.remainingBalance}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-neutral-400">{new Date(sale.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PortalSalesPage;

export async function loader() {
  const response = await fetchWithAuth(`${API_BASE}/client/sales`);

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ message: "Could not fetch sales." }),
      { status: 500 }
    );
  }

  return response.json();
}
