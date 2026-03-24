import { Link } from "react-router-dom";
import CustomerForm from "../../components/CustomerForm";

function NewCustomerPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">New Customer</h1>
            <Link to="/customers" relative="path" className="text-brand-600 hover:underline mb-4 inline-block">
                ← Back to Customers
            </Link>
            <CustomerForm />
        </div>
    );
}

export default NewCustomerPage;
