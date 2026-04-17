function ProductFilters({ categories = [], sellers = [], filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const activeCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    filters.username,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category */}
      <select
        value={filters.category || ""}
        onChange={(e) => handleChange("category", e.target.value)}
        className="border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Price Range */}
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          placeholder="Min $"
          value={filters.minPrice || ""}
          onChange={(e) => handleChange("minPrice", e.target.value)}
          className="w-20 border border-neutral-200 rounded-lg px-2.5 py-2 text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
        <span className="text-neutral-400 text-xs">–</span>
        <input
          type="number"
          placeholder="Max $"
          value={filters.maxPrice || ""}
          onChange={(e) => handleChange("maxPrice", e.target.value)}
          className="w-20 border border-neutral-200 rounded-lg px-2.5 py-2 text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>

      {/* In Stock */}
      <label className="flex items-center gap-1.5 text-sm text-neutral-600 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.inStock === "true"}
          onChange={(e) => handleChange("inStock", e.target.checked ? "true" : "")}
          className="rounded border-neutral-300"
        />
        In stock
      </label>

      {/* Username (seller) */}
      <select
        value={filters.username || ""}
        onChange={(e) => handleChange("username", e.target.value)}
        className="w-36 border border-neutral-200 rounded-lg px-2.5 py-2 text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
      >
        <option value="">All sellers</option>
        {
            sellers.map((seller) => (
              <option key={seller.username} value={seller.username}>
                {seller.username}
              </option>
            ))
        }
      </select>

      {/* Clear */}
      {activeCount > 0 && (
        <button
          onClick={() => onChange({ category: "", minPrice: "", maxPrice: "", inStock: "", ...(filters.username !== undefined && { username: "" }) })}
          className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          Clear filters ({activeCount})
        </button>
      )}
    </div>
  );
}

export default ProductFilters;
