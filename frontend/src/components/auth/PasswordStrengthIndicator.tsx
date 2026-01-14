"use client";

import { useMemo } from "react";
import { Box, HStack, Text, Progress } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";

export type PasswordStrength = "very-weak" | "weak" | "medium" | "strong" | "very-strong";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    if (!password) return null;

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    if (score <= 1) return "very-weak" as PasswordStrength;
    if (score === 2) return "weak" as PasswordStrength;
    if (score === 3) return "medium" as PasswordStrength;
    if (score === 4) return "strong" as PasswordStrength;
    return "very-strong" as PasswordStrength;
  }, [password]);

  const strengthConfig = useMemo(() => {
    if (!strength) return null;

    const configs = {
      "very-weak": {
        label: <Trans>Very Weak</Trans>,
        color: "red",
        value: 20,
        bgColor: { base: "red.500", _dark: "red.600" },
      },
      weak: {
        label: <Trans>Weak</Trans>,
        color: "orange",
        value: 40,
        bgColor: { base: "orange.500", _dark: "orange.600" },
      },
      medium: {
        label: <Trans>Medium</Trans>,
        color: "yellow",
        value: 60,
        bgColor: { base: "yellow.500", _dark: "yellow.600" },
      },
      strong: {
        label: <Trans>Strong</Trans>,
        color: "green",
        value: 80,
        bgColor: { base: "green.500", _dark: "green.600" },
      },
      "very-strong": {
        label: <Trans>Very Strong</Trans>,
        color: "green",
        value: 100,
        bgColor: { base: "green.600", _dark: "green.700" },
      },
    };

    return configs[strength];
  }, [strength]);

  if (!password || !strength || !strengthConfig) {
    return null;
  }

  return (
    <Box mt={2}>
      <HStack justify="space-between" mb={1}>
        <Text fontSize="xs" color={{ base: "gray.600", _dark: "gray.400" }}>
          <Trans>Password Strength:</Trans>
        </Text>
        <Text
          fontSize="xs"
          fontWeight="medium"
          color={strengthConfig.bgColor}
        >
          {strengthConfig.label}
        </Text>
      </HStack>
      <Progress.Root value={strengthConfig.value} size="sm" colorPalette={strengthConfig.color}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
}
