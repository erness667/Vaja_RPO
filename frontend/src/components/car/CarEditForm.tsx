'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Spinner,
  Text,
  HStack,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { LuArrowLeft, LuUpload, LuX, LuImage, LuStar } from "react-icons/lu";
import { useUpdateCar } from "@/lib/hooks/useUpdateCar";
import { useCar } from "@/lib/hooks/useCar";
import { useCarMakes } from "@/lib/hooks/useCarMakes";
import { useCarModels } from "@/lib/hooks/useCarModels";
import { MakeDropdown } from "../ui/MakeDropdown";
import { ModelDropdown } from "../ui/ModelDropdown";
import type { UpdateCarRequest } from "@/client/types.gen";
import { postApiCarsByIdImages, putApiCarsByIdImagesByImageIdSetMain, deleteApiCarsByIdImagesByImageId } from "@/client";
import type { CarImageInfo } from "@/lib/types/car";
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
  const { car, isLoading: isLoadingCar, error: carError, refetch: refetchCar } = useCar(carId);
  const { makes } = useCarMakes();
  const { updateCar, isLoading, error, setError } = useUpdateCar();

  // Image management state
  const [existingImages, setExistingImages] = useState<CarImageInfo[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState<number | null>(null);
  const [isSettingMain, setIsSettingMain] = useState<number | null>(null);
  const [pendingMainImageId, setPendingMainImageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);

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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [newImagePreviews]);

  // Update existing images when car data changes
  useEffect(() => {
    if (car) {
      if (car.images && car.images.length > 0) {
        setExistingImages(car.images);
      } else if (car.imageUrls && car.imageUrls.length > 0) {
        // Fallback: create image info from URLs if images array not available
        const imagesFromUrls: CarImageInfo[] = car.imageUrls.map((url, index) => ({
          id: -(index + 1), // Negative IDs for images without IDs
          url,
          isMain: url === car.mainImageUrl,
        }));
        setExistingImages(imagesFromUrls);
      } else {
        setExistingImages([]);
      }
    }
  }, [car]);

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

  // Image management functions
  const handleDeleteImage = useCallback(async (imageId: number) => {
    if (imageId < 0) {
      // This is a temporary image without an ID, just remove from state
      setExistingImages(prev => {
        const filtered = prev.filter(img => img.id !== imageId);
        const deletedImage = prev.find(img => img.id === imageId);
        // If deleted image was main and there are remaining images, set first one as main
        if (deletedImage?.isMain && filtered.length > 0) {
          const firstImageId = filtered[0].id;
          return filtered.map((img) => ({
            ...img,
            isMain: img.id === firstImageId,
          }));
        }
        return filtered;
      });
      return;
    }

    setIsDeletingImage(imageId);
    try {
      // Check if the image being deleted is the main image
      const imageToDelete = existingImages.find(img => img.id === imageId);
      const wasMainImage = imageToDelete?.isMain ?? false;

      const response = await deleteApiCarsByIdImagesByImageId({
        path: { id: carId, imageId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        // Check for 403 Forbidden first
        if (response.response?.status === 403) {
          throw new Error("You don't have permission to delete images. If you recently became an admin, please log out and log back in to refresh your session.");
        }
        
        let errorMessage = "Failed to delete image";
        if (response.error) {
          errorMessage = typeof response.error === 'string' ? response.error : "Failed to delete image";
        } else if (response.response) {
          try {
            const errorData = await response.response.json().catch(() => ({ message: "Failed to delete image" }));
            errorMessage = errorData.message || "Failed to delete image";
          } catch {
            errorMessage = "Failed to delete image";
          }
        }
        throw new Error(errorMessage);
      }

      // Update local state immediately instead of refetching to avoid page refresh
      setExistingImages(prev => {
        const filtered = prev.filter(img => img.id !== imageId);
        
        // If deleted image was main and there are remaining images, set first one as main
        if (wasMainImage && filtered.length > 0) {
          const firstRemainingImageId = filtered[0].id;
          // Only track as pending if it's a real image (not temporary with negative ID)
          if (firstRemainingImageId > 0) {
            // Store as pending main image change (will be applied on form submit)
            setPendingMainImageId(firstRemainingImageId);
          }
          
          // Update local state immediately
          return filtered.map((img) => ({
            ...img,
            isMain: img.id === firstRemainingImageId,
          }));
        }
        
        return filtered;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete image";
      setError(errorMessage);
    } finally {
      setIsDeletingImage(null);
    }
  }, [carId, setError, existingImages]);

  const handleSetMainImage = useCallback((imageId: number) => {
    // Just update local state - don't call API until form is submitted
    setExistingImages(prev => prev.map(img => ({
      ...img,
      isMain: img.id === imageId,
    })));
    
    // Store pending main image change (only for real images, not temporary ones)
    if (imageId > 0) {
      setPendingMainImageId(imageId);
    }
  }, []);

  const handleNewImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Clear the file input
    if (e.target) {
      e.target.value = '';
    }

    // Store files temporarily (don't upload yet)
    setNewImages(prev => [...prev, ...files]);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...previews]);
  }, []);

  const handleRemoveNewImage = useCallback((index: number) => {
    if (newImagePreviews[index]) {
      URL.revokeObjectURL(newImagePreviews[index]);
    }
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  }, [newImagePreviews]);

  const uploadNewImages = useCallback(async () => {
    if (newImages.length === 0) return;

    setIsUploadingImages(true);
    try {
      const response = await postApiCarsByIdImages({
        path: { id: carId },
        body: { files: newImages },
      });

      if (response.error || (response.response && !response.response.ok)) {
        // Check for 403 Forbidden first
        if (response.response?.status === 403) {
          throw new Error("You don't have permission to upload images. If you recently became an admin, please log out and log back in to refresh your session.");
        }
        
        let errorMessage = "Failed to upload images";
        if (response.error) {
          errorMessage = typeof response.error === 'string' ? response.error : "Failed to upload images";
        } else if (response.response) {
          try {
            const errorData = await response.response.json().catch(() => ({ message: "Failed to upload images" }));
            errorMessage = errorData.message || "Failed to upload images";
          } catch {
            errorMessage = "Failed to upload images";
          }
        }
        throw new Error(errorMessage);
      }

      // Update local state with new images from response
      if (response.data) {
        const updatedCar = response.data as { images?: CarImageInfo[] };
        if (updatedCar.images && Array.isArray(updatedCar.images)) {
          // Merge new images with existing ones
          setExistingImages(prev => {
            const existingIds = new Set(prev.map(img => img.id));
            const newImagesFromResponse = updatedCar.images!.filter((img: CarImageInfo) => !existingIds.has(img.id));
            return [...prev, ...newImagesFromResponse];
          });
        } else {
          // Fallback: reload car data
          await refetchCar();
        }
      } else {
        // Fallback: reload car data
        await refetchCar();
      }

      // Clear new images and previews
      const previewsToRevoke = [...newImagePreviews];
      setNewImages([]);
      setNewImagePreviews([]);
      previewsToRevoke.forEach((preview: string) => URL.revokeObjectURL(preview));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload images";
      setError(errorMessage);
      throw err; // Re-throw to prevent form submission
    } finally {
      setIsUploadingImages(false);
    }
  }, [newImages, newImagePreviews, carId, refetchCar, setError]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;

    // Create a synthetic event to reuse handleNewImagesChange
    const syntheticEvent = {
      target: { files: files as unknown as FileList, value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleNewImagesChange(syntheticEvent);
  }, [handleNewImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      // Upload new images first if any
      if (newImages.length > 0) {
        try {
          await uploadNewImages();
        } catch {
          // Error already handled in uploadNewImages
          return;
        }
      }

      // Apply pending main image change if any
      if (pendingMainImageId !== null) {
        setIsSettingMain(pendingMainImageId);
        try {
          const response = await putApiCarsByIdImagesByImageIdSetMain({
            path: { id: carId, imageId: pendingMainImageId },
          });

          if (response.error || (response.response && !response.response.ok)) {
            if (response.response?.status === 403) {
              throw new Error("You don't have permission to perform this action. If you recently became an admin, please log out and log back in to refresh your session.");
            }
            throw new Error("Failed to set main image");
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to set main image";
          setError(errorMessage);
          setIsSettingMain(null);
          return; // Don't proceed with form submission if setting main image fails
        } finally {
          setIsSettingMain(null);
        }
      }

      // Then update car details
      const result = await updateCar(carId, formData);
      if (result.success) {
        // Clear pending main image change
        setPendingMainImageId(null);
        router.push(`/cars/${carId}`);
      }
    },
    [formData, carId, updateCar, router, newImages, uploadNewImages, pendingMainImageId, setError]
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
                  <Trans>Fotografije vozila</Trans>
                </Heading>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <Box mb={6}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={{ base: "gray.700", _dark: "gray.300" }}
                      mb={3}
                    >
                      <Trans>Obstoječe slike ({existingImages.length})</Trans>
                    </Text>
                    <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={4}>
                      {existingImages.map((image, index) => (
                        <Box
                          key={image.id}
                          position="relative"
                          aspectRatio="4/3"
                          borderRadius="md"
                          overflow="hidden"
                          borderWidth={image.isMain ? "2px" : "1px"}
                          borderColor={
                            image.isMain
                              ? { base: "yellow.400", _dark: "yellow.500" }
                              : { base: "gray.200", _dark: "gray.700" }
                          }
                          bg={{ base: "white", _dark: "gray.800" }}
                          onMouseEnter={() => setHoveredImageIndex(index)}
                          onMouseLeave={() => setHoveredImageIndex(null)}
                        >
                          <Image
                            src={image.url}
                            alt={`Car image ${index + 1}`}
                            fill
                            unoptimized
                            style={{
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
                                colorPalette={image.isMain ? "yellow" : "gray"}
                                variant="solid"
                                bg={
                                  image.isMain
                                    ? { base: "yellow.500", _dark: "yellow.600" }
                                    : { base: "whiteAlpha.900", _dark: "gray.800" }
                                }
                                shadow="md"
                                aria-label="Nastavi kot glavno sliko"
                                onClick={() => handleSetMainImage(image.id)}
                                loading={isSettingMain === image.id}
                                disabled={image.isMain}
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
                                onClick={() => handleDeleteImage(image.id)}
                                loading={isDeletingImage === image.id}
                              >
                                <LuX />
                              </IconButton>
                            </HStack>
                          </Box>
                          {image.isMain && (
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
                              textAlign="center"
                            >
                              <Trans>Glavna</Trans>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {/* Upload New Images */}
                <Box>
                  <Field.Root>
                    <Field.Label
                      fontSize="sm"
                      fontWeight="medium"
                      color={{ base: "gray.700", _dark: "gray.300" }}
                      mb={3}
                    >
                      <Trans>Dodajte nove slike</Trans>
                    </Field.Label>
                    
                    <Box
                      width="100%"
                      borderWidth="2px"
                      borderStyle="dashed"
                      borderColor={{
                        base: "gray.300",
                        _dark: "gray.600",
                      }}
                      borderRadius="lg"
                      p={6}
                      textAlign="center"
                      cursor="pointer"
                      transition="all 0.2s"
                      bg={{
                        base: "gray.50",
                        _dark: "gray.800",
                      }}
                      _hover={{
                        borderColor: "blue.400",
                        bg: { base: "blue.50", _dark: "blue.900" },
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <VStack gap={2}>
                        <Icon as={LuImage} boxSize={8} color={{ base: "gray.400", _dark: "gray.500" }} />
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={{ base: "gray.700", _dark: "gray.300" }}
                        >
                          <Trans>Kliknite za izbiro slik</Trans>
                        </Text>
                        <Button
                          size="sm"
                          colorPalette="blue"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <Icon as={LuUpload} mr={2} />
                          <Trans>Izberi slike</Trans>
                        </Button>
                      </VStack>
                      
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewImagesChange}
                        display="none"
                      />
                    </Box>
                  </Field.Root>

                  {/* New Image Previews (not yet uploaded) */}
                  {newImagePreviews.length > 0 && (
                    <Box mt={4}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={{ base: "gray.700", _dark: "gray.300" }}
                        mb={3}
                      >
                        <Trans>Nove slike (bodo naložene ob shranjevanju)</Trans> ({newImagePreviews.length})
                      </Text>
                      <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={4} mb={4}>
                        {newImagePreviews.map((preview, index) => (
                          <Box
                            key={index}
                            position="relative"
                            aspectRatio="4/3"
                            borderRadius="md"
                            overflow="hidden"
                            borderWidth="1px"
                            borderColor={{ base: "gray.200", _dark: "gray.700" }}
                            bg={{ base: "white", _dark: "gray.800" }}
                          >
                            <Image
                              src={preview}
                              alt={`New image ${index + 1}`}
                              fill
                              unoptimized
                              style={{
                                objectFit: "cover",
                              }}
                            />
                            <IconButton
                              position="absolute"
                              top={2}
                              right={2}
                              size="sm"
                              colorPalette="red"
                              variant="solid"
                              bg={{ base: "red.500", _dark: "red.600" }}
                              color="white"
                              shadow="md"
                              aria-label="Odstrani sliko"
                              onClick={() => handleRemoveNewImage(index)}
                            >
                              <LuX />
                            </IconButton>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}

                  {/* Show loading indicator when uploading */}
                  {isUploadingImages && (
                    <Box mt={4} textAlign="center">
                      <Spinner size="md" color="blue.500" mr={2} />
                      <Text
                        fontSize="sm"
                        color={{ base: "gray.600", _dark: "gray.400" }}
                        display="inline"
                      >
                        <Trans>Nalaganje slik...</Trans>
                      </Text>
                    </Box>
                  )}
                </Box>
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

