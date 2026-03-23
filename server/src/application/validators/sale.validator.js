import { z } from "zod";

// Schema for creating a sale
export const createSaleSchema = z.object({
  customerId: z
    .string({
      required_error: "Customer ID is required",
      invalid_type_error: "Customer ID must be a string",
    })
    .min(1, "Customer ID cannot be empty")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid customer ID format"),

  productId: z
    .string({
      required_error: "Product ID is required",
      invalid_type_error: "Product ID must be a string",
    })
    .min(1, "Product ID cannot be empty")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),

  totalAmount: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        if (isNaN(parsed)) {
          return val; // Return invalid value to trigger refine error
        }
        return parsed;
      }
      return val;
    })
    .pipe(
      z
        .number({
          invalid_type_error: "Invalid total amount format",
        })
        .positive("Total amount must be greater than 0")
        .max(1000000, "Total amount must be less than 1,000,000")
    )
    .optional(),

  paymentType: z
    .enum(["full", "installments"], {
      required_error: "Payment type is required",
      invalid_type_error:
        "Payment type must be either 'full' or 'installments'",
    })
    .default("full"),
});

// Schema for updating a sale (all fields optional except IDs)
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
        if (isNaN(parsed)) {
          return val;
        }
        return parsed;
      }
      return val;
    })
    .pipe(
      z
        .number({
          invalid_type_error: "Invalid total amount format",
        })
        .positive("Total amount must be greater than 0")
        .max(1000000, "Total amount must be less than 1,000,000")
    )
    .optional(),

  paymentType: z
    .enum(["full", "installments"], {
      invalid_type_error:
        "Payment type must be either 'full' or 'installments'",
    })
    .optional(),

  remainingBalance: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        if (isNaN(parsed)) {
          return val;
        }
        return parsed;
      }
      return val;
    })
    .pipe(
      z
        .number({
          invalid_type_error: "Invalid remaining balance format",
        })
        .min(0, "Remaining balance cannot be negative")
        .max(1000000, "Remaining balance must be less than 1,000,000")
    )
    .optional(),
});
