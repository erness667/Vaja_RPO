'use client';

import { useState, useCallback } from "react";
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
} from "@chakra-ui/react";
import { useCreateDealership } from "@/lib/hooks/useCreateDealership";
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

export function DealershipRequestForm() {
  const router = useRouter();
  const { createDealership, isLoading, error, setError } = useCreateDealership();
  const [success, setSuccess] = useState(false);
  
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
  }, [error, setError, success]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await createDealership({
      ...formData,
      description: formData.description || null,
      email: formData.email || null,
      website: formData.website || null,
      taxNumber: formData.taxNumber || null,
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
        setSuccess(false);
        router.push("/profile");
      }, 3000);
    }
  }, [formData, createDealership, router]);

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
                  <Trans>Zahteva za prodajalnico</Trans>
                </Heading>
              </HStack>
              <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                <Trans>
                  Izpolnite spodnji obrazec za zahtevo za registracijo prodajalnice. 
                  Vaša zahteva bo pregledana in odobrena s strani administratorja.
                </Trans>
              </Text>
            </VStack>

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
                        Vaša zahteva za prodajalnico je bila uspešno oddana. 
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
                      <Trans>Ime prodajalnice</Trans>
                    </HStack>
                  </Field.Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t`Vnesite ime prodajalnice`}
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
                    placeholder={t`Dodajte opis prodajalnice...`}
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
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t`Vnesite naslov prodajalnice`}
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

