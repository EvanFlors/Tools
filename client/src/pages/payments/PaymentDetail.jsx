import { Link, useRouteLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_BASE } from "../../config/api";function PaymentDetailPage() {
  const data = useRouteLoaderData("payment-detail");
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const payment = data?.data || data;

  if (!payment || !payment._id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Payment Not Found
        </h1>
        <Link to="/payments" className="text-blue-600 hover:underline">
          Back to Payments
        </Link>
      </div>
    );
  }

  const sale = payment.saleId;

  function navigateHandler() {
    navigate("edit");
  }

  async function startDeleteHandling() {
    const proceed = window.confirm(
      "Are you sure you want to delete this payment? The sale balance will be restored."
    );
    if (!proceed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${API_BASE}/admin/payments/${payment._id}`,
        { method: "DELETE", credentials: "include" }
      );

      if (response.status === 422 || response.status === 400) {
        const errorData = await response.json();
        window.alert(`Error: ${errorData.error || "Validation error"}`);
        setIsDeleting(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        window.alert(
          `Error: ${errorData.error || "Failed to delete payment"}`
        );
        setIsDeleting(false);
        return;
      }

      navigate("/payments", { replace: true });
    } catch (error) {
      console.error("Error deleting payment:", error);
      window.alert("An error occurred while deleting the payment.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/payments"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Payments
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Payment Details
            </h1>
            <p className="text-sm text-gray-500">
              ID: {payment._id}
            </p>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition disabled:bg-red-300 disabled:cursor-not-allowed"
            aria-label="Delete"
            onClick={startDeleteHandling}
            disabled={isDeleting}
          >
            {isDeleting ? "..." : "✕"}
          </button>
        </div>

        {/* Payment Amount */}
        <div className="border rounded-lg p-6 bg-emerald-50 mb-8 text-center">
          <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
          <p className="text-5xl font-bold text-emerald-600">
            $
            {typeof payment.amount === "number"
              ? payment.amount.toFixed(2)
              : payment.amount}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(payment.date || payment.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Balance Change */}
        <div className="border rounded-lg p-6 bg-gray-50 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Balance Change
          </h2>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Previous Balance</p>
              <p className="text-2xl font-bold text-red-500">
                $
                {typeof payment.previousBalance === "number"
                  ? payment.previousBalance.toFixed(2)
                  : payment.previousBalance}
              </p>
            </div>
            <div className="text-3xl text-gray-400">→</div>
            <div className="text-center">
              <p className="text-sm text-gray-500">New Balance</p>
              <p className="text-2xl font-bold text-emerald-600">
                $
                {typeof payment.newBalance === "number"
                  ? payment.newBalance.toFixed(2)
                  : payment.newBalance}
              </p>
            </div>
          </div>
        </div>

        {/* Linked Sale Info */}
        {sale && typeof sale === "object" && (
          <div className="border rounded-lg p-6 bg-blue-50 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Linked Sale
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="text-lg font-medium text-gray-800">
                  {sale.customerId?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <p className="text-lg font-medium text-gray-800">
                  {sale.productId?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-bold text-gray-800">
                  $
                  {typeof sale.totalAmount === "number"
                    ? sale.totalAmount.toFixed(2)
                    : sale.totalAmount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Remaining</p>
                <p className="text-lg font-bold text-red-600">
                  $
                  {typeof sale.remainingBalance === "number"
                    ? sale.remainingBalance.toFixed(2)
                    : sale.remainingBalance}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Type</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    sale.paymentType === "full"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {String(sale.paymentType).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sale Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    sale.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {String(sale.status).toUpperCase()}
                </span>
              </div>
            </div>
            <Link
              to={`/sales/${sale._id}`}
              className="text-blue-600 hover:underline text-sm mt-4 inline-block"
            >
              View Sale →
            </Link>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex justify-between text-sm text-gray-500 mb-6">
          <p>Created: {new Date(payment.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(payment.updatedAt).toLocaleString()}</p>
        </div>

        <button
          onClick={navigateHandler}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full font-semibold"
        >
          Edit Payment
        </button>
      </div>
    </div>
  );
}

export default PaymentDetailPage;

export async function PaymentDetailLoader({ params }) {
  const { paymentId } = params;
  const response = await fetch(
    `${API_BASE}/admin/payments/${paymentId}`,
    { credentials: "include" }
  );

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ message: "Could not fetch payment details." }),
      { status: 500 }
    );
  }

  const resData = await response.json();
  return resData;
}
