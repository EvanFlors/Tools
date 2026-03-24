import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function CustomersPage() {
    const data = useLoaderData();

    const customers = data.data || data; // Handle both { data: [...] } and [...] formats

    console.log(customers);

    if (!customers || customers.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-gray-800">Customers</h1>
                    <Link
                        to="/customers/new"
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold flex items-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        Create Customers
                    </Link>
                </div>
                <div className="text-center text-gray-600 py-12">
                    <p className="text-xl">No customers available at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-800">Customers</h1>
                <Link
                    to="/customers/new"
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    Create Customers
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer) => (
                    <Link
                        key={customer._id}
                        to={`/customers/${customer._id}`}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                        <h2 className="text-2xl font-semibold mb-2">{customer.name}</h2>
                        <p className="text-gray-600">Télefono: {customer.phone}</p>
                        <p className="text-gray-400">Dirección: {customer.address}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default CustomersPage;

export async function loader() {
    const response = await fetch(`${API_BASE}/admin/customers`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Response(
            JSON.stringify({ message: "Failed to fetch customers" }),
            { status: 500 }
        );
    }

    const resData = await response.json();
    return resData;
}