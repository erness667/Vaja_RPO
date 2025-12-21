"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MyPostsPage } from "@/components/car/MyPostsPage";

export default function MyPostsRoute() {
  return (
    <ProtectedRoute redirectTo="/login">
      <MyPostsPage />
    </ProtectedRoute>
  );
}

