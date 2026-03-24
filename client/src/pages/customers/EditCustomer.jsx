import { Link, useRouteLoaderData } from "react-router-dom";
import CustomerForm from "../../components/CustomerForm";

function EditCustomerPage() {
    const customer = useRouteLoaderData("customer-detail");

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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Customer</h1>
            <Link to="/customers" relative="path" className="text-brand-600 hover:underline mb-4 inline-block">
                ← Back to Customers
            </Link>
            <CustomerForm customer={customerData} />
        </div>
    );
}

export default EditCustomerPage;

