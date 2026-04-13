import { Link, useRouteLoaderData } from "react-router-dom";
import SaleForm from "../../components/SaleForm";

function EditSalePage() {
    const data = useRouteLoaderData("sale-detail");

    // Handle both data.data and direct data formats
    const sale = data?.data || data;

    if (!sale || !sale._id) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Sale Not Found</h1>
                <Link to="/sales" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    Back to Sales
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-6">Edit sale</h1>
            <SaleForm sale={sale} />
        </div>
    );
}

export default EditSalePage;