'use client';

import { useCallback, useEffect, useState } from "react";
import { getApiViewHistory } from "@/client";
import "@/lib/api-client";
import type { ViewHistoryItem } from "@/lib/types/car";
import { isAuthenticated } from "@/lib/utils/auth-storage";

export function useViewHistory() {
  const [history, setHistory] = useState<ViewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated()) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiViewHistory({});

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri nalaganju zgodovine ogledov.");
        setIsLoading(false);
        return;
      }

      const data = (response.data as ViewHistoryItem[]) ?? [];
      setHistory(data);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory,
    setError,
  };
}

