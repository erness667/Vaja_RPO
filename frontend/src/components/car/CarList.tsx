'use client';

import {
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { PageShell } from "@/components/layout/PageShell";
import { useCars } from "@/lib/hooks/useCars";
import { CarCard } from "./CarCard";

export function CarList() {
  const { cars, isLoading, error } = useCars();

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <VStack align="stretch" gap={6}>
        <Heading
          size="lg"
          color={{ base: "gray.800", _dark: "gray.100" }}
        >
          Najnovejši oglasi
        </Heading>

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

        {!isLoading && !error && cars.length === 0 && (
          <Text
            fontSize="sm"
            color={{ base: "gray.600", _dark: "gray.400" }}
          >
            Trenutno ni objavljenih vozil.
          </Text>
        )}

        {!isLoading && !error && cars.length > 0 && (
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3 }}
            gap={6}
          >
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </PageShell>
  );
}


