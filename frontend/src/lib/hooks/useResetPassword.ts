import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { postApiAuthResetPassword } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";

export interface ResetPasswordFormData {
  token: string;
  newPassword: string;
}

export function useResetPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = useCallback(async (formData: ResetPasswordFormData) => {
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await postApiAuthResetPassword({
        body: {
          token: formData.token,
          newPassword: formData.newPassword,
        },
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

      // Success - redirect to login after a short delay
      setSuccess(true);
      setIsLoading(false);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [router]);

  return {
    resetPassword,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
  };
}

