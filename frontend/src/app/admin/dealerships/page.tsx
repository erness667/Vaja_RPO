'use client';

import { AdminDealershipsPage } from "@/components/admin/AdminDealershipsPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminDealershipsRoute() {
  return (
    <ProtectedRoute>
      <AdminDealershipsPage />
    </ProtectedRoute>
  );
}

