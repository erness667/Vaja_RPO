'use client';

import { useState, useCallback, useEffect, useRef } from "react";

export interface AddressSuggestion {
  description: string;
  placeId: string;
}

export interface PlaceDetails {
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  streetNumber?: string | null;
  streetName?: string | null;
  city?: string | null;
  postalCode?: string | null;
}

export function useAddressAutocomplete() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5121';

  const searchAddress = useCallback(async (query: string, city?: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the search
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ input: query });
        if (city) {
          params.append('city', city);
        }
        
        const response = await fetch(
          `${apiBaseUrl}/api/geocoding/autocomplete?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch address suggestions');
        }

        const data = await response.json() as { suggestions: AddressSuggestion[]; success: boolean };
        setSuggestions(data.suggestions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  }, [apiBaseUrl]);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/geocoding/place-details?placeId=${encodeURIComponent(placeId)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }

      const data = await response.json() as {
        formattedAddress: string;
        latitude: number | null;
        longitude: number | null;
        streetNumber?: string | null;
        streetName?: string | null;
        city?: string | null;
        postalCode?: string | null;
        success: boolean;
      };

      if (data.success) {
        return {
          formattedAddress: data.formattedAddress,
          latitude: data.latitude,
          longitude: data.longitude,
          streetNumber: data.streetNumber,
          streetName: data.streetName,
          city: data.city,
          postalCode: data.postalCode,
        };
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [apiBaseUrl]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    searchAddress,
    getPlaceDetails,
    clearSuggestions,
  };
}
