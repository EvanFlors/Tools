import { useState, useEffect, useCallback } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import { API_BASE } from "../../config/api";
import { fetchWithAuth } from "../../utils/auth";

import ProductsGrid from "../../components/ProductsGrid";
import SearchBar from "../../components/SearchBar";
import ProductFilters from "../../components/ProductFilters";

function ProductsPage() {
    const initialData = useLoaderData();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState(initialData?.data || []);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [filters, setFilters] = useState({
        category: searchParams.get("category") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        inStock: searchParams.get("inStock") || "",
    });

    // Load categories on mount
    useEffect(() => {
        fetchWithAuth(`${API_BASE}/admin/products/categories`)
            .then((r) => r.json())
            .then((d) => setCategories(d.data || []))
            .catch(() => {});
    }, []);

    // Fetch products whenever search/filters change
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (filters.category) params.set("category", filters.category);
        if (filters.minPrice) params.set("minPrice", filters.minPrice);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
        if (filters.inStock) params.set("inStock", filters.inStock);

        setSearchParams(params, { replace: true });

        try {
            const res = await fetchWithAuth(`${API_BASE}/admin/products?${params.toString()}`);
            const data = await res.json();
            setProducts(data.data || []);
        } catch {
            // handled by fetchWithAuth
        } finally {
            setLoading(false);
        }
    }, [search, filters, setSearchParams]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
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

            {/* Search & Filters */}
            <div className="space-y-3 mb-8">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search products..."
                />
                <ProductFilters
                    categories={categories}
                    filters={filters}
                    onChange={setFilters}
                />
            </div>

            {loading ? (
                <div className="text-center text-neutral-400 py-20">
                    <p>Loading...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center text-neutral-400 py-20">
                    <p>No products found.</p>
                </div>
            ) : (
                <ProductsGrid products={products} linkPrefix="/products" />
            )}
        </div>
    );
}

export default ProductsPage;

export async function loader() {
    const response = await fetchWithAuth(`${API_BASE}/admin/products`);

    if (!response.ok) {
        throw new Response(
            JSON.stringify({ message: "Could not fetch products." }),
            { status: 500 }
        );
    }

    return response.json();
}
