import { Form, useNavigation, useActionData, redirect } from "react-router-dom";
import { API_BASE } from "../config/api";

function CustomerForm({ customer }) {
    const data = useActionData();

    const navigation = useNavigation();

    const method = customer ? "put" : "post";

    return (
        <>
            <Form method={method} className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                {data && data.errors && <ul className="mb-4 text-red-600">
                    {Object.entries(data.errors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                    ))}
                </ul>}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                        Customer Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={customer ? customer.name : ''}
                        required
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                        Phone
                    </label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        defaultValue={customer ? customer.phone : ''}
                        required
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="address" className="block text-gray-700 font-semibold mb-2">
                        Address
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        defaultValue={customer ? customer.address : ''}
                        required
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={navigation.state === "submitting"}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full font-semibold disabled:bg-blue-300"
                >
                    {navigation.state === "submitting"
                        ? "Submitting..."
                        : customer ? 'Update Customer' : 'Create Customer'
                    }
                </button>
            </Form>
        </>
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