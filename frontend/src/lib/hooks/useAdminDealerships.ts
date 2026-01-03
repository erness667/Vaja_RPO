'use client';

import { useState, useCallback } from "react";
import {
  getApiDealershipsPending,
  postApiDealershipsByIdApprove,
} from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import "@/lib/api-client";

export interface Dealership {
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
  status: string; // "Pending", "Approved", "Declined", "Suspended"
  reviewedByAdminId?: string | null;
  reviewedByAdminName?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  updatedAt: string;
  workerCount: number;
}

export function useAdminDealerships() {
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingDealerships = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiDealershipsPending({});

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to fetch pending dealerships" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }

      if (response.data) {
        // The response is an array of Dealership objects
        const data = Array.isArray(response.data) 
          ? response.data as Dealership[]
          : [];
        setDealerships(data);
        setIsLoading(false);
        return data;
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

  const approveDealership = useCallback(async (
    dealershipId: number,
    approve: boolean,
    notes?: string
  ): Promise<Dealership | null> => {
    setError(null);

    try {
      const response = await postApiDealershipsByIdApprove({
        path: { id: dealershipId },
        body: {
          approve,
          notes: notes || null,
        },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: approve ? "Failed to approve dealership" : "Failed to decline dealership" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        return null;
      }

      if (response.data) {
        const updatedDealership = response.data as Dealership;
        // Remove the dealership from the list since it's no longer pending
        setDealerships(prev => prev.filter(d => d.id !== dealershipId));
        return updatedDealership;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return null;
    }
  }, []);

  return {
    dealerships,
    isLoading,
    error,
    fetchPendingDealerships,
    approveDealership,
    setError,
  };
}

