'use client';

import { useState, useCallback, useEffect, useRef } from "react";
import { getApiFriends } from "@/client";
import "@/lib/api-client";
import type { Friend } from "@/lib/types/friend";
import { isAuthenticated } from "@/lib/utils/auth-storage";

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialMountRef = useRef(true);
  const lastRefetchRef = useRef<number>(0);
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFriends = useCallback(async (showLoading = true) => {
    if (!isAuthenticated()) {
      setFriends([]);
      setIsLoading(false);
      return;
    }

    // Only show loading on initial mount or when explicitly requested
    if (showLoading || isInitialMountRef.current) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await getApiFriends({});

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri nalaganju prijateljev.");
        setIsLoading(false);
        isInitialMountRef.current = false;
        return;
      }

      const data = (response.data as Friend[]) ?? [];
      setFriends(data);
      setIsLoading(false);
      isInitialMountRef.current = false;
      lastRefetchRef.current = Date.now();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(message);
      setIsLoading(false);
      isInitialMountRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchFriends();

    // Listen for authentication state changes (login/logout) - show loading
    const handleAuthStateChange = () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
      fetchFriends(true); // Show loading on auth change
    };

    // Listen for friend removal events to refetch friends list - don't show loading
    const handleFriendRemoved = () => {
      const now = Date.now();
      const timeSinceLastRefetch = now - lastRefetchRef.current;
      
      // Throttle: only refetch if last refetch was more than 500ms ago
      if (timeSinceLastRefetch < 500) {
        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current);
        }
        refetchTimeoutRef.current = setTimeout(() => {
          fetchFriends(false); // Don't show loading
          refetchTimeoutRef.current = null;
        }, 500 - timeSinceLastRefetch);
        return;
      }

      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
      fetchFriends(false); // Don't show loading
    };

    if (typeof window !== "undefined") {
      window.addEventListener("authStateChanged", handleAuthStateChange);
      window.addEventListener("friendRemoved", handleFriendRemoved);

      return () => {
        window.removeEventListener("authStateChanged", handleAuthStateChange);
        window.removeEventListener("friendRemoved", handleFriendRemoved);
        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current);
        }
      };
    }
  }, [fetchFriends]);

  const refetch = useCallback(() => {
    fetchFriends(false); // Don't show loading on manual refetch
  }, [fetchFriends]);

  return {
    friends,
    isLoading,
    error,
    refetch,
    setError,
  };
}

