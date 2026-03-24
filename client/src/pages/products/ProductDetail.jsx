import { Link, useRouteLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_BASE } from "../../config/api";function ProductDetailPage() {
    const product = useRouteLoaderData("product-detail");
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    function navigateHandler() {
        navigate(`edit`);
    }

    async function startDeleteHandling() {
        const proceed = window.confirm("Are you sure you want to delete this product?");

        if (!proceed) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`${API_BASE}/admin/products/${product.data._id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.status === 422 || response.status === 400) {
                const errorData = await response.json();
                window.alert(`Error: ${errorData.error || 'Cannot delete this product.'}`);
                setIsDeleting(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                window.alert(`Error: ${errorData.error || 'Failed to delete product.'}`);
                setIsDeleting(false);
                return;
            }

            navigate("/products", { replace: true });
        } catch (error) {
            console.error("Error deleting product:", error);
            window.alert("An error occurred while deleting the product. Please try again.");
            setIsDeleting(false);
        }
    }

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
            <Link to="../" relative="path" className="text-brand-600 hover:underline mb-4 inline-block">
                ← Back to Products
            </Link>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                <div className="flex justify-end">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition disabled:bg-red-300 disabled:cursor-not-allowed"
                        aria-label="Delete"
                        onClick={startDeleteHandling}
                        disabled={isDeleting}
                    >
                    {isDeleting ? '...' : '✕'}
                    </button>
                </div>
                {productData.imageIds && productData.imageIds.length > 0 && (
                    <img
                        src={`${API_BASE}/images/${productData.imageIds[0]._id}`}
                        alt={productData.name}
                        className="w-full h-64 object-contain rounded-lg mb-6"
                        crossOrigin="anonymous"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                )}
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{productData.name}</h1>
                <p className="text-gray-600 text-lg mb-6">{productData.description}</p>
                <p className="text-3xl font-bold text-brand-600 mb-6">
                    ${typeof productData.price === 'number' ? productData.price.toFixed(2) : productData.price}
                </p>
                <button
                    onClick={navigateHandler}
                    className="mt-6 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors w-full"
                >
                    Edit product
                </button>
            </div>
        </div>
    );
}

export default ProductDetailPage;

export async function ProductDetailLoader({ request, params }) {
    const { productId } = params;
    const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Response(
            JSON.stringify({ message: 'Could not fetch product details.' }),
            { status: 500 }
        );
    }

    const resData = await response.json();
    return resData;
}