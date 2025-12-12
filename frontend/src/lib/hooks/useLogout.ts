import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { postApiAuthLogout } from "@/client";
import { clearAuthTokens, getAccessToken } from "@/lib/utils/auth-storage";
import "@/lib/api-client";

export function useLogout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const token = getAccessToken();
      
      // If no token, just clear local storage and redirect
      if (!token) {
        clearAuthTokens();
        setIsLoading(false);
        router.push("/");
        return { success: true };
      }

      // Call logout endpoint - auth header will be automatically added by client config
      const response = await postApiAuthLogout({});

      // Clear tokens regardless of response (logout should always clear local state)
      clearAuthTokens();

      if (response.error || (response.response && !response.response.ok)) {
        // Even if API call fails, we've cleared local tokens
        // Just log the error but don't show it to user
       
      }

      setIsLoading(false);
      router.push("/");
      return { success: true };
    } catch (err) {
      // Even on error, clear local tokens
      clearAuthTokens();
      console.error("Logout error:", err);
      setIsLoading(false);
      router.push("/");
      return { success: true };
    }
  }, [router]);

  return {
    logout,
    isLoading,
    error,
  };
}

