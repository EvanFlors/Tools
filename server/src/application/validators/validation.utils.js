/**
 * Transforms Zod error issues into a frontend-friendly structure.
 * @param {import("zod").ZodError} zodError
 * @returns {Record<string, string>} e.g. { "amount": "Amount must be greater than 0" }
 */
export function formatZodErrors(zodError) {
  const errors = {};

  for (const issue of zodError.issues) {
    const field = issue.path.join(".");
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

/**
 * Generic validation helper.
 * Receives a Zod schema and data, returns { success, data, errors }.
 * @param {import("zod").ZodSchema} schema
 * @param {unknown} data
 */
export function validateRequest(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: formatZodErrors(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
