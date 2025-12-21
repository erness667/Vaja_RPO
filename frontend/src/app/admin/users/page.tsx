'use client';

import { AdminUsersPage } from "@/components/admin/AdminUsersPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminUsersRoute() {
  return (
    <ProtectedRoute>
      <AdminUsersPage />
    </ProtectedRoute>
  );
}

