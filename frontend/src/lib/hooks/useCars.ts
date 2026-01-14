"use client";

import { useCallback, useState, useMemo } from "react";
import { getApiCars, type GetApiCarsData } from "@/client";
import "@/lib/api-client";
import type { Car } from "@/lib/types/car";

export interface UseCarsFilters {
  makeId?: string | null;
  modelId?: string | null;
  yearFrom?: string | null;
  yearTo?: string | null;
  priceFrom?: string | null;
  priceTo?: string | null;
  mileageTo?: string | null;
  fuelType?: string | null;
  sellerId?: string | null;
  dealershipId?: number | null;
  page?: number;
  pageSize?: number;
}

export function useCars(filters?: UseCarsFilters) {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For client-side pagination, load a large batch of cars at once
      // Use a large pageSize to get as many cars as possible in one request
      const query: NonNullable<GetApiCarsData["query"]> = {
        page: 1,
        pageSize: 1000, // Load up to 1000 cars for client-side pagination
      };

      if (filters?.makeId) {
        query.makeId = filters.makeId;
      }
      if (filters?.modelId) {
        query.modelId = filters.modelId;
      }

      const parseIntSafe = (value?: string | null) => {
        if (!value) return undefined;
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? undefined : parsed;
      };

      const parseNumberWithSeparators = (value?: string | null) => {
        if (!value) return undefined;
        const normalized = value.replace(/\./g, "").replace(",", ".");
        const num = Number(normalized);
        return Number.isFinite(num) ? num : undefined;
      };

      const yearFrom = parseIntSafe(filters?.yearFrom);
      const yearTo = parseIntSafe(filters?.yearTo);
      const priceFrom = parseNumberWithSeparators(filters?.priceFrom);
      const priceTo = parseNumberWithSeparators(filters?.priceTo);
      const mileageTo = parseIntSafe(
        filters?.mileageTo
          ? filters.mileageTo.replace(/\./g, "").replace(",", ".")
          : undefined,
      );

      if (yearFrom !== undefined) {
        query.yearFrom = yearFrom;
      }
      if (yearTo !== undefined) {
        query.yearTo = yearTo;
      }
      if (priceFrom !== undefined) {
        query.priceFrom = priceFrom;
      }
      if (priceTo !== undefined) {
        query.priceTo = priceTo;
      }
      if (mileageTo !== undefined) {
        query.mileageTo = mileageTo;
      }
      if (filters?.fuelType) {
        query.fuelType = filters.fuelType;
      }

      if (filters?.sellerId) {
        query.sellerId = filters.sellerId;
      }

      if (filters?.dealershipId !== undefined && filters.dealershipId !== null) {
        query.dealershipId = filters.dealershipId;
      }

      const response = await getApiCars({
        query,
      });

      if (response.error || (response.response && !response.response.ok)) {
        setError("Napaka pri nalaganju vozil.");
        setIsLoading(false);
        return [];
      }

      if (response.data) {
        // API wraps cars in an object: { cars, totalCount, page, pageSize, totalPages }
        const raw = response.data as { 
          cars?: Car[];
          totalCount?: number;
          page?: number;
          pageSize?: number;
          totalPages?: number;
        } | undefined;
        const data = raw?.cars ?? [];
        setCars(data);
        
        // For client-side pagination, we'll calculate pagination in the component
        // based on the total number of cars loaded
        setIsLoading(false);
        return data;
      }

      setCars([]);
      setIsLoading(false);
      return [];
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Prišlo je do nepričakovane napake.";
      setError(message);
      setIsLoading(false);
      return [];
    }
  }, [filters]);

  // Calculate pagination info for client-side pagination
  const clientPagination = useMemo(() => {
    const pageSize = filters?.pageSize ?? 6;
    const totalCount = cars.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = filters?.page ?? 1;
    
    return totalCount > 0 ? {
      totalCount,
      page: currentPage,
      pageSize,
      totalPages,
    } : null;
  }, [cars.length, filters?.page, filters?.pageSize]);

  return {
    cars,
    isLoading,
    error,
    pagination: clientPagination,
    refetch: fetchCars,
  };
}


