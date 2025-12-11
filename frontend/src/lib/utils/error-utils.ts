/**
 * Utility functions for extracting and formatting error messages
 * from API responses, particularly ASP.NET Core ProblemDetails format
 */

export function extractValidationErrors(errorData: unknown): string {
  if (typeof errorData === 'string') {
    return errorData;
  }
  
  if (!errorData || typeof errorData !== 'object') {
    return "An error occurred. Please try again.";
  }
  
  const errorObj = errorData as Record<string, unknown>;
  const validationErrors: string[] = [];
  
  // Check for ASP.NET Core ProblemDetails format (errors property)
  if (errorObj.errors && typeof errorObj.errors === 'object') {
    const errorsObj = errorObj.errors as Record<string, unknown>;
    for (const key in errorsObj) {
      if (Array.isArray(errorsObj[key])) {
        validationErrors.push(...(errorsObj[key] as unknown[]).map(e => String(e)));
      } else if (typeof errorsObj[key] === 'string') {
        validationErrors.push(errorsObj[key] as string);
      }
    }
  }
  
  // Check for direct ModelState format (field names as keys)
  if (validationErrors.length === 0) {
    const skipKeys = ['type', 'title', 'status', 'traceId', 'errors'];
    for (const key in errorObj) {
      if (skipKeys.includes(key)) continue;
      
      if (Array.isArray(errorObj[key])) {
        validationErrors.push(...(errorObj[key] as unknown[]).map(e => String(e)));
      } else if (typeof errorObj[key] === 'string') {
        validationErrors.push(errorObj[key] as string);
      }
    }
  }
  
  if (validationErrors.length > 0) {
    return validationErrors.join('. ');
  }
  
  // Fallback to other error message formats
  return (
    (errorObj.title as string) ||
    (errorObj.message as string) ||
    ((errorObj.data as Record<string, unknown>)?.message as string) ||
    ((errorObj.error as Record<string, unknown>)?.message as string) ||
    "An error occurred. Please try again."
  );
}

