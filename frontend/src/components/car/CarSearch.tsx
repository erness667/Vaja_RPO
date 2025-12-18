"use client";

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
import { useRouter, useSearchParams } from "next/navigation";
import { LuSettings2, LuSearch } from "react-icons/lu";
import { MakeDropdown } from "../ui/MakeDropdown";
import { ModelDropdown } from "../ui/ModelDropdown";
import {
  FUEL_TYPES,
  PRICE_OPTIONS,
  KILOMETER_OPTIONS,
} from "@/lib/constants/car-options";
import { Trans, t } from "@lingui/macro";

export function CarSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    makeId: searchParams.get("makeId") ?? "",
    modelId: searchParams.get("modelId") ?? "",
    priceFrom: searchParams.get("priceFrom") ?? "",
    priceTo: searchParams.get("priceTo") ?? "",
    yearFrom: searchParams.get("yearFrom") ?? "",
    yearTo: searchParams.get("yearTo") ?? "",
    kilometers: searchParams.get("mileageTo") ?? "",
    fuel: searchParams.get("fuelType") ?? "",
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

    const params = new URLSearchParams();

    if (filters.makeId) params.set("makeId", filters.makeId);
    if (filters.modelId) params.set("modelId", filters.modelId);
    if (filters.priceFrom) params.set("priceFrom", filters.priceFrom);
    if (filters.priceTo) params.set("priceTo", filters.priceTo);
    if (filters.yearFrom) params.set("yearFrom", filters.yearFrom);
    if (filters.yearTo) params.set("yearTo", filters.yearTo);
    if (filters.kilometers) params.set("mileageTo", filters.kilometers);
    if (filters.fuel) params.set("fuelType", filters.fuel);

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
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
      ? { value: "", label: t`Vse` }
      : { value: price, label: `€ ${price}` }
  );
  const priceToItems = priceFromItems;
  const kilometerItems = KILOMETER_OPTIONS.map((km) =>
    km === "Vse" ? { value: "", label: t`Vse` } : { value: km, label: `${km} km` }
  );
  const yearFromItems = [{ value: "", label: t`Vse` }, ...yearOptions.map((y) => ({ value: y, label: y }))];
  const yearToItems = yearFromItems;
  const fuelItems = [
    { value: "", label: t`Gorivo` },
    ...FUEL_TYPES.map((f) => ({ value: f.value, label: f.label })),
  ];

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
          <Trans>Hitro iskanje osebnih vozil</Trans>
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
                <Trans>Cena od</Trans>
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
                <Trans>Cena do</Trans>
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
                <Trans>Prevoženih km do</Trans>
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
                <Trans>Letnik od</Trans>
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
                <Trans>Letnik do</Trans>
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
                <Trans>Gorivo</Trans>
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
            <Trans>Napredno iskanje z dodatnimi filtri</Trans>
          </Button>

          <Button
            type="submit"
            colorPalette="blue"
          >
            <LuSearch style={{ marginRight: "8px" }} />
            <Trans>Iskanje vozil</Trans>
          </Button>
        </HStack>
      </Box>
      </Box>
    </Box>
  );
}
