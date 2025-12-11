"use client";

import { useState, useCallback } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Field,
  Stack,
} from "@chakra-ui/react";
import { PageShell } from "@/components/layout/PageShell";
import { useRegister } from "@/lib/hooks/useRegister";
import type { RegisterFormData } from "@/lib/types/auth";
import "@/lib/api-client";

export function RegisterForm() {
  const { register, isLoading, error, setError } = useRegister();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    username: "",
    password: "",
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  }, [error, setError]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await register(formData);
  }, [formData, register]);


  return (
    <PageShell>
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Heading
            size="xl"
            mb={2}
            color={{ base: "gray.800", _dark: "gray.100" }}
          >
            Create account
          </Heading>
          <Text
            fontSize="sm"
            color={{ base: "gray.600", _dark: "gray.400" }}
          >
            Sign up with a username and password to get started.
          </Text>
        </Box>

        {error && (
          <Box
            p={4}
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

        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <Field.Root required>
              <Field.Label
                fontSize="sm"
                fontWeight="medium"
                color={{ base: "gray.700", _dark: "gray.300" }}
              >
                Name
              </Field.Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={isLoading}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label
                fontSize="sm"
                fontWeight="medium"
                color={{ base: "gray.700", _dark: "gray.300" }}
              >
                Surname
              </Field.Label>
              <Input
                id="surname"
                name="surname"
                type="text"
                autoComplete="family-name"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Enter your surname"
                disabled={isLoading}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label
                fontSize="sm"
                fontWeight="medium"
                color={{ base: "gray.700", _dark: "gray.300" }}
              >
                Email Address
              </Field.Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label
                fontSize="sm"
                fontWeight="medium"
                color={{ base: "gray.700", _dark: "gray.300" }}
              >
                Phone Number
              </Field.Label>
              <Input
                id="phone"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                disabled={isLoading}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label
                fontSize="sm"
                fontWeight="medium"
                color={{ base: "gray.700", _dark: "gray.300" }}
              >
                Username
              </Field.Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                disabled={isLoading}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label
                fontSize="sm"
                fontWeight="medium"
                color={{ base: "gray.700", _dark: "gray.300" }}
              >
                Password
              </Field.Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                disabled={isLoading}
              />
            </Field.Root>

            <Button
              type="submit"
              colorPalette="blue"
              size="md"
              width="full"
              loading={isLoading}
              loadingText="Registering..."
              disabled={isLoading}
            >
              Register
            </Button>
          </Stack>
        </form>
      </VStack>
    </PageShell>
  );
}
