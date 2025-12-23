'use client';

import { useState, useCallback, useEffect } from "react";
import { getApiFriendsRequestsPending } from "@/client";
import "@/lib/api-client";
import type { FriendRequest } from "@/lib/types/friend";
import { isAuthenticated } from "@/lib/utils/auth-storage";

export function useFriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!isAuthenticated()) {
      setRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiFriendsRequestsPending({});

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri nalaganju zahtev.");
        setIsLoading(false);
        return;
      }

      const data = (response.data as FriendRequest[]) ?? [];
      setRequests(data);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  return {
    requests,
    isLoading,
    error,
    refetch: fetchRequests,
    setError,
  };
}

