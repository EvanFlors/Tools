import { Link, useRouteLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_BASE } from "../../config/api";
import { showGlobalToast } from "../../components/Toast";
import ImageCarousel from "../../components/ImageCarousel";

function ProductDetailPage() {
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
                showGlobalToast(errorData.error || "Cannot delete this product.", "error");
                setIsDeleting(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                showGlobalToast(errorData.error || "Failed to delete product.", "error");
                setIsDeleting(false);
                return;
            }

            showGlobalToast("Product deleted successfully.", "success");
            navigate("/products", { replace: true });
        } catch (error) {
            console.error("Error deleting product:", error);
            showGlobalToast("Unable to connect to the server. Please try again.", "error");
            setIsDeleting(false);
        }
    }

    if (!product || !product.data) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-xl font-semibold text-neutral-900 mb-4">Product Not Found</h1>
                <Link to="/products" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    ← Back to Products
                </Link>
            </div>
        );
    }

    const productData = product.data;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <Link to="../" relative="path" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-8 inline-block">
                ← Back to Products
            </Link>

            <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl overflow-hidden">
                {/* Image */}
                <div className="px-5 pt-5">
                    <ImageCarousel
                        images={productData.imageIds}
                        alt={productData.name}
                        height="h-64 sm:h-80"
                    />
                </div>

                {/* Info */}
                <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight leading-tight">
                            {productData.name}
                        </h1>
                        <button
                            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition text-xs disabled:opacity-40"
                            aria-label="Delete"
                            onClick={startDeleteHandling}
                            disabled={isDeleting}
                        >
                            {isDeleting ? '…' : '✕'}
                        </button>
                    </div>

                    <p className="text-neutral-600 text-sm leading-relaxed mb-5">{productData.description}</p>

                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        <p className="text-2xl font-semibold text-neutral-900">
                            ${typeof productData.price === 'number' ? productData.price.toFixed(2) : productData.price}
                        </p>
                        {productData.category && (
                            <span className="px-2.5 py-0.5 bg-neutral-200 text-neutral-700 rounded-full text-xs font-medium">
                                {productData.category}
                            </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            productData.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'
                        }`}>
                            {productData.stock > 0 ? `${productData.stock} in stock` : 'Out of stock'}
                        </span>
                    </div>

                    <button
                        onClick={navigateHandler}
                        className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm"
                    >
                        Edit product
                    </button>
                </div>
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