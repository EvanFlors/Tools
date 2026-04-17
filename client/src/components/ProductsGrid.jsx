import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import ImageCarousel from "./ImageCarousel";

function ProductsGrid({ products = [], linkPrefix }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Memoización para evitar renders innecesarios
  const normalizedProducts = useMemo(() => {
    return products.map((p) => ({
      ...p,
      formattedPrice:
        typeof p.price === "number" ? p.price.toFixed(2) : p.price,
      isInStock: p.stock > 0,
      username: p?.userId?.username || "Unknown",
    }));
  }, [products]);

  const openModal = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  return (
    <>
      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {normalizedProducts.map((product) => (
          <article
            key={product._id}
            className="bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200/80 hover:border-neutral-300 hover:shadow-sm transition-all group"
          >
            {/* IMAGE */}
            <button
              type="button"
              onClick={() => openModal(product)}
              className="w-full text-left focus:outline-none focus:ring-2 focus:ring-neutral-300"
              aria-label={`View images for ${product.name}`}
            >
              <ImageCarousel
                images={product.imageIds}
                alt={product.name}
                height="h-56"
              />
            </button>

            {/* CONTENT */}
            <div className="px-4 pt-3.5 pb-4 space-y-2">
              <header>
                <h2 className="text-base font-semibold text-neutral-900 leading-snug line-clamp-2">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="text-sm text-neutral-500 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                )}
              </header>

              {/* PRICE + META */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-neutral-900">
                      ${product.formattedPrice} MXN
                    </span>

                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        product.isInStock
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {product.isInStock ? "In stock" : "Out of stock"}
                    </span>
                  </div>

                  <span className="text-xs text-neutral-500">
                    by {product.username}
                  </span>
                </div>

                {linkPrefix && (
                  <Link
                    to={`${linkPrefix}/${product._id}`}
                    className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
                  >
                    View →
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-neutral-50 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-end p-3 pb-0">
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* CAROUSEL */}
            <div className="px-5 pb-2">
              <ImageCarousel
                images={selectedProduct.imageIds}
                alt={selectedProduct.name}
                height="h-64 sm:h-80"
              />
            </div>

            {/* DETAILS */}
            <div className="px-5 pt-3 pb-5 space-y-3">
              <h2 className="text-lg font-semibold text-neutral-900">
                {selectedProduct.name}
              </h2>

              {selectedProduct.description && (
                <p className="text-sm text-neutral-500">
                  {selectedProduct.description}
                </p>
              )}

              <p className="text-xl font-semibold text-neutral-900">
                $
                {typeof selectedProduct.price === "number"
                  ? selectedProduct.price.toFixed(2)
                  : selectedProduct.price}{" "}
                MXN
              </p>

              <p className="text-xs text-neutral-500">
                by {selectedProduct?.userId?.username || "Unknown"}
              </p>

              {linkPrefix && (
                <Link
                  to={`${linkPrefix}/${selectedProduct._id}`}
                  className="inline-block mt-2 px-4 py-2 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition text-sm font-medium"
                >
                  View details →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductsGrid;