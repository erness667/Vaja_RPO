"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Icon,
  Spinner,
  Card,
  CardBody,
  Input,
  Table,
  IconButton,
} from "@chakra-ui/react";
import { Trans, t } from "@lingui/macro";
import {
  LuGauge,
  LuFuel,
  LuSettings2,
  LuPalette,
  LuCalendar,
  LuUsers,
  LuX,
  LuSearch,
  LuArrowRight,
} from "react-icons/lu";
import { useCar } from "@/lib/hooks/useCar";
import { getApiCars } from "@/client";
import "@/lib/api-client";
import type { Car } from "@/lib/types/car";

const MAX_COMPARISON_CARS = 3;
const COMPARISON_STORAGE_KEY = "car_comparison_ids";

// Helper functions for localStorage
const getStoredComparisonIds = (): number[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
    if (!stored) return [];
    const ids = JSON.parse(stored) as number[];
    return ids.filter((id) => typeof id === "number" && id > 0).slice(0, MAX_COMPARISON_CARS);
  } catch {
    return [];
  }
};

const saveComparisonIds = (ids: number[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore localStorage errors
  }
};

export function CarComparisonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCarIds, setSelectedCarIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Car[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Initialize selected cars from localStorage on mount
  useEffect(() => {
    if (!isInitialized.current) {
      const storedIds = getStoredComparisonIds();
      setSelectedCarIds(storedIds);
      isInitialized.current = true;
    }
  }, []);

  // Save to localStorage whenever selectedCarIds changes
  useEffect(() => {
    if (isInitialized.current) {
      saveComparisonIds(selectedCarIds);
    }
  }, [selectedCarIds]);

  // Handle URL parameters for adding cars from detail pages
  useEffect(() => {
    if (!isInitialized.current) return; // Wait for localStorage initialization
    
    const carsParam = searchParams?.get("cars");
    if (carsParam) {
      const newCarIds = carsParam
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id) && id > 0);
      
      if (newCarIds.length > 0) {
        // Merge with existing selected cars, avoiding duplicates
        setSelectedCarIds((prev) => {
          const merged = [...prev];
          for (const newId of newCarIds) {
            if (!merged.includes(newId) && merged.length < MAX_COMPARISON_CARS) {
              merged.push(newId);
            }
          }
          return merged;
        });
        // Clear the URL parameter after reading it
        router.replace("/compare", { scroll: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.get("cars"), isInitialized.current]);

  // Perform search with debouncing
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      return;
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await getApiCars({
          query: {
            page: 1,
            pageSize: 10,
            ...(searchQuery ? { search: searchQuery } : {}),
          } as { page: number; pageSize: number; search?: string },
        });

        if (response.error || (response.response && !response.response.ok)) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        if (response.data) {
          const raw = response.data as { cars?: Car[] } | undefined;
          const data = raw?.cars ?? [];
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);


  const handleAddCar = useCallback(
    (carId: number) => {
      if (selectedCarIds.includes(carId)) {
        return; // Already selected
      }
      if (selectedCarIds.length >= MAX_COMPARISON_CARS) {
        return; // Max limit reached
      }
      setSelectedCarIds([...selectedCarIds, carId]);
      setSearchQuery("");
    },
    [selectedCarIds]
  );

  const handleRemoveCar = useCallback(
    (carId: number) => {
      setSelectedCarIds(selectedCarIds.filter((id) => id !== carId));
    },
    [selectedCarIds]
  );

  const filteredSearchResults = useMemo(() => {
    if (!searchResults || searchQuery.length < 3) return [];
    return searchResults.filter(
      (car) => !selectedCarIds.includes(car.id)
    );
  }, [searchResults, searchQuery, selectedCarIds]);

  return (
    <Box
      suppressHydrationWarning
      py={8}
      px={4}
      bgGradient={{ base: "linear(to-br, gray.50, gray.100, gray.50)", _dark: "linear(to-br, gray.900, gray.950, gray.900)" }}
      minH="calc(100vh - 5rem)"
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
        <VStack gap={6} align="stretch">
          {/* Header */}
          <VStack align="start" gap={2}>
            <Heading
              size="xl"
              color={{ base: "gray.800", _dark: "gray.100" }}
            >
              <Trans>Primerjava vozil</Trans>
            </Heading>
            <Text
              fontSize="md"
              color={{ base: "gray.600", _dark: "gray.400" }}
            >
              <Trans>
                Primerjaj do {MAX_COMPARISON_CARS} vozil med seboj in si oglej
                njihove specifikacije
              </Trans>
            </Text>
          </VStack>

          {/* Car Selection Section */}
          <Card.Root
            borderRadius="xl"
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            bg={{ base: "white", _dark: "gray.900" }}
          >
            <CardBody p={6}>
              <VStack align="stretch" gap={4}>
                <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                  <Trans>Izberi vozila</Trans>
                </Heading>

                {/* Search Input */}
                <Box position="relative">
                  <Input
                    placeholder={t`Išči vozila...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    borderWidth="2px"
                    borderColor={{ base: "gray.300", _dark: "gray.600" }}
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                    }}
                    pr="50px"
                  />
                  <Icon
                    as={LuSearch}
                    position="absolute"
                    right="16px"
                    top="50%"
                    transform="translateY(-50%)"
                    boxSize={5}
                    color={{ base: "gray.400", _dark: "gray.500" }}
                  />
                </Box>

                {/* Search Results */}
                {searchQuery.length >= 3 && (
                  <Box
                    position="relative"
                    maxH="400px"
                    overflowY="auto"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={{ base: "gray.200", _dark: "gray.700" }}
                    bg={{ base: "white", _dark: "gray.800" }}
                  >
                    {isSearching ? (
                      <Box p={8} textAlign="center">
                        <Spinner size="lg" color="blue.500" />
                      </Box>
                    ) : filteredSearchResults.length > 0 ? (
                      <VStack align="stretch" gap={0}>
                        {filteredSearchResults.map((car) => {
                          const imageUrl =
                            car.mainImageUrl || car.imageUrls?.[0] || null;
                          const title = `${car.brand} ${car.model}`.trim();
                          const price = `${car.price.toLocaleString("sl-SI")} €`;

                          return (
                            <Box
                              key={car.id}
                              as="button"
                              onClick={() => {
                                if (selectedCarIds.length < MAX_COMPARISON_CARS) {
                                  handleAddCar(car.id);
                                }
                              }}
                              p={4}
                              _hover={{
                                bg: { base: "gray.50", _dark: "gray.700" },
                              }}
                              borderBottomWidth="1px"
                              borderBottomColor={{
                                base: "gray.200",
                                _dark: "gray.700",
                              }}
                              _last={{ borderBottomWidth: 0 }}
                              textAlign="left"
                              width="100%"
                              opacity={
                                selectedCarIds.length >= MAX_COMPARISON_CARS ? 0.5 : 1
                              }
                              cursor={
                                selectedCarIds.length >= MAX_COMPARISON_CARS ? "not-allowed" : "pointer"
                              }
                            >
                              <HStack gap={3} align="center">
                                <Box
                                  position="relative"
                                  width="80px"
                                  height="60px"
                                  borderRadius="md"
                                  overflow="hidden"
                                  flexShrink={0}
                                  bg={{ base: "gray.100", _dark: "gray.700" }}
                                >
                                  {imageUrl ? (
                                    <Image
                                      src={imageUrl}
                                      alt={title}
                                      fill
                                      style={{ objectFit: "cover" }}
                                      unoptimized
                                    />
                                  ) : (
                                    <Box
                                      position="absolute"
                                      inset={0}
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      borderWidth="1px"
                                      borderStyle="dashed"
                                      borderColor={{
                                        base: "gray.300",
                                        _dark: "gray.600",
                                      }}
                                    >
                                      <Text fontSize="xs" color="gray.400">
                                        <Trans>Ni slike</Trans>
                                      </Text>
                                    </Box>
                                  )}
                                </Box>
                                <VStack align="start" gap={1} flex={1} minW={0}>
                                  <Text
                                    fontWeight="bold"
                                    fontSize="sm"
                                    color={{ base: "gray.900", _dark: "gray.100" }}
                                  >
                                    {title}
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    color={{ base: "gray.600", _dark: "gray.400" }}
                                  >
                                    {car.year} • {car.mileage.toLocaleString("sl-SI")} km
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color={{ base: "blue.600", _dark: "blue.400" }}
                                  >
                                    {price}
                                  </Text>
                                </VStack>
                                <Icon
                                  as={LuArrowRight}
                                  boxSize={5}
                                  color={{ base: "blue.500", _dark: "blue.400" }}
                                />
                              </HStack>
                            </Box>
                          );
                        })}
                      </VStack>
                    ) : (
                      <Box p={4} textAlign="center">
                        <Text color={{ base: "gray.500", _dark: "gray.400" }}>
                          <Trans>Ni rezultatov</Trans>
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Selected Cars Preview */}
                {selectedCarIds.length > 0 && (
                  <VStack align="stretch" gap={3} mt={4}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={{ base: "gray.700", _dark: "gray.300" }}
                    >
                      <Trans>
                        Izbrana vozila ({selectedCarIds.length}/{MAX_COMPARISON_CARS})
                      </Trans>
                    </Text>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
                      {selectedCarIds.map((carId) => (
                        <SelectedCarCard
                          key={carId}
                          carId={carId}
                          onRemove={() => handleRemoveCar(carId)}
                        />
                      ))}
                      {selectedCarIds.length < MAX_COMPARISON_CARS && (
                        <Card.Root
                          borderRadius="lg"
                          borderWidth="2px"
                          borderStyle="dashed"
                          borderColor={{ base: "gray.300", _dark: "gray.600" }}
                          bg={{ base: "gray.50", _dark: "gray.800" }}
                          minH="200px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <CardBody>
                            <VStack gap={2}>
                              <Text
                                fontSize="sm"
                                color={{ base: "gray.500", _dark: "gray.400" }}
                                textAlign="center"
                              >
                                <Trans>Dodaj vozilo</Trans>
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card.Root>
                      )}
                    </SimpleGrid>
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card.Root>

          {/* Comparison Table */}
          {selectedCarIds.length >= 2 && (
            <ComparisonTable carIds={selectedCarIds} />
          )}

          {selectedCarIds.length < 2 && (
            <Card.Root
              borderRadius="xl"
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              bg={{ base: "white", _dark: "gray.900" }}
            >
              <CardBody p={8} textAlign="center">
                <Text
                  fontSize="lg"
                  color={{ base: "gray.500", _dark: "gray.400" }}
                >
                  <Trans>
                    Izberi vsaj 2 vozili za primerjavo
                  </Trans>
                </Text>
              </CardBody>
            </Card.Root>
          )}
        </VStack>
      </Box>
    </Box>
  );
}

interface SelectedCarCardProps {
  carId: number;
  onRemove: () => void;
}

function SelectedCarCard({ carId, onRemove }: SelectedCarCardProps) {
  const { car, isLoading } = useCar(carId);
  const router = useRouter();

  if (isLoading) {
    return (
      <Card.Root borderRadius="lg" borderWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
        <CardBody p={4}>
          <Box display="flex" alignItems="center" justifyContent="center" minH="200px">
            <Spinner size="lg" color="blue.500" />
          </Box>
        </CardBody>
      </Card.Root>
    );
  }

  if (!car) {
    return null;
  }

  const imageUrl = car.mainImageUrl || car.imageUrls?.[0] || null;
  const title = `${car.brand} ${car.model}`.trim();
  const price = `${car.price.toLocaleString("sl-SI")} €`;

  return (
    <Card.Root
      borderRadius="lg"
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      bg={{ base: "white", _dark: "gray.800" }}
      position="relative"
      overflow="hidden"
    >
      <IconButton
        aria-label={t`Odstrani`}
        position="absolute"
        top={2}
        right={2}
        zIndex={1}
        size="sm"
        colorPalette="red"
        variant="solid"
        onClick={onRemove}
      >
        <LuX />
      </IconButton>
      <Box
        height="150px"
        position="relative"
        bgGradient={{
          base: "linear(to-tr, gray.200, gray.300)",
          _dark: "linear(to-tr, gray.800, gray.700)",
        }}
        overflow="hidden"
        onClick={() => router.push(`/cars/${car.id}`)}
        cursor="pointer"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
            unoptimized
          />
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
            <Text fontSize="sm" color={{ base: "gray.400", _dark: "gray.500" }}>
              <Trans>Ni slike</Trans>
            </Text>
          </Box>
        )}
        <Box
          position="absolute"
          top={2}
          left={2}
        >
          <Badge
            colorPalette="blue"
            variant="solid"
            fontSize="sm"
            fontWeight="bold"
            px={2}
            py={1}
            borderRadius="full"
          >
            {car.year}
          </Badge>
        </Box>
      </Box>
      <CardBody p={4}>
        <VStack align="stretch" gap={2}>
          <Text
            fontWeight="bold"
            fontSize="md"
            color={{ base: "gray.900", _dark: "gray.100" }}
            lineHeight="1.3"
            onClick={() => router.push(`/cars/${car.id}`)}
            cursor="pointer"
            _hover={{ color: "blue.500" }}
          >
            {title}
          </Text>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={{ base: "blue.600", _dark: "blue.400" }}
          >
            {price}
          </Text>
        </VStack>
      </CardBody>
    </Card.Root>
  );
}

interface ComparisonTableProps {
  carIds: number[];
}

function ComparisonTable({ carIds }: ComparisonTableProps) {
  // Always call hooks for up to 3 cars (hooks must be called unconditionally)
  const car1Data = useCar(carIds[0] || null);
  const car2Data = useCar(carIds[1] || null);
  const car3Data = useCar(carIds[2] || null);

  const carsData = [
    carIds[0] ? { id: carIds[0], car: car1Data.car, isLoading: car1Data.isLoading } : null,
    carIds[1] ? { id: carIds[1], car: car2Data.car, isLoading: car2Data.isLoading } : null,
    carIds[2] ? { id: carIds[2], car: car3Data.car, isLoading: car3Data.isLoading } : null,
  ].filter((data): data is { id: number; car: Car | null; isLoading: boolean } => data !== null);

  const allLoaded = carsData.every((data) => !data.isLoading);
  const allCars = carsData.map((data) => data.car).filter((car): car is Car => car !== null);

  if (!allLoaded) {
    return (
      <Card.Root
        borderRadius="xl"
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        bg={{ base: "white", _dark: "gray.900" }}
      >
        <CardBody p={8} textAlign="center">
          <Spinner size="lg" color="blue.500" />
          <Text mt={4} color={{ base: "gray.600", _dark: "gray.400" }}>
            <Trans>Nalaganje podatkov...</Trans>
          </Text>
        </CardBody>
      </Card.Root>
    );
  }

  if (allCars.length < 2) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("sl-SI", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const specs = [
    {
      label: t`Znamka in model`,
      getValue: (car: Car) => `${car.brand} ${car.model}`,
      icon: LuSettings2,
    },
    {
      label: t`Letnik`,
      getValue: (car: Car) => car.year.toString(),
      icon: LuCalendar,
    },
    {
      label: t`Prva registracija`,
      getValue: (car: Car) => formatDate(car.firstRegistrationDate),
      icon: LuCalendar,
    },
    {
      label: t`Prevoženih km`,
      getValue: (car: Car) => `${car.mileage.toLocaleString("sl-SI")} km`,
      icon: LuGauge,
    },
    {
      label: t`Predhodnih lastnikov`,
      getValue: (car: Car) => car.previousOwners.toString(),
      icon: LuUsers,
    },
    {
      label: t`Vrsta goriva`,
      getValue: (car: Car) => car.fuelType,
      icon: LuFuel,
    },
    {
      label: t`Moč motorja`,
      getValue: (car: Car) => `${car.enginePower} kW`,
      icon: LuSettings2,
    },
    {
      label: t`Menjalnik`,
      getValue: (car: Car) => car.transmission,
      icon: LuSettings2,
    },
    {
      label: t`Barva`,
      getValue: (car: Car) => car.color,
      icon: LuPalette,
    },
    {
      label: t`Cena`,
      getValue: (car: Car) => `${car.price.toLocaleString("sl-SI")} €`,
      icon: undefined,
    },
  ];

  return (
    <Card.Root
      borderRadius="xl"
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      bg={{ base: "white", _dark: "gray.900" }}
    >
      <CardBody p={0}>
        <Box overflowX="auto" width="100%">
          <Table.Root width="100%">
            <Table.Header>
              <Table.Row bg={{ base: "gray.50", _dark: "gray.800" }}>
                <Table.ColumnHeader minW="200px" color={{ base: "gray.700", _dark: "gray.300" }} fontWeight="semibold">
                  <Trans>Specifikacija</Trans>
                </Table.ColumnHeader>
                {allCars.map((car) => (
                  <Table.ColumnHeader
                    key={car.id}
                    textAlign="center"
                    color={{ base: "gray.700", _dark: "gray.300" }}
                    fontWeight="semibold"
                  >
                    <VStack gap={2} align="center" p={2}>
                      <Box
                        position="relative"
                        width="120px"
                        height="80px"
                        borderRadius="md"
                        overflow="hidden"
                        bg={{ base: "gray.100", _dark: "gray.700" }}
                      >
                        {car.mainImageUrl || car.imageUrls?.[0] ? (
                          <Image
                            src={car.mainImageUrl || car.imageUrls?.[0] || ""}
                            alt={`${car.brand} ${car.model}`}
                            fill
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        ) : (
                          <Box
                            position="absolute"
                            inset={0}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderWidth="1px"
                            borderStyle="dashed"
                            borderColor={{
                              base: "gray.300",
                              _dark: "gray.600",
                            }}
                          >
                            <Text fontSize="xs" color="gray.400">
                              <Trans>Ni slike</Trans>
                            </Text>
                          </Box>
                        )}
                      </Box>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={{ base: "gray.900", _dark: "gray.100" }}
                        textAlign="center"
                      >
                        {car.brand} {car.model}
                      </Text>
                    </VStack>
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {specs.map((spec, index) => (
                <Table.Row
                  key={index}
                  _hover={{
                    bg: { base: "gray.50", _dark: "gray.800" },
                  }}
                >
                  <Table.Cell
                    fontWeight="medium"
                    color={{ base: "gray.700", _dark: "gray.300" }}
                  >
                    <HStack gap={2}>
                      {spec.icon && (
                        <Icon
                          as={spec.icon}
                          boxSize={4}
                          color={{ base: "blue.500", _dark: "blue.400" }}
                        />
                      )}
                      <Text>{spec.label}</Text>
                    </HStack>
                  </Table.Cell>
                  {allCars.map((car) => (
                    <Table.Cell
                      key={car.id}
                      textAlign="center"
                      color={{ base: "gray.600", _dark: "gray.400" }}
                    >
                      {spec.getValue(car)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </CardBody>
    </Card.Root>
  );
}

