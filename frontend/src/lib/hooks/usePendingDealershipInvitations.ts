'use client';

import { useState, useCallback, useEffect } from "react";
import {
  getApiDealershipsWorkersInvitationsPending,
  postApiDealershipsWorkersByWorkerIdRespond,
} from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import "@/lib/api-client";
import { isAuthenticated } from "@/lib/utils/auth-storage";
import type { DealershipWorker } from "./useDealershipWorkers";

export function usePendingDealershipInvitations() {
  const [invitations, setInvitations] = useState<DealershipWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!isAuthenticated()) {
      setInvitations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiDealershipsWorkersInvitationsPending({});

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to fetch invitations" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      const data = (response.data as DealershipWorker[]) ?? [];
      setInvitations(data);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  const respondToInvitation = useCallback(async (
    workerId: number,
    accept: boolean
  ): Promise<boolean> => {
    setError(null);

    try {
      const response = await postApiDealershipsWorkersByWorkerIdRespond({
        path: { workerId },
        body: accept,
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: accept ? "Failed to accept invitation" : "Failed to decline invitation" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        return false;
      }

      // Remove the invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== workerId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return {
    invitations,
    isLoading,
    error,
    fetchInvitations,
    respondToInvitation,
    setError,
  };
}

