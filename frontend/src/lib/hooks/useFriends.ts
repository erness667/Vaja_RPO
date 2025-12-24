'use client';

import { useState, useCallback, useEffect } from "react";
import { getApiFriends } from "@/client";
import "@/lib/api-client";
import type { Friend } from "@/lib/types/friend";
import { isAuthenticated } from "@/lib/utils/auth-storage";

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    if (!isAuthenticated()) {
      setFriends([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiFriends({});

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri nalaganju prijateljev.");
        setIsLoading(false);
        return;
      }

      const data = (response.data as Friend[]) ?? [];
      setFriends(data);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();

    // Listen for authentication state changes (login/logout)
    const handleAuthStateChange = () => {
      fetchFriends();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("authStateChanged", handleAuthStateChange);

      return () => {
        window.removeEventListener("authStateChanged", handleAuthStateChange);
      };
    }
  }, [fetchFriends]);

  return {
    friends,
    isLoading,
    error,
    refetch: fetchFriends,
    setError,
  };
}

