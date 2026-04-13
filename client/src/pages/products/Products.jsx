import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

import ProductsGrid from "../../components/ProductsGrid";

function ProductsPage() {
    const data = useLoaderData();

    if (!data || data.status === 500) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-xl font-semibold text-neutral-900 mb-4">Error</h1>
                <p className="text-neutral-500">{data.message}</p>
            </div>
        );
    }

    const products = data.data || data;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Products</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        {products.length > 0 ? `${products.length} item${products.length !== 1 ? "s" : ""}` : "No products yet"}
                    </p>
                </div>
                <Link
                    to="/products/new"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition text-sm font-medium"
                >
                    <span className="text-base leading-none">+</span>
                    New product
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="text-center text-neutral-400 py-20">
                    <p>No products available at the moment.</p>
                </div>
            ) : (
                <ProductsGrid products={products} linkPrefix="/products" />
            )}
        </div>
    );
}

export default ProductsPage;

export async function loader() {
    const response = await fetch(`${API_BASE}/admin/products`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Response(
            JSON.stringify({ message: 'Could not fetch products. Please try again later.' }),
            { status: 500 }
        );
    }

    const resData = await response.json();
    return resData;
}