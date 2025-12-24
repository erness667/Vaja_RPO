"use client";

import { FriendsPage } from "@/components/friends/FriendsPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Friends() {
  return (
    <ProtectedRoute>
      <FriendsPage />
    </ProtectedRoute>
  );
}

