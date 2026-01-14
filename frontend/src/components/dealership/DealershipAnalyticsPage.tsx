"use client";

import { useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
} from "@chakra-ui/react";
import { Trans, t } from "@lingui/macro";
import { useUserDealership } from "@/lib/hooks/useUserDealership";
import { useDealershipAnalytics } from "@/lib/hooks/useDealershipAnalytics";
import { PageShell } from "@/components/layout/PageShell";
import { LuTrendingUp, LuEye, LuHeart, LuClock, LuCar, LuEuro } from "react-icons/lu";
import { BrandDistributionChart } from "./analytics/BrandDistributionChart";
import { FuelTypeDistributionChart } from "./analytics/FuelTypeDistributionChart";
import { WorkerActivityChart } from "./analytics/WorkerActivityChart";
import { DealershipManageMenu } from "./DealershipManageMenu";

export function DealershipAnalyticsPage() {
  const { dealership, isLoading: isLoadingDealership } = useUserDealership();
  const { analytics, isLoading: isLoadingAnalytics, error } = useDealershipAnalytics(dealership?.id ?? null);

  if (isLoadingDealership || isLoadingAnalytics) {
    return (
      <PageShell>
        <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
          <Spinner size="xl" color="blue.500" />
        </Box>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <Box
          p={4}
          borderRadius="md"
          bg={{ base: "red.50", _dark: "red.900" }}
          borderWidth="1px"
          borderColor={{ base: "red.200", _dark: "red.700" }}
        >
          <Text color={{ base: "red.800", _dark: "red.200" }}>{error}</Text>
        </Box>
      </PageShell>
    );
  }

  if (!analytics) {
    return (
      <PageShell>
        <Text><Trans>Ni podatkov za analitiko</Trans></Text>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <VStack gap={6} align="stretch">
        <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
          <Heading size="xl" color={{ base: "gray.800", _dark: "gray.100" }}>
            <Trans>Analitika avtohiše</Trans>
          </Heading>
          <DealershipManageMenu />
        </HStack>

          {/* Overview Stats */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
            <Card.Root>
              <CardBody>
                <VStack align="start" gap={2}>
                  <HStack gap={2} color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Icon as={LuCar} boxSize={5} />
                    <Text fontSize="sm" fontWeight="medium">
                      <Trans>Skupno avtomobilov</Trans>
                    </Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color={{ base: "gray.900", _dark: "gray.100" }}>
                    {analytics.overview.totalCars}
                  </Text>
                </VStack>
              </CardBody>
            </Card.Root>

            <Card.Root>
              <CardBody>
                <VStack align="start" gap={2}>
                  <HStack gap={2} color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Icon as={LuEuro} boxSize={5} />
                    <Text fontSize="sm" fontWeight="medium">
                      <Trans>Skupna vrednost</Trans>
                    </Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color={{ base: "gray.900", _dark: "gray.100" }}>
                    {analytics.overview.totalValue.toLocaleString("sl-SI", {
                      maximumFractionDigits: 0,
                    })} €
                  </Text>
                  <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                    <Trans>Povprečna cena: {analytics.overview.averagePrice.toLocaleString("sl-SI", {
                      maximumFractionDigits: 0,
                    })} €</Trans>
                  </Text>
                </VStack>
              </CardBody>
            </Card.Root>

            <Card.Root>
              <CardBody>
                <VStack align="start" gap={2}>
                  <HStack gap={2} color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Icon as={LuEye} boxSize={5} />
                    <Text fontSize="sm" fontWeight="medium">
                      <Trans>Skupni ogledi</Trans>
                    </Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color={{ base: "gray.900", _dark: "gray.100" }}>
                    {analytics.overview.totalViews}
                  </Text>
                  <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                    <Trans>Priljubljeni: {analytics.overview.totalFavourites}</Trans>
                  </Text>
                </VStack>
              </CardBody>
            </Card.Root>

            <Card.Root>
              <CardBody>
                <VStack align="start" gap={2}>
                  <HStack gap={2} color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Icon as={LuClock} boxSize={5} />
                    <Text fontSize="sm" fontWeight="medium">
                      <Trans>Povprečni čas</Trans>
                    </Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color={{ base: "gray.900", _dark: "gray.100" }}>
                    {Math.round(analytics.overview.averageDaysOnMarket)}
                  </Text>
                  <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                    <Trans>dni na trgu</Trans>
                  </Text>
                </VStack>
              </CardBody>
            </Card.Root>
          </SimpleGrid>

          {/* Brand and Fuel Distribution */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <BrandDistributionChart brandDistribution={analytics.brandDistribution} />
            <FuelTypeDistributionChart fuelTypeDistribution={analytics.fuelTypeDistribution} />
          </SimpleGrid>

          {/* Top Cars */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card.Root>
              <CardBody>
                <VStack align="stretch" gap={4}>
                  <Heading size="md">
                    <Trans>Najbolj ogledani avtomobili</Trans>
                  </Heading>
                  <VStack align="stretch" gap={2}>
                    {analytics.topViewedCars.slice(0, 5).map((car, index) => (
                      <HStack key={car.carId} justify="space-between" p={2} bg={{ base: "gray.50", _dark: "gray.700" }} borderRadius="md">
                        <HStack gap={3}>
                          <Text fontWeight="bold" color="blue.500">{index + 1}.</Text>
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium">{car.brand} {car.model}</Text>
                            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                              {car.year} • {car.price.toLocaleString("sl-SI")} €
                            </Text>
                          </VStack>
                        </HStack>
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                          {car.viewCount} <Trans>ogledov</Trans>
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card.Root>

            <Card.Root>
              <CardBody>
                <VStack align="stretch" gap={4}>
                  <Heading size="md">
                    <Trans>Najbolj priljubljeni avtomobili</Trans>
                  </Heading>
                  <VStack align="stretch" gap={2}>
                    {analytics.topFavouriteCars.slice(0, 5).map((car, index) => (
                      <HStack key={car.carId} justify="space-between" p={2} bg={{ base: "gray.50", _dark: "gray.700" }} borderRadius="md">
                        <HStack gap={3}>
                          <Text fontWeight="bold" color="red.500">{index + 1}.</Text>
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium">{car.brand} {car.model}</Text>
                            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                              {car.year} • {car.price.toLocaleString("sl-SI")} €
                            </Text>
                          </VStack>
                        </HStack>
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                          {car.favouriteCount} <Trans>priljubljenih</Trans>
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card.Root>
          </SimpleGrid>

          {/* Worker Activity */}
          <WorkerActivityChart workerActivity={analytics.workerActivity} />
        </VStack>
    </PageShell>
  );
}
