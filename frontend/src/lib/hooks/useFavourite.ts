'use client';

import { useState, useCallback, useEffect } from "react";
import {
  getApiFavouritesByCarIdCheck,
  postApiFavouritesByCarIdToggle,
} from "@/client";
import "@/lib/api-client";
import { isAuthenticated } from "@/lib/utils/auth-storage";

export function useFavourite(carId: number | null) {
  const [isFavourite, setIsFavourite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkFavourite = useCallback(async () => {
    if (!carId || !isAuthenticated()) {
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await getApiFavouritesByCarIdCheck({
        path: { carId },
      });

      if (response.response?.ok && response.data) {
        setIsFavourite((response.data as { isFavourite: boolean }).isFavourite);
      }
      setIsChecking(false);
    } catch {
      setIsChecking(false);
    }
  }, [carId]);

  const toggleFavourite = useCallback(async (): Promise<boolean | null> => {
    if (!carId || !isAuthenticated()) {
      setError("Morate biti prijavljeni za dodajanje med priljubljene.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await postApiFavouritesByCarIdToggle({
        path: { carId },
      });

      if (!response.response?.ok) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri spreminjanju priljubljenih.");
        setIsLoading(false);
        return null;
      }

      const data = response.data as { isFavourite: boolean };
      setIsFavourite(data.isFavourite);
      setIsLoading(false);
      return data.isFavourite;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [carId]);

  useEffect(() => {
    checkFavourite();
  }, [checkFavourite]);

  return {
    isFavourite,
    isLoading,
    isChecking,
    error,
    toggleFavourite,
    refetch: checkFavourite,
    setError,
  };
}
