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
    fetchRequests();

    // Listen for authentication state changes (login/logout)
    const handleAuthStateChange = () => {
      fetchRequests();
    };

    // Listen for friend request events (sent via SignalR through useFriendHub)
    // This is a fallback in case the SignalR events don't trigger refetch
    const handleFriendRequestEvent = () => {
      // Small delay to ensure backend has processed
      setTimeout(() => {
        fetchRequests();
      }, 200);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("authStateChanged", handleAuthStateChange);
      // Listen for custom events that might be dispatched when friend requests are sent/received/rejected
      window.addEventListener("friendRequestSent", handleFriendRequestEvent);
      window.addEventListener("friendRequestReceived", handleFriendRequestEvent);
      window.addEventListener("friendRequestRejected", handleFriendRequestEvent);

      return () => {
        window.removeEventListener("authStateChanged", handleAuthStateChange);
        window.removeEventListener("friendRequestSent", handleFriendRequestEvent);
        window.removeEventListener("friendRequestReceived", handleFriendRequestEvent);
        window.removeEventListener("friendRequestRejected", handleFriendRequestEvent);
      };
    }
  }, [fetchRequests]);

  return {
    requests,
    isLoading,
    error,
    refetch: fetchRequests,
    setError,
  };
}

