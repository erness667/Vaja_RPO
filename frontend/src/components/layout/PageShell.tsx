"use client";

import type { ReactNode } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";

type PageShellProps = {
  children: ReactNode;
  maxWidthClass?: string;
};

const maxWidthMap: Record<string, string> = {
  "max-w-md": "28rem",
  "max-w-lg": "32rem",
  "max-w-xl": "36rem",
  "max-w-2xl": "42rem",
  "max-w-4xl": "56rem",
  "max-w-6xl": "72rem",
};

export function PageShell({
  children,
  maxWidthClass = "max-w-md",
}: PageShellProps) {
  const bgGradient = useColorModeValue(
    "linear(to-br, gray.50, gray.100, gray.50)",
    "linear(to-br, gray.900, gray.950, gray.900)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const maxW = maxWidthMap[maxWidthClass] || "28rem";

  return (
    <Box
      suppressHydrationWarning
      py={8}
      px={4}
      bgGradient={bgGradient}
      minH="calc(100vh - 5rem)"
    >
      <Box
        suppressHydrationWarning
        maxW={maxW}
        mx="auto"
        rounded="2xl"
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="2xl"
        p={8}
      >
        {children}
      </Box>
    </Box>
  );
}


