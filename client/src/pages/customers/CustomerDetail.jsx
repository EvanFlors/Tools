import { Link, useRouteLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_BASE } from "../../config/api";function CustomerDetailPage() {
    const customer = useRouteLoaderData("customer-detail");
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    function navigateHandler() {
        navigate(`edit`);
    }

    async function startDeleteHandling() {
        const proceed = window.confirm("Are you sure you want to delete this customer?");

        if (!proceed) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`${API_BASE}/admin/customers/${customer.data._id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.status === 422 || response.status === 400) {
                const errorData = await response.json();
                window.alert(`Error: ${errorData.error || 'Cannot delete this customer.'}`);
                setIsDeleting(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                window.alert(`Error: ${errorData.error || 'Failed to delete customer.'}`);
                setIsDeleting(false);
                return;
            }

            navigate("/customers", { replace: true });
        } catch (error) {
            console.error("Error deleting customer:", error);
            window.alert("An error occurred while deleting the customer. Please try again.");
            setIsDeleting(false);
        }
    }

    if (!customer || !customer.data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Customer Not Found</h1>
                <Link to="/customers" className="text-brand-600 hover:underline">
                    Back to Customers
                </Link>
            </div>
        );
    }

    const customerData = customer.data;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="../" relative="path" className="text-brand-600 hover:underline mb-4 inline-block">
                ← Back to Customers
            </Link>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                <div className="flex justify-end">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition disabled:bg-red-300 disabled:cursor-not-allowed"
                        aria-label="Delete"
                        onClick={startDeleteHandling}
                        disabled={isDeleting}
                    >
                    {isDeleting ? '...' : '✕'}
                    </button>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{customerData.name}</h1>
                <p className="text-gray-600 text-lg mb-6">{customerData.address}</p>
                <p className="text-3xl font-bold text-brand-600 mb-6">
                    {customerData.phone}
                </p>
                <button
                    onClick={navigateHandler}
                    className="mt-6 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors w-full"
                >
                    Edit customer
                </button>
            </div>
        </div>
    );
}

export default CustomerDetailPage;

export async function CustomerDetailLoader({ request, params }) {
    const { customerId } = params;
    const response = await fetch(`${API_BASE}/admin/customers/${customerId}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw Response(
            JSON.stringify({ message: 'Could not fetch customer details.' }),
            { status: 500 }
        );
    }

    const resData = await response.json();
    return resData;
}