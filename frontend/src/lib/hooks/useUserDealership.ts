'use client';

import { useState, useCallback, useEffect } from "react";
import { getApiDealerships, getApiDealershipsById, getApiDealershipsMyWorker } from "@/client";
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

      // First try to get approved dealership for current user as owner
      const ownerResponse = await getApiDealerships({
        query: {
          status: "Approved",
          ownerId: user.id,
        },
      });

      if (!ownerResponse.error && ownerResponse.response && ownerResponse.response.ok && ownerResponse.data) {
        const data = Array.isArray(ownerResponse.data) ? ownerResponse.data as UserDealership[] : [];
        if (data.length > 0) {
          // User owns a dealership, use that
          setDealership(data[0]);
          setIsLoading(false);
          return data[0];
        }
      }

      // If user doesn't own a dealership, check if they're a worker
      const workerResponse = await getApiDealershipsMyWorker({});

      if (!workerResponse.error && workerResponse.response && workerResponse.response.ok && workerResponse.data) {
        const workerDealerships = Array.isArray(workerResponse.data) ? workerResponse.data as UserDealership[] : [];
        if (workerDealerships.length > 0) {
          // User is a worker in at least one dealership, use the first one
          setDealership(workerDealerships[0]);
          setIsLoading(false);
          return workerDealerships[0];
        }
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

