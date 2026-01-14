'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
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
  HStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { LuUpload, LuX, LuImage, LuStar } from "react-icons/lu";
import { useCreateCar } from "@/lib/hooks/useCreateCar";
import { useUserDealerships } from "@/lib/hooks/useUserDealerships";
import { MakeDropdown } from "../ui/MakeDropdown";
import { ModelDropdown } from "../ui/ModelDropdown";
import type { CreateCarRequest } from "@/client/types.gen";
import "@/lib/api-client";
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  COLORS,
} from "@/lib/constants/car-options";

export function CarCreateForm() {
  const { createCar, isLoading, error, setError } = useCreateCar();
  const { dealerships, isLoading: dealershipsLoading } = useUserDealerships();

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
    dealershipId: null,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]); // Unique IDs for each image
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);

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

  // Dealership options for Select - update when dealerships change
  const dealershipItems = useMemo(() => {
    return [
      { value: "", label: "Zasebna oseba" },
      ...dealerships.map((d) => ({ value: String(d.id), label: d.name })),
    ];
  }, [dealerships]);
  
  const dealershipList = useListCollection({
    initialItems: dealershipItems,
    itemToString: (item) => item.label,
  });

  // Update collection when dealerships change (use list.set() like MakeDropdown and ModelDropdown)
  useEffect(() => {
    dealershipList.set(dealershipItems);
  }, [dealershipItems, dealershipList]);

  const handleChange = useCallback((field: keyof CreateCarRequest, value: string | number | number | null) => {
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

  const handleImagesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      setImages(files);

      // Create preview URLs
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);

      // Create unique IDs for each image
      const ids = files.map((_, index) => `${Date.now()}-${index}-${Math.random()}`);
      setImageIds(ids);

      // Default main image to the first selected image
      setMainImageIndex(files.length > 0 ? 0 : null);
    },
    []
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      // Revoke the object URL to free memory
      if (imagePreviews[index]) {
        URL.revokeObjectURL(imagePreviews[index]);
      }

      const newImages = images.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      const newIds = imageIds.filter((_, i) => i !== index);

      setImages(newImages);
      setImagePreviews(newPreviews);
      setImageIds(newIds);

      // Main image is always at index 0, so if we removed index 0, the new first image becomes main
      // If we removed a different index, main stays at 0
      setMainImageIndex(newImages.length > 0 ? 0 : null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [images, imagePreviews, imageIds]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length > 0) {
        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);

        // Create unique IDs for new images
        const newIds = files.map((_, index) => `${Date.now()}-${index}-${Math.random()}`);
        setImageIds([...imageIds, ...newIds]);

        if (mainImageIndex === null && newImages.length > 0) {
          setMainImageIndex(0);
        }
      }
    },
    [images, imagePreviews, imageIds, mainImageIndex]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Main image is always first in the array (index 0) so backend marks it as main
      await createCar(formData, images);
    },
    [formData, images, createCar]
  );

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [imagePreviews]);

  return (
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
              Barva *
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
              Cena (€) *
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

        {/* Fotografije vozila Section */}
        <Box
          pt={6}
          borderTopWidth="1px"
          borderTopColor={{ base: "gray.200", _dark: "gray.700" }}
        >
          <Heading
            size="lg"
            color={{ base: "gray.800", _dark: "gray.100" }}
            mb={6}
            pb={3}
            borderBottomWidth="2px"
            borderBottomColor={{ base: "blue.200", _dark: "blue.700" }}
          >
            Fotografije vozila
          </Heading>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
              mb={3}
            >
              Dodajte slike (lahko več)
            </Field.Label>
            
            {/* Upload Area - Full Width */}
            <Box
              width="100%"
              borderWidth="2px"
              borderStyle="dashed"
              borderColor={{
                base: "gray.300",
                _dark: "gray.600",
                _hover: "blue.400",
              }}
              borderRadius="lg"
              p={10}
              textAlign="center"
              cursor="pointer"
              transition="all 0.2s"
              bg={{
                base: "gray.50",
                _dark: "gray.800",
                _hover: { base: "blue.50", _dark: "blue.900" },
              }}
              _hover={{
                borderColor: "blue.400",
                bg: { base: "blue.50", _dark: "blue.900" },
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
            <VStack gap={3}>
              <Box
                fontSize="4xl"
                color={{ base: "gray.400", _dark: "gray.500" }}
              >
                <LuImage />
              </Box>
              <VStack gap={1}>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  Kliknite za izbiro ali povlecite slike sem
                </Text>
                <Text
                  fontSize="xs"
                  color={{ base: "gray.500", _dark: "gray.400" }}
                >
                  Podprte so slike v formatih JPG, PNG, WEBP
                </Text>
              </VStack>
              <Button
                size="sm"
                colorPalette="blue"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <HStack gap={2}>
                  <LuUpload />
                  <Text>Izberi slike</Text>
                </HStack>
              </Button>
            </VStack>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              display="none"
            />
          </Box>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <Box mt={4}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={{ base: "gray.700", _dark: "gray.300" }}
                mb={3}
              >
                Izbrane slike ({imagePreviews.length})
              </Text>
              <Box
                display="grid"
                gridTemplateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(4, 1fr)", md: "repeat(4, 1fr)" }}
                gap={4}
              >
                {imagePreviews.map((preview, index) => {
                  const isMain = index === 0; // Main image is always first
                  const otherImageIndex = index - 1; // Index for non-main images (0, 1, 2, ...)
                  const col = 3 + (otherImageIndex % 2); // Column 3 or 4
                  const row = Math.floor(otherImageIndex / 2) + 1; // Row 1, 2, 3, ...
                  
                  return (
                  <Box
                    key={imageIds[index] || `image-${index}`}
                    position="relative"
                    borderRadius="md"
                    overflow="hidden"
                    borderWidth={isMain ? "2px" : "1px"}
                    borderColor={
                      isMain
                        ? { base: "yellow.400", _dark: "yellow.500" }
                        : { base: "gray.200", _dark: "gray.700" }
                    }
                    bg={{ base: "white", _dark: "gray.800" }}
                    aspectRatio="4/3"
                    gridColumn={
                      isMain
                        ? { base: "span 2", sm: "1 / 3", md: "1 / 3" }
                        : { base: "span 1", sm: `${col} / ${col + 1}`, md: `${col} / ${col + 1}` }
                    }
                    gridRow={
                      isMain
                        ? { base: "span 2", sm: "1 / 3", md: "1 / 3" }
                        : { base: "auto", sm: `${row} / ${row + 1}`, md: `${row} / ${row + 1}` }
                    }
                    onMouseEnter={() => setHoveredImageIndex(index)}
                    onMouseLeave={() => setHoveredImageIndex(null)}
                  >
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={400}
                      height={300}
                      unoptimized
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      position="absolute"
                      top={2}
                      right={2}
                      zIndex={10}
                      opacity={hoveredImageIndex === index ? 1 : 0}
                      transition="opacity 0.2s"
                    >
                      <HStack gap={1}>
                        <IconButton
                          size="sm"
                          colorPalette={isMain ? "yellow" : "gray"}
                          variant="solid"
                          bg={
                            isMain
                              ? { base: "yellow.500", _dark: "yellow.600" }
                              : { base: "whiteAlpha.900", _dark: "gray.800" }
                          }
                          color={
                            isMain
                              ? { base: "gray.900", _dark: "gray.900" }
                              : { base: "gray.700", _dark: "gray.200" }
                          }
                          shadow="md"
                          aria-label="Nastavi kot glavno sliko"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Reorder images so the selected one becomes first
                            const newImages = [...images];
                            const newPreviews = [...imagePreviews];
                            const newIds = [...imageIds];
                            const selectedImage = newImages[index];
                            const selectedPreview = newPreviews[index];
                            const selectedId = newIds[index];
                            
                            // Remove from current position
                            newImages.splice(index, 1);
                            newPreviews.splice(index, 1);
                            newIds.splice(index, 1);
                            
                            // Add to beginning
                            newImages.unshift(selectedImage);
                            newPreviews.unshift(selectedPreview);
                            newIds.unshift(selectedId);
                            
                            setImages(newImages);
                            setImagePreviews(newPreviews);
                            setImageIds(newIds);
                            setMainImageIndex(0);
                          }}
                        >
                          <LuStar />
                        </IconButton>
                        <IconButton
                          size="sm"
                          colorPalette="red"
                          variant="solid"
                          bg={{ base: "red.500", _dark: "red.600" }}
                          color="white"
                          shadow="md"
                          aria-label="Odstrani sliko"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                        >
                          <LuX />
                        </IconButton>
                      </HStack>
                    </Box>
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      bg="blackAlpha.600"
                      color="white"
                      fontSize="xs"
                      px={2}
                      py={1}
                      opacity={hoveredImageIndex === index ? 1 : 0}
                      transition="opacity 0.2s"
                    >
                      {isMain && "Glavna • "}
                      {images[index]?.name || `Slika ${index + 1}`}
                    </Box>
                  </Box>
                  );
                })}
              </Box>
            </Box>
          )}
          </Field.Root>
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
            Oprema in dodatni podatki
          </Heading>

          <Field.Root>
            <Field.Label
              fontSize="sm"
              fontWeight="medium"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              Opis opreme in dodatnih podatkov
            </Field.Label>
          <Textarea
            value={formData.equipmentAndDetails || ""}
            onChange={(e) => handleChange("equipmentAndDetails", e.target.value)}
            rows={6}
            placeholder="Opišite opremo vozila, dodatne podatke, stanje vozila..."
          />
          </Field.Root>
        </Box>

        {/* Dealership Selection Section - Only show if user is in a dealership */}
        {!dealershipsLoading && dealerships.length > 0 && (
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
              Objava kot trgovec
            </Heading>
            <Text
              fontSize="sm"
              color={{ base: "gray.600", _dark: "gray.400" }}
              mb={4}
            >
              Izberite, ali želite oglas objaviti kot zasebna oseba ali kot trgovec. Če izberete trgovec, bo oglas objavljen pod vašo trgovsko dejavnostjo.
            </Text>
            <Field.Root>
              <Field.Label
                fontSize="sm"
                fontWeight="medium"
                color={{ base: "gray.700", _dark: "gray.300" }}
              >
                Objava kot
              </Field.Label>
              <Select.Root
                collection={dealershipList.collection}
                value={formData.dealershipId ? [String(formData.dealershipId)] : [""]}
                onValueChange={(details) => {
                  const selectedValue = details.value[0] || "";
                  const selectedDealershipId = selectedValue === "" 
                    ? null 
                    : parseInt(selectedValue);
                  handleChange("dealershipId", selectedDealershipId);
                }}
              >
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Zasebna oseba" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                    <Select.ClearTrigger onClick={() => handleChange("dealershipId", null)} />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {dealershipList.collection.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        <Select.ItemText>{item.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
              {formData.dealershipId && (
                <Field.HelperText
                  fontSize="xs"
                  color={{ base: "blue.600", _dark: "blue.400" }}
                  mt={1}
                >
                  Oglas bo objavljen pod izbranim trgovskim dejavnostjo
                </Field.HelperText>
              )}
            </Field.Root>
          </Box>
        )}

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
            loadingText="Objavljanje..."
            fontSize="md"
            fontWeight="semibold"
            py={6}
          >
            Objavi oglas
          </Button>
        </Box>
      </VStack>
      </Box>
    </form>
  );
}

