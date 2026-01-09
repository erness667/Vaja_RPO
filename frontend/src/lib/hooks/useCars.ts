"use client";

import { useCallback, useState } from "react";
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
}

export function useCars(filters?: UseCarsFilters) {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query: NonNullable<GetApiCarsData["query"]> = {
        page: 1,
        pageSize: 12,
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
        // API wraps cars in an object: { cars, totalCount, ... }
        const raw = response.data as { cars?: Car[] } | undefined;
        const data = raw?.cars ?? [];
        setCars(data);
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

  return {
    cars,
    isLoading,
    error,
    refetch: fetchCars,
  };
}


