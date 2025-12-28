'use client';

import { useState, useCallback, useEffect, useRef } from "react";
import { getApiChatConversations } from "@/client";
import "@/lib/api-client";
import type { Conversation } from "@/lib/types/chat";
import { isAuthenticated } from "@/lib/utils/auth-storage";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefetchRef = useRef<number>(0);

  const fetchConversations = useCallback(async (showLoading = true) => {
    if (!isAuthenticated()) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await getApiChatConversations({});

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri nalaganju pogovorov.");
        setIsLoading(false);
        return;
      }

      const data = (response.data as Conversation[]) ?? [];
      setConversations(data);
      setIsLoading(false);
      lastRefetchRef.current = Date.now();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();

    // Listen for authentication state changes (login/logout) - immediate refetch
    const handleAuthStateChange = () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
      fetchConversations();
    };

    // Listen for new messages to update conversations list
    // Throttle: only refetch if last refetch was more than 500ms ago
    const handleNewMessage = () => {
      const now = Date.now();
      const timeSinceLastRefetch = now - lastRefetchRef.current;
      
      // Only refetch if it's been at least 500ms since last refetch
      if (timeSinceLastRefetch < 500) {
        // Clear any pending timeout and schedule a new one
        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current);
        }
        refetchTimeoutRef.current = setTimeout(() => {
          fetchConversations(false); // Don't show loading state
          refetchTimeoutRef.current = null;
        }, 500 - timeSinceLastRefetch);
        return;
      }

      // Refetch immediately if enough time has passed (without loading state)
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
      fetchConversations(false); // Don't show loading state
    };

    // Listen for messages marked as read to update conversations list
    // Throttle: only refetch if last refetch was more than 500ms ago
    const handleMessagesRead = () => {
      const now = Date.now();
      const timeSinceLastRefetch = now - lastRefetchRef.current;
      
      // Only refetch if it's been at least 500ms since last refetch
      if (timeSinceLastRefetch < 500) {
        // Clear any pending timeout and schedule a new one
        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current);
        }
        refetchTimeoutRef.current = setTimeout(() => {
          fetchConversations(false); // Don't show loading state
          refetchTimeoutRef.current = null;
        }, 500 - timeSinceLastRefetch);
        return;
      }

      // Refetch immediately if enough time has passed (without loading state)
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
      fetchConversations(false); // Don't show loading state
    };

    // Listen for message request accepted to update conversations list
    const handleMessageRequestAccepted = () => {
      const now = Date.now();
      const timeSinceLastRefetch = now - lastRefetchRef.current;
      
      // Only refetch if it's been at least 500ms since last refetch
      if (timeSinceLastRefetch < 500) {
        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current);
        }
        refetchTimeoutRef.current = setTimeout(() => {
          fetchConversations(false); // Don't show loading state
          refetchTimeoutRef.current = null;
        }, 500 - timeSinceLastRefetch);
        return;
      }

      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
      fetchConversations(false); // Don't show loading state
    };

    if (typeof window !== "undefined") {
      window.addEventListener("authStateChanged", handleAuthStateChange);
      window.addEventListener("newMessageReceived", handleNewMessage);
      window.addEventListener("messagesMarkedAsRead", handleMessagesRead);
      window.addEventListener("messageRequestAccepted", handleMessageRequestAccepted);

      return () => {
        window.removeEventListener("authStateChanged", handleAuthStateChange);
        window.removeEventListener("newMessageReceived", handleNewMessage);
        window.removeEventListener("messagesMarkedAsRead", handleMessagesRead);
        window.removeEventListener("messageRequestAccepted", handleMessageRequestAccepted);
        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current);
        }
      };
    }
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refetch: fetchConversations,
    setError,
  };
}

