import { Form, useNavigation, useActionData, redirect } from "react-router-dom";
import { API_BASE } from "../config/api";

const inputClass =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 bg-neutral-50";

function CustomerForm({ customer }) {
    const data = useActionData();
    const navigation = useNavigation();
    const method = customer ? "put" : "post";

    return (
        <Form method={method} className="bg-neutral-50 border border-neutral-200/80 p-5 sm:p-6 rounded-xl max-w-2xl mx-auto">
            {data && data.errors && (
                <ul className="mb-4 text-sm text-brand-600 bg-brand-50 border border-brand-100 p-3 rounded-lg">
                    {Object.entries(data.errors).map(([field, message]) => (
                        <li key={field}>• {message}</li>
                    ))}
                </ul>
            )}

            <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Customer Name
                </label>
                <input type="text" id="name" name="name"
                    defaultValue={customer ? customer.name : ''} required className={inputClass} />
            </div>

            <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Phone
                </label>
                <input type="text" id="phone" name="phone"
                    defaultValue={customer ? customer.phone : ''} required className={inputClass} />
            </div>

            <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Address
                </label>
                <input type="text" id="address" name="address"
                    defaultValue={customer ? customer.address : ''} required className={inputClass} />
            </div>

            <button type="submit" disabled={navigation.state === "submitting"}
                className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50 mt-2">
                {navigation.state === "submitting"
                    ? "Submitting..."
                    : customer ? 'Update customer' : 'Create customer'}
            </button>
        </Form>
    );
}

export default CustomerForm;

export async function action({ request, params }) {
    const method = request.method.toUpperCase();
    const formData = await request.formData();

    // Create regular JSON object (no files for customers)
    const customerData = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
    };

    let url;
    let customerId;

    if (method === "POST") {
        url = `${API_BASE}/admin/customers`;
    } else if (method === "PUT") {
        customerId = params.customerId;
        url = `${API_BASE}/admin/customers/${customerId}`;
    } else if (method === "DELETE") {
        customerId = params.customerId;
        url = `${API_BASE}/admin/customers/${customerId}`;
    }

    const response = await fetch(url, {
        method: method,
        credentials: "include",
        headers: method !== "DELETE" ? {
            "Content-Type": "application/json",
        } : undefined,
        body: method !== "DELETE" ? JSON.stringify(customerData) : undefined,
    });

    if (response.status === 422) {
        const resData = await response.json();
        return resData; // Return the validation errors to be consumed by useActionData
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Response(
            JSON.stringify({ message: errorData.message || 'Could not process request.' }),
            { status: response.status }
        );
    }

    // Redirect appropriately based on method
    if (method === "DELETE") {
        return redirect("/customers");
    }

    const resData = await response.json();

    if (method === "PUT") {
        return redirect(`/customers/${customerId}`);
    } else {
        // POST - redirect to newly created customer
        return redirect(`/customers/${resData.data._id}`);
    }
}