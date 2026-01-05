'use client';

import { useState, useCallback } from "react";
import {
  getApiDealershipsByIdWorkers,
  postApiDealershipsByIdWorkersInvite,
  putApiDealershipsWorkersByWorkerIdRole,
  deleteApiDealershipsWorkersByWorkerId,
  postApiDealershipsWorkersByWorkerIdRespond,
  postApiDealershipsByIdTransferOwnership,
} from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import "@/lib/api-client";

export interface DealershipWorker {
  id: number;
  dealershipId: number;
  dealershipName: string;
  userId: string;
  userName: string;
  userSurname: string;
  userEmail: string;
  userAvatarImageUrl?: string | null;
  role: string; // "Worker" or "Admin"
  status: string; // "Pending", "Active", "Inactive", "Declined"
  invitedByUserId: string;
  invitedByName: string;
  createdAt: string;
  acceptedAt?: string | null;
  updatedAt: string;
}

export function useDealershipWorkers(dealershipId: number | null) {
  const [workers, setWorkers] = useState<DealershipWorker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    if (!dealershipId) {
      setWorkers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiDealershipsByIdWorkers({
        path: { id: dealershipId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to fetch workers" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }

      if (response.data) {
        const data = Array.isArray(response.data) ? response.data as DealershipWorker[] : [];
        setWorkers(data);
        setIsLoading(false);
        return data;
      }

      setWorkers([]);
      setIsLoading(false);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [dealershipId]);

  const inviteWorker = useCallback(async (
    userId: string,
    role: "Worker" | "Admin" = "Worker"
  ): Promise<DealershipWorker | null> => {
    if (!dealershipId) {
      setError("No dealership selected");
      return null;
    }

    setError(null);

    try {
      const response = await postApiDealershipsByIdWorkersInvite({
        path: { id: dealershipId },
        body: {
          userId,
          role,
        },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to invite worker" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        return null;
      }

      if (response.data) {
        const newWorker = response.data as DealershipWorker;
        setWorkers(prev => [...prev, newWorker]);
        return newWorker;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return null;
    }
  }, [dealershipId]);

  const updateWorkerRole = useCallback(async (
    workerId: number,
    role: "Worker" | "Admin"
  ): Promise<DealershipWorker | null> => {
    setError(null);

    try {
      const response = await putApiDealershipsWorkersByWorkerIdRole({
        path: { workerId },
        body: {
          role,
        },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to update worker role" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        return null;
      }

      if (response.data) {
        const updatedWorker = response.data as DealershipWorker;
        setWorkers(prev => prev.map(w => w.id === workerId ? updatedWorker : w));
        return updatedWorker;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return null;
    }
  }, []);

  const removeWorker = useCallback(async (workerId: number): Promise<boolean> => {
    setError(null);

    try {
      const response = await deleteApiDealershipsWorkersByWorkerId({
        path: { workerId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to remove worker" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        return false;
      }

      setWorkers(prev => prev.filter(w => w.id !== workerId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return false;
    }
  }, []);

  const respondToInvitation = useCallback(async (
    workerId: number,
    accept: boolean
  ): Promise<DealershipWorker | null> => {
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
        return null;
      }

      if (response.data) {
        const updatedWorker = response.data as DealershipWorker;
        setWorkers(prev => prev.map(w => w.id === workerId ? updatedWorker : w));
        return updatedWorker;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return null;
    }
  }, []);

  const transferOwnership = useCallback(async (
    newOwnerId: string
  ): Promise<boolean> => {
    if (!dealershipId) {
      setError("No dealership selected");
      return false;
    }

    setError(null);

    try {
      const response = await postApiDealershipsByIdTransferOwnership({
        path: { id: dealershipId },
        body: {
          newOwnerId,
        },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to transfer ownership" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return false;
    }
  }, [dealershipId]);

  return {
    workers,
    isLoading,
    error,
    fetchWorkers,
    inviteWorker,
    updateWorkerRole,
    removeWorker,
    respondToInvitation,
    transferOwnership,
    setError,
  };
}

