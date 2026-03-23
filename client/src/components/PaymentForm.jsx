import { useState, useEffect } from "react";
import {
  Form,
  useNavigate,
  useNavigation,
  useActionData,
  redirect,
} from "react-router-dom";
import { API_BASE } from "../config/api";

function PaymentForm({ payment, saleId: propSaleId }) {
  const data = useActionData();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState("");
  const [amount, setAmount] = useState("");
  const [saleInfo, setSaleInfo] = useState(null);

  const method = payment ? "put" : "post";
  const isEdit = !!payment;

  // Initialize form values when editing
  useEffect(() => {
    if (payment) {
      const sid =
        payment.saleId?._id || payment.saleId || "";
      setSelectedSale(sid);
      setAmount(payment.amount ?? "");
    } else if (propSaleId) {
      setSelectedSale(propSaleId);
    }
  }, [payment, propSaleId]);

  // Fetch sales for dropdown (only when creating)
  useEffect(() => {
    if (!isEdit) {
      fetch(`${API_BASE}/admin/sales`, { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch sales");
          return res.json();
        })
        .then((data) => {
          // Only show active sales (with remaining balance)
          const activeSales = (data.data || data || []).filter(
            (s) => s.status === "active" && s.remainingBalance > 0
          );
          setSales(activeSales);
        })
        .catch((err) => console.error("Error fetching sales:", err));
    }
  }, [isEdit]);

  // Fetch selected sale info for balance display
  useEffect(() => {
    if (!selectedSale) {
      setSaleInfo(null);
      return;
    }

    fetch(`${API_BASE}/admin/sales/${selectedSale}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sale");
        return res.json();
      })
      .then((data) => {
        const sale = data.data || data;
        setSaleInfo(sale);
      })
      .catch(() => setSaleInfo(null));
  }, [selectedSale]);

  // Calculate max payable amount
  // When editing: remaining balance + current payment amount (refund then reapply)
  // When creating: just remaining balance
  const maxPayable = saleInfo
    ? isEdit
      ? saleInfo.remainingBalance + (payment?.amount || 0)
      : saleInfo.remainingBalance
    : undefined;

  function cancelHandler() {
    navigate(-1);
  }

  return (
    <>
      <button
        className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:scale-95 transition mb-4"
        aria-label="Go Back"
        onClick={cancelHandler}
      >
        ←
      </button>
      <Form
        method={method}
        className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto"
      >
        {/* Validation errors (Zod) */}
        {data && data.errors && (
          <ul className="mb-4 text-red-600 bg-red-50 p-4 rounded">
            {Object.entries(data.errors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        )}

        {/* Business logic errors */}
        {data && data.error && (
          <div className="mb-4 text-red-600 bg-red-50 p-4 rounded">
            <p>⚠️ {data.error}</p>
          </div>
        )}

        {/* Sale selector — only for creation */}
        {!isEdit && (
          <div className="mb-4">
            <label
              htmlFor="saleId"
              className="block text-gray-700 font-semibold mb-2"
            >
              Sale *
            </label>
            <select
              id="saleId"
              name="saleId"
              value={selectedSale}
              onChange={(e) => setSelectedSale(e.target.value)}
              required
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a sale</option>
              {sales.map((sale) => (
                <option key={sale._id} value={sale._id}>
                  {sale.customerId?.name || "Unknown"} —{" "}
                  {sale.productId?.name || "Unknown"} — Remaining: $
                  {sale.remainingBalance?.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Hidden saleId for edit mode */}
        {isEdit && (
          <input type="hidden" name="saleId" value={selectedSale} />
        )}

        {/* Sale info card */}
        {saleInfo && (
          <div className="mb-6 border rounded-lg p-4 bg-blue-50">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Sale Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">
                  {saleInfo.customerId?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Product</p>
                <p className="font-medium">
                  {saleInfo.productId?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Total Amount</p>
                <p className="font-medium">
                  $
                  {typeof saleInfo.totalAmount === "number"
                    ? saleInfo.totalAmount.toFixed(2)
                    : saleInfo.totalAmount}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Remaining Balance</p>
                <p className="font-bold text-red-600">
                  $
                  {typeof saleInfo.remainingBalance === "number"
                    ? saleInfo.remainingBalance.toFixed(2)
                    : saleInfo.remainingBalance}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Payment Type</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    saleInfo.paymentType === "full"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {String(saleInfo.paymentType).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    saleInfo.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {String(saleInfo.status).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="mb-4">
          <label
            htmlFor="amount"
            className="block text-gray-700 font-semibold mb-2"
          >
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0.01"
            max={maxPayable || undefined}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder={
              maxPayable
                ? `Max: $${maxPayable.toFixed(2)}`
                : "Enter payment amount"
            }
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {maxPayable !== undefined && (
            <p className="text-sm text-gray-500 mt-1">
              Maximum payable: ${maxPayable.toFixed(2)}
              {isEdit && saleInfo && (
                <span className="text-gray-400">
                  {" "}(remaining ${saleInfo.remainingBalance?.toFixed(2)} + current payment ${payment?.amount?.toFixed(2)})
                </span>
              )}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={navigation.state === "submitting"}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full font-semibold disabled:bg-blue-300"
        >
          {navigation.state === "submitting"
            ? "Submitting..."
            : isEdit
            ? "Update Payment"
            : "Record Payment"}
        </button>
      </Form>
    </>
  );
}

export default PaymentForm;

export async function action({ request, params }) {
  const method = request.method.toUpperCase();
  const formData = await request.formData();

  const paymentData = {
    saleId: formData.get("saleId"),
    amount: parseFloat(formData.get("amount")),
  };

  let url;
  let paymentId;

  if (method === "POST") {
    url = `${API_BASE}/admin/payments`;
  } else if (method === "PUT") {
    paymentId = params.paymentId;
    url = `${API_BASE}/admin/payments/${paymentId}`;
  } else if (method === "DELETE") {
    paymentId = params.paymentId;
    url = `${API_BASE}/admin/payments/${paymentId}`;
  }

  const response = await fetch(url, {
    method: method,
    credentials: "include",
    headers:
      method !== "DELETE"
        ? { "Content-Type": "application/json" }
        : undefined,
    body: method !== "DELETE" ? JSON.stringify(paymentData) : undefined,
  });

  // Return validation & business errors for in-form display
  if (response.status === 422 || response.status === 400) {
    const resData = await response.json();
    return resData;
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Response(
      JSON.stringify({
        message: errorData.message || "Could not process request.",
      }),
      { status: response.status }
    );
  }

  if (method === "DELETE") {
    return redirect("/payments");
  }

  const resData = await response.json();

  if (method === "PUT") {
    return redirect(`/payments/${paymentId}`);
  } else {
    return redirect(`/payments/${resData._id}`);
  }
}
