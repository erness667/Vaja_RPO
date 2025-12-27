'use client';

import { useState, useCallback } from "react";
import { postApiChatRequestsByUserIdAccept } from "@/client";
import "@/lib/api-client";
import { extractValidationErrors } from "@/lib/utils/error-utils";

export function useAcceptMessageRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptMessageRequest = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await postApiChatRequestsByUserIdAccept({
        path: { userId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to accept message request" };
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
    acceptMessageRequest,
    isLoading,
    error,
    setError,
  };
}

