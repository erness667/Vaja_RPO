"use client";

import { FavouritesPage } from "@/components/favourites/FavouritesPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Favourites() {
  return (
    <ProtectedRoute>
      <FavouritesPage />
    </ProtectedRoute>
  );
}

