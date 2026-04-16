import { useState, useEffect } from "react";
import { Form, useNavigate, useNavigation, useActionData, redirect } from "react-router-dom";
import { API_BASE } from "../config/api";

const inputClass =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 bg-neutral-50";

function SaleForm({ sale }) {
    const data = useActionData();
    const navigate = useNavigate();
    const navigation = useNavigation();

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");

    const method = sale ? "put" : "post";

    useEffect(() => {
        if (sale) {
            setSelectedCustomer(sale.customerId?._id || sale.customerId || "");
            setSelectedProduct(sale.productId?._id || sale.productId || "");
        }
    }, [sale]);

    useEffect(() => {
        fetch(`${API_BASE}/admin/customers`, { credentials: "include" })
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => setCustomers(data.data || []))
            .catch(err => console.error("Error fetching customers:", err));

        fetch(`${API_BASE}/admin/products`, { credentials: "include" })
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => setProducts(data.data || []))
            .catch(err => console.error("Error fetching products:", err));
    }, []);

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

                <div className="mb-4">
                    <label htmlFor="customerId" className="block text-sm font-medium text-neutral-700 mb-1.5">Customer *</label>
                    <select id="customerId" name="customerId" value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)} className={inputClass}>
                        <option value="">Select a customer</option>
                        {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="productId" className="block text-sm font-medium text-neutral-700 mb-1.5">Product *</label>
                    <select id="productId" name="productId" value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)} className={inputClass}>
                        <option value="">Select a product</option>
                        {products.map((p) => <option key={p._id} value={p._id}>{p.name} - ${p.price}</option>)}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="totalAmount" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Total Amount
                        <span className="text-xs text-neutral-400 font-normal ml-1">(leave empty to use product price)</span>
                    </label>
                    <input type="number" id="totalAmount" name="totalAmount" step="0.01" min="0"
                        defaultValue={sale ? sale.totalAmount : ''} className={inputClass} />
                </div>

                <button type="submit" disabled={navigation.state === "submitting"}
                    className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50 mt-2">
                    {navigation.state === "submitting"
                        ? "Submitting..."
                        : sale ? 'Update sale' : 'Create sale'}
                </button>
            </Form>
        </>
    );
}

export default SaleForm;

export async function action({ request, params }) {
    const method = request.method.toUpperCase();
    const formData = await request.formData();

    const saleData = {
        customerId: formData.get("customerId"),
        productId: formData.get("productId"),
    };

    const totalAmountRaw = formData.get("totalAmount");
    if (totalAmountRaw !== null && totalAmountRaw !== "") {
        saleData.totalAmount = parseFloat(totalAmountRaw);
    }

    let url;
    let saleId;

    if (method === "POST") {
        url = `${API_BASE}/admin/sales`;
    } else if (method === "PUT") {
        saleId = params.saleId;
        url = `${API_BASE}/admin/sales/${saleId}`;
    } else if (method === "DELETE") {
        saleId = params.saleId;
        url = `${API_BASE}/admin/sales/${saleId}`;
    }

    const response = await fetch(url, {
        method: method,
        credentials: "include",
        headers: method !== "DELETE" ? {
            "Content-Type": "application/json",
        } : undefined,
        body: method !== "DELETE" ? JSON.stringify(saleData) : undefined,
    });

    if (response.status === 422 || response.status === 400) {
        const resData = await response.json();
        return resData;
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Response(
            JSON.stringify({ message: errorData.message || 'Could not process request.' }),
            { status: response.status }
        );
    }

    if (method === "DELETE") {
        return redirect("/sales");
    }

    const resData = await response.json();

    if (method === "PUT") {
        return redirect(`/sales/${saleId}`);
    } else {
        return redirect(`/sales`);
    }
}
