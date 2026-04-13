import { Link, useRouteLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_BASE } from "../../config/api";
import { showGlobalToast } from "../../components/Toast";

function PaymentDetailPage() {
  const data = useRouteLoaderData("payment-detail");
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const payment = data?.data || data;

  if (!payment || !payment._id) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Payment Not Found</h1>
        <Link to="/payments" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
          ← Back to Payments
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
        showGlobalToast(errorData.error || "Validation error", "error");
        setIsDeleting(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        showGlobalToast(errorData.error || "Failed to delete payment.", "error");
        setIsDeleting(false);
        return;
      }

      showGlobalToast("Payment deleted successfully.", "success");
      navigate("/payments", { replace: true });
    } catch (error) {
      console.error("Error deleting payment:", error);
      showGlobalToast("Unable to connect to the server. Please try again.", "error");
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/payments"
        className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6 inline-block"
      >
        ← Back to Payments
      </Link>

      <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl overflow-hidden">
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900 mb-1 tracking-tight">Payment Details</h1>
              <p className="text-xs text-neutral-400 font-mono break-all">ID: {payment._id}</p>
            </div>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              aria-label="Delete"
              onClick={startDeleteHandling}
              disabled={isDeleting}
            >
              {isDeleting ? "…" : "✕"}
            </button>
          </div>

          {/* Payment Amount */}
          <div className="bg-neutral-100 border border-neutral-200/60 rounded-lg p-6 mb-6 text-center">
            <p className="text-xs font-medium text-neutral-500 mb-1">Payment Amount</p>
            <p className="text-3xl font-semibold text-neutral-900">
              ${typeof payment.amount === "number" ? payment.amount.toFixed(2) : payment.amount}
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              {new Date(payment.date || payment.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Balance Change */}
          <div className="bg-neutral-100 border border-neutral-200/60 rounded-lg p-6 mb-6">
            <h2 className="text-xs font-medium text-neutral-500 mb-4">Balance Change</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-xs text-neutral-400">Previous</p>
                <p className="text-xl sm:text-2xl font-semibold text-neutral-600">
                  ${typeof payment.previousBalance === "number" ? payment.previousBalance.toFixed(2) : payment.previousBalance}
                </p>
              </div>
              <div className="text-xl text-neutral-300 rotate-90 sm:rotate-0">→</div>
              <div className="text-center">
                <p className="text-xs text-neutral-400">New</p>
                <p className="text-xl sm:text-2xl font-semibold text-neutral-900">
                  ${typeof payment.newBalance === "number" ? payment.newBalance.toFixed(2) : payment.newBalance}
                </p>
              </div>
            </div>
          </div>

          {/* Linked Sale Info */}
          {sale && typeof sale === "object" && (
            <div className="bg-neutral-100 border border-neutral-200/60 rounded-lg p-5 mb-6">
              <h2 className="text-xs font-medium text-neutral-500 mb-4">Linked Sale</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-400">Customer</p>
                  <p className="text-sm font-medium text-neutral-900">{sale.customerId?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Product</p>
                  <p className="text-sm font-medium text-neutral-900">{sale.productId?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Total Amount</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    ${typeof sale.totalAmount === "number" ? sale.totalAmount.toFixed(2) : sale.totalAmount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Current Remaining</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    ${typeof sale.remainingBalance === "number" ? sale.remainingBalance.toFixed(2) : sale.remainingBalance}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Payment Type</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    sale.paymentType === "full" ? "bg-neutral-200 text-neutral-700" : "bg-yellow-50 text-yellow-700"
                  }`}>
                    {sale.paymentType}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Sale Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    sale.status === "active" ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
                  }`}>
                    {sale.status}
                  </span>
                </div>
              </div>
              <Link
                to={`/sales/${sale._id}`}
                className="text-sm text-neutral-500 hover:text-neutral-800 font-medium mt-4 inline-block transition-colors"
              >
                View sale →
              </Link>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-neutral-400 mb-6 gap-1">
            <p>Created: {new Date(payment.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(payment.updatedAt).toLocaleString()}</p>
          </div>

          <button
            onClick={navigateHandler}
            className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm"
          >
            Edit payment
          </button>
        </div>
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
