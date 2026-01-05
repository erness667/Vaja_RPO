"use client";

import {
  Box,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMemo } from "react";
import type { Car } from "@/lib/types/car";

interface CarPriceStatsProps {
  cars: Car[];
}

export function CarPriceStats({ cars }: CarPriceStatsProps) {
  const stats = useMemo(() => {
    if (cars.length === 0) {
      return {
        avg: 0,
        min: 0,
        max: 0,
        count: 0,
      };
    }

    const prices = cars.map((car) => car.price).filter((price) => price > 0);
    
    if (prices.length === 0) {
      return {
        avg: 0,
        min: 0,
        max: 0,
        count: 0,
      };
    }

    const sum = prices.reduce((acc, price) => acc + price, 0);
    const avg = sum / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return {
      avg: Math.round(avg),
      min,
      max,
      count: prices.length,
    };
  }, [cars]);

  if (stats.count === 0) {
    return (
      <Box
        p={4}
        borderRadius="md"
        bg={{ base: "gray.50", _dark: "gray.700" }}
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.600" }}
      >
        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
          No cars with prices available
        </Text>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      borderRadius="md"
      bg={{ base: "blue.50", _dark: "blue.900" }}
      borderWidth="1px"
      borderColor={{ base: "blue.200", _dark: "blue.700" }}
    >
      <VStack align="stretch" gap={2}>
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color={{ base: "blue.800", _dark: "blue.200" }}
        >
          Price Statistics ({stats.count} cars)
        </Text>
        <HStack justify="space-between" wrap="wrap" gap={4}>
          <VStack align="start" gap={1}>
            <Text
              fontSize="xs"
              color={{ base: "gray.600", _dark: "gray.400" }}
            >
              Average
            </Text>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={{ base: "blue.700", _dark: "blue.300" }}
            >
              {stats.avg.toLocaleString("sl-SI")} €
            </Text>
          </VStack>
          <VStack align="start" gap={1}>
            <Text
              fontSize="xs"
              color={{ base: "gray.600", _dark: "gray.400" }}
            >
              Minimum
            </Text>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={{ base: "green.700", _dark: "green.300" }}
            >
              {stats.min.toLocaleString("sl-SI")} €
            </Text>
          </VStack>
          <VStack align="start" gap={1}>
            <Text
              fontSize="xs"
              color={{ base: "gray.600", _dark: "gray.400" }}
            >
              Maximum
            </Text>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={{ base: "red.700", _dark: "red.300" }}
            >
              {stats.max.toLocaleString("sl-SI")} €
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
}

