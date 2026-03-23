import SaleForm from "../../components/SaleForm";

function NewSalePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Sale</h1>
            <SaleForm />
        </div>
    );
}

export default NewSalePage;