"use client";

import { Box } from "@chakra-ui/react";
import { Navbar } from "./Navbar";
import { ImpersonationBanner } from "./ImpersonationBanner";
import { FloatingSettingsMenu } from "./FloatingSettingsMenu";
import { FriendsSidebar } from "./FriendsSidebar";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box 
      suppressHydrationWarning
      minH="100vh"
      bg={{ base: "#f5f5f5", _dark: "#111827" }}
      color={{ base: "#111827", _dark: "#f3f4f6" }}
      transition="background-color 0.3s ease, color 0.3s ease"
    >
      <Navbar />
      <ImpersonationBanner />
      <Box as="main" width="100%" position="relative">
        {children}
      </Box>
      <FriendsSidebar />
      <FloatingSettingsMenu />
    </Box>
  );
}

