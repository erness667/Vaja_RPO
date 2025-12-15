'use client';

import { useState, useCallback } from "react";
import {
  Box,
  VStack,
  Heading,
  Button,
  Field,
  SimpleGrid,
  Textarea,
  Input,
} from "@chakra-ui/react";
import { useCreateCar } from "@/lib/hooks/useCreateCar";
import { MakeDropdown } from "./MakeDropdown";
import { ModelDropdown } from "./ModelDropdown";
import type { CreateCarRequest } from "@/client/types.gen";
import "@/lib/api-client";

const fuelTypes = [
  { value: "Benzin", label: "Benzin" },
  { value: "Diesel", label: "Diesel" },
  { value: "Električno", label: "Električno" },
  { value: "Hibridno", label: "Hibridno" },
  { value: "LPG", label: "LPG" },
  { value: "CNG", label: "CNG" },
];

const transmissionTypes = [
  { value: "Ročni", label: "Ročni" },
  { value: "Avtomatski", label: "Avtomatski" },
  { value: "DSG", label: "DSG" },
  { value: "CVT", label: "CVT" },
];

const colors = [
  "Bela", "Črna", "Siva", "Srebrna", "Modra", "Rdeča", "Zelena", 
  "Rumena", "Oranžna", "Rjava", "Vijolična", "Roza", "Druga"
];

export function CarCreateForm() {
  const { createCar, isLoading, error, setError } = useCreateCar();
  
  const [formData, setFormData] = useState<CreateCarRequest>({
    makeId: "",
    modelId: "",
    year: new Date().getFullYear(),
    firstRegistrationDate: new Date().toISOString().split('T')[0],
    mileage: 0,
    previousOwners: 0,
    fuelType: "",
    enginePower: 0,
    transmission: "",
    color: "",
    equipmentAndDetails: "",
    price: 0,
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => 
    (1950 + i).toString()
  ).reverse();

  const handleChange = useCallback((field: keyof CreateCarRequest, value: string | number) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Reset model when make changes
      if (field === "makeId" && value !== prev.makeId) {
        newData.modelId = "";
      }
      return newData;
    });
    if (error) setError(null);
  }, [error, setError]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createCar(formData);
  }, [formData, createCar]);

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg={{ base: "rgba(255, 255, 255, 0.9)", _dark: "rgba(15, 23, 42, 0.6)" }}
      borderRadius="xl"
      p={6}
      boxShadow="sm"
      borderWidth="1px"
      borderColor={{ base: "rgba(229, 231, 235, 0.8)", _dark: "rgba(51, 65, 85, 0.6)" }}
    >
      {error && (
        <Box
          p={4}
          mb={6}
          borderRadius="md"
          bg={{ base: "red.50", _dark: "red.900" }}
          borderWidth="1px"
          borderColor={{ base: "red.200", _dark: "red.700" }}
          color={{ base: "red.800", _dark: "red.200" }}
          fontSize="sm"
        >
          {error}
        </Box>
      )}

      <VStack gap={6} align="stretch">
        <Heading
          size="lg"
          color={{ base: "gray.800", _dark: "gray.100" }}
        >
          Osnovni podatki
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <MakeDropdown
            value={formData.makeId}
            onChange={(value) => handleChange("makeId", value)}
            label="Znamka *"
            placeholder="Izberite znamko"
          />

          <ModelDropdown
            makeId={formData.makeId || null}
            value={formData.modelId}
            onChange={(value) => handleChange("modelId", value)}
            label="Model *"
            placeholder="Izberite model"
          />

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Letnik *
            </Field.Label>
            <select
              value={formData.year}
              onChange={(e) => handleChange("year", parseInt(e.target.value))}
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
              Prva registracija *
            </Field.Label>
            <Input
              type="date"
              value={formData.firstRegistrationDate}
              onChange={(e) => handleChange("firstRegistrationDate", e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Prevoženih km *
            </Field.Label>
            <Input
              type="number"
              value={formData.mileage || ""}
              onChange={(e) => handleChange("mileage", parseInt(e.target.value) || 0)}
              min={0}
              placeholder="0"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Predhodnih lastnikov *
            </Field.Label>
            <Input
              type="number"
              value={formData.previousOwners || ""}
              onChange={(e) => handleChange("previousOwners", parseInt(e.target.value) || 0)}
              min={0}
              max={20}
              placeholder="0"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Vrsta goriva *
            </Field.Label>
            <select
              value={formData.fuelType}
              onChange={(e) => handleChange("fuelType", e.target.value)}
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
              <option value="">Izberite gorivo</option>
              {fuelTypes.map((fuel) => (
                <option key={fuel.value} value={fuel.value}>
                  {fuel.label}
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
              Moč motorja (kW) *
            </Field.Label>
            <Input
              type="number"
              value={formData.enginePower || ""}
              onChange={(e) => handleChange("enginePower", parseInt(e.target.value) || 0)}
              min={0}
              placeholder="0"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Menjalnik *
            </Field.Label>
            <select
              value={formData.transmission}
              onChange={(e) => handleChange("transmission", e.target.value)}
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
              <option value="">Izberite menjalnik</option>
              {transmissionTypes.map((trans) => (
                <option key={trans.value} value={trans.value}>
                  {trans.label}
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
              Barva *
            </Field.Label>
            <select
              value={formData.color}
              onChange={(e) => handleChange("color", e.target.value)}
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
              <option value="">Izberite barvo</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
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
              Cena (€) *
            </Field.Label>
            <Input
              type="number"
              value={formData.price || ""}
              onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
              min={0}
              step="0.01"
              placeholder="0.00"
            />
          </Field.Root>
        </SimpleGrid>

        <Field.Root>
          <Field.Label
            fontSize="sm"
            fontWeight="medium"
            color={{ base: "gray.700", _dark: "gray.300" }}
          >
            Oprema in dodatni podatki
          </Field.Label>
          <Textarea
            value={formData.equipmentAndDetails || ""}
            onChange={(e) => handleChange("equipmentAndDetails", e.target.value)}
            rows={6}
            placeholder="Opišite opremo vozila, dodatne podatke, stanje vozila..."
          />
        </Field.Root>

        <Button
          type="submit"
          colorPalette="blue"
          size="lg"
          isLoading={isLoading}
          loadingText="Objavljanje..."
        >
          Objavi oglas
        </Button>
      </VStack>
    </Box>
  );
}

