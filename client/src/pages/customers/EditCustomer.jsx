import { Link, useRouteLoaderData } from "react-router-dom";
import CustomerForm from "../../components/CustomerForm";

function EditCustomerPage() {
    const customer = useRouteLoaderData("customer-detail");

    if (!customer || !customer.data) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Customer Not Found</h1>
                <Link to="/customers" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    Back to Customers
                </Link>
            </div>
        );
    }

    const customerData = customer.data;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-6">Edit customer</h1>
            <Link to="/customers" relative="path" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4 inline-block">
                ← Back to Customers
            </Link>
            <CustomerForm customer={customerData} />
        </div>
    );
}

export default EditCustomerPage;

