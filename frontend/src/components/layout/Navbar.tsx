"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiUser, HiUserAdd, HiPlus, HiSun, HiMoon } from "react-icons/hi";
import { Trans, t } from "@lingui/macro";
import { 
  Box, 
  HStack, 
  Button, 
  IconButton,
  ClientOnly,
  Skeleton,
  MenuRoot,
  MenuTrigger,
  MenuPositioner,
  MenuContent,
  MenuItem,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { isAuthenticated, getStoredUser, type StoredUser } from "@/lib/utils/auth-storage";
import { useLogout } from "@/lib/hooks/useLogout";

export function Navbar() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const { logout, isLoading: isLoggingOut } = useLogout();

  useEffect(() => {
    // Check authentication status on mount and when it might change
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      if (isAuth) {
        setUser(getStoredUser());
      } else {
        setUser(null);
      }
    };

    checkAuth();
    
    // Listen for storage changes (when user data is updated from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        checkAuth();
      }
    };
    
    // Listen for custom events when user data is updated programmatically
    const handleUserUpdate = () => {
      checkAuth();
    };
    
    // Listen for authentication state changes (login/logout)
    const handleAuthStateChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataUpdated', handleUserUpdate);
    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    // Check periodically (e.g., every 5 seconds) to catch token expiration
    const interval = setInterval(checkAuth, 5000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdated', handleUserUpdate);
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setUser(null);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name && user?.surname) {
      return `${user.name[0]}${user.surname[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };
  
  // Render avatar - image if available, otherwise initials
  const renderAvatar = () => {
    if (user?.avatarImageUrl) {
      return (
        <Box
          as="span"
          display="inline-block"
          width="32px"
          height="32px"
          borderRadius="full"
          overflow="hidden"
          borderWidth="2px"
          borderColor={{ base: "white", _dark: "#374151" }}
        >
          <Image
            src={user.avatarImageUrl}
            alt={getUserInitials()}
            width={32}
            height={32}
            unoptimized
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      );
    }
    
    return (
      <Box
        as="span"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        width="32px"
        height="32px"
        borderRadius="full"
        bg={{ base: "blue.500", _dark: "blue.400" }}
        color="white"
        fontSize="sm"
        fontWeight="medium"
      >
        {getUserInitials()}
      </Box>
    );
  };

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
          <ClientOnly fallback={
            <Box
              width="200px"
              height="70px"
              bg="gray.200"
              borderRadius="md"
            />
          }>
            <Image
              src={isDark ? "/logo_dark.png" : "/logo.png"}
              alt={t`SUPERCARS Logo`}
              width={200}
              height={70}
              style={{ height: "4rem", width: "auto", objectFit: "contain" }}
              priority
            />
          </ClientOnly>
        </Link>

        {/* Navigation Links */}
        <HStack gap={3} alignItems="center">
          {/* Show "Objavi oglas" button only if user is authenticated */}
          {authenticated && (
            <Link href="/create">
              <Button
                colorPalette="blue"
                size="sm"
              >
                <HiPlus style={{ width: "20px", height: "20px", marginRight: "8px" }} />
                <Trans>Objavi oglas</Trans>
              </Button>
            </Link>
          )}

          {/* Dark Mode Toggle */}
          <ClientOnly fallback={<Skeleton boxSize="9" />}>
            <IconButton
              onClick={toggleColorMode}
              variant="ghost"
              aria-label={t`Toggle dark mode`}
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

          {/* User Menu or Login/Register Buttons */}
          <ClientOnly fallback={<Skeleton boxSize="9" />}>
            {authenticated ? (
              <MenuRoot positioning={{ placement: "bottom", offset: { mainAxis: 4 } }}>
                <MenuTrigger asChild>
                  <IconButton
                    variant="ghost"
                    aria-label={t`User menu`}
                    size="sm"
                    borderRadius="full"
                    p={0}
                    _hover={{
                      bg: { base: "#f3f4f6", _dark: "#374151" },
                    }}
                  >
                    {renderAvatar()}
                  </IconButton>
                </MenuTrigger>
                <MenuPositioner>
                  <MenuContent
                    bg={{ base: "white", _dark: "#1f2937" }}
                    borderColor={{ base: "#e5e7eb", _dark: "#374151" }}
                  >
                    <MenuItem
                      value="favourites"
                      onClick={() => router.push("/favourites")}
                      color={{ base: "#374151", _dark: "#f3f4f6" }}
                      _hover={{
                        bg: { base: "#f3f4f6", _dark: "#374151" },
                      }}
                    >
                      <Trans>Priljubljene</Trans>
                    </MenuItem>
                    <MenuItem
                      value="view-history"
                      onClick={() => router.push("/view-history")}
                      color={{ base: "#374151", _dark: "#f3f4f6" }}
                      _hover={{
                        bg: { base: "#f3f4f6", _dark: "#374151" },
                      }}
                    >
                      <Trans>Zgodovina ogledov</Trans>
                    </MenuItem>
                    <MenuItem
                      value="profile"
                      onClick={() => router.push("/profile")}
                      color={{ base: "#374151", _dark: "#f3f4f6" }}
                      _hover={{
                        bg: { base: "#f3f4f6", _dark: "#374151" },
                      }}
                    >
                      <Trans>Profile</Trans>
                    </MenuItem>
                    <MenuItem
                      value="logout"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      color={{ base: "#374151", _dark: "#f3f4f6" }}
                      _hover={{
                        bg: { base: "#f3f4f6", _dark: "#374151" },
                      }}
                    >
                      {isLoggingOut ? <Trans>Logging out...</Trans> : <Trans>Log out</Trans>}
                    </MenuItem>
                  </MenuContent>
                </MenuPositioner>
              </MenuRoot>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    suppressHydrationWarning
                    color={{ base: "#374151", _dark: "#f3f4f6" }}
                  >
                    <HiUser style={{ width: "20px", height: "20px", marginRight: "8px" }} />
                    <Trans>Login</Trans>
                  </Button>
                </Link>

                <Link href="/register">
                  <Button
                    colorPalette="blue"
                    size="sm"
                  >
                    <HiUserAdd style={{ width: "20px", height: "20px", marginRight: "8px" }} />
                    <Trans>Register</Trans>
                  </Button>
                </Link>
              </>
            )}
          </ClientOnly>
        </HStack>
      </Box>
    </Box>
  );
}
