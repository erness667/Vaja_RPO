'use client';

import { useState } from "react";
import {
  Box,
  Heading,
  Field,
  Button,
  SimpleGrid,
  HStack,
} from "@chakra-ui/react";
import { PageShell } from "@/components/layout/PageShell";
import { LuSettings2, LuSearch } from "react-icons/lu";
import { MakeDropdown } from "./MakeDropdown";
import { ModelDropdown } from "./ModelDropdown";

export function CarSearch() {
  const [filters, setFilters] = useState({
    makeId: "",
    modelId: "",
    priceFrom: "",
    priceTo: "",
    yearFrom: "",
    yearTo: "",
    kilometers: "",
    fuel: "",
  });

  const handleChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [field]: value };
      // Reset dependent fields when parent changes
      if (field === "makeId" && value !== prev.makeId) {
        newFilters.modelId = "";
      }
      return newFilters;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search filters:", filters);
  };

  const handleAdvancedSearch = () => {
    console.log("Advanced search clicked");
  };

  const fuelTypes = ["Gorivo", "Benzin", "Diesel", "Električno", "Hibridno"];

  const priceOptions = [
    "Vse",
    "0",
    "5.000",
    "10.000",
    "15.000",
    "20.000",
    "30.000",
    "50.000",
    "100.000",
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) =>
    (2000 + i).toString()
  );

  const kilometerOptions = [
    "Vse",
    "10.000",
    "20.000",
    "50.000",
    "100.000",
    "150.000",
    "200.000",
  ];

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <Heading
        size="lg"
        mb={6}
        color={{ base: "gray.800", _dark: "gray.100" }}
      >
        Hitro iskanje osebnih vozil
      </Heading>

      <Box
        as="form"
        onSubmit={handleSearch}
        suppressHydrationWarning
        bg={{ base: "rgba(255, 255, 255, 0.9)", _dark: "rgba(15, 23, 42, 0.6)" }}
        borderRadius="xl"
        p={6}
        boxShadow="sm"
        borderWidth="1px"
        borderColor={{ base: "rgba(229, 231, 235, 0.8)", _dark: "rgba(51, 65, 85, 0.6)" }}
      >
        {/* First Row */}
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 4 }}
          gap={4}
          mb={4}
        >
          <MakeDropdown
            value={filters.makeId}
            onChange={(value) => handleChange("makeId", value)}
          />

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Cena od
            </Field.Label>
            <select
              value={filters.priceFrom}
              onChange={(e) => handleChange("priceFrom", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--chakra-colors-gray-300)",
                borderRadius: "0.375rem",
                backgroundColor: "var(--chakra-colors-white)",
                color: "var(--chakra-colors-gray-900)",
                fontSize: "1rem",
              }}
            >
              {priceOptions.map((price) => (
                <option key={price} value={price === "Vse" ? "" : price}>
                  {price === "Vse" ? price : `€ ${price}`}
                </option>
              ))}
            </select>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Cena do
            </Field.Label>
            <select
              value={filters.priceTo}
              onChange={(e) => handleChange("priceTo", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--chakra-colors-gray-300)",
                borderRadius: "0.375rem",
                backgroundColor: "var(--chakra-colors-white)",
                color: "var(--chakra-colors-gray-900)",
                fontSize: "1rem",
              }}
            >
              {priceOptions.map((price) => (
                <option key={price} value={price === "Vse" ? "" : price}>
                  {price === "Vse" ? price : `€ ${price}`}
                </option>
              ))}
            </select>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Prevoženih km do
            </Field.Label>
            <select
              value={filters.kilometers}
              onChange={(e) => handleChange("kilometers", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--chakra-colors-gray-300)",
                borderRadius: "0.375rem",
                backgroundColor: "var(--chakra-colors-white)",
                color: "var(--chakra-colors-gray-900)",
                fontSize: "1rem",
              }}
            >
              {kilometerOptions.map((km) => (
                <option key={km} value={km === "Vse" ? "" : km}>
                  {km === "Vse" ? km : `${km} km`}
                </option>
              ))}
            </select>
          </Field.Root>
        </SimpleGrid>

        {/* Second Row */}
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 4 }}
          gap={4}
          mb={6}
        >
          <ModelDropdown
            makeId={filters.makeId || null}
            value={filters.modelId}
            onChange={(value) => handleChange("modelId", value)}
          />

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Letnik od
            </Field.Label>
            <select
              value={filters.yearFrom}
              onChange={(e) => handleChange("yearFrom", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--chakra-colors-gray-300)",
                borderRadius: "0.375rem",
                backgroundColor: "var(--chakra-colors-white)",
                color: "var(--chakra-colors-gray-900)",
                fontSize: "1rem",
              }}
            >
              <option value="">Vse</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Letnik do
            </Field.Label>
            <select
              value={filters.yearTo}
              onChange={(e) => handleChange("yearTo", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--chakra-colors-gray-300)",
                borderRadius: "0.375rem",
                backgroundColor: "var(--chakra-colors-white)",
                color: "var(--chakra-colors-gray-900)",
                fontSize: "1rem",
              }}
            >
              <option value="">Vse</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Gorivo
            </Field.Label>
            <select
              value={filters.fuel}
              onChange={(e) => handleChange("fuel", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--chakra-colors-gray-300)",
                borderRadius: "0.375rem",
                backgroundColor: "var(--chakra-colors-white)",
                color: "var(--chakra-colors-gray-900)",
                fontSize: "1rem",
              }}
            >
              {fuelTypes.map((fuel) => (
                <option key={fuel} value={fuel === "Gorivo" ? "" : fuel}>
                  {fuel}
                </option>
              ))}
            </select>
          </Field.Root>
        </SimpleGrid>

        {/* Action Buttons */}
        <HStack
          justify="space-between"
          align="center"
          gap={4}
          flexWrap="wrap"
        >
          <Button
            type="button"
            variant="ghost"
            onClick={handleAdvancedSearch}
            color={{ base: "gray.600", _dark: "gray.300" }}
            _hover={{
              color: "blue.400",
            }}
          >
            <LuSettings2 style={{ marginRight: "8px" }} />
            Napredno iskanje z dodatnimi filtri
          </Button>

          <Button
            type="submit"
            colorPalette="blue"
          >
            <LuSearch style={{ marginRight: "8px" }} />
            Iskanje vozil
          </Button>
        </HStack>
      </Box>
    </PageShell>
  );
}
