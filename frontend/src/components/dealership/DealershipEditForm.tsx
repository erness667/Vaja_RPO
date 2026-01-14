'use client';

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Field,
  Stack,
  Textarea,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { useUpdateDealership } from "@/lib/hooks/useUpdateDealership";
import { useUserDealership } from "@/lib/hooks/useUserDealership";
import { useAddressAutocomplete } from "@/lib/hooks/useAddressAutocomplete";
import { DealershipMap } from "./DealershipMap";
import type { UpdateDealershipRequest } from "@/client/types.gen";
import "@/lib/api-client";
import { Trans, t } from "@lingui/macro";
import {
  LuBuilding2,
  LuFileText,
  LuMapPin,
  LuPhone,
  LuMail,
  LuGlobe,
  LuArrowLeft,
} from "react-icons/lu";

export function DealershipEditForm() {
  const router = useRouter();
  const { dealership, isLoading: isLoadingDealership, fetchUserDealership } = useUserDealership();
  const { updateDealership, isLoading, error, setError } = useUpdateDealership();
  const { suggestions, isLoading: isSearchingAddress, searchAddress, getPlaceDetails, clearSuggestions } = useAddressAutocomplete();
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<UpdateDealershipRequest>({
    name: "",
    description: null,
    address: "",
    city: "",
    phoneNumber: "",
    email: null,
    website: null,
    taxNumber: null,
  });

  // Load dealership data when component mounts or dealership changes
  useEffect(() => {
    if (dealership) {
      setFormData({
        name: dealership.name,
        description: dealership.description ?? null,
        address: dealership.address,
        city: dealership.city,
        phoneNumber: dealership.phoneNumber,
        email: dealership.email ?? null,
        website: dealership.website ?? null,
        taxNumber: dealership.taxNumber ?? null,
      });
      setLatitude(dealership.latitude ?? null);
      setLongitude(dealership.longitude ?? null);
    }
  }, [dealership]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
    // Clear coordinates when address or city changes
    if (name === "address" || name === "city") {
      setLatitude(null);
      setLongitude(null);
    }
    // Trigger address autocomplete for address field
    if (name === "address") {
      searchAddress(value, formData.city ?? undefined);
      setShowAddressSuggestions(true);
    }
  }, [error, setError, searchAddress, formData.city]);

  const handleAddressSelect = useCallback(async (suggestion: { description: string; placeId: string }) => {
    // Get place details from place_id
    const placeDetails = await getPlaceDetails(suggestion.placeId);
    
    if (!placeDetails) {
      // Fallback: use description if place details not available
      const parts = suggestion.description.split(",");
      setFormData((prev) => ({
        ...prev,
        address: parts[0]?.trim() || suggestion.description,
        city: parts[1]?.trim() || (prev.city ?? ""),
      }));
      setShowAddressSuggestions(false);
      clearSuggestions();
      return;
    }

    // Build address from place details
    let addressText = "";
    if (placeDetails.streetName) {
      addressText = placeDetails.streetName;
      if (placeDetails.streetNumber) {
        addressText += ` ${placeDetails.streetNumber}`;
      }
    } else {
      // Fallback: use formatted address and extract first part
      const parts = placeDetails.formattedAddress.split(",");
      addressText = parts[0]?.trim() || placeDetails.formattedAddress;
    }
    
    const city = placeDetails.city || formData.city || "";

    setFormData((prev) => ({
      ...prev,
      address: addressText,
      city: city,
    }));

    // Set coordinates from place details
    if (placeDetails.latitude && placeDetails.longitude) {
      setLatitude(placeDetails.latitude);
      setLongitude(placeDetails.longitude);
    }

    setShowAddressSuggestions(false);
    clearSuggestions();
  }, [formData.city, getPlaceDetails, clearSuggestions]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!dealership) return;
    
    const updateData: UpdateDealershipRequest = {
      ...formData,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    };

    const result = await updateDealership(dealership.id, updateData);
    if (result.success) {
      // Refresh dealership data
      await fetchUserDealership();
      // Navigate back to management page
      router.push("/dealerships/manage");
    }
  }, [formData, latitude, longitude, updateDealership, dealership, fetchUserDealership, router]);

  if (isLoadingDealership) {
    return (
      <Box
        suppressHydrationWarning
        py={8}
        px={4}
        bgGradient={{ base: "linear(to-br, gray.50, gray.100, gray.50)", _dark: "linear(to-br, gray.900, gray.950, gray.900)" }}
        minH="calc(100vh - 5rem)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (!dealership) {
    return (
      <Box
        suppressHydrationWarning
        py={8}
        px={4}
        bgGradient={{ base: "linear(to-br, gray.50, gray.100, gray.50)", _dark: "linear(to-br, gray.900, gray.950, gray.900)" }}
        minH="calc(100vh - 5rem)"
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
          <VStack gap={4} align="center">
            <Icon as={LuBuilding2} boxSize={16} color={{ base: "gray.400", _dark: "gray.500" }} />
            <Heading size="lg" color={{ base: "gray.700", _dark: "gray.300" }}>
              <Trans>Ni avtohiše</Trans>
            </Heading>
            <Text color={{ base: "gray.600", _dark: "gray.400" }} textAlign="center">
              <Trans>
                Nimate odobrene avtohiše. Prosimo, zahtevajte avtohišo in počakajte na odobritev.
              </Trans>
            </Text>
            <Button
              colorPalette="blue"
              onClick={() => router.push("/dealerships/manage")}
            >
              <Trans>Nazaj</Trans>
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      suppressHydrationWarning
      py={8}
      px={4}
      bgGradient={{ base: "linear(to-br, gray.50, gray.100, gray.50)", _dark: "linear(to-br, gray.900, gray.950, gray.900)" }}
      minH="calc(100vh - 5rem)"
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
        <VStack gap={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <Icon as={LuBuilding2} boxSize={8} color="blue.500" />
              <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
                <Trans>Uredi avtohišo</Trans>
              </Heading>
            </HStack>
            <Button
              variant="ghost"
              onClick={() => router.push("/dealerships/manage")}
              disabled={isLoading}
            >
              <HStack gap={2}>
                <Icon as={LuArrowLeft} />
                <Trans>Nazaj</Trans>
              </HStack>
            </Button>
          </HStack>

          {/* Error Message */}
          {error && (
            <Box
              p={4}
              borderRadius="lg"
              bg={{ base: "red.50", _dark: "red.900" }}
              borderWidth="1px"
              borderColor={{ base: "red.200", _dark: "red.700" }}
            >
              <Text color={{ base: "red.800", _dark: "red.200" }}>{error}</Text>
            </Box>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
              <Field.Root required>
                <Field.Label
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <HStack gap={2}>
                    <Icon as={LuBuilding2} boxSize={4} />
                    <Trans>Ime avtohiše</Trans>
                  </HStack>
                </Field.Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name ?? ""}
                  onChange={handleChange}
                  placeholder={t`Vnesite ime avtohiše`}
                  disabled={isLoading}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <HStack gap={2}>
                    <Icon as={LuFileText} boxSize={4} />
                    <Trans>Opis</Trans>
                    <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }}>
                      (neobvezno)
                    </Text>
                  </HStack>
                </Field.Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description ?? ""}
                  onChange={handleChange}
                  placeholder={t`Dodajte opis avtohiše...`}
                  rows={4}
                  disabled={isLoading}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <HStack gap={2}>
                    <Icon as={LuMapPin} boxSize={4} />
                    <Trans>Naslov</Trans>
                  </HStack>
                </Field.Label>
                <Box position="relative" width="100%">
                  <Input
                    ref={addressInputRef}
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address ?? ""}
                    onChange={handleChange}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowAddressSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowAddressSuggestions(false), 200);
                    }}
                    placeholder={t`Vnesite naslov avtohiše`}
                    disabled={isLoading}
                    width="100%"
                  />
                  {showAddressSuggestions && suggestions.length > 0 && (
                    <Box
                      ref={suggestionsRef}
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      mt={1}
                      bg={{ base: "white", _dark: "gray.800" }}
                      borderWidth="1px"
                      borderColor={{ base: "gray.200", _dark: "gray.700" }}
                      borderRadius="md"
                      boxShadow="lg"
                      zIndex={1000}
                      maxH="300px"
                      overflowY="auto"
                    >
                      {isSearchingAddress && (
                        <Box p={3} textAlign="center">
                          <Spinner size="sm" />
                        </Box>
                      )}
                      {!isSearchingAddress && suggestions.map((suggestion, index) => (
                        <Box
                          key={suggestion.placeId || index}
                          p={3}
                          cursor="pointer"
                          _hover={{
                            bg: { base: "gray.100", _dark: "gray.700" },
                          }}
                          onClick={() => handleAddressSelect(suggestion)}
                          borderBottomWidth={index < suggestions.length - 1 ? "1px" : "0"}
                          borderColor={{ base: "gray.100", _dark: "gray.700" }}
                        >
                          <Text
                            fontSize="sm"
                            color={{ base: "gray.800", _dark: "gray.100" }}
                            lineClamp={2}
                          >
                            {suggestion.description}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Field.Root>

              <Field.Root required>
                <Field.Label
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <HStack gap={2}>
                    <Icon as={LuMapPin} boxSize={4} />
                    <Trans>Mesto</Trans>
                  </HStack>
                </Field.Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city ?? ""}
                  onChange={handleChange}
                  placeholder={t`Vnesite mesto`}
                  disabled={isLoading}
                />
              </Field.Root>

              {/* Map Section */}
              <VStack align="stretch" gap={3}>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <Trans>Lokacija na zemljevidu</Trans>
                </Text>

                <DealershipMap
                  key={`${latitude}-${longitude}`}
                  latitude={latitude}
                  longitude={longitude}
                  address={formData.address && formData.city ? `${formData.address}, ${formData.city}` : formData.address ?? ""}
                />
              </VStack>

              <Field.Root required>
                <Field.Label
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <HStack gap={2}>
                    <Icon as={LuPhone} boxSize={4} />
                    <Trans>Telefonska številka</Trans>
                  </HStack>
                </Field.Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber ?? ""}
                  onChange={handleChange}
                  placeholder={t`Vnesite telefonsko številko`}
                  disabled={isLoading}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <HStack gap={2}>
                    <Icon as={LuFileText} boxSize={4} />
                    <Trans>Davčna številka</Trans>
                    <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }}>
                      (neobvezno)
                    </Text>
                  </HStack>
                </Field.Label>
                <Input
                  id="taxNumber"
                  name="taxNumber"
                  type="text"
                  value={formData.taxNumber ?? ""}
                  onChange={handleChange}
                  placeholder={t`Vnesite davčno številko`}
                  disabled={isLoading}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <HStack gap={2}>
                    <Icon as={LuMail} boxSize={4} />
                    <Trans>E-poštni naslov</Trans>
                    <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }}>
                      (neobvezno)
                    </Text>
                  </HStack>
                </Field.Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email ?? ""}
                  onChange={handleChange}
                  placeholder={t`Vnesite e-poštni naslov`}
                  disabled={isLoading}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <HStack gap={2}>
                    <Icon as={LuGlobe} boxSize={4} />
                    <Trans>Spletna stran</Trans>
                    <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }}>
                      (neobvezno)
                    </Text>
                  </HStack>
                </Field.Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website ?? ""}
                  onChange={handleChange}
                  placeholder={t`https://example.com`}
                  disabled={isLoading}
                />
              </Field.Root>

              <HStack gap={3} justify="flex-end">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dealerships/manage")}
                  disabled={isLoading}
                >
                  <Trans>Prekliči</Trans>
                </Button>
                <Button
                  type="submit"
                  colorPalette="blue"
                  loading={isLoading}
                  loadingText={t`Shranjevanje...`}
                  disabled={isLoading}
                >
                  <Trans>Shrani spremembe</Trans>
                </Button>
              </HStack>
            </Stack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
}
