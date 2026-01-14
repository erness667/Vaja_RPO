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
  Card,
  CardBody,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { useCreateDealership } from "@/lib/hooks/useCreateDealership";
import { useGeocoding } from "@/lib/hooks/useGeocoding";
import { useAddressAutocomplete } from "@/lib/hooks/useAddressAutocomplete";
import { DealershipMap } from "./DealershipMap";
import type { CreateDealershipRequest } from "@/client/types.gen";
import "@/lib/api-client";
import { Trans, t } from "@lingui/macro";
import {
  LuBuilding2,
  LuFileText,
  LuMapPin,
  LuPhone,
  LuMail,
  LuGlobe,
} from "react-icons/lu";
import { DealershipInvitationsList } from "./DealershipInvitationsList";

export function DealershipRequestForm() {
  const router = useRouter();
  const { createDealership, isLoading, error, setError } = useCreateDealership();
  const { geocodeAddress } = useGeocoding();
  const { suggestions, isLoading: isSearchingAddress, searchAddress, getPlaceDetails, clearSuggestions } = useAddressAutocomplete();
  const [success, setSuccess] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<CreateDealershipRequest>({
    name: "",
    description: "",
    address: "",
    city: "",
    phoneNumber: "",
    email: "",
    website: "",
    taxNumber: "",
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
    if (success) setSuccess(false);
    // Clear coordinates when address or city changes
    if (name === "address" || name === "city") {
      setLatitude(null);
      setLongitude(null);
    }
    // Trigger address autocomplete for address field
    if (name === "address") {
      searchAddress(value, formData.city);
      setShowAddressSuggestions(true);
    }
  }, [error, setError, success, searchAddress, formData.city]);

  const handleAddressSelect = useCallback(async (suggestion: { description: string; placeId: string }) => {
    // Get place details from place_id
    const placeDetails = await getPlaceDetails(suggestion.placeId);
    
    if (!placeDetails) {
      // Fallback: use description if place details not available
      const parts = suggestion.description.split(",");
      setFormData((prev) => ({
        ...prev,
        address: parts[0]?.trim() || suggestion.description,
        city: parts[1]?.trim() || prev.city,
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
    
    const city = placeDetails.city || formData.city;
    
    setFormData((prev) => ({
      ...prev,
      address: addressText.trim(),
      city: city || prev.city,
    }));
    
    // Set coordinates from place details
    if (placeDetails.latitude && placeDetails.longitude) {
      setLatitude(placeDetails.latitude);
      setLongitude(placeDetails.longitude);
    }
    
    setShowAddressSuggestions(false);
    clearSuggestions();
    
    // Focus back on input
    if (addressInputRef.current) {
      addressInputRef.current.focus();
    }
  }, [formData.city, getPlaceDetails, clearSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowAddressSuggestions(false);
      }
    };

    if (showAddressSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showAddressSuggestions]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Auto-geocode if coordinates not set
    let finalLatitude = latitude;
    let finalLongitude = longitude;
    
    if (!finalLatitude || !finalLongitude) {
      const geocodeResult = await geocodeAddress(formData.address, formData.city);
      if (geocodeResult) {
        finalLatitude = geocodeResult.latitude;
        finalLongitude = geocodeResult.longitude;
        setLatitude(finalLatitude);
        setLongitude(finalLongitude);
      }
    }

    const result = await createDealership({
      ...formData,
      description: formData.description || null,
      email: formData.email || null,
      website: formData.website || null,
      taxNumber: formData.taxNumber || null,
      latitude: finalLatitude || undefined,
      longitude: finalLongitude || undefined,
    });
    
    if (result.success) {
      setSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: "",
          description: "",
          address: "",
          city: "",
          phoneNumber: "",
          email: "",
          website: "",
          taxNumber: "",
        });
        setLatitude(null);
        setLongitude(null);
        setSuccess(false);
        router.push("/profile");
      }, 3000);
    }
  }, [formData, latitude, longitude, geocodeAddress, createDealership, router]);

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
            <VStack align="stretch" gap={3}>
              <HStack gap={3}>
                <Icon as={LuBuilding2} boxSize={8} color="blue.500" />
                <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
                  <Trans>Zahteva za avtohišo</Trans>
                </Heading>
              </HStack>
              <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                <Trans>
                  Izpolnite spodnji obrazec za zahtevo za registracijo avtohiše. 
                  Vaša zahteva bo pregledana in odobrena s strani administratorja.
                </Trans>
              </Text>
            </VStack>

            {/* Pending Invitations */}
            <Box>
              <DealershipInvitationsList />
            </Box>

            {/* Success Message */}
            {success && (
              <Card.Root colorPalette="green">
                <CardBody p={4}>
                  <VStack gap={2} align="flex-start">
                    <Text fontWeight="medium" color={{ base: "green.800", _dark: "green.200" }}>
                      <Trans>Zahteva uspešno oddana!</Trans>
                    </Text>
                    <Text fontSize="sm" color={{ base: "green.700", _dark: "green.300" }}>
                      <Trans>
                        Vaša zahteva za avtohišo je bila uspešno oddana. 
                        Administrator bo pregledal vašo zahtevo in vas bo obvestil o odločitvi.
                      </Trans>
                    </Text>
                  </VStack>
                </CardBody>
              </Card.Root>
            )}

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
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t`Vnesite ime avtohiše`}
                    disabled={isLoading || success}
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
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t`Dodajte opis avtohiše...`}
                    rows={4}
                    disabled={isLoading || success}
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
                      value={formData.address}
                      onChange={handleChange}
                      onFocus={() => {
                        if (suggestions.length > 0) {
                          setShowAddressSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow click
                        setTimeout(() => setShowAddressSuggestions(false), 200);
                      }}
                      placeholder={t`Vnesite naslov avtohiše`}
                      disabled={isLoading || success}
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
                    value={formData.city}
                    onChange={handleChange}
                    placeholder={t`Vnesite mesto`}
                    disabled={isLoading || success}
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
                    latitude={latitude}
                    longitude={longitude}
                    address={formData.address && formData.city ? `${formData.address}, ${formData.city}` : formData.address}
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
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder={t`Vnesite telefonsko številko`}
                    disabled={isLoading || success}
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
                    value={formData.taxNumber || ""}
                    onChange={handleChange}
                    placeholder={t`Vnesite davčno številko`}
                    disabled={isLoading || success}
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
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t`Vnesite e-poštni naslov`}
                    disabled={isLoading || success}
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
                    value={formData.website}
                    onChange={handleChange}
                    placeholder={t`https://example.com`}
                    disabled={isLoading || success}
                  />
                </Field.Root>

                <Button
                  type="submit"
                  colorPalette="blue"
                  size="lg"
                  width="full"
                  loading={isLoading}
                  loadingText={t`Oddajanje zahteve...`}
                  disabled={isLoading || success}
                >
                  <Trans>Oddaj zahtevo</Trans>
                </Button>
              </Stack>
            </form>
          </VStack>
        </Box>
      </Box>
  );
}

