'use client';

import {
  Box,
  Card,
  CardBody,
  CardFooter,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  Stack,
} from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import type { Car } from "@/lib/types/car";

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  const title = `${car.brand} ${car.model}`.trim();
  const price = `${car.price.toLocaleString("sl-SI")} €`;
  const mileageText = `${car.mileage.toLocaleString("sl-SI")} km`;
  const powerText = `${car.enginePower} kW`;

  return (
    <Card
      height="100%"
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      bg={{ base: "white", _dark: "gray.900" }}
      overflow="hidden"
      display="flex"
      flexDirection="column"
      _hover={{
        borderColor: "blue.500",
        boxShadow: "0 10px 30px rgba(37, 99, 235, 0.35)",
        transform: "translateY(-2px)",
      }}
      transition="all 0.2s ease"
    >
      {/* Image placeholder */}
      <Box
        bgGradient="linear(to-tr, gray.800, gray.700)"
        height="180px"
        position="relative"
      >
        <Box
          position="absolute"
          inset="16px"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="whiteAlpha.300"
        />
      </Box>

      <CardBody flex="1">
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between" align="flex-start" gap={2}>
            <Text
              fontWeight="semibold"
              fontSize="lg"
              noOfLines={1}
              color={{ base: "gray.900", _dark: "gray.100" }}
            >
              {title}
            </Text>
            <Badge
              colorPalette="blue"
              fontWeight="semibold"
              px={2}
              py={0.5}
              borderRadius="full"
            >
              {car.year}
            </Badge>
          </HStack>

          <Text
            fontSize="xl"
            fontWeight="bold"
            color={{ base: "blue.600", _dark: "blue.300" }}
          >
            {price}
          </Text>

          <Stack
            direction="row"
            spacing={4}
            fontSize="sm"
            color={{ base: "gray.600", _dark: "gray.300" }}
          >
            <Text noOfLines={1}>{mileageText}</Text>
            <Text>• {car.fuelType}</Text>
            <Text>• {powerText}</Text>
          </Stack>

          <Stack
            direction="row"
            spacing={4}
            fontSize="xs"
            color={{ base: "gray.500", _dark: "gray.400" }}
          >
            <Text noOfLines={1}>{car.transmission}</Text>
            <Text noOfLines={1}>• {car.color}</Text>
          </Stack>
        </VStack>
      </CardBody>

      <Box
        borderTopWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
      />

      <CardFooter>
        <Button
          width="full"
          variant="outline"
          colorPalette="blue"
          rightIcon={<LuChevronRight />}
        >
          Podrobnosti vozila
        </Button>
      </CardFooter>
    </Card>
  );
}


