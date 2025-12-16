
import { useState, useCallback, useEffect } from "react";
import { getApiCarCatalogMakes } from "@/client";
import type { Make } from "@/lib/types/car-api";
import "@/lib/api-client";

export function useCarMakes() {
  const [makes, setMakes] = useState<Make[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMakes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiCarCatalogMakes({});

      if (response.error || (response.response && !response.response.ok)) {
        const errorMessage = "Failed to fetch car makes";
        setError(errorMessage);
        setIsLoading(false);
        return [];
      }

      if (response.data) {
        const makesData = response.data as Make[];
        setMakes(makesData);
        setIsLoading(false);
        return makesData;
      }

      setIsLoading(false);
      return [];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchMakes();
  }, [fetchMakes]);

  return {
    makes,
    isLoading,
    error,
    refetch: fetchMakes,
  };
}

