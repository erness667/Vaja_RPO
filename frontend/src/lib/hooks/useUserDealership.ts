'use client';

import { useState, useCallback, useEffect } from "react";
import { getApiDealerships } from "@/client";
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

export function useUserDealership() {
  const [dealership, setDealership] = useState<UserDealership | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDealership = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = getStoredUser();
      if (!user?.id) {
        setDealership(null);
        setIsLoading(false);
        return;
      }

      // Get approved dealership for current user as owner
      const response = await getApiDealerships({
        query: {
          status: "Approved",
          ownerId: user.id,
        },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to fetch dealership" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setDealership(null);
        setIsLoading(false);
        return null;
      }

      if (response.data) {
        const data = Array.isArray(response.data) ? response.data as UserDealership[] : [];
        // User should only have one approved dealership
        const approvedDealership = data.length > 0 ? data[0] : null;
        setDealership(approvedDealership);
        setIsLoading(false);
        return approvedDealership;
      }

      setDealership(null);
      setIsLoading(false);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setDealership(null);
      setIsLoading(false);
      return null;
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchUserDealership();
  }, [fetchUserDealership]);

  return {
    dealership,
    isLoading,
    error,
    fetchUserDealership,
    setError,
  };
}

