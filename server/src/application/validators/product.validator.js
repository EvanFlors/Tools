import { z } from "zod";

// ======================================================
// Reusable Price Schema (clean + robust)
// ======================================================
const priceSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      const parsed = Number(val);
      return Number.isNaN(parsed) ? val : parsed;
    }
    return val;
  },
  z
    .number({
      invalid_type_error: "Invalid price format",
    })
    .positive("Price must be greater than 0")
    .max(1_000_000, "Price must be less than 1,000,000")
);

// ======================================================
// Create Product Schema
// ======================================================
export const createProductSchema = z.object({
  name: z
    .string({
      required_error: "Product name is required",
      invalid_type_error: "Product name must be a string",
    })
    .min(1, "Product name cannot be empty")
    .max(100, "Product name must be less than 100 characters")
    .trim(),

  description: z
    .string({
      required_error: "Product description is required",
      invalid_type_error: "Product description must be a string",
    })
    .min(1, "Product description cannot be empty")
    .max(1000, "Product description must be less than 1000 characters")
    .trim(),

  price: priceSchema,

  category: z
    .string()
    .max(50, "Category must be less than 50 characters")
    .trim()
    .optional()
    .default("General"),

  stock: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z
      .number({ invalid_type_error: "Stock must be a number" })
      .int()
      .min(0)
      .optional()
      .default(0)
  ),
});

// ======================================================
// Update Product Schema
// ======================================================
export const updateProductSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Product name must be a string",
    })
    .min(1, "Product name cannot be empty")
    .max(100, "Product name must be less than 100 characters")
    .trim()
    .optional(),

  description: z
    .string({
      invalid_type_error: "Product description must be a string",
    })
    .min(1, "Product description cannot be empty")
    .max(1000, "Product description must be less than 1000 characters")
    .trim()
    .optional(),

  price: priceSchema.optional(),

  category: z
    .string()
    .max(50, "Category must be less than 50 characters")
    .trim()
    .optional(),

  stock: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z
      .number({ invalid_type_error: "Stock must be a number" })
      .int()
      .min(0)
      .optional()
  ),
});

// ======================================================
// Image Validation
// ======================================================
export const validateImageFiles = (files, required = true) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  const maxSize = 5 * 1024 * 1024; // 5MB

  if (required && (!files || files.length === 0)) {
    return { images: "At least one product image is required" };
  }

  if (!files || files.length === 0) {
    return {};
  }

  if (files.length > 10) {
    return { images: "Maximum 10 images allowed per product" };
  }

  for (const file of files) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        images:
          "Invalid image format. Only JPEG, PNG, JPG, and WEBP are allowed.",
      };
    }

    if (file.size > maxSize) {
      return {
        images: `File "${file.originalname}" exceeds 5MB limit.`,
      };
    }
  }

  return {};
};
