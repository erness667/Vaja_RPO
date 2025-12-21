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
  Link,
} from "@chakra-ui/react";
import { PageShell } from "@/components/layout/PageShell";
import { useForgotPassword } from "@/lib/hooks/useForgotPassword";
import "@/lib/api-client";
import { Trans, t } from "@lingui/macro";
import NextLink from "next/link";

export function ForgotPasswordForm() {
  const { forgotPassword, isLoading, error, success, setError } = useForgotPassword();
  
  const [formData, setFormData] = useState({
    email: "",
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
    await forgotPassword(formData);
  }, [formData, forgotPassword]);

  return (
    <PageShell>
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Heading
            size="xl"
            mb={2}
            color={{ base: "gray.800", _dark: "gray.100" }}
          >
            <Trans>Forgot Password</Trans>
          </Heading>
          <Text
            fontSize="sm"
            color={{ base: "gray.600", _dark: "gray.400" }}
          >
            <Trans>Enter your email address and we'll send you a link to reset your password.</Trans>
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

        {success && (
          <Box
            p={4}
            borderRadius="md"
            bg={{ base: "green.50", _dark: "green.900" }}
            borderWidth="1px"
            borderColor={{ base: "green.200", _dark: "green.700" }}
            color={{ base: "green.800", _dark: "green.200" }}
            fontSize="sm"
          >
            <Trans>If an account with that email exists, a password reset link has been sent. Please check your email (or the console for testing).</Trans>
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
                <Trans>Email Address</Trans>
              </Field.Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t`Enter your email`}
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading || success}
              />
            </Field.Root>

            <Button
              type="submit"
              colorPalette="blue"
              size="md"
              width="full"
              loading={isLoading}
              disabled={isLoading || success}
            >
              {isLoading ? <Trans>Sending...</Trans> : <Trans>Send Reset Link</Trans>}
            </Button>
          </Stack>
        </form>

        <Box textAlign="center">
          <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
            <Trans>Remember your password?</Trans>{" "}
            <Link as={NextLink} href="/login" colorPalette="blue" textDecoration="underline">
              <Trans>Sign in</Trans>
            </Link>
          </Text>
        </Box>
      </VStack>
    </PageShell>
  );
}

