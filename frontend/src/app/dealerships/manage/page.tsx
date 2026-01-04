import { DealershipManagementPage } from "@/components/dealership/DealershipManagementPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DealershipManagePage() {
  return (
    <ProtectedRoute>
      <DealershipManagementPage />
    </ProtectedRoute>
  );
}

