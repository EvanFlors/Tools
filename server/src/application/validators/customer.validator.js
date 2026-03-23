import { z } from "zod";

// Schema for creating a customer
export const createCustomerSchema = z.object({
  name: z
    .string({
      required_error: "Customer name is required",
      invalid_type_error: "Customer name must be a string",
    })
    .min(1, "Customer name cannot be empty")
    .max(100, "Customer name must be less than 100 characters")
    .trim(),

  phone: z
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number must be a string",
    })
    .trim()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must be less than 20 characters")
    .regex(
      /^[\d\s\-\+\(\)]+$/,
      "Phone number can only contain digits, spaces, and common phone characters (+, -, (, ))"
    ),

  address: z
    .string({
      required_error: "Address is required",
      invalid_type_error: "Address must be a string",
    })
    .min(1, "Address cannot be empty")
    .max(200, "Address must be less than 200 characters")
    .trim(),
});

// Schema for updating a customer (all fields optional)
export const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name cannot be empty")
    .max(100, "Customer name must be less than 100 characters")
    .trim()
    .optional(),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must be less than 20 characters")
    .regex(
      /^[\d\s\-\+\(\)]+$/,
      "Phone number can only contain digits, spaces, and common phone characters (+, -, (, ))"
    )
    .optional(),

  address: z
    .string()
    .min(1, "Address cannot be empty")
    .max(200, "Address must be less than 200 characters")
    .trim()
    .optional(),
});
