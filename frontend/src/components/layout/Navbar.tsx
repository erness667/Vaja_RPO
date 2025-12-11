"use client";

import Image from "next/image";
import Link from "next/link";
import { HiUser, HiUserAdd, HiPlus, HiSun, HiMoon } from "react-icons/hi";
import { 
  Box, 
  HStack, 
  Button, 
  IconButton,
  ClientOnly,
  Skeleton,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";

export function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Box
      as="nav"
      suppressHydrationWarning
      bg={{ base: "white", _dark: "#111827" }}
      borderBottomWidth="1px"
      borderBottomColor={{ base: "#e5e7eb", _dark: "#374151" }}
      boxShadow="0 1px 3px rgba(0,0,0,0.1)"
    >
      <Box
        maxW="1280px"
        mx="auto"
        px={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        height="80px"
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src={isDark ? "/logo_dark.png" : "/logo.png"}
            alt="SUPERCARS Logo"
            width={200}
            height={70}
            style={{ height: "4rem", width: "auto", objectFit: "contain" }}
            priority
          />
        </Link>

        {/* Navigation Links */}
        <HStack gap={3} alignItems="center">
          <Button
            as={Link}
            href="/create"
            colorPalette="blue"
            size="sm"
            leftIcon={<HiPlus style={{ width: "20px", height: "20px" }} />}
          >
            Objavi oglas
          </Button>

          {/* Dark Mode Toggle */}
          <ClientOnly fallback={<Skeleton boxSize="9" />}>
            <IconButton
              onClick={toggleColorMode}
              variant="ghost"
              aria-label="Toggle dark mode"
              size="sm"
              color={{ base: "#374151", _dark: "#f3f4f6" }}
              _hover={{
                bg: { base: "#f3f4f6", _dark: "#374151" },
              }}
            >
              {isDark ? (
                <HiSun style={{ width: "20px", height: "20px" }} />
              ) : (
                <HiMoon style={{ width: "20px", height: "20px" }} />
              )}
            </IconButton>
          </ClientOnly>

          <Button
            as={Link}
            href="/login"
            variant="ghost"
            size="sm"
            suppressHydrationWarning
            color={{ base: "#374151", _dark: "#f3f4f6" }}
            leftIcon={<HiUser style={{ width: "20px", height: "20px" }} />}
          >
            Login
          </Button>

          <Button
            as={Link}
            href="/register"
            colorPalette="blue"
            size="sm"
            leftIcon={<HiUserAdd style={{ width: "20px", height: "20px" }} />}
          >
            Register
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
