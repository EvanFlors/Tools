import { Link, useRouteLoaderData } from "react-router-dom";
import ProductForm from "../../components/ProductForm";

function EditProductPage() {
    const product = useRouteLoaderData("product-detail");

    if (!product || !product.data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Product Not Found</h1>
                <Link to="/products" className="text-brand-600 hover:underline">
                    Back to Products
                </Link>
            </div>
        );
    }

    const productData = product.data;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Product</h1>
            <Link to="/products" relative="path" className="text-brand-600 hover:underline mb-4 inline-block">
                ← Back to Products
            </Link>
            <ProductForm product={productData} />
        </div>
    );
}

export default EditProductPage;