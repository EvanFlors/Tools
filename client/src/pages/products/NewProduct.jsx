import { Link } from "react-router-dom";
import ProductForm from "../../components/ProductForm";

function NewProductPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-6">Create new product</h1>
            <Link to="../" relative="path" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4 inline-block">
                ← Back to Products
            </Link>
            <ProductForm />
        </div>
    );
}

export default NewProductPage;