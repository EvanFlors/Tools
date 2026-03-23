import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function PaymentsPage() {
  const data = useLoaderData();

  if (!data || data.status === 500) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Error</h1>
        <p className="text-xl text-red-600">{data?.message}</p>
      </div>
    );
  }

  const payments = data.data || data;

  if (!payments || payments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Payments</h1>
          <Link
            to="/payments/new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Record Payment
          </Link>
        </div>
        <div className="text-center text-gray-600 py-12">
          <p className="text-xl">No payments recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Payments</h1>
        <Link
          to="/payments/new"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Record Payment
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payments.map((payment) => {
          const sale = payment.saleId;
          return (
            <Link
              key={payment._id}
              to={`/payments/${payment._id}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-emerald-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Payment</p>
                  <h3 className="text-2xl font-bold text-emerald-600">
                    ${typeof payment.amount === "number"
                      ? payment.amount.toFixed(2)
                      : payment.amount}
                  </h3>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </span>
              </div>

              {sale && (
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {sale.customerId?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Product:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {sale.productId?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sale Total:</span>
                    <span className="text-sm font-semibold text-gray-800">
                      ${typeof sale.totalAmount === "number"
                        ? sale.totalAmount.toFixed(2)
                        : sale.totalAmount}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-3 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">Balance: </span>
                  ${typeof payment.previousBalance === "number"
                    ? payment.previousBalance.toFixed(2)
                    : payment.previousBalance}{" "}
                  →{" "}
                  <span className="font-semibold text-emerald-600">
                    ${typeof payment.newBalance === "number"
                      ? payment.newBalance.toFixed(2)
                      : payment.newBalance}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default PaymentsPage;

export async function loader() {
  const response = await fetch(`${API_BASE}/admin/payments`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message: "Could not fetch payments. Please try again later.",
      }),
      { status: 500 }
    );
  }

  const resData = await response.json();
  return resData;
}
