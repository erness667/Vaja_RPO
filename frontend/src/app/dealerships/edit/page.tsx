"use client";

import { DealershipEditForm } from "@/components/dealership/DealershipEditForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DealershipEditPage() {
  return (
    <ProtectedRoute>
      <DealershipEditForm />
    </ProtectedRoute>
  );
}
