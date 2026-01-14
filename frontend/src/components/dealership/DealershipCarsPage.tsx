"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  VStack,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  Button,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { LuArrowLeft, LuFileText } from "react-icons/lu";
import { PageShell } from "@/components/layout/PageShell";
import { useCars } from "@/lib/hooks/useCars";
import { useUserDealership } from "@/lib/hooks/useUserDealership";
import { CarCard } from "../car/CarCard";
import { SortBar, type SortOption } from "../layout/SortBar";
import { Trans } from "@lingui/macro";
import { DealershipManageMenu } from "./DealershipManageMenu";

export function DealershipCarsPage() {
  const router = useRouter();
  const { dealership, isLoading: isLoadingDealership } = useUserDealership();

  // Get dealership ID for filtering
  const dealershipId = useMemo(() => dealership?.id ?? null, [dealership?.id]);

  // Memoize filters to prevent recreation on each render
  const filters = useMemo(() => ({ dealershipId }), [dealershipId]);

  const { cars, isLoading, error, refetch } = useCars(filters);
  const [sort, setSort] = useState<SortOption>("newest");

  // Fetch cars when component mounts or dealershipId changes
  useEffect(() => {
    if (dealershipId) {
      void refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealershipId]); // Only depend on dealershipId, not refetch

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

  if (isLoadingDealership) {
    return (
      <PageShell maxWidthClass="max-w-6xl">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
        </Box>
      </PageShell>
    );
  }

  if (!dealership) {
    return (
      <PageShell maxWidthClass="max-w-6xl">
        <VStack gap={4} align="center" py={8}>
          <Icon as={LuFileText} boxSize={16} color={{ base: "gray.400", _dark: "gray.500" }} />
          <Heading size="lg" color={{ base: "gray.700", _dark: "gray.300" }}>
            <Trans>Ni prodajalnice</Trans>
          </Heading>
          <Text color={{ base: "gray.600", _dark: "gray.400" }} textAlign="center">
            <Trans>
              Nimate odobrene prodajalnice.
            </Trans>
          </Text>
          <Button
            colorPalette="blue"
            onClick={() => router.push("/dealerships/manage")}
          >
            <Trans>Nazaj</Trans>
          </Button>
        </VStack>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <VStack gap={6} align="stretch">
        <Button
          variant="ghost"
          onClick={() => router.push("/dealerships/manage")}
          alignSelf="flex-start"
          color={{ base: "gray.600", _dark: "gray.400" }}
          _hover={{ color: { base: "blue.600", _dark: "blue.400" } }}
        >
          <Icon as={LuArrowLeft} mr={2} />
          <Trans>Nazaj</Trans>
        </Button>

        <VStack align="stretch" gap={2}>
          <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
            <VStack align="start" gap={1}>
              <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
                <Trans>Objavljeni avtomobili</Trans>
              </Heading>
              <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                <Trans>Prodajalnica: {dealership.name}</Trans>
              </Text>
            </VStack>
            <DealershipManageMenu />
          </HStack>
        </VStack>

        <SortBar value={sort} onChange={setSort} />

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="blue.500" />
          </Box>
        ) : error ? (
          <Box
            p={6}
            borderRadius="lg"
            bg={{ base: "red.50", _dark: "red.900" }}
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
            textAlign="center"
          >
            <Text color={{ base: "red.800", _dark: "red.200" }}>{error}</Text>
          </Box>
        ) : sortedCars.length === 0 ? (
          <Box
            p={12}
            borderRadius="lg"
            bg={{ base: "gray.50", _dark: "gray.900" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            textAlign="center"
          >
            <Icon as={LuFileText} boxSize={16} color={{ base: "gray.400", _dark: "gray.500" }} mb={4} />
            <Heading size="md" color={{ base: "gray.700", _dark: "gray.300" }} mb={2}>
              <Trans>Ni objavljenih avtomobilov</Trans>
            </Heading>
            <Text color={{ base: "gray.600", _dark: "gray.400" }}>
              <Trans>Ta prodajalnica še ni objavila nobenega avtomobila.</Trans>
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {sortedCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </PageShell>
  );
}
