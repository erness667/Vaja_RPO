import { useState, useCallback } from "react";
import { putApiUserAvatar } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import { storeUserData } from "@/lib/utils/auth-storage";
import type { UserProfile } from "./useUserProfile";
import "@/lib/api-client";

export interface UpdateAvatarData {
  avatarImageUrl: string;
}

export function useUpdateAvatar() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvatar = useCallback(async (data: UpdateAvatarData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await putApiUserAvatar({
        body: data,
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.data && typeof response.data === "object") {
          errorData = response.data;
        } else if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Request failed" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }

      if (response.data) {
        const userData = response.data as UserProfile;
        storeUserData(userData);
        setIsLoading(false);
        return { success: true, user: userData };
      } else {
        const errorMessage = "Update failed. Please try again.";
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    updateAvatar,
    isLoading,
    error,
    setError,
  };
}

