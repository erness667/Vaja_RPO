"use client";

import { useState, useCallback, useEffect } from "react";
import { getApiDealershipsByIdAnalytics } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import "@/lib/api-client";

export interface DealershipAnalytics {
  overview: {
    totalCars: number;
    totalValue: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    totalViews: number;
    totalFavourites: number;
    averageDaysOnMarket: number;
  };
  monthlyStats: Array<{
    year: number;
    month: number;
    carsCount: number;
    totalValue: number;
    averagePrice: number;
    viewsCount: number;
  }>;
  topViewedCars: Array<{
    carId: number;
    brand: string;
    model: string;
    year: number;
    price: number;
    viewCount: number;
    totalViewCount: number;
    favouriteCount: number;
    createdAt: string;
  }>;
  topFavouriteCars: Array<{
    carId: number;
    brand: string;
    model: string;
    year: number;
    price: number;
    viewCount: number;
    favouriteCount: number;
    createdAt: string;
  }>;
  brandDistribution: Array<{
    brand: string;
    count: number;
    totalValue: number;
    averagePrice: number;
  }>;
  fuelTypeDistribution: Array<{
    fuelType: string;
    count: number;
    totalValue: number;
    averagePrice: number;
  }>;
  workerActivity: Array<{
    userId: string;
    userName: string;
    userSurname: string;
    role: string;
    carsPosted: number;
    totalValuePosted: number;
  }>;
  viewsOverTime: Array<{
    year: number;
    month: number;
    viewsCount: number;
  }>;
}

export function useDealershipAnalytics(dealershipId: number | null) {
  const [analytics, setAnalytics] = useState<DealershipAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!dealershipId) {
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiDealershipsByIdAnalytics({
        path: { id: dealershipId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to fetch analytics" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }

      if (response.data) {
        const analyticsData = response.data as DealershipAnalytics;
        setAnalytics(analyticsData);
        setIsLoading(false);
        return analyticsData;
      }

      setIsLoading(false);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [dealershipId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
    setError,
  };
}
