'use client';

import { useState, useCallback } from "react";
import { deleteApiFriendsByFriendId } from "@/client";
import "@/lib/api-client";
import { extractValidationErrors } from "@/lib/utils/error-utils";

export function useRemoveFriend() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeFriend = useCallback(async (friendId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deleteApiFriendsByFriendId({
        path: { friendId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to remove friend" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      
      // Dispatch custom event to notify components about friend removal
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("friendRemoved", { detail: { friendId } }));
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  return {
    removeFriend,
    isLoading,
    error,
    setError,
  };
}

