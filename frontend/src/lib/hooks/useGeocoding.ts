'use client';

import { useState, useCallback } from "react";
import { getAccessToken } from "@/lib/utils/auth-storage";

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  success: boolean;
}

export function useGeocoding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = useCallback(async (
    address: string,
    city?: string
  ): Promise<GeocodingResult | null> => {
    if (!address.trim()) {
      setError("Address is required");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      const queryParams = new URLSearchParams({
        address: address.trim(),
      });
      if (city?.trim()) {
        queryParams.append("city", city.trim());
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5121';
      const response = await fetch(
        `${apiBaseUrl}/api/geocoding/geocode?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Could not find location for this address.";
        setError(errorMessage);
        return null;
      }

      const data = await response.json() as GeocodingResult;
      if (data.success && data.latitude && data.longitude) {
        return data;
      }

      setError("Location not found for this address.");
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while geocoding.";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    geocodeAddress,
    isLoading,
    error,
    setError,
  };
}
