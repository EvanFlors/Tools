import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function PortalProductDetailPage() {
  const data = useLoaderData();
  const product = data?.data || data;

  if (!product || !product._id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Product Not Found</h1>
        <Link to="/portal" className="text-brand-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/portal"
        className="text-brand-600 hover:underline mb-4 inline-block"
      >
        ← Back to Products
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
        {/* Images */}
        {product.imageIds && product.imageIds.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 gap-4">
              {product.imageIds.map((image, index) => (
                <img
                  key={index}
                  src={`${API_BASE}/images/${image._id || image}`}
                  alt={product.name}
                  className="w-full h-64 object-contain rounded-lg"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          {product.name}
        </h1>

        <p className="text-gray-600 text-lg mb-6">{product.description}</p>

        <p className="text-3xl font-bold text-brand-600 mb-6">
          $
          {typeof product.price === "number"
            ? product.price.toFixed(2)
            : product.price}
        </p>
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
