import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { postApiCars, postApiCarsByIdImages } from "@/client";
import { extractValidationErrors } from "@/lib/utils/error-utils";
import type { CreateCarRequest } from "@/client/types.gen";
import "@/lib/api-client";

export function useCreateCar() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCar = useCallback(async (formData: CreateCarRequest, images?: File[]) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await postApiCars({
        body: formData,
      });

      if (response.error || (response.response && !response.response.ok)) {
        let errorData: unknown = response.error;
        
        if (!errorData && response.data && typeof response.data === 'object') {
          errorData = response.data;
        } else if (!errorData && response.response) {
          try {
            const text = await response.response.text();
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: "Request failed" };
          }
        }
        
        const errorMessage = extractValidationErrors(errorData);
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }

      if (response.data) {
        // If images were selected, upload them to the gallery endpoint
        if (images && images.length > 0) {
          try {
            const createdCar: any = response.data;
            const carId = createdCar.id as number | undefined;

            if (carId) {
              await postApiCarsByIdImages({
                path: { id: carId },
                body: { files: images },
              });
            }
          } catch {
            // Ignore image upload errors for now; car itself is created
          }
        }

        setIsLoading(false);
        // Redirect to homepage or car detail page
        router.push("/");
        return { success: true, data: response.data };
      } else {
        const errorMessage = "Failed to create car listing. Please try again.";
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [router]);

  return {
    createCar,
    isLoading,
    error,
    setError,
  };
}

