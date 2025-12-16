/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from "react";
import { getApiCarsById } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import type { Car } from "@/lib/types/car";
import "@/lib/api-client";

export function useCar(carId: number | null) {
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCar = useCallback(async () => {
    if (!carId) {
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiCarsById({
        path: { id: carId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Failed to fetch car details" };
          }
        }
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }

      if (response.data) {
        const carData = response.data as Car;
        setCar(carData);
        setIsLoading(false);
        return carData;
      }

      setIsLoading(false);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [carId]);

  useEffect(() => {
    fetchCar();
  }, [fetchCar]);

  return {
    car,
    isLoading,
    error,
    refetch: fetchCar,
    setError,
  };
}

