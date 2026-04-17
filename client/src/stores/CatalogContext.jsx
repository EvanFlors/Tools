import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { API_BASE } from "../config/api";

const CatalogContext = createContext(null);

const INITIAL_FILTERS = {
  category: "",
  minPrice: "",
  maxPrice: "",
  inStock: "",
  username: "",
};

export function CatalogProvider({ initialData = {}, children }) {
  const [products, setProducts] = useState(initialData.products || []);
  const [categories, setCategories] = useState(initialData.categories || []);
  const [sellers, setSellers] = useState(initialData.sellers || []);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(false);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchCatalog = useCallback(async (signal) => {
    setLoading(true);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.inStock) params.set("inStock", filters.inStock);
    if (filters.username) params.set("username", filters.username);

    try {
      const res = await fetch(`${API_BASE}/catalog/products?${params.toString()}`, { signal });
      if (!res.ok) return;
      const json = await res.json();
      setProducts(json.data || []);
      if (json.categories) setCategories(json.categories);
      if (json.sellers) setSellers(json.sellers);
    } catch (err) {
      if (err.name !== "AbortError") console.error("Catalog fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  // Debounce + abort on search/filter change
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchCatalog(controller.signal);
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(debounceRef.current);
    };
  }, [fetchCatalog]);

  return (
    <CatalogContext.Provider
      value={{ products, categories, sellers, search, setSearch, filters, setFilters, loading }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within <CatalogProvider>");
  return ctx;
}
