"use client";

import { FriendRequestsPage } from "@/components/friends/FriendRequestsPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function FriendRequests() {
  return (
    <ProtectedRoute>
      <FriendRequestsPage />
    </ProtectedRoute>
  );
}

