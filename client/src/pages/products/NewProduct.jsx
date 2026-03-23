import { Link } from "react-router-dom";
import ProductForm from "../../components/ProductForm";

function NewProductPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Product</h1>
            <Link to="../" relative="path" className="text-blue-600 hover:underline mb-4 inline-block">
                ← Back to Products
            </Link>
            <ProductForm />
        </div>
    );
}

export default NewProductPage;