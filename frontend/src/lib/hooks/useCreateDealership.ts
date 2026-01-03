'use client';

import { useState, useCallback } from "react";
import { postApiDealerships } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import "@/lib/api-client";
import type { CreateDealershipRequest } from "@/client/types.gen";

export function useCreateDealership() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDealership = useCallback(async (formData: CreateDealershipRequest) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await postApiDealerships({
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
    createDealership,
    isLoading,
    error,
    setError,
  };
}

