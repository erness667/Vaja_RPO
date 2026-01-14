"use client";

import { DealershipAnalyticsPage } from "@/components/dealership/DealershipAnalyticsPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DealershipAnalyticsRoute() {
  return (
    <ProtectedRoute>
      <DealershipAnalyticsPage />
    </ProtectedRoute>
  );
}
