import { useState, useCallback } from "react";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import { storeUserData, getAccessToken } from "@/lib/utils/auth-storage";
import type { UserProfile } from "./useUserProfile";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5121';

export interface UpdateAvatarData {
  file: File;
}

export function useUpdateAvatar() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvatar = useCallback(async (data: UpdateAvatarData) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(data.file.type)) {
        const errorMessage = "Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, WEBP.";
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }

      // Validate file size (max 5MB)
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      if (data.file.size > maxFileSize) {
        const errorMessage = "File size exceeds 5MB limit.";
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', data.file);

      // Get access token
      const token = getAccessToken();
      if (!token) {
        const errorMessage = "Not authenticated. Please log in again.";
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }

      // Send request
      const response = await fetch(`${apiBaseUrl}/api/user/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorData: unknown;
        try {
          const text = await response.text();
          errorData = JSON.parse(text);
        } catch {
          errorData = { message: "Request failed" };
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }

      const userData = await response.json() as UserProfile;
      storeUserData(userData);
      setIsLoading(false);
      return { success: true, user: userData };
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

