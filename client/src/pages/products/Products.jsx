import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function ProductsPage() {
    const data = useLoaderData();

    if (!data || data.status === 500) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-6">Error</h1>
                <p className="text-xl text-red-600">{data.message}</p>
            </div>
        );
    }

    const products = data.data || data; // Handle both { data: [...] } and [...] formats

    if (!products || products.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-gray-800">Products</h1>
                    <Link
                        to="/products/new"
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold flex items-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        Create Product
                    </Link>
                </div>
                <div className="text-center text-gray-600 py-12">
                    <p className="text-xl">No products available at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-800">Products</h1>
                <Link
                    to="/products/new"
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    Create Product
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <Link
                        key={product._id}
                        to={`/products/${product._id}`}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                        <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
                        <p className="text-gray-600">{product.description}</p>
                        {product.imageIds && product.imageIds.length > 0 && (
                            <img
                                src={`${API_BASE}/images/${product.imageIds[0]._id}`}
                                alt={product.name}
                                className="w-full h-48 object-contain rounded mb-4"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        )}
                        <p className="text-lg font-bold text-brand-600 mt-4">
                            ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                        </p>
                    </Link>
                ))}
            </div>
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