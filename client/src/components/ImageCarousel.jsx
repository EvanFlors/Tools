import { useState } from "react";
import { API_BASE } from "../config/api";

/**
 * Clean, minimal image viewer with subtle navigation.
 *
 * Props:
 *  - images     : array of image objects ({ _id }) or strings (ids)
 *  - alt        : alt text for images
 *  - className  : optional wrapper class
 *  - height     : Tailwind height class for main image (default "h-72")
 */
export default function ImageCarousel({
  images = [],
  alt = "Product",
  className = "",
  height = "h-72",
  showThumbnails = false
}) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        className={`${height} bg-neutral-150 flex items-center justify-center ${className}`}
      >
        <svg
          className="w-12 h-12 text-neutral-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  const ids = images.map((img) => img._id || img);

  function prev(e) {
    e.stopPropagation();
    setCurrent((c) => (c === 0 ? ids.length - 1 : c - 1));
  }
  function next(e) {
    e.stopPropagation();
    setCurrent((c) => (c === ids.length - 1 ? 0 : c + 1));
  }

  return (
    <div className={className}>
      {/* Main image */}
      <div className={`relative ${height} bg-neutral-150 overflow-hidden group`}>
        <img
          src={`${API_BASE}/images/${ids[current]}`}
          alt={`${alt} ${current + 1}`}
          className="w-full h-full object-contain transition-opacity duration-300 bg-white "
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />

        {ids.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-neutral-50/90 text-neutral-700 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-neutral-50 shadow-sm text-sm"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-neutral-50/90 text-neutral-700 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-neutral-50 shadow-sm text-sm"
              aria-label="Next image"
            >
              ›
            </button>

            {/* Indicator pills */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
              {ids.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  className={`h-1 rounded-full transition-all ${
                    i === current
                      ? "w-4 bg-neutral-800"
                      : "w-1.5 bg-neutral-400/60 hover:bg-neutral-400"
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails — show when more than 1 image */}
      {(ids.length > 1 && showThumbnails) && (
        <div className="flex gap-1.5 mt-2.5 overflow-x-auto">
          {ids.map((id, i) => (
            <button
              key={id}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded overflow-hidden transition-all ${
                i === current
                  ? "ring-2 ring-neutral-800 ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={`${API_BASE}/images/${id}`}
                alt={`${alt} thumb ${i + 1}`}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
