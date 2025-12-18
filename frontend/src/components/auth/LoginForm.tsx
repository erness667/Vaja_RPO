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
import { useLogin } from "@/lib/hooks/useLogin";
import type { LoginFormData } from "@/lib/types/auth";
import "@/lib/api-client";
import { Trans, t } from "@lingui/macro";

export function LoginForm() {
  const { login, isLoading, error, setError } = useLogin();
  
  const [formData, setFormData] = useState<LoginFormData>({
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
    await login(formData);
  }, [formData, login]);

  return (
    <PageShell>
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Heading
            size="xl"
            mb={2}
            color={{ base: "gray.800", _dark: "gray.100" }}
          >
            <Trans>Sign in</Trans>
          </Heading>
          <Text
            fontSize="sm"
            color={{ base: "gray.600", _dark: "gray.400" }}
          >
            <Trans>Enter your credentials to access your account.</Trans>
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
              <Trans>Username or Email</Trans>
              </Field.Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
              placeholder={t`Enter your username or email`}
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label
                fontSize="sm"
                fontWeight="medium"
                color={{ base: "gray.700", _dark: "gray.300" }}
              >
              <Trans>Password</Trans>
              </Field.Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
              placeholder={t`Enter your password`}
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Field.Root>

            <Button
              type="submit"
              colorPalette="blue"
              size="md"
              width="full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? <Trans>Signing in...</Trans> : <Trans>Sign in</Trans>}
            </Button>
          </Stack>
        </form>
      </VStack>
    </PageShell>
  );
}

