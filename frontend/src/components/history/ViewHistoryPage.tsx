"use client";

import Link from "next/link";
import { useMemo } from "react";
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
import { LuArrowLeft, LuClock } from "react-icons/lu";
import { PageShell } from "@/components/layout/PageShell";
import { useViewHistory } from "@/lib/hooks/useViewHistory";
import { CarCard } from "../car/CarCard";
import type { Car } from "@/lib/types/car";
import { Trans } from "@lingui/macro";

export function ViewHistoryPage() {
  const { history, isLoading, error } = useViewHistory();

  const historyCars: { car: Car; viewedAt: string }[] = useMemo(() => {
    return history
      .filter((h) => h.car)
      .map((h) => ({ car: h.car as Car, viewedAt: h.viewedAt }));
  }, [history]);

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <VStack gap={6} align="stretch">
        <Link href="/" style={{ alignSelf: "flex-start" }}>
          <Button
            variant="ghost"
            color={{ base: "gray.600", _dark: "gray.400" }}
            _hover={{ color: { base: "blue.600", _dark: "blue.400" } }}
          >
            <Icon as={LuArrowLeft} mr={2} />
            <Trans>Nazaj na seznam</Trans>
          </Button>
        </Link>

        <VStack align="stretch" gap={2}>
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <Heading
                size="xl"
                color={{ base: "gray.900", _dark: "gray.100" }}
              >
                <Trans>Zgodovina ogledov</Trans>
              </Heading>
            </HStack>
          </HStack>
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            <Trans>Zadnjih 10 vozil, ki ste jih odprli (najnovejše na vrhu).</Trans>
          </Text>
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
        ) : historyCars.length === 0 ? (
          <Box
            p={6}
            borderRadius="lg"
            bg={{ base: "gray.50", _dark: "gray.800" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            textAlign="center"
          >
            <Icon
              as={LuClock}
              boxSize={8}
              color={{ base: "gray.400", _dark: "gray.500" }}
              mb={2}
            />
            <Text color={{ base: "gray.600", _dark: "gray.400" }}>
              <Trans>Še nimate ogledov. Začnite z raziskovanjem ponudbe.</Trans>
            </Text>
            <Link href="/">
              <Button mt={3} colorPalette="blue">
                <Trans>Na seznam vozil</Trans>
              </Button>
            </Link>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
            {historyCars.map(({ car, viewedAt }) => (
              <CarCard
                key={`${car.id}-${viewedAt}`}
                car={car}
                viewedAt={viewedAt}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </PageShell>
  );
}
