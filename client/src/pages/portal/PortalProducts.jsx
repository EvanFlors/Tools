import { useLoaderData } from "react-router-dom";
import { API_BASE } from "../../config/api";

import ProductsGrid from "../../components/ProductsGrid";

function PortalProductsPage() {
  const data = useLoaderData();
  const products = data?.data || data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Our Products</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {products.length > 0 ? `${products.length} item${products.length !== 1 ? "s" : ""} available` : "No products yet"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-neutral-400 py-20">
          <p>No products available at the moment.</p>
        </div>
      ) : (
        <ProductsGrid products={products} linkPrefix="/portal/products" />
      )}
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
