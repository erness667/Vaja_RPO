"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
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
import { CarCard } from "./CarCard";
import { SortBar, type SortOption } from "../layout/SortBar";
import { Trans } from "@lingui/macro";
import { getStoredUser, isAuthenticated } from "@/lib/utils/auth-storage";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function MyPostsPage() {
  const router = useRouter();
  const currentUser = useMemo(() => getStoredUser(), []);
  const isLoggedIn = useMemo(() => isAuthenticated(), []);

  // Get current user's ID for filtering
  const sellerId = useMemo(() => currentUser?.id || null, [currentUser?.id]);

  // Memoize filters to prevent recreation on each render
  const filters = useMemo(() => ({ sellerId }), [sellerId]);

  const { cars, isLoading, error, refetch } = useCars(filters);
  const [sort, setSort] = useState<SortOption>("newest");

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  // Fetch cars when component mounts or sellerId changes
  useEffect(() => {
    if (sellerId) {
      void refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]); // Only depend on sellerId, not refetch

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

  if (!isLoggedIn) {
    return null; // Will redirect
  }

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <VStack gap={6} align="stretch">
        <Button
          variant="ghost"
          as={Link}
          href="/"
          alignSelf="flex-start"
          color={{ base: "gray.600", _dark: "gray.400" }}
          _hover={{ color: { base: "blue.600", _dark: "blue.400" } }}
        >
          <Icon as={LuArrowLeft} mr={2} />
          <Trans>Nazaj na seznam</Trans>
        </Button>

        <VStack align="stretch" gap={2}>
          <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
            <VStack align="start" gap={1}>
              <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
                <Trans>Moji oglasi</Trans>
              </Heading>
              <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                <Trans>Vsa vozila, ki ste jih objavili.</Trans>
              </Text>
            </VStack>

            {cars.length > 0 && (
              <SortBar value={sort} onChange={setSort} />
            )}
          </HStack>
        </VStack>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <Spinner size="lg" color="blue.500" />
          </Box>
        ) : error ? (
          <Box
            p={4}
            borderRadius="lg"
            bg={{ base: "red.50", _dark: "red.900" }}
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
          >
            <Text color={{ base: "red.800", _dark: "red.200" }}>{error}</Text>
          </Box>
        ) : sortedCars.length === 0 ? (
          <Box
            p={6}
            borderRadius="lg"
            bg={{ base: "gray.50", _dark: "gray.800" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            textAlign="center"
          >
            <Icon as={LuFileText} boxSize={8} color={{ base: "gray.400", _dark: "gray.500" }} mb={2} />
            <Text color={{ base: "gray.600", _dark: "gray.400" }} mb={3}>
              <Trans>Trenutno nimate objavljenih oglasov.</Trans>
            </Text>
            <Button as={Link} href="/create" colorPalette="blue">
              <Trans>Objavi prvi oglas</Trans>
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
            {sortedCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </PageShell>
  );
}

