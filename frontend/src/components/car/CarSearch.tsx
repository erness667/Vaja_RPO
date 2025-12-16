'use client';

import { useState } from "react";
import {
  Box,
  Heading,
  Field,
  Button,
  SimpleGrid,
  HStack,
  Select,
  useListCollection,
} from "@chakra-ui/react";
import { LuSettings2, LuSearch } from "react-icons/lu";
import { MakeDropdown } from "./MakeDropdown";
import { ModelDropdown } from "./ModelDropdown";
import {
  FUEL_TYPES,
  PRICE_OPTIONS,
  KILOMETER_OPTIONS,
} from "@/lib/constants/car-options";

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

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) =>
    (2000 + i).toString()
  );

  // Chakra Select collections
  const priceFromItems = PRICE_OPTIONS.map((price) =>
    price === "Vse"
      ? { value: "", label: "Vse" }
      : { value: price, label: `€ ${price}` }
  );
  const priceToItems = priceFromItems;
  const kilometerItems = KILOMETER_OPTIONS.map((km) =>
    km === "Vse" ? { value: "", label: "Vse" } : { value: km, label: `${km} km` }
  );
  const yearFromItems = [{ value: "", label: "Vse" }, ...yearOptions.map((y) => ({ value: y, label: y }))];
  const yearToItems = yearFromItems;
  const fuelItems = ["Gorivo", ...FUEL_TYPES.map((f) => f.value)].map(
    (fuel) =>
    fuel === "Gorivo" ? { value: "", label: "Gorivo" } : { value: fuel, label: fuel }
  );

  const priceFromList = useListCollection({
    initialItems: priceFromItems,
    itemToString: (item) => item.label,
  });
  const priceToList = useListCollection({
    initialItems: priceToItems,
    itemToString: (item) => item.label,
  });
  const kilometerList = useListCollection({
    initialItems: kilometerItems,
    itemToString: (item) => item.label,
  });
  const yearFromList = useListCollection({
    initialItems: yearFromItems,
    itemToString: (item) => item.label,
  });
  const yearToList = useListCollection({
    initialItems: yearToItems,
    itemToString: (item) => item.label,
  });
  const fuelList = useListCollection({
    initialItems: fuelItems,
    itemToString: (item) => item.label,
  });

  return (
    <Box
      suppressHydrationWarning
      pt={8}
      pb={2}
      px={4}
      bgGradient={{ base: "linear(to-br, gray.50, gray.100, gray.50)", _dark: "linear(to-br, gray.900, gray.950, gray.900)" }}
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
            <Select.Root
              collection={priceFromList.collection}
              value={filters.priceFrom ? [filters.priceFrom] : [""]}
              onValueChange={(details) =>
                handleChange("priceFrom", details.value[0] ?? "")
              }
            >
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                  <Select.ClearTrigger />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {priceFromList.collection.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Cena do
            </Field.Label>
            <Select.Root
              collection={priceToList.collection}
              value={filters.priceTo ? [filters.priceTo] : [""]}
              onValueChange={(details) =>
                handleChange("priceTo", details.value[0] ?? "")
              }
            >
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                  <Select.ClearTrigger />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {priceToList.collection.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Prevoženih km do
            </Field.Label>
            <Select.Root
              collection={kilometerList.collection}
              value={filters.kilometers ? [filters.kilometers] : [""]}
              onValueChange={(details) =>
                handleChange("kilometers", details.value[0] ?? "")
              }
            >
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                  <Select.ClearTrigger />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {kilometerList.collection.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
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
            <Select.Root
              collection={yearFromList.collection}
              value={filters.yearFrom ? [filters.yearFrom] : [""]}
              onValueChange={(details) =>
                handleChange("yearFrom", details.value[0] ?? "")
              }
            >
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                  <Select.ClearTrigger />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {yearFromList.collection.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Letnik do
            </Field.Label>
            <Select.Root
              collection={yearToList.collection}
              value={filters.yearTo ? [filters.yearTo] : [""]}
              onValueChange={(details) =>
                handleChange("yearTo", details.value[0] ?? "")
              }
            >
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                  <Select.ClearTrigger />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {yearToList.collection.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Gorivo
            </Field.Label>
            <Select.Root
              collection={fuelList.collection}
              value={filters.fuel ? [filters.fuel] : [""]}
              onValueChange={(details) =>
                handleChange("fuel", details.value[0] ?? "")
              }
            >
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                  <Select.ClearTrigger />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {fuelList.collection.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
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
      </Box>
    </Box>
  );
}
