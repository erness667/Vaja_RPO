'use client';

import { useState, useCallback } from "react";
import { deleteApiDealershipsById } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import "@/lib/api-client";

export function useDeleteDealership() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDealership = useCallback(async (dealershipId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deleteApiDealershipsById({
        path: { id: dealershipId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            if (text) {
              try {
                errorData = JSON.parse(text);
              } catch {
                errorData = { message: text || "Failed to delete dealership" };
              }
            } else {
              errorData = { message: `Request failed with status ${response.response.status}` };
            }
          } catch {
            errorData = { message: "Failed to delete dealership" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  return {
    deleteDealership,
    isLoading,
    error,
    setError,
  };
}
