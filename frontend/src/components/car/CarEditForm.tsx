'use client';

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  VStack,
  Heading,
  Button,
  Field,
  SimpleGrid,
  Textarea,
  Input,
  Select,
  useListCollection,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { LuArrowLeft } from "react-icons/lu";
import { useUpdateCar } from "@/lib/hooks/useUpdateCar";
import { useCar } from "@/lib/hooks/useCar";
import { useCarMakes } from "@/lib/hooks/useCarMakes";
import { useCarModels } from "@/lib/hooks/useCarModels";
import { MakeDropdown } from "../ui/MakeDropdown";
import { ModelDropdown } from "../ui/ModelDropdown";
import type { UpdateCarRequest } from "@/client/types.gen";
import "@/lib/api-client";
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  COLORS,
} from "@/lib/constants/car-options";

interface CarEditFormProps {
  carId: number;
}

export function CarEditForm({ carId }: CarEditFormProps) {
  const router = useRouter();
  const { car, isLoading: isLoadingCar, error: carError } = useCar(carId);
  const { makes } = useCarMakes();
  const { updateCar, isLoading, error, setError } = useUpdateCar();

  const [formData, setFormData] = useState<UpdateCarRequest>({
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

  // Find make ID from brand name
  const makeIdFromBrand = useMemo(() => {
    if (car && makes.length > 0) {
      const make = makes.find(m => m.name?.toLowerCase() === car.brand.toLowerCase());
      return make?.id || "";
    }
    return "";
  }, [car, makes]);

  const { models } = useCarModels(makeIdFromBrand || null);

  // Find model ID from model name
  const modelIdFromModel = useMemo(() => {
    if (car && models.length > 0 && makeIdFromBrand) {
      const model = models.find(m => m.name?.toLowerCase() === car.model.toLowerCase());
      return model?.id || "";
    }
    return "";
  }, [car, models, makeIdFromBrand]);

  // Populate form when car data is loaded
  useEffect(() => {
    if (car && makeIdFromBrand && modelIdFromModel) {
      const registrationDate = car.firstRegistrationDate
        ? new Date(car.firstRegistrationDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      setFormData({
        makeId: makeIdFromBrand,
        modelId: modelIdFromModel,
        year: car.year,
        firstRegistrationDate: registrationDate,
        mileage: car.mileage,
        previousOwners: car.previousOwners,
        fuelType: car.fuelType,
        enginePower: car.enginePower,
        transmission: car.transmission,
        color: car.color,
        equipmentAndDetails: car.equipmentAndDetails || "",
        price: Number(car.price),
      });
    }
  }, [car, makeIdFromBrand, modelIdFromModel]);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => 
    (1950 + i).toString()
  ).reverse();

  const yearItems = yearOptions.map((y) => ({ value: y, label: y }));
  const yearList = useListCollection({
    initialItems: yearItems,
    itemToString: (item) => item.label,
  });

  const fuelList = useListCollection({
    initialItems: FUEL_TYPES,
    itemToString: (item) => item.label,
  });

  const transmissionList = useListCollection({
    initialItems: TRANSMISSION_TYPES,
    itemToString: (item) => item.label,
  });

  const colorItems = COLORS.map((c) => ({ value: c, label: c }));
  const colorList = useListCollection({
    initialItems: colorItems,
    itemToString: (item) => item.label,
  });

  const handleChange = useCallback((field: keyof UpdateCarRequest, value: string | number) => {
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const result = await updateCar(carId, formData);
      if (result.success) {
        router.push(`/cars/${carId}`);
      }
    },
    [formData, carId, updateCar, router]
  );

  if (isLoadingCar) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (carError || !car) {
    return (
      <Box p={6}>
        <VStack gap={4}>
          <Heading size="lg" color={{ base: "red.600", _dark: "red.400" }}>
            <Trans>Napaka pri nalaganju vozila</Trans>
          </Heading>
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            {carError || <Trans>Vozilo ni bilo najdeno</Trans>}
          </Text>
          <Button onClick={() => router.back()}>
            <Trans>Nazaj</Trans>
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <VStack gap={6} align="stretch">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          alignSelf="flex-start"
          color={{ base: "gray.600", _dark: "gray.400" }}
          _hover={{ color: { base: "blue.600", _dark: "blue.400" } }}
        >
          <LuArrowLeft style={{ marginRight: "8px" }} />
          <Trans>Nazaj</Trans>
        </Button>

        <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
          <Trans>Uredi oglas</Trans>
        </Heading>

        <form onSubmit={handleSubmit}>
          <Box
            bg={{ base: "rgba(255, 255, 255, 0.9)", _dark: "rgba(15, 23, 42, 0.6)" }}
            borderRadius="xl"
            p={6}
            boxShadow="sm"
            borderWidth="1px"
            borderColor={{
              base: "rgba(229, 231, 235, 0.8)",
              _dark: "rgba(51, 65, 85, 0.6)",
            }}
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

            <VStack gap={8} align="stretch">
              {/* Osnovni podatki Section */}
              <Box>
                <Heading
                  size="lg"
                  color={{ base: "gray.800", _dark: "gray.100" }}
                  mb={6}
                  pb={3}
                  borderBottomWidth="2px"
                  borderBottomColor={{ base: "blue.200", _dark: "blue.700" }}
                >
                  <Trans>Osnovni podatki</Trans>
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
                      <Trans>Letnik *</Trans>
                    </Field.Label>
                    <Select.Root
                      collection={yearList.collection}
                      value={formData.year ? [String(formData.year)] : []}
                      onValueChange={(details) =>
                        handleChange(
                          "year",
                          parseInt(details.value[0] ?? String(currentYear))
                        )
                      }
                    >
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Izberite letnik" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                          <Select.ClearTrigger />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {yearList.collection.items.map((item) => (
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
                      <Trans>Prva registracija *</Trans>
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
                      <Trans>Prevoženih km *</Trans>
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
                      <Trans>Predhodnih lastnikov *</Trans>
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
                      <Trans>Vrsta goriva *</Trans>
                    </Field.Label>
                    <Select.Root
                      collection={fuelList.collection}
                      value={formData.fuelType ? [formData.fuelType] : []}
                      onValueChange={(details) =>
                        handleChange("fuelType", details.value[0] ?? "")
                      }
                    >
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Izberite gorivo" />
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

                  <Field.Root>
                    <Field.Label
                      fontSize="sm"
                      fontWeight="medium"
                      color={{ base: "gray.700", _dark: "gray.300" }}
                    >
                      <Trans>Moč motorja (kW) *</Trans>
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
                      <Trans>Menjalnik *</Trans>
                    </Field.Label>
                    <Select.Root
                      collection={transmissionList.collection}
                      value={formData.transmission ? [formData.transmission] : []}
                      onValueChange={(details) =>
                        handleChange("transmission", details.value[0] ?? "")
                      }
                    >
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Izberite menjalnik" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                          <Select.ClearTrigger />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {transmissionList.collection.items.map((item) => (
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
                      <Trans>Barva *</Trans>
                    </Field.Label>
                    <Select.Root
                      collection={colorList.collection}
                      value={formData.color ? [formData.color] : []}
                      onValueChange={(details) =>
                        handleChange("color", details.value[0] ?? "")
                      }
                    >
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Izberite barvo" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                          <Select.ClearTrigger />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {colorList.collection.items.map((item) => (
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
                      <Trans>Cena (€) *</Trans>
                    </Field.Label>
                    <Input
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) => handleChange("price", parseInt(e.target.value) || 0)}
                      min={0}
                      placeholder="0"
                    />
                  </Field.Root>
                </SimpleGrid>
              </Box>

              {/* Oprema in dodatni podatki Section */}
              <Box
                pt={6}
                borderTopWidth="1px"
                borderTopColor={{ base: "gray.200", _dark: "gray.700" }}
              >
                <Heading
                  size="lg"
                  color={{ base: "gray.800", _dark: "gray.100" }}
                  mb={4}
                  pb={3}
                  borderBottomWidth="2px"
                  borderBottomColor={{ base: "blue.200", _dark: "blue.700" }}
                >
                  <Trans>Oprema in dodatni podatki</Trans>
                </Heading>

                <Field.Root>
                  <Field.Label
                    fontSize="sm"
                    fontWeight="medium"
                    color={{ base: "gray.700", _dark: "gray.300" }}
                  >
                    <Trans>Opis opreme in dodatnih podatkov</Trans>
                  </Field.Label>
                  <Textarea
                    value={formData.equipmentAndDetails || ""}
                    onChange={(e) => handleChange("equipmentAndDetails", e.target.value)}
                    rows={6}
                    placeholder="Opišite opremo vozila, dodatne podatke, stanje vozila..."
                  />
                </Field.Root>
              </Box>

              {/* Submit Button */}
              <Box
                pt={6}
                borderTopWidth="1px"
                borderTopColor={{ base: "gray.200", _dark: "gray.700" }}
              >
                <Button
                  type="submit"
                  colorPalette="blue"
                  size="lg"
                  width="100%"
                  loading={isLoading}
                  loadingText="Shranjevanje..."
                  fontSize="md"
                  fontWeight="semibold"
                  py={6}
                >
                  <Trans>Shrani spremembe</Trans>
                </Button>
              </Box>
            </VStack>
          </Box>
        </form>
      </VStack>
    </Box>
  );
}

