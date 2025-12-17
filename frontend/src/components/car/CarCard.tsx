'use client';

import { useRouter } from "next/navigation";
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
  Icon,
} from "@chakra-ui/react";
import Image from "next/image";
import { LuChevronRight, LuGauge, LuFuel, LuSettings2, LuPalette, LuEye } from "react-icons/lu";
import type { Car } from "@/lib/types/car";
import { Trans } from "@lingui/macro";

interface CarCardProps {
  car: Car;
  viewedAt?: string;
}

export function CarCard({ car, viewedAt }: CarCardProps) {
  const router = useRouter();
  const title = `${car.brand} ${car.model}`.trim();
  const price = `${car.price.toLocaleString("sl-SI")} €`;
  const mileageText = `${car.mileage.toLocaleString("sl-SI")} km`;
  const powerText = `${car.enginePower} kW`;
  const viewsText = `${(car.viewCount ?? 0).toLocaleString("sl-SI")} ogledov`;
  
  // Get image URL - prefer mainImageUrl, then first imageUrls, or null
  const imageUrl = car.mainImageUrl || car.imageUrls?.[0] || null;

  const handleDetailsClick = () => {
    router.push(`/cars/${car.id}`);
  };

  return (
    <Card.Root
      height="100%"
      borderRadius="xl"
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      bg={{ base: "white", _dark: "gray.900" }}
      overflow="hidden"
      display="flex"
      flexDirection="column"
      boxShadow={{ base: "sm", _dark: "lg" }}
      _hover={{
        borderColor: "blue.500",
        boxShadow: { base: "0 10px 30px rgba(37, 99, 235, 0.2)", _dark: "0 10px 30px rgba(37, 99, 235, 0.4)" },
        transform: "translateY(-4px)",
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      {/* Car Image */}
      <Box
        height="200px"
        position="relative"
        bgGradient={{ base: "linear(to-tr, gray.200, gray.300)", _dark: "linear(to-tr, gray.800, gray.700)" }}
        overflow="hidden"
      >
        {viewedAt && (
          <Box position="absolute" top={3} left={3} zIndex={1}>
            <Badge
              colorPalette="blue"
              variant="solid"
              display="inline-flex"
              alignItems="center"
              gap={1}
              px={2.5}
              py={1}
              boxShadow="md"
            >
              <LuEye />
              {new Date(viewedAt).toLocaleString("sl-SI", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          </Box>
        )}
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={title}
              fill
              style={{
                objectFit: "cover",
              }}
              unoptimized
            />
            {/* Gradient overlay for better text readability */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              height="60px"
              bgGradient="linear(to-t, blackAlpha.600, transparent)"
            />
          </>
        ) : (
          <Box
            position="absolute"
            inset="16px"
            borderRadius="lg"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor={{ base: "gray.300", _dark: "whiteAlpha.300" }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontSize="sm"
              color={{ base: "gray.400", _dark: "gray.500" }}
            >
              Ni slike
            </Text>
          </Box>
        )}
        {/* Year Badge on Image */}
        <Box
          position="absolute"
          top={3}
          right={3}
        >
          <Badge
            colorPalette="blue"
            variant="solid"
            fontSize="sm"
            fontWeight="bold"
            px={3}
            py={1}
            borderRadius="full"
            boxShadow="md"
          >
            {car.year}
          </Badge>
        </Box>
      </Box>

      <CardBody flex="1" p={5}>
        <VStack align="stretch" gap={4}>
          {/* Title */}
          <Text
            fontWeight="bold"
            fontSize="xl"
            color={{ base: "gray.900", _dark: "gray.100" }}
            lineHeight="1.3"
            minH="3.2em"
         
          >
            {title}
          </Text>

          {/* Price */}
          <Box>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={{ base: "blue.600", _dark: "blue.400" }}
              lineHeight="1.2"
            >
              {price}
            </Text>
            <HStack gap={2} color={{ base: "gray.500", _dark: "gray.400" }} fontSize="xs" mt={1}>
              <Icon as={LuEye} boxSize={4} />
              <Text>{viewsText}</Text>
            </HStack>
          </Box>

          {/* Main Specs with Icons */}
          <VStack align="stretch" gap={2.5}>
            <HStack gap={3} color={{ base: "gray.700", _dark: "gray.300" }}>
              <Icon as={LuGauge} boxSize={4} color={{ base: "blue.500", _dark: "blue.400" }} />
              <Text fontSize="sm" fontWeight="medium">
                {mileageText}
              </Text>
            </HStack>
            
            <HStack gap={3} color={{ base: "gray.700", _dark: "gray.300" }}>
              <Icon as={LuFuel} boxSize={4} color={{ base: "blue.500", _dark: "blue.400" }} />
              <Text fontSize="sm" fontWeight="medium">
                {car.fuelType}
              </Text>
            </HStack>

            <HStack gap={3} color={{ base: "gray.700", _dark: "gray.300" }}>
              <Icon as={LuSettings2} boxSize={4} color={{ base: "blue.500", _dark: "blue.400" }} />
              <Text fontSize="sm" fontWeight="medium">
                {powerText} • {car.transmission}
              </Text>
            </HStack>

            <HStack gap={3} color={{ base: "gray.600", _dark: "gray.400" }}>
              <Icon as={LuPalette} boxSize={4} color={{ base: "gray.500", _dark: "gray.500" }} />
              <Text fontSize="sm">
                {car.color}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </CardBody>

      <Box
        borderTopWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
      />

      <CardFooter p={5} pt={4}>
        <Button
          width="full"
          colorPalette="blue"
          variant="solid"
          size="md"
          fontWeight="semibold"
          onClick={handleDetailsClick}
          _hover={{
            transform: "translateX(2px)",
          }}
          transition="all 0.2s"
        >
          <Trans>Podrobnosti vozila</Trans>
        </Button>
      </CardFooter>
    </Card.Root>
  );
}


