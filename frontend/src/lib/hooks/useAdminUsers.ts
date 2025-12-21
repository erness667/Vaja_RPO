'use client';

import { useState, useCallback } from "react";
import {
  getApiUserAdminUsers,
  putApiUserAdminUsersByIdRole,
  putApiUserAdminUsersByIdProfile,
  deleteApiUserAdminUsersById,
} from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import { getAccessToken } from "@/lib/utils/auth-storage";
import "@/lib/api-client";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  surname: string;
  username: string;
  phoneNumber: string;
  avatarImageUrl?: string | null;
  role: 0 | 1; // 0 = User, 1 = Admin
}

export interface AdminUsersResponse {
  users: AdminUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null>(null);

  const fetchUsers = useCallback(async (params: GetUsersParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiUserAdminUsers({
        query: {
          page: params.page || 1,
          pageSize: params.pageSize || 20,
          ...(params.search ? { search: params.search } : {}),
        },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to fetch users" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }

      if (response.data) {
        const data = response.data as AdminUsersResponse;
        setUsers(data.users || []);
        setPagination({
          totalCount: data.totalCount,
          page: data.page,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
        });
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

  const updateUserRole = useCallback(async (userId: string, role: 0 | 1): Promise<AdminUser | null> => {
    setError(null);

    try {
      const response = await putApiUserAdminUsersByIdRole({
        path: { id: userId },
        body: { role },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to update user role" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        return null;
      }

      if (response.data) {
        const updatedUser = response.data as AdminUser;
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
        return updatedUser;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return null;
    }
  }, []);

  const updateUserAvatar = useCallback(async (userId: string, file: File): Promise<AdminUser | null> => {
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5121';
      const token = getAccessToken();

      if (!token) {
        setError("Niste prijavljeni. Prosimo, prijavite se znova.");
        return null;
      }

      const response = await fetch(`${apiBaseUrl}/api/user/admin/users/${userId}/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorData: unknown;
        try {
          const text = await response.text();
          errorData = JSON.parse(text);
        } catch {
          errorData = { message: "Failed to update user avatar" };
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        return null;
      }

      const userData = await response.json() as AdminUser;
      setUsers(prev => prev.map(u => u.id === userId ? userData : u));
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return null;
    }
  }, []);

  const updateUserProfile = useCallback(async (
    userId: string,
    profileData: { name?: string; surname?: string; phoneNumber?: string }
  ): Promise<AdminUser | null> => {
    setError(null);

    try {
      const response = await putApiUserAdminUsersByIdProfile({
        path: { id: userId },
        body: profileData,
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to update user profile" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        return null;
      }

      if (response.data) {
        const updatedUser = response.data as AdminUser;
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
        return updatedUser;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return null;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await deleteApiUserAdminUsersById({
        path: { id: userId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to delete user" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        return false;
      }

      setUsers(prev => prev.filter(u => u.id !== userId));
      if (pagination) {
        setPagination(prev => prev ? { ...prev, totalCount: prev.totalCount - 1 } : null);
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return false;
    }
  }, [pagination]);

  return {
    users,
    isLoading,
    error,
    pagination,
    fetchUsers,
    updateUserRole,
    updateUserProfile,
    updateUserAvatar,
    deleteUser,
    setError,
  };
}

