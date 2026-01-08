'use client';

import { useState, useCallback, useEffect } from "react";
import { getApiDealerships, getApiDealershipsMyWorker } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import "@/lib/api-client";
import { getStoredUser } from "@/lib/utils/auth-storage";

export interface UserDealership {
  id: number;
  ownerId: string;
  ownerName: string;
  ownerSurname: string;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  phoneNumber: string;
  email?: string | null;
  website?: string | null;
  taxNumber?: string | null;
  status: string;
  reviewedByAdminId?: string | null;
  reviewedByAdminName?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  updatedAt: string;
  workerCount: number;
}

export function useUserDealerships() {
  const [dealerships, setDealerships] = useState<UserDealership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDealerships = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = getStoredUser();
      if (!user?.id) {
        setDealerships([]);
        setIsLoading(false);
        return [];
      }

      const allDealerships: UserDealership[] = [];

      // Get dealerships where user is owner (get all, not just approved - show in dropdown, backend validates on post)
      const ownerResponse = await getApiDealerships({
        query: {
          ownerId: user.id,
        },
      });

      if (!ownerResponse.error && ownerResponse.response && ownerResponse.response.ok && ownerResponse.data) {
        const ownerDealerships = Array.isArray(ownerResponse.data) ? ownerResponse.data as UserDealership[] : [];
        // Show all owner dealerships in dropdown, backend will validate approval on post
        allDealerships.push(...ownerDealerships);
      }

      // Get dealerships where user is an active worker (all active workers can post, not just admins)
      const workerResponse = await getApiDealershipsMyWorker({});
      
      if (!workerResponse.error && workerResponse.response && workerResponse.response.ok && workerResponse.data) {
        const workerDealerships = Array.isArray(workerResponse.data) ? workerResponse.data as UserDealership[] : [];
        // Backend returns all active worker dealerships, backend validates approval on post
        // Avoid duplicates (in case user is both owner and worker)
        workerDealerships.forEach(d => {
          if (!allDealerships.find(existing => existing.id === d.id)) {
            allDealerships.push(d);
          }
        });
      }

      setDealerships(allDealerships);
      setIsLoading(false);
      return allDealerships;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setDealerships([]);
      setIsLoading(false);
      return [];
    }
  }, []);

  // Auto-fetch on mount and listen for auth state changes
  useEffect(() => {
    fetchUserDealerships();

    // Listen for authentication state changes (login/logout)
    const handleAuthStateChange = () => {
      fetchUserDealerships();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("authStateChanged", handleAuthStateChange);

      return () => {
        window.removeEventListener("authStateChanged", handleAuthStateChange);
      };
    }
  }, [fetchUserDealerships]);

  return {
    dealerships,
    isLoading,
    error,
    fetchUserDealerships,
    setError,
  };
}
