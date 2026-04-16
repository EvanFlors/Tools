import { z } from "zod";

// Reusable number transform (string | number → number)
const numericField = (fieldName) =>
  z
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
      z.number({ invalid_type_error: `${fieldName} must be a valid number` })
    );

export const createPaymentSchema = z.object({
  saleId: z
    .string({
      required_error: "Sale ID is required",
      invalid_type_error: "Sale ID must be a string",
    })
    .min(1, "Sale ID cannot be empty")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid sale ID format"),

  amount: numericField("Amount").pipe(
    z
      .number()
      .positive("Amount must be greater than 0")
      .max(1000000, "Amount must be less than 1,000,000")
  ),

  couponId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid coupon ID format")
    .optional()
    .nullable(),
});

export const updatePaymentSchema = z.object({
  amount: numericField("Amount").pipe(
    z
      .number()
      .positive("Amount must be greater than 0")
      .max(1000000, "Amount must be less than 1,000,000")
  ),
});
