"use client";

import { MessagesPage } from "@/components/messages/MessagesPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Messages() {
  return (
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  );
}

