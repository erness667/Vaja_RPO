/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from "react";
import { getApiUserMe } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import { storeUserData } from "@/lib/utils/auth-storage";
import type { StoredUser } from "@/lib/utils/auth-storage";
import "@/lib/api-client";

export interface UserProfile extends StoredUser {
  id: string;
  email: string;
  username: string;
  name: string;
  surname: string;
  phoneNumber: string;
  avatarImageUrl?: string;
}

export function useUserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiUserMe({});

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to fetch user profile" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }

      if (response.data) {
        const userData = response.data as UserProfile;
        setUser(userData);
        // Update stored user data
        storeUserData(userData);
        setIsLoading(false);
        return userData;
      }

      setIsLoading(false);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
    setError,
  };
}

