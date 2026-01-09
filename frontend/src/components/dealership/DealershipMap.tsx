"use client";

import { useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import { useJsApiLoader } from "@react-google-maps/api";

interface DealershipMapProps {
  latitude: number | null;
  longitude: number | null;
  address?: string;
  height?: string;
}

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

export function DealershipMap({ latitude, longitude, address, height = "400px" }: DealershipMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Get API key from environment variable
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !isLoaded || !mapContainerRef.current) return;

    // Default center (Slovenia)
    const defaultCenter: google.maps.LatLngLiteral = { lat: 46.1512, lng: 14.9955 };
    const center: google.maps.LatLngLiteral = latitude && longitude 
      ? { lat: latitude, lng: longitude } 
      : defaultCenter;
    const zoom = latitude && longitude ? 15 : 7;

    // Initialize map if not already initialized
    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }

    // Update marker position
    if (latitude && longitude) {
      const position: google.maps.LatLngLiteral = { lat: latitude, lng: longitude };

      if (markerRef.current) {
        markerRef.current.setPosition(position);
      } else {
        markerRef.current = new google.maps.Marker({
          position,
          map: mapRef.current,
          title: address || "Dealership Location",
        });
      }

      // Update or create info window
      if (address) {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(address);
        } else {
          infoWindowRef.current = new google.maps.InfoWindow({
            content: address,
          });
          markerRef.current.addListener("click", () => {
            if (infoWindowRef.current && mapRef.current && markerRef.current) {
              infoWindowRef.current.open(mapRef.current, markerRef.current);
            }
          });
        }
        // Open info window
        if (infoWindowRef.current && mapRef.current && markerRef.current) {
          infoWindowRef.current.open(mapRef.current, markerRef.current);
        }
      }

      // Center map on marker
      if (mapRef.current) {
        mapRef.current.setCenter(position);
        mapRef.current.setZoom(15);
      }
    } else if (markerRef.current) {
      // Remove marker if coordinates are cleared
      markerRef.current.setMap(null);
      markerRef.current = null;
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    }
  }, [isMounted, isLoaded, latitude, longitude, address]);

  if (!apiKey) {
    return (
      <Box
        width="100%"
        height={height}
        borderRadius="md"
        overflow="hidden"
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        bg={{ base: "gray.100", _dark: "gray.900" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box textAlign="center" p={4}>
          <Box fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
            Google Maps API key not configured
          </Box>
        </Box>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box
        width="100%"
        height={height}
        borderRadius="md"
        overflow="hidden"
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        bg={{ base: "gray.100", _dark: "gray.900" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box textAlign="center" p={4}>
          <Box fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
            Loading map...
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={mapContainerRef}
      width="100%"
      height={height}
      borderRadius="md"
      overflow="hidden"
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      bg={{ base: "gray.100", _dark: "gray.900" }}
    />
  );
}
