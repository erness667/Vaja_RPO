'use client';

import { useState, useCallback, useEffect } from "react";
import { getApiFavourites } from "@/client";
import "@/lib/api-client";
import type { FavouriteItem } from "@/lib/types/car";
import { isAuthenticated } from "@/lib/utils/auth-storage";

export function useFavourites() {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavourites = useCallback(async () => {
    if (!isAuthenticated()) {
      setFavourites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiFavourites({});

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri nalaganju priljubljenih.");
        setIsLoading(false);
        return;
      }

      const data = (response.data as FavouriteItem[]) ?? [];
      setFavourites(data);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Run after mount to avoid setState warnings in render
    const timer = setTimeout(() => {
      fetchFavourites();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchFavourites]);

  return {
    favourites,
    isLoading,
    error,
    refetch: fetchFavourites,
    setError,
  };
}

