'use client';

import { useState, useCallback } from "react";
import { deleteApiFriendsRequestById } from "@/client";
import "@/lib/api-client";
import { extractValidationErrors } from "@/lib/utils/error-utils";

export function useCancelFriendRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelFriendRequest = useCallback(async (requestId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deleteApiFriendsRequestById({
        path: { id: requestId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to cancel friend request" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  return {
    cancelFriendRequest,
    isLoading,
    error,
    setError,
  };
}

