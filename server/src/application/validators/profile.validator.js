import { z } from "zod";

export const createProfileSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
      invalid_type_error: "Username must be a string",
    })
    .min(2, "Username must be at least 2 characters long")
    .max(100, "Username must be at most 100 characters long")
    .trim(),
  phone: z
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number must be a string",
    })
    .length(10, "Phone number must be exactly 10 characters long")
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .trim(),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be at most 100 characters long")
    .trim(),
});

export const updateProfileSchema = z.object({
  username: z
    .string({
      invalid_type_error: "Username must be a string",
    })
    .min(2, "Username must be at least 2 characters long")
    .max(100, "Username must be at most 100 characters long")
    .trim()
    .optional(),
  phone: z
    .string({
      invalid_type_error: "Phone number must be a string",
    })
    .length(10, "Phone number must be exactly 10 characters long")
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .trim()
    .optional(),
  currentPassword: z
    .string({
      invalid_type_error: "Current password must be a string",
    })
    .min(1, "Current password cannot be empty")
    .trim()
    .optional(),
  newPassword: z
    .string({
      invalid_type_error: "New password must be a string",
    })
    .min(6, "New password must be at least 6 characters long")
    .max(100, "New password must be at most 100 characters long")
    .trim()
    .optional(),
});
