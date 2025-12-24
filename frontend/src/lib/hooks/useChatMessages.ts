'use client';

import { useState, useCallback, useEffect } from "react";
import { getApiChatConversationByUserId } from "@/client";
import "@/lib/api-client";
import type { Message } from "@/lib/types/chat";
import { isAuthenticated } from "@/lib/utils/auth-storage";

export function useChatMessages(userId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!userId || !isAuthenticated()) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiChatConversationByUserId({
        path: { userId },
        query: { skip: 0, take: 100 },
      });

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri nalaganju sporočil.");
        setIsLoading(false);
        return;
      }

      const data = (response.data as Message[]) ?? [];
      setMessages(data);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(message);
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Use setTimeout to defer execution and avoid cascading renders
    const timer = setTimeout(() => {
      fetchMessages();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMessages]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Check if message already exists to avoid duplicates
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const updateMessageReadStatus = useCallback((messageId: number, readAt: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isRead: true, readAt }
          : msg
      )
    );
  }, []);

  const markMessagesFromSenderAsRead = useCallback((senderId: string, readAt?: string) => {
    const readAtTime = readAt || new Date().toISOString();
    setMessages((prev) =>
      prev.map((msg) =>
        msg.senderId === senderId && !msg.isRead
          ? { ...msg, isRead: true, readAt: readAtTime }
          : msg
      )
    );
  }, []);

  return {
    messages,
    isLoading,
    error,
    refetch: fetchMessages,
    addMessage,
    updateMessageReadStatus,
    markMessagesFromSenderAsRead,
    setError,
  };
}

