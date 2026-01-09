"use client";

import { DealershipCarsPage } from "@/components/dealership/DealershipCarsPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DealershipCarsRoute() {
  return (
    <ProtectedRoute>
      <DealershipCarsPage />
    </ProtectedRoute>
  );
}
