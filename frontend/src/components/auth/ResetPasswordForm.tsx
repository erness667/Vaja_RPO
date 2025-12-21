"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { useResetPassword } from "@/lib/hooks/useResetPassword";
import "@/lib/api-client";
import { Trans, t } from "@lingui/macro";
import NextLink from "next/link";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { resetPassword, isLoading, error, success, setError } = useResetPassword();
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setValidationError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
    if (validationError) setValidationError(null);
  }, [error, setError, validationError]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token) {
      setValidationError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    setValidationError(null);
    await resetPassword({
      token,
      newPassword: formData.newPassword,
    });
  }, [formData, token, resetPassword, setError]);

  const displayError = validationError || error;

  return (
    <PageShell>
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Heading
            size="xl"
            mb={2}
            color={{ base: "gray.800", _dark: "gray.100" }}
          >
            <Trans>Reset Password</Trans>
          </Heading>
          <Text
            fontSize="sm"
            color={{ base: "gray.600", _dark: "gray.400" }}
          >
            <Trans>Enter your new password below.</Trans>
          </Text>
        </Box>

        {displayError && (
          <Box
            p={4}
            borderRadius="md"
            bg={{ base: "red.50", _dark: "red.900" }}
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
            color={{ base: "red.800", _dark: "red.200" }}
            fontSize="sm"
          >
            {displayError}
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
            <Trans>Password has been reset successfully! Redirecting to login...</Trans>
          </Box>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
              <Field.Root required>
                <Field.Label
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <Trans>New Password</Trans>
                </Field.Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t`Enter your new password`}
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={isLoading || success}
                />
                <Field.HelperText>
                  <Trans>Must be at least 6 characters long</Trans>
                </Field.HelperText>
              </Field.Root>

              <Field.Root required>
                <Field.Label
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <Trans>Confirm Password</Trans>
                </Field.Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t`Confirm your new password`}
                  value={formData.confirmPassword}
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
                disabled={isLoading || success || !token}
              >
                {isLoading ? <Trans>Resetting...</Trans> : <Trans>Reset Password</Trans>}
              </Button>
            </Stack>
          </form>
        )}

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

