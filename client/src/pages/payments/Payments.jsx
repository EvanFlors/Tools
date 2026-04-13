import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function PaymentsPage() {
  const data = useLoaderData();

  if (!data || data.status === 500) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Error</h1>
        <p className="text-sm text-neutral-500">{data?.message}</p>
      </div>
    );
  }

  const payments = data.data || data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Payments</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {payments && payments.length > 0
              ? `${payments.length} payment${payments.length !== 1 ? "s" : ""}`
              : "No payments yet"}
          </p>
        </div>
        <Link
          to="/payments/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition text-sm font-medium"
        >
          <span className="text-base leading-none">+</span>
          New payment
        </Link>
      </div>

      {!payments || payments.length === 0 ? (
        <div className="text-center text-neutral-400 py-20">
          <p>No payments recorded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {payments.map((payment) => {
            const sale = payment.saleId;
            return (
              <Link
                key={payment._id}
                to={`/payments/${payment._id}`}
                className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 hover:border-neutral-300 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-medium text-neutral-400">Payment</p>
                    <h3 className="text-2xl font-semibold text-neutral-900">
                      ${typeof payment.amount === "number"
                        ? payment.amount.toFixed(2)
                        : payment.amount}
                    </h3>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {sale && (
                  <div className="border-t border-neutral-200/60 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Customer:</span>
                      <span className="font-medium text-neutral-900">
                        {sale.customerId?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Product:</span>
                      <span className="font-medium text-neutral-900">
                        {sale.productId?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Sale Total:</span>
                      <span className="font-semibold text-neutral-900">
                        ${typeof sale.totalAmount === "number"
                          ? sale.totalAmount.toFixed(2)
                          : sale.totalAmount}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-xs text-neutral-400">
                  <span>Balance: </span>
                  ${typeof payment.previousBalance === "number"
                    ? payment.previousBalance.toFixed(2)
                    : payment.previousBalance}{" "}
                  →{" "}
                  <span className="font-semibold text-neutral-700">
                    ${typeof payment.newBalance === "number"
                      ? payment.newBalance.toFixed(2)
                      : payment.newBalance}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
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
