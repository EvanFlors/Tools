import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";
import ImageCarousel from "../../components/ImageCarousel";

function PortalProductDetailPage() {
  const data = useLoaderData();
  const product = data?.data || data;

  if (!product || !product._id) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Product Not Found</h1>
        <Link to="/portal" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/portal" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6 inline-block">
        ← Back to Products
      </Link>

      <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl overflow-hidden">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <ImageCarousel images={product.imageIds} alt={product.name} height="h-64 sm:h-80" />
        </div>

        <div className="p-5 sm:p-6 space-y-3">
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">{product.name}</h1>
          <p className="text-sm text-neutral-600 leading-relaxed">{product.description}</p>
          <p className="text-2xl font-semibold text-neutral-900">
            ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PortalProductDetailPage;

export async function loader({ params }) {
  const { productId } = params;
  const response = await fetch(
    `${API_BASE}/client/products/${productId}`,
    { credentials: "include" }
  );

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ message: "Could not fetch product details." }),
      { status: 500 }
    );
  }

  return response.json();
}
