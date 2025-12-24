'use client';

import { useState, useCallback, useEffect } from "react";
import { getApiChatConversations } from "@/client";
import "@/lib/api-client";
import type { Conversation } from "@/lib/types/chat";
import { isAuthenticated } from "@/lib/utils/auth-storage";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated()) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refetch: fetchConversations,
    setError,
  };
}

