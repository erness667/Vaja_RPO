"use client";

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

export function LoginForm() {
  return (
    <PageShell>
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Heading
            size="xl"
            mb={2}
            color={{ base: "gray.800", _dark: "gray.100" }}
          >
            Sign in
          </Heading>
          <Text
            fontSize="sm"
            color={{ base: "gray.600", _dark: "gray.400" }}
          >
            Enter your credentials to access your account.
          </Text>
        </Box>

        <form>
          <Stack gap={6}>
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
                placeholder="Enter your username"
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
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </Field.Root>

            <Button
              type="submit"
              colorPalette="blue"
              size="md"
              width="full"
            >
              Login
            </Button>
          </Stack>
        </form>
      </VStack>
    </PageShell>
  );
}

