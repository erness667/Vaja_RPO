'use client';

import { useState, useCallback } from "react";
import { deleteApiCarsById } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import "@/lib/api-client";

export function useDeleteCar() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCar = useCallback(async (carId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deleteApiCarsById({
        path: { id: carId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to delete car" };
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
    deleteCar,
    isLoading,
    error,
    setError,
  };
}

