"use client";

import {
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCars, type UseCarsFilters } from "@/lib/hooks/useCars";
import { CarCard } from "./CarCard";
import { SortBar, SortOption } from "../layout/SortBar";
import { Trans } from "@lingui/macro";
import { CarPriceStats } from "./CarPriceStats";
import type { Car } from "@/lib/types/car";

export function CarList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const scrollPositionRef = useRef<number>(0);

  // Track filter keys to detect filter changes (excluding page)
  const filterKeys = useMemo(() => {
    return [
      searchParams.get("makeId"),
      searchParams.get("modelId"),
      searchParams.get("yearFrom"),
      searchParams.get("yearTo"),
      searchParams.get("priceFrom"),
      searchParams.get("priceTo"),
      searchParams.get("mileageTo"),
      searchParams.get("fuelType"),
    ].join("|");
  }, [searchParams]);

  const filters: UseCarsFilters = useMemo(() => {
    const get = (key: string) => searchParams.get(key) || undefined;

    return {
      makeId: get("makeId"),
      modelId: get("modelId"),
      yearFrom: get("yearFrom"),
      yearTo: get("yearTo"),
      priceFrom: get("priceFrom"),
      priceTo: get("priceTo"),
      mileageTo: get("mileageTo"),
      fuelType: get("fuelType"),
      // Don't send page/pageSize to API - we'll do client-side pagination
      pageSize: 6, // Used for client-side pagination calculation
    };
  }, [searchParams]);

  const { cars: allCars, isLoading, error, pagination, refetch } = useCars(filters);
  const [sort, setSort] = useState<SortOption>("newest");
  const [showPriceStats, setShowPriceStats] = useState(false);

  // Reset to page 1 when filters change (but not when page changes)
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (!pageParam) {
      setCurrentPage(1);
    } else {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page);
      } else {
        setCurrentPage(1);
      }
    }
  }, [filterKeys, searchParams]);

  // Refetch when filters change
  useEffect(() => {
    void refetch();
  }, [refetch, filters]);

  // Restore scroll position after page change (use useLayoutEffect for synchronous update)
  useLayoutEffect(() => {
    if (scrollPositionRef.current > 0) {
      // Restore scroll position synchronously before browser paint
      window.scrollTo(0, scrollPositionRef.current);
      scrollPositionRef.current = 0; // Reset after restoring
    }
  }, [currentPage]);

  // Update URL when page changes (without scrolling or refresh)
  const handlePageChange = (newPage: number) => {
    // Save current scroll position before changing page
    scrollPositionRef.current = window.scrollY;
    
    // Update state first (this triggers re-render)
    setCurrentPage(newPage);
    
    // Update URL without triggering navigation/refresh
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    
    // Use window.history.replaceState to update URL without navigation
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      '',
      newUrl
    );
  };

  // Calculate pagination based on all loaded cars
  const pageSize = 6;
  const totalPages = Math.ceil(allCars.length / pageSize);

  // Generate page numbers to display (show max 5 pages around current)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const renderHeading = () => {
    switch (sort) {
      case "oldest":
        return <Trans>Najstarejši oglasi</Trans>;
      case "priceDesc":
        return <Trans>Najdražji oglasi</Trans>;
      case "priceAsc":
        return <Trans>Najcenejši oglasi</Trans>;
      case "newest":
      default:
        return <Trans>Najnovejši oglasi</Trans>;
    }
  };

  // Sort all cars first, then paginate
  const sortedCars = useMemo(() => {
    const list = [...allCars];
    let sorted: Car[];
    switch (sort) {
      case "priceDesc":
        sorted = list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "priceAsc":
        sorted = list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "oldest":
        sorted = list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "newest":
      default:
        sorted = list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }
    // Apply client-side pagination after sorting
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sorted.slice(startIndex, endIndex);
  }, [allCars, sort, currentPage]);

  return (
    <Box
      suppressHydrationWarning
      pt={0}
      pb={8}
      px={4}
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
        <VStack align="stretch" gap={6}>
          <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
            <Heading
              size="lg"
              color={{ base: "gray.800", _dark: "gray.100" }}
            >
              {renderHeading()}
            </Heading>
            <HStack gap={3}>
              <Button
                size="sm"
                onClick={() => setShowPriceStats(!showPriceStats)}
                colorScheme="blue"
                variant={showPriceStats ? "solid" : "outline"}
              >
                {showPriceStats ? "Hide" : "Show"} Price Stats
              </Button>
              <SortBar value={sort} onChange={setSort} />
            </HStack>
          </HStack>

          {showPriceStats && !isLoading && !error && allCars.length > 0 && (
            <CarPriceStats cars={allCars} />
          )}

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

        {!isLoading && !error && sortedCars.length === 0 && (
          <Text
            fontSize="sm"
            color={{ base: "gray.600", _dark: "gray.400" }}
          >
            <Trans>Trenutno ni objavljenih vozil.</Trans>
          </Text>
        )}

        {!isLoading && !error && sortedCars.length > 0 && (
          <>
            <SimpleGrid
              columns={{ base: 1, sm: 2, lg: 3 }}
              gap={6}
            >
              {sortedCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </SimpleGrid>

            {/* Pagination */}
            {totalPages > 1 && (
              <HStack justify="center" gap={2} mt={6} pt={6} borderTopWidth="1px" borderTopColor={{ base: "gray.200", _dark: "gray.700" }} wrap="wrap">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  size="sm"
                  borderRadius="md"
                  minW="40px"
                  h="40px"
                >
                  &lt;
                </Button>
                
                {getPageNumbers().map((page, index) => {
                  if (page === "...") {
                    return (
                      <Text
                        key={`ellipsis-${index}`}
                        color={{ base: "gray.600", _dark: "gray.400" }}
                        px={2}
                      >
                        ...
                      </Text>
                    );
                  }
                  
                  const pageNum = page as number;
                  const isActive = pageNum === currentPage;
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      size="sm"
                      borderRadius="md"
                      minW="40px"
                      h="40px"
                      bg={isActive 
                        ? { base: "blue.500", _dark: "blue.600" }
                        : { base: "white", _dark: "gray.700" }
                      }
                      color={isActive 
                        ? "white"
                        : { base: "gray.900", _dark: "gray.100" }
                      }
                      borderWidth="1px"
                      borderColor={isActive
                        ? { base: "blue.500", _dark: "blue.600" }
                        : { base: "gray.300", _dark: "gray.600" }
                      }
                      _hover={!isActive ? {
                        bg: { base: "gray.50", _dark: "gray.600" },
                        borderColor: { base: "gray.400", _dark: "gray.500" }
                      } : {}}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  size="sm"
                  borderRadius="md"
                  minW="40px"
                  h="40px"
                >
                  &gt;
                </Button>
              </HStack>
            )}
          </>
        )}
        </VStack>
      </Box>
    </Box>
  );
}


