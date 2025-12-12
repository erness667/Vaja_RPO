import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { postApiAuthLogin } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import { storeAuthTokens } from "@/lib/utils/auth-storage";
import type { LoginFormData } from "@/lib/types/auth";

export function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (formData: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await postApiAuthLogin({
        body: formData,
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        
        if (!errorData && response.data && typeof response.data === 'object') {
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
        // Parse the response data
        const authData = response.data as {
          accessToken?: string;
          refreshToken?: string;
          expiresAt?: string;
          refreshTokenExpiresAt?: string;
          user?: {
            id?: string;
            email?: string;
            username?: string;
            name?: string;
            surname?: string;
            phoneNumber?: string;
          };
        };

        if (authData.accessToken && authData.refreshToken && authData.user) {
          // Store tokens and user data
          storeAuthTokens({
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            expiresAt: authData.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Default 15 min
            refreshTokenExpiresAt: authData.refreshTokenExpiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days
            user: {
              id: authData.user.id || '',
              email: authData.user.email,
              username: authData.user.username,
              name: authData.user.name,
              surname: authData.user.surname,
              phoneNumber: authData.user.phoneNumber,
            },
          });

          setIsLoading(false);
          router.push("/"); // Redirect to home page after successful login
          return { success: true };
        } else {
          const errorMessage = "Login failed. Invalid response from server.";
          setError(errorMessage);
          setIsLoading(false);
          return { success: false, error: errorMessage };
        }
      } else {
        const errorMessage = "Login failed. Please try again.";
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
  }, [router]);

  return {
    login,
    isLoading,
    error,
    setError,
  };
}

