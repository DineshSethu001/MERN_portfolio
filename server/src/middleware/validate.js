import { ZodError } from 'zod';
import { HttpError } from '../utils/http.js';

// Turns Zod issues into { field: "first message" } for the client to show under inputs.
export function zodToFields(error) {
  const fields = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

// validate(schema)            -> validates req.body
// validate(schema, 'query')   -> validates req.query
export const validate = (schema, source = 'body') => (req, _res, next) => {
  try {
    const parsed = schema.parse(req[source] ?? {});
    if (source === 'query') req.validQuery = parsed;
    else req[source] = parsed;
    next();
  } catch (err) {
    if (err instanceof ZodError) return next(new HttpError(400, 'Please fix the highlighted fields', zodToFields(err)));
    next(err);
  }
};
