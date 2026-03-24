import { Link, useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

function PortalProductsPage() {
  const data = useLoaderData();
  const products = data?.data || data || [];

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Our Products</h1>
        <div className="text-center text-gray-600 py-12">
          <p className="text-xl">No products available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/portal/products/${product._id}`}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {product.imageIds && product.imageIds.length > 0 && (
              <img
                src={`${API_BASE}/images/${product.imageIds[0]._id || product.imageIds[0]}`}
                alt={product.name}
                className="w-full h-48 object-contain rounded mb-4"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <p className="text-lg font-bold text-brand-600">
              ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PortalProductsPage;

export async function loader() {
  const response = await fetch(`${API_BASE}/client/products`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ message: "Could not fetch products." }),
      { status: 500 }
    );
  }

  return response.json();
}
