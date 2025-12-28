'use client';

import { useState, useCallback } from "react";
import { postApiFriendsRequest } from "@/client";
import "@/lib/api-client";
import { extractValidationErrors } from "@/lib/utils/error-utils";

export function useSendFriendRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendFriendRequest = useCallback(async (addresseeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await postApiFriendsRequest({
        body: { addresseeId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to send friend request" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }

      setIsLoading(false);
      
      // Dispatch event to trigger sidebar updates (receiver will get SignalR event, but this helps with immediate UI updates)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("friendRequestSent"));
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  return {
    sendFriendRequest,
    isLoading,
    error,
    setError,
  };
}

