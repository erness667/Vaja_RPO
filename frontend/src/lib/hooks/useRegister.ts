import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { postApiAuthRegister } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import type { RegisterFormData } from "@/lib/types/auth";

export function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (formData: RegisterFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await postApiAuthRegister({
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

      if (response.data) {
        setIsLoading(false);
        router.push("/login");
        return { success: true };
      } else {
        const errorMessage = "Registration failed. Please try again.";
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [router]);

  return {
    register,
    isLoading,
    error,
    setError,
  };
}

