import { z } from "zod";

export const createSaleSchema = z.object({
  customerId: z
    .string({ required_error: "Customer ID is required" })
    .min(1, "Customer ID cannot be empty")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid customer ID format"),

  productId: z
    .string({ required_error: "Product ID is required" })
    .min(1, "Product ID cannot be empty")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),

  totalAmount: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        if (isNaN(parsed)) return val;
        return parsed;
      }
      return val;
    })
    .pipe(
      z.number({ invalid_type_error: "Invalid total amount format" })
        .positive("Total amount must be greater than 0")
        .max(1000000, "Total amount must be less than 1,000,000")
    )
    .optional(),
});

export const updateSaleSchema = z.object({
  customerId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid customer ID format")
    .optional(),

  productId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format")
    .optional(),

  totalAmount: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        if (isNaN(parsed)) return val;
        return parsed;
      }
      return val;
    })
    .pipe(
      z.number({ invalid_type_error: "Invalid total amount format" })
        .positive("Total amount must be greater than 0")
        .max(1000000, "Total amount must be less than 1,000,000")
    )
    .optional(),

  status: z
    .enum(["active", "completed", "cancelled"], {
      invalid_type_error: "Status must be 'active', 'completed', or 'cancelled'",
    })
    .optional(),
});
