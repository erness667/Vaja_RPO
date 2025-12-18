"use client";

import {
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCars, type UseCarsFilters } from "@/lib/hooks/useCars";
import { CarCard } from "./CarCard";
import { SortBar, SortOption } from "../layout/SortBar";
import { Trans } from "@lingui/macro";

export function CarList() {
  const searchParams = useSearchParams();

  const filters: UseCarsFilters = useMemo(() => {
    const get = (key: string) => searchParams.get(key) || undefined;

    return {
      makeId: get("makeId"),
      modelId: get("modelId"),
      yearFrom: get("yearFrom"),
      yearTo: get("yearTo"),
      priceFrom: get("priceFrom"),
      priceTo: get("priceTo"),
      mileageTo: get("mileageTo"),
      fuelType: get("fuelType"),
    };
  }, [searchParams]);

  const { cars, isLoading, error, refetch } = useCars(filters);
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const renderHeading = () => {
    switch (sort) {
      case "oldest":
        return <Trans>Najstarejši oglasi</Trans>;
      case "priceDesc":
        return <Trans>Najdražji oglasi</Trans>;
      case "priceAsc":
        return <Trans>Najcenejši oglasi</Trans>;
      case "newest":
      default:
        return <Trans>Najnovejši oglasi</Trans>;
    }
  };

  const sortedCars = useMemo(() => {
    const list = [...cars];
    switch (sort) {
      case "priceDesc":
        return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "priceAsc":
        return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case "oldest":
        return list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "newest":
      default:
        return list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [cars, sort]);

  return (
    <Box
      suppressHydrationWarning
      pt={0}
      pb={8}
      px={4}
    >
      <Box
        suppressHydrationWarning
        maxW="72rem"
        mx="auto"
        rounded="2xl"
        bg={{ base: "white", _dark: "gray.800" }}
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        boxShadow="2xl"
        p={8}
      >
        <VStack align="stretch" gap={6}>
          <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
            <Heading
              size="lg"
              color={{ base: "gray.800", _dark: "gray.100" }}
            >
              {renderHeading()}
            </Heading>
            <SortBar value={sort} onChange={setSort} />
          </HStack>

        {isLoading && (
          <Box display="flex" justifyContent="center" py={10}>
            <Spinner size="lg" color="blue.500" />
          </Box>
        )}

        {error && !isLoading && (
          <Box
            p={4}
            borderRadius="md"
            bg={{ base: "red.50", _dark: "red.900" }}
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
          >
            <Text
              fontSize="sm"
              color={{ base: "red.800", _dark: "red.200" }}
            >
              {error}
            </Text>
          </Box>
        )}

        {!isLoading && !error && sortedCars.length === 0 && (
          <Text
            fontSize="sm"
            color={{ base: "gray.600", _dark: "gray.400" }}
          >
            <Trans>Trenutno ni objavljenih vozil.</Trans>
          </Text>
        )}

        {!isLoading && !error && sortedCars.length > 0 && (
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3 }}
            gap={6}
          >
            {sortedCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </SimpleGrid>
        )}
        </VStack>
      </Box>
    </Box>
  );
}


