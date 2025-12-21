import { useState, useCallback } from "react";
import { postApiAuthForgotPassword } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";

export interface ForgotPasswordFormData {
  email: string;
}

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const forgotPassword = useCallback(async (formData: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await postApiAuthForgotPassword({
        body: formData,
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        
        if (!errorData && response.data && typeof response.data === 'object') {
          errorData = response.data;
        } else if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Request failed" };
          }
        }
        
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }

      // Success - show success message
      setSuccess(true);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    forgotPassword,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
  };
}

