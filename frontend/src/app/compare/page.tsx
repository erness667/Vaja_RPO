"use client";

import { CarComparisonPage } from "@/components/car/CarComparisonPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ComparePage() {
  return (
    <ProtectedRoute>
      <CarComparisonPage />
    </ProtectedRoute>
  );
}

