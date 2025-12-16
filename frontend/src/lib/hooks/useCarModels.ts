import { useState, useCallback, useEffect } from "react";
import { getApiCarCatalogMakesByMakeIdModels } from "@/client";
import type { Model } from "@/lib/types/car-api";
import "@/lib/api-client";

export function useCarModels(makeId: string | null | undefined) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    if (!makeId) {
      setModels([]);
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiCarCatalogMakesByMakeIdModels({
        path: { makeId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        const errorMessage = "Failed to fetch car models";
        setError(errorMessage);
        setIsLoading(false);
        return [];
      }

      if (response.data) {
        const modelsData = response.data as Model[];
        setModels(modelsData);
        setIsLoading(false);
        return modelsData;
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
  }, [makeId]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    isLoading,
    error,
    refetch: fetchModels,
  };
}

