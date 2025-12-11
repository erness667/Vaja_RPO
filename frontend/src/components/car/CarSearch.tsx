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

export function CarSearch() {
  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    priceFrom: "",
    priceTo: "",
    yearFrom: "",
    yearTo: "",
    kilometers: "",
    fuel: "",
  });

  const handleChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search filters:", filters);
  };

  const handleAdvancedSearch = () => {
    console.log("Advanced search clicked");
  };

  const brands = ["Vse znamke", "BMW", "Mercedes", "Audi", "Volkswagen"];
  const models = ["Vsi modeli", "Model 1", "Model 2", "Model 3"];
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
          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Vse znamke
            </Field.Label>
            <Box
              as="select"
              value={filters.brand}
              onChange={(e) => handleChange("brand", (e.target as HTMLSelectElement).value)}
              width="100%"
              padding="8px 12px"
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              borderRadius="md"
              bg={{ base: "white", _dark: "gray.800" }}
              color={{ base: "gray.900", _dark: "gray.100" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
            >
              {brands.map((brand) => (
                <option key={brand} value={brand === "Vse znamke" ? "" : brand}>
                  {brand}
                </option>
              ))}
            </Box>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Cena od
            </Field.Label>
            <Box
              as="select"
              value={filters.priceFrom}
              onChange={(e) => handleChange("priceFrom", (e.target as HTMLSelectElement).value)}
              width="100%"
              padding="8px 12px"
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              borderRadius="md"
              bg={{ base: "white", _dark: "gray.800" }}
              color={{ base: "gray.900", _dark: "gray.100" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
            >
              {priceOptions.map((price) => (
                <option key={price} value={price === "Vse" ? "" : price}>
                  {price === "Vse" ? price : `€ ${price}`}
                </option>
              ))}
            </Box>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Cena do
            </Field.Label>
            <Box
              as="select"
              value={filters.priceTo}
              onChange={(e) => handleChange("priceTo", (e.target as HTMLSelectElement).value)}
              width="100%"
              padding="8px 12px"
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              borderRadius="md"
              bg={{ base: "white", _dark: "gray.800" }}
              color={{ base: "gray.900", _dark: "gray.100" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
            >
              {priceOptions.map((price) => (
                <option key={price} value={price === "Vse" ? "" : price}>
                  {price === "Vse" ? price : `€ ${price}`}
                </option>
              ))}
            </Box>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Prevoženih km do
            </Field.Label>
            <Box
              as="select"
              value={filters.kilometers}
              onChange={(e) => handleChange("kilometers", (e.target as HTMLSelectElement).value)}
              width="100%"
              padding="8px 12px"
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              borderRadius="md"
              bg={{ base: "white", _dark: "gray.800" }}
              color={{ base: "gray.900", _dark: "gray.100" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
            >
              {kilometerOptions.map((km) => (
                <option key={km} value={km === "Vse" ? "" : km}>
                  {km === "Vse" ? km : `${km} km`}
                </option>
              ))}
            </Box>
          </Field.Root>
        </SimpleGrid>

        {/* Second Row */}
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 4 }}
          gap={4}
          mb={6}
        >
          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Vsi modeli
            </Field.Label>
            <Box
              as="select"
              value={filters.model}
              onChange={(e) => handleChange("model", (e.target as HTMLSelectElement).value)}
              width="100%"
              padding="8px 12px"
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              borderRadius="md"
              bg={{ base: "white", _dark: "gray.800" }}
              color={{ base: "gray.900", _dark: "gray.100" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
            >
              {models.map((model) => (
                <option key={model} value={model === "Vsi modeli" ? "" : model}>
                  {model}
                </option>
              ))}
            </Box>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Letnik od
            </Field.Label>
            <Box
              as="select"
              value={filters.yearFrom}
              onChange={(e) => handleChange("yearFrom", (e.target as HTMLSelectElement).value)}
              width="100%"
              padding="8px 12px"
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              borderRadius="md"
              bg={{ base: "white", _dark: "gray.800" }}
              color={{ base: "gray.900", _dark: "gray.100" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
            >
              <option value="">Vse</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Box>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Letnik do
            </Field.Label>
            <Box
              as="select"
              value={filters.yearTo}
              onChange={(e) => handleChange("yearTo", (e.target as HTMLSelectElement).value)}
              width="100%"
              padding="8px 12px"
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              borderRadius="md"
              bg={{ base: "white", _dark: "gray.800" }}
              color={{ base: "gray.900", _dark: "gray.100" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
            >
              <option value="">Vse</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Box>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Gorivo
            </Field.Label>
            <Box
              as="select"
              value={filters.fuel}
              onChange={(e) => handleChange("fuel", (e.target as HTMLSelectElement).value)}
              width="100%"
              padding="8px 12px"
              borderWidth="1px"
              borderColor={{ base: "gray.300", _dark: "gray.600" }}
              borderRadius="md"
              bg={{ base: "white", _dark: "gray.800" }}
              color={{ base: "gray.900", _dark: "gray.100" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
            >
              {fuelTypes.map((fuel) => (
                <option key={fuel} value={fuel === "Gorivo" ? "" : fuel}>
                  {fuel}
                </option>
              ))}
            </Box>
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
            leftIcon={<LuSettings2 />}
            color={{ base: "gray.600", _dark: "gray.300" }}
            _hover={{
              color: "blue.400",
            }}
          >
            Napredno iskanje z dodatnimi filtri
          </Button>

          <Button
            type="submit"
            colorPalette="blue"
            leftIcon={<LuSearch />}
          >
            Iskanje vozil
          </Button>
        </HStack>
      </Box>
    </PageShell>
  );
}
