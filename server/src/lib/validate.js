import { z } from "zod";

/**
 * Validate body/query/params with zod schemas and replace them with the
 * parsed (trimmed, normalised, defaulted) values.
 */
export function validate(schemas) {
  return function validateRequest(req, res, next) {
    try {
      for (const key of ["body", "query", "params"]) {
        if (schemas[key]) {
          req[key] = schemas[key].parse(req[key] ?? {});
        }
      }
      return next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request",
          details: err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      return next(err);
    }
  };
}
