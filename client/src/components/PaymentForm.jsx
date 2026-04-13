import { useState, useEffect } from "react";
import {
  Form,
  useNavigate,
  useNavigation,
  useActionData,
  redirect,
} from "react-router-dom";
import { API_BASE } from "../config/api";

const inputClass =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 bg-neutral-50";

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

  useEffect(() => {
    if (payment) {
      const sid = payment.saleId?._id || payment.saleId || "";
      setSelectedSale(sid);
      setAmount(payment.amount ?? "");
    } else if (propSaleId) {
      setSelectedSale(propSaleId);
    }
  }, [payment, propSaleId]);

  useEffect(() => {
    if (!isEdit) {
      fetch(`${API_BASE}/admin/sales`, { credentials: "include" })
        .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
        .then((data) => {
          const activeSales = (data.data || data || []).filter(
            (s) => s.status === "active" && s.remainingBalance > 0
          );
          setSales(activeSales);
        })
        .catch((err) => console.error("Error fetching sales:", err));
    }
  }, [isEdit]);

  useEffect(() => {
    if (!selectedSale) { setSaleInfo(null); return; }
    fetch(`${API_BASE}/admin/sales/${selectedSale}`, { credentials: "include" })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => setSaleInfo(data.data || data))
      .catch(() => setSaleInfo(null));
  }, [selectedSale]);

  const maxPayable = saleInfo
    ? isEdit
      ? saleInfo.remainingBalance + (payment?.amount || 0)
      : saleInfo.remainingBalance
    : undefined;

  function cancelHandler() { navigate(-1); }

  return (
    <>
      <button
        className="w-7 h-7 bg-neutral-200 text-neutral-600 rounded-md hover:bg-neutral-300 transition mb-4 text-sm"
        aria-label="Go Back" onClick={cancelHandler}
      >←</button>

      <Form method={method} className="bg-neutral-50 border border-neutral-200/80 p-5 sm:p-6 rounded-xl max-w-2xl mx-auto">
        {data && data.errors && (
          <ul className="mb-4 text-sm text-brand-600 bg-brand-50 border border-brand-100 p-3 rounded-lg">
            {Object.entries(data.errors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        )}
        {data && data.error && (
          <div className="mb-4 text-sm text-brand-600 bg-brand-50 border border-brand-100 p-3 rounded-lg">
            {data.error}
          </div>
        )}

        {/* Sale selector — creation only */}
        {!isEdit && (
          <div className="mb-4">
            <label htmlFor="saleId" className="block text-sm font-medium text-neutral-700 mb-1.5">Sale *</label>
            <select id="saleId" name="saleId" value={selectedSale} required
              onChange={(e) => setSelectedSale(e.target.value)} className={inputClass}>
              <option value="">Select a sale</option>
              {sales.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.customerId?.name || "Unknown"} — {s.productId?.name || "Unknown"} — Remaining: ${s.remainingBalance?.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}
        {isEdit && <input type="hidden" name="saleId" value={selectedSale} />}

        {/* Sale info card */}
        {saleInfo && (
          <div className="mb-5 bg-neutral-100 border border-neutral-200/60 rounded-lg p-4">
            <h3 className="text-xs font-medium text-neutral-500 mb-2">Sale Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-400">Customer</p>
                <p className="font-medium text-neutral-900">{saleInfo.customerId?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Product</p>
                <p className="font-medium text-neutral-900">{saleInfo.productId?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Total Amount</p>
                <p className="font-medium text-neutral-900">
                  ${typeof saleInfo.totalAmount === "number" ? saleInfo.totalAmount.toFixed(2) : saleInfo.totalAmount}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Remaining Balance</p>
                <p className="font-semibold text-neutral-900">
                  ${typeof saleInfo.remainingBalance === "number" ? saleInfo.remainingBalance.toFixed(2) : saleInfo.remainingBalance}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Payment Type</p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  saleInfo.paymentType === "full" ? "bg-neutral-200 text-neutral-700" : "bg-yellow-50 text-yellow-700"
                }`}>
                  {saleInfo.paymentType}
                </span>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Status</p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  saleInfo.status === "active" ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
                }`}>
                  {saleInfo.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1.5">Amount *</label>
          <input type="number" id="amount" name="amount" step="0.01" min="0.01"
            max={maxPayable || undefined} value={amount}
            onChange={(e) => setAmount(e.target.value)} required
            placeholder={maxPayable ? `Max: $${maxPayable.toFixed(2)}` : "Enter payment amount"}
            className={inputClass} />
          {maxPayable !== undefined && (
            <p className="text-xs text-neutral-400 mt-1">
              Maximum payable: ${maxPayable.toFixed(2)}
              {isEdit && saleInfo && (
                <span> (remaining ${saleInfo.remainingBalance?.toFixed(2)} + current ${payment?.amount?.toFixed(2)})</span>
              )}
            </p>
          )}
        </div>

        <button type="submit" disabled={navigation.state === "submitting"}
          className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50 mt-2">
          {navigation.state === "submitting"
            ? "Submitting..."
            : isEdit ? "Update payment" : "Record payment"}
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
