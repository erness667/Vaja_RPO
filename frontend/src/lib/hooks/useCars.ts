'use client';

import { useCallback, useEffect, useState } from "react";
import { getApiCars } from "@/client";
import "@/lib/api-client";
import type { Car } from "@/lib/types/car";

export function useCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiCars({
        query: {
          page: 1,
          pageSize: 12,
        },
      });

      if (response.error || (response.response && !response.response.ok)) {
        setError("Napaka pri nalaganju vozil.");
        setIsLoading(false);
        return [];
      }

      if (response.data) {
        // API wraps cars in an object: { cars, totalCount, ... }
        const raw = response.data as any;
        const data = (raw.cars ?? []) as Car[];
        setCars(data);
        setIsLoading(false);
        return data;
      }

      setCars([]);
      setIsLoading(false);
      return [];
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Prišlo je do nepričakovane napake.";
      setError(message);
      setIsLoading(false);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  return {
    cars,
    isLoading,
    error,
    refetch: fetchCars,
  };
}


