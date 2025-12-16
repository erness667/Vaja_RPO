'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Badge,
  Icon,
  Spinner,
  Card,
  CardBody,
} from "@chakra-ui/react";
import {
  LuGauge,
  LuFuel,
  LuSettings2,
  LuPalette,
  LuCalendar,
  LuUsers,
  LuArrowLeft,
  LuStar,
} from "react-icons/lu";
import { PageShell } from "@/components/layout/PageShell";
import { useCar } from "@/lib/hooks/useCar";

interface CarDetailPageProps {
  carId: number | null;
}

export function CarDetailPage({ carId }: CarDetailPageProps) {
  const router = useRouter();
  const { car, isLoading, error } = useCar(carId);

  if (isLoading) {
    return (
      <PageShell maxWidthClass="max-w-6xl">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={{ base: "gray.600", _dark: "gray.400" }}>Nalaganje podrobnosti vozila...</Text>
          </VStack>
        </Box>
      </PageShell>
    );
  }

  if (error || !car) {
    return (
      <PageShell maxWidthClass="max-w-6xl">
        <VStack gap={4} align="stretch">
          <Button
            variant="ghost"
            leftIcon={<LuArrowLeft />}
            onClick={() => router.back()}
            alignSelf="flex-start"
          >
            Nazaj
          </Button>
          <Box
            p={6}
            borderRadius="xl"
            bg={{ base: "red.50", _dark: "red.900" }}
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
          >
            <Text color={{ base: "red.800", _dark: "red.200" }} fontWeight="medium">
              {error || "Vozilo ni bilo najdeno."}
            </Text>
          </Box>
        </VStack>
      </PageShell>
    );
  }

  const title = `${car.brand} ${car.model}`.trim();
  const price = `${car.price.toLocaleString("sl-SI")} €`;
  const mileageText = `${car.mileage.toLocaleString("sl-SI")} km`;
  const powerText = `${car.enginePower} kW`;
  const registrationDate = new Date(car.firstRegistrationDate).toLocaleDateString("sl-SI");

  // Get all images - main image first, then others
  const allImages = car.mainImageUrl
    ? [car.mainImageUrl, ...(car.imageUrls?.filter(url => url !== car.mainImageUrl) || [])]
    : car.imageUrls || [];

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <VStack gap={6} align="stretch">
        {/* Back Button */}
        <Button
          variant="ghost"
          leftIcon={<LuArrowLeft />}
          onClick={() => router.back()}
          alignSelf="flex-start"
          color={{ base: "gray.600", _dark: "gray.400" }}
          _hover={{ color: { base: "blue.600", _dark: "blue.400" } }}
        >
          Nazaj
        </Button>

        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
          {/* Images Section */}
          <VStack gap={4} align="stretch">
            {/* Main Image */}
            {allImages.length > 0 && (
              <Box
                position="relative"
                width="100%"
                aspectRatio="4/3"
                borderRadius="xl"
                overflow="hidden"
                bg={{ base: "gray.100", _dark: "gray.800" }}
                boxShadow="lg"
              >
                <Image
                  src={allImages[0]}
                  alt={title}
                  fill
                  style={{
                    objectFit: "cover",
                  }}
                  unoptimized
                  priority
                />
              </Box>
            )}

            {/* Thumbnail Grid */}
            {allImages.length > 1 && (
              <SimpleGrid columns={4} gap={3}>
                {allImages.slice(1, 5).map((imageUrl, index) => (
                  <Box
                    key={index}
                    position="relative"
                    aspectRatio="1"
                    borderRadius="lg"
                    overflow="hidden"
                    bg={{ base: "gray.100", _dark: "gray.800" }}
                    cursor="pointer"
                    _hover={{
                      transform: "scale(1.05)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                  >
                    <Image
                      src={imageUrl}
                      alt={`${title} - Slika ${index + 2}`}
                      fill
                      style={{
                        objectFit: "cover",
                      }}
                      unoptimized
                    />
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </VStack>

          {/* Details Section */}
          <VStack gap={6} align="stretch">
            {/* Title and Price */}
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between" align="flex-start" gap={4}>
                <VStack align="start" gap={2} flex={1}>
                  <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
                    {title}
                  </Heading>
                  <Badge
                    colorPalette="blue"
                    variant="solid"
                    fontSize="md"
                    fontWeight="bold"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {car.year}
                  </Badge>
                </VStack>
              </HStack>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                color={{ base: "blue.600", _dark: "blue.400" }}
              >
                {price}
              </Text>
            </VStack>

            <Box
              height="1px"
              bg={{ base: "gray.200", _dark: "gray.700" }}
              my={2}
            />

            {/* Specifications */}
            <Card.Root
              borderRadius="xl"
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              bg={{ base: "white", _dark: "gray.800" }}
            >
              <CardBody p={6}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" color={{ base: "gray.800", _dark: "gray.100" }} mb={2}>
                    Specifikacije
                  </Heading>
                  
                  <SimpleGrid columns={2} gap={4}>
                    <HStack gap={3}>
                      <Icon as={LuGauge} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          Prevoženih km
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {mileageText}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuFuel} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          Gorivo
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {car.fuelType}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuSettings2} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          Moč motorja
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {powerText}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuSettings2} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          Menjalnik
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {car.transmission}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuPalette} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          Barva
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {car.color}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuCalendar} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          Prva registracija
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {registrationDate}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuUsers} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          Predhodnih lastnikov
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {car.previousOwners}
                        </Text>
                      </VStack>
                    </HStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card.Root>

            {/* Equipment and Details */}
            {car.equipmentAndDetails && (
              <Card.Root
                borderRadius="xl"
                borderWidth="1px"
                borderColor={{ base: "gray.200", _dark: "gray.700" }}
                bg={{ base: "white", _dark: "gray.800" }}
              >
                <CardBody p={6}>
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color={{ base: "gray.800", _dark: "gray.100" }}>
                      Oprema in dodatni podatki
                    </Heading>
                    <Text
                      fontSize="sm"
                      color={{ base: "gray.700", _dark: "gray.300" }}
                      whiteSpace="pre-wrap"
                      lineHeight="1.6"
                    >
                      {car.equipmentAndDetails}
                    </Text>
                  </VStack>
                </CardBody>
              </Card.Root>
            )}
          </VStack>
        </SimpleGrid>
      </VStack>
    </PageShell>
  );
}

