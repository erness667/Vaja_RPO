/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect, useRef } from "react";
import { getApiUserMe } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import { storeUserData, isAuthenticated } from "@/lib/utils/auth-storage";
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
  const isFetchingRef = useRef(false);
  const isInitialMountRef = useRef(true);

  const fetchUser = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return null;
    }

    const wasInitialMount = isInitialMountRef.current;
    isFetchingRef.current = true;

    // Check if user is authenticated before fetching
    if (!isAuthenticated()) {
      setUser(null);
      setError(null);
      // Only set loading to false on initial mount, not on refetches
      if (wasInitialMount) {
        setIsLoading(false);
        isInitialMountRef.current = false;
      }
      isFetchingRef.current = false;
      return null;
    }

    // Only show loading state on initial mount to prevent flickering
    if (wasInitialMount) {
      setIsLoading(true);
    }
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
        setUser(null);
        if (isInitialMountRef.current) {
          setIsLoading(false);
          isInitialMountRef.current = false;
        }
        isFetchingRef.current = false;
        return null;
      }

      if (response.data) {
        const userData = response.data as UserProfile;
        setUser(userData);
        // Update stored user data (we removed the userDataUpdated listener to prevent infinite loops)
        storeUserData(userData);
        if (isInitialMountRef.current) {
          setIsLoading(false);
          isInitialMountRef.current = false;
        }
        isFetchingRef.current = false;
        return userData;
      }

      setUser(null);
      if (isInitialMountRef.current) {
        setIsLoading(false);
        isInitialMountRef.current = false;
      }
      isFetchingRef.current = false;
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setUser(null);
      if (isInitialMountRef.current) {
        setIsLoading(false);
        isInitialMountRef.current = false;
      }
      isFetchingRef.current = false;
      return null;
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Listen for authentication state changes (login/logout)
    // Note: We don't listen to 'userDataUpdated' to avoid infinite loops
    // (when we fetch and store user data, it would trigger this listener)
    const handleAuthStateChange = () => {
      fetchUser();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("authStateChanged", handleAuthStateChange);

      return () => {
        window.removeEventListener("authStateChanged", handleAuthStateChange);
      };
    }
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
    setError,
  };
}

