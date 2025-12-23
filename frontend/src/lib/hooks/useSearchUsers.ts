'use client';

import { useState, useCallback } from "react";
import { getApiUserSearch } from "@/client";
import "@/lib/api-client";
import type { UserInfo } from "@/lib/types/friend";

export function useSearchUsers() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (username: string, limit: number = 10) => {
    if (!username || username.trim().length < 2) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiUserSearch({
        query: {
          username: username.trim(),
          limit,
        },
      });

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri iskanju uporabnikov.");
        setUsers([]);
        setIsLoading(false);
        return;
      }

      const data = (response.data as UserInfo[]) ?? [];
      setUsers(data);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(message);
      setUsers([]);
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setUsers([]);
    setError(null);
  }, []);

  return {
    users,
    isLoading,
    error,
    searchUsers,
    clearResults,
  };
}

