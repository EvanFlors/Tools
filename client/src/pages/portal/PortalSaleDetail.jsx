import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function PortalSaleDetailPage() {
  const data = useLoaderData();
  const sale = data?.data || data;

  if (!sale || !sale._id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Sale Not Found</h1>
        <Link to="/portal/sales" className="text-emerald-600 hover:underline">
          Back to My Sales
        </Link>
      </div>
    );
  }

  const payments = sale.payments || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/portal/sales"
        className="text-emerald-600 hover:underline mb-4 inline-block"
      >
        ← Back to My Sales
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Sale Details
            </h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                sale.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {String(sale.status).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="border rounded-lg p-6 bg-gray-50 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Product Information
          </h2>
          {sale.productId?.imageIds &&
            sale.productId.imageIds.length > 0 && (
              <img
                src={`${API_BASE}/images/${sale.productId.imageIds[0]._id || sale.productId.imageIds[0]}`}
                alt={sale.productId.name}
                className="w-full h-40 object-contain rounded-lg mb-4"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Product Name</p>
              <p className="text-lg font-medium text-gray-800">
                {sale.productId?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-700">
                {sale.productId?.description || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="border rounded-lg p-6 bg-emerald-50 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Payment Summary
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">
                $
                {typeof sale.totalAmount === "number"
                  ? sale.totalAmount.toFixed(2)
                  : sale.totalAmount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining Balance</p>
              <p className="text-2xl font-bold text-red-600">
                $
                {typeof sale.remainingBalance === "number"
                  ? sale.remainingBalance.toFixed(2)
                  : sale.remainingBalance}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Type</p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mt-2 ${
                  sale.paymentType === "full"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {String(sale.paymentType).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="border rounded-lg p-6 bg-white mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Payment History
          </h2>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No payments recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-sm font-semibold text-gray-600">
                      #
                    </th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">
                      Amount
                    </th>
                    <th className="pb-3 text-sm font-semibold text-gray-600">
                      Balance After
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={payment._id} className="border-b last:border-b-0">
                      <td className="py-3 text-sm text-gray-500">
                        {payments.length - index}
                      </td>
                      <td className="py-3 text-sm text-gray-700">
                        {new Date(
                          payment.date || payment.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-sm font-semibold text-emerald-600">
                        $
                        {typeof payment.amount === "number"
                          ? payment.amount.toFixed(2)
                          : payment.amount}
                      </td>
                      <td className="py-3 text-sm text-gray-700">
                        $
                        {typeof payment.newBalance === "number"
                          ? payment.newBalance.toFixed(2)
                          : payment.newBalance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="flex justify-between text-sm text-gray-500">
          <p>Created: {new Date(sale.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(sale.updatedAt).toLocaleString()}</p>
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
