'use client';

import Link from "next/link";
import {
  Box,
  VStack,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  Button,
  Icon,
} from "@chakra-ui/react";
import { LuArrowLeft, LuHeart } from "react-icons/lu";
import { PageShell } from "@/components/layout/PageShell";
import { useFavourites } from "@/lib/hooks/useFavourites";
import type { Car } from "@/lib/types/car";
import { CarCard } from "./CarCard";

export function FavouritesPage() {
  const { favourites, isLoading, error } = useFavourites();

  // Map favourites to cars for display
  const favouriteCars: Car[] = favourites
    .map((f) => f.car)
    .filter((c): c is Car => Boolean(c));

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
          Nazaj na seznam
        </Button>

        <VStack align="stretch" gap={2}>
          <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
            Moje priljubljene
          </Heading>
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            Vsa vozila, ki ste jih dodali med priljubljene.
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
        ) : favouriteCars.length === 0 ? (
          <Box
            p={6}
            borderRadius="lg"
            bg={{ base: "gray.50", _dark: "gray.800" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            textAlign="center"
          >
            <Icon as={LuHeart} boxSize={8} color={{ base: "gray.400", _dark: "gray.500" }} mb={2} />
            <Text color={{ base: "gray.600", _dark: "gray.400" }} mb={3}>
              Trenutno nimate priljubljenih vozil.
            </Text>
            <Button as={Link} href="/" colorPalette="blue">
              Nazaj na iskanje
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
            {favouriteCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </PageShell>
  );
}

