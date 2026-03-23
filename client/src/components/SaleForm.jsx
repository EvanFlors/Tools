import { useState, useEffect } from "react";
import { Form, useNavigate, useNavigation, useActionData, redirect } from "react-router-dom";
import { API_BASE } from "../config/api";

function SaleForm({ sale }) {
    const data = useActionData();
    const navigate = useNavigate();
    const navigation = useNavigation();

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [paymentType, setPaymentType] = useState("full");

    const method = sale ? "put" : "post";

    console.log("Form sale data:", sale);

    // Initialize form values when sale data is available
    useEffect(() => {
        if (sale) {
            setSelectedCustomer(sale.customerId?._id || sale.customerId || "");
            setSelectedProduct(sale.productId?._id || sale.productId || "");
            setPaymentType(sale.paymentType || "full");
        }
    }, [sale]);

    useEffect(() => {
        // Fetch customers
        fetch(`${API_BASE}/admin/customers`, { credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch customers');
                return res.json();
            })
            .then(data => {
                setCustomers(data.data || []);
                console.log("Customers loaded:", data.data);
            })
            .catch(err => console.error("Error fetching customers:", err));

        // Fetch products
        fetch(`${API_BASE}/admin/products`, { credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch products');
                return res.json();
            })
            .then(data => {
                setProducts(data.data || []);
                console.log("Products loaded:", data.data);
            })
            .catch(err => console.error("Error fetching products:", err));
    }, []);

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
            <Form method={method} className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                {/* Display validation errors from Zod */}
                {data && data.errors && (
                    <ul className="mb-4 text-red-600 bg-red-50 p-4 rounded">
                        {Object.entries(data.errors).map(([field, message]) => (
                            <li key={field}>• {message}</li>
                        ))}
                    </ul>
                )}

                {/* Display business logic errors from service */}
                {data && data.error && (
                    <div className="mb-4 text-red-600 bg-red-50 p-4 rounded">
                        <p>⚠️ {data.error}</p>
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="customerId" className="block text-gray-700 font-semibold mb-2">
                        Customer *
                    </label>
                    <select
                        id="customerId"
                        name="customerId"
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        // required
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="productId" className="block text-gray-700 font-semibold mb-2">
                        Product *
                    </label>
                    <select
                        id="productId"
                        name="productId"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        // required
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                            <option key={product._id} value={product._id}>
                                {product.name} - ${product.price}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="totalAmount" className="block text-gray-700 font-semibold mb-2">
                        Total Amount *
                    </label>
                    <input
                        type="number"
                        id="totalAmount"
                        name="totalAmount"
                        step="0.01"
                        min="0"
                        defaultValue={sale ? sale.totalAmount : ''}
                        // required
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="paymentType" className="block text-gray-700 font-semibold mb-2">
                        Payment Type *
                    </label>
                    <select
                        id="paymentType"
                        name="paymentType"
                        value={paymentType}
                        onChange={(e) => {
                            console.log("Payment type changed to:", e.target.value);
                            setPaymentType(e.target.value);
                        }}
                        // required
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="full">Full Payment</option>
                        <option value="installments">Installments</option>
                    </select>
                </div>
                {/* <div className="mb-4">
                    <label htmlFor="status" className="block text-gray-700 font-semibold mb-2">
                        Status *
                    </label>
                    <select
                        id="status"
                        name="status"
                        defaultValue={sale ? sale.status : 'active'}
                        required
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                </div> */}

                <button
                    type="submit"
                    disabled={navigation.state === "submitting"}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full font-semibold disabled:bg-blue-300"
                >
                    {navigation.state === "submitting"
                        ? "Submitting..."
                        : sale ? 'Update Sale' : 'Create Sale'
                    }
                </button>
            </Form>
        </>
    );
}

export default SaleForm;

export async function action({ request, params }) {
    const method = request.method.toUpperCase();
    const formData = await request.formData();

    // Create regular JSON object
    const saleData = {
        customerId: formData.get("customerId"),
        productId: formData.get("productId"),
        paymentType: formData.get("paymentType"),
        status: formData.get("status"),
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

    console.log("Response status:", response.status);

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
        console.log("Response data:", resData);
        return redirect(`/sales`);
    }
}
