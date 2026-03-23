import { Link, useRouteLoaderData } from "react-router-dom";
import SaleForm from "../../components/SaleForm";

function EditSalePage() {
    const data = useRouteLoaderData("sale-detail");

    // Handle both data.data and direct data formats
    const sale = data?.data || data;

    if (!sale || !sale._id) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Sale Not Found</h1>
                <Link to="/sales" className="text-blue-600 hover:underline">
                    Back to Sales
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Sale</h1>
            <SaleForm sale={sale} />
        </div>
    );
}

export default EditSalePage;