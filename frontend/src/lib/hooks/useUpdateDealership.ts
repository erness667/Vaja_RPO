'use client';

import { useState, useCallback } from "react";
import { putApiDealershipsById } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import type { UpdateDealershipRequest } from "@/client/types.gen";
import "@/lib/api-client";

export function useUpdateDealership() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDealership = useCallback(async (dealershipId: number, data: UpdateDealershipRequest) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await putApiDealershipsById({
        path: { id: dealershipId },
        body: data,
      });

      if (response.error || (response.response && !response.response.ok)) {
        // Check for 403 Forbidden first
        if (response.response?.status === 403) {
          const errorMessage = "You don't have permission to perform this action.";
          setError(errorMessage);
          setIsLoading(false);
          return { success: false, error: errorMessage };
        }

        let errorData: unknown = response.error;
        
        if (!errorData && response.data && typeof response.data === 'object') {
          errorData = response.data;
        } else if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            if (text) {
              try {
                errorData = JSON.parse(text);
              } catch {
                errorData = { message: text || "Request failed" };
              }
            } else {
              errorData = { message: `Request failed with status ${response.response.status}` };
            }
          } catch {
            errorData = { message: `Request failed with status ${response.response.status}` };
          }
        }
        
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }

      if (response.data) {
        setIsLoading(false);
        return { success: true, data: response.data };
      }

      const errorMessage = "Update failed. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    updateDealership,
    isLoading,
    error,
    setError,
  };
}
