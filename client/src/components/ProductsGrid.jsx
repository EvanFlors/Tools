import { useState } from "react";
import { Link } from "react-router-dom";
import ImageCarousel from "./ImageCarousel";

function ProductsGrid({ products, linkPrefix }) {
    const [selectedProduct, setSelectedProduct] = useState(null);

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200/80 hover:border-neutral-300 transition-all group"
            >
              {/* Clickable image area */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProduct(product)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedProduct(product); }}
                className="w-full cursor-pointer"
                aria-label={`View images for ${product.name}`}
              >
                <ImageCarousel
                  images={product.imageIds}
                  alt={product.name}
                  height="h-56"
                />
              </div>

              <div className="px-4 pt-3.5 pb-4">
                <h2 className="text-base font-semibold text-neutral-900 leading-snug">
                  {product.name}
                </h2>
                <p className="text-sm text-neutral-500 line-clamp-2 mt-1 leading-relaxed">{product.description}</p>
                <div className="flex items-center justify-between mt-3.5">
                  <span className="text-lg font-semibold text-neutral-900">
                    ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                  </span>
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
            </div>
          ))}
        </div>

        {/* Lightbox modal */}
        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="bg-neutral-50 rounded-xl overflow-hidden w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <div className="flex justify-end p-3 pb-0">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition text-sm"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Full carousel with thumbnails */}
              <div className="px-5 pb-2">
                <ImageCarousel
                  images={selectedProduct.imageIds}
                  alt={selectedProduct.name}
                  height="h-64 sm:h-80"
                />
              </div>

              {/* Product details */}
              <div className="px-5 pt-3 pb-5 space-y-2">
                <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
                  {selectedProduct.name}
                </h2>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {selectedProduct.description}
                </p>
                <p className="text-xl font-semibold text-neutral-900">
                  ${typeof selectedProduct.price === "number" ? selectedProduct.price.toFixed(2) : selectedProduct.price}
                </p>

                {linkPrefix && (
                  <Link
                    to={`${linkPrefix}/${selectedProduct._id}`}
                    className="inline-block mt-3 px-4 py-2 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition text-sm font-medium"
                  >
                    View details →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    )
}

export default ProductsGrid;