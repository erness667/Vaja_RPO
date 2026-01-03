'use client';

import { DealershipRequestForm } from "@/components/dealership/DealershipRequestForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function CreateDealershipRoute() {
  return (
    <ProtectedRoute>
      <DealershipRequestForm />
    </ProtectedRoute>
  );
}

