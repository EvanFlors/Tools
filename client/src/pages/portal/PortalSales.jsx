import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function PortalSalesPage() {
  const data = useLoaderData();
  const sales = data?.data || data || [];

  if (!sales || sales.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">My Sales</h1>
        <div className="text-center text-gray-600 py-12">
          <p className="text-xl">You don't have any sales yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">My Sales</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sales.map((sale) => (
          <Link
            key={sale._id}
            to={`/portal/sales/${sale._id}`}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-emerald-500"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <h3 className="text-xl font-semibold text-gray-800">
                  {sale.productId?.name || "N/A"}
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  sale.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {String(sale.status).toUpperCase()}
              </span>
            </div>

            {sale.productId?.imageIds && sale.productId.imageIds.length > 0 && (
              <img
                src={`${API_BASE}/images/${sale.productId.imageIds[0]._id || sale.productId.imageIds[0]}`}
                alt={sale.productId.name}
                className="w-full h-40 object-contain rounded mb-4"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="text-sm font-semibold text-gray-800">
                  ${typeof sale.totalAmount === "number" ? sale.totalAmount.toFixed(2) : sale.totalAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Remaining:</span>
                <span className="text-sm font-semibold text-red-600">
                  ${typeof sale.remainingBalance === "number" ? sale.remainingBalance.toFixed(2) : sale.remainingBalance}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    sale.paymentType === "full"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {String(sale.paymentType).toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(sale.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PortalSalesPage;

export async function loader() {
  const response = await fetch(`${API_BASE}/client/sales`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ message: "Could not fetch sales." }),
      { status: 500 }
    );
  }

  return response.json();
}
