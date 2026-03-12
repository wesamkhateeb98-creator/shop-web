/**
 * Maps to .NET ServiceProblemDetails:
 * { title, detail, type, instance, extensions }
 */
export interface ApiError {
  title: string;
  detail?: string;
  type: string;
  instance?: string;
  extensions: Record<string, unknown>;
}

export interface ValidationErrors {
  [field: string]: string[];
}

export function extractValidationErrors(
  error: ApiError
): ValidationErrors | null {
  const errors = error.extensions?.['errors'];
  if (errors && typeof errors === 'object') {
    return errors as ValidationErrors;
  }
  return null;
}
