import { Link, useRouteLoaderData } from "react-router-dom";
import ProductForm from "../../components/ProductForm";

function EditProductPage() {
    const product = useRouteLoaderData("product-detail");

    if (!product || !product.data) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Product Not Found</h1>
                <Link to="/products" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    Back to Products
                </Link>
            </div>
        );
    }

    const productData = product.data;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-6">Edit product</h1>
            <Link to="/products" relative="path" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4 inline-block">
                ← Back to Products
            </Link>
            <ProductForm product={productData} />
        </div>
    );
}

export default EditProductPage;