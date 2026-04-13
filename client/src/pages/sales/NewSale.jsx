import SaleForm from "../../components/SaleForm";

function NewSalePage() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-6">Create new sale</h1>
            <SaleForm />
        </div>
    );
}

export default NewSalePage;