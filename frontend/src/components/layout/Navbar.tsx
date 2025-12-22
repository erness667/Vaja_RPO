"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiUser, HiUserAdd, HiPlus, HiSun, HiMoon } from "react-icons/hi";
import { LuHeart, LuHistory, LuUser, LuLogOut, LuSearch, LuX, LuImage, LuShield, LuFileText, LuGitCompare } from "react-icons/lu";
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
  Icon,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { isAuthenticated, getStoredUser, type StoredUser } from "@/lib/utils/auth-storage";
import { useLogout } from "@/lib/hooks/useLogout";
import { getApiCars } from "@/client";
import "@/lib/api-client";
import type { Car } from "@/lib/types/car";

export function Navbar() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const { logout, isLoading: isLoggingOut } = useLogout();
  const isAdmin = user?.role === 1; // 1 = Admin
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Car[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Note: search parameter needs to be added to SDK types after backend update
      const response = await getApiCars({
        query: {
          page: 1,
          pageSize: 5,
          ...(query ? { search: query } : {}),
        } as { page: number; pageSize: number; search?: string },
      });

      if (response.error || (response.response && !response.response.ok)) {
        setSearchResults([]);
        return;
      }

      if (response.data) {
        const raw = response.data as { cars?: Car[] } | undefined;
        const data = raw?.cars ?? [];
        setSearchResults(data);
        setShowSearchResults(data.length > 0);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch {
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input with debouncing
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If query is less than 3 characters, clear results
    if (value.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Debounce search - wait 300ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  }, [performSearch]);

  // Clear search results and hide dropdown when query is empty or too short
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    }
  }, [searchQuery]);

  // Close search results when clicking outside (but not when toggling dark mode)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Don't close if clicking on dark mode toggle or its children
      const darkModeToggle = document.querySelector('[aria-label*="dark mode" i], [aria-label*="Toggle dark mode" i]');
      if (darkModeToggle && (darkModeToggle.contains(target) || darkModeToggle === target)) {
        return;
      }
      
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
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

        {/* Search Bar */}
        <Box
          ref={searchContainerRef}
          position="relative"
          flex="1"
          maxW="600px"
          mx={4}
        >
          <Box position="relative" suppressHydrationWarning>
            <Input
              type="text"
              placeholder={t`Išči vozila...`}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchQuery.length >= 3 && searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
              pl={10}
              pr={searchQuery ? 10 : 4}
              bg={{ base: "white", _dark: "#1f2937" }}
              borderColor={{ base: "#e5e7eb", _dark: "#374151" }}
              color={{ base: "#111827", _dark: "#f3f4f6" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
              autoComplete="off"
            />
            <Icon
              as={LuSearch}
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color={{ base: "#6b7280", _dark: "#9ca3af" }}
              boxSize={5}
              pointerEvents="none"
            />
            {searchQuery && (
              <IconButton
                position="absolute"
                right={1}
                top="50%"
                transform="translateY(-50%)"
                size="sm"
                variant="ghost"
                aria-label={t`Clear search`}
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                color={{ base: "#6b7280", _dark: "#9ca3af" }}
              >
                <LuX />
              </IconButton>
            )}
          </Box>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              mt={2}
              bg={{ base: "white", _dark: "#1f2937" }}
              borderWidth="1px"
              borderColor={{ base: "#e5e7eb", _dark: "#374151" }}
              borderRadius="lg"
              boxShadow="xl"
              maxH="500px"
              overflowY="auto"
              zIndex={9999}
            >
                {isSearching ? (
                  <Box p={4} textAlign="center">
                    <Text color={{ base: "#6b7280", _dark: "#9ca3af" }}>
                      <Trans>Iskanje...</Trans>
                    </Text>
                  </Box>
                ) : searchResults.length > 0 ? (
                  <VStack align="stretch" gap={0}>
                    {searchResults.map((car) => {
                      const imageUrl = car.mainImageUrl || car.imageUrls?.[0] || null;
                      const title = `${car.brand} ${car.model}`.trim();
                      const price = `${car.price.toLocaleString("sl-SI")} €`;
                      const subtitle = `${car.year} • ${car.mileage.toLocaleString("sl-SI")} km`;
                      const hasPriceReduction = car.originalPrice && car.originalPrice > car.price;

                      return (
                        <Box
                          key={car.id}
                          as="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                            setShowSearchResults(false);
                            if (searchTimeoutRef.current) {
                              clearTimeout(searchTimeoutRef.current);
                            }
                            router.push(`/cars/${car.id}`);
                          }}
                          p={4}
                          _hover={{
                            bg: { base: "#f3f4f6", _dark: "#374151" },
                          }}
                          borderBottomWidth="1px"
                          borderBottomColor={{ base: "#e5e7eb", _dark: "#374151" }}
                          _last={{ borderBottomWidth: 0 }}
                          textAlign="left"
                          width="100%"
                        >
                          <HStack gap={3} align="start">
                            {/* Always show image container for consistent sizing */}
                            <Box
                              position="relative"
                              width="80px"
                              height="60px"
                              borderRadius="md"
                              overflow="hidden"
                              flexShrink={0}
                              bg={{ base: "#f3f4f6", _dark: "#374151" }}
                            >
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={title}
                                  fill
                                  style={{ objectFit: "cover" }}
                                  unoptimized
                                />
                              ) : (
                                <Box
                                  position="absolute"
                                  inset={0}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  borderWidth="1px"
                                  borderStyle="dashed"
                                  borderColor={{ base: "#d1d5db", _dark: "#4b5563" }}
                                >
                                  <Icon
                                    as={LuImage}
                                    boxSize={5}
                                    color={{ base: "#9ca3af", _dark: "#6b7280" }}
                                  />
                                </Box>
                              )}
                            </Box>
                            <VStack align="start" gap={1} flex={1} minW={0}>
                              <Text
                                fontWeight="bold"
                                fontSize="sm"
                                color={{ base: "#111827", _dark: "#f3f4f6" }}
                                lineClamp={1}
                              >
                                {title}
                              </Text>
                              <Text
                                fontSize="xs"
                                color={{ base: "#6b7280", _dark: "#9ca3af" }}
                                lineClamp={1}
                              >
                                {subtitle}
                              </Text>
                              {/* Price with original price if reduced */}
                              {hasPriceReduction ? (
                                <HStack gap={2} align="baseline" flexWrap="wrap">
                                  <Text
                                    fontSize="xs"
                                    fontWeight="medium"
                                    color={{ base: "gray.500", _dark: "gray.400" }}
                                    textDecoration="line-through"
                                  >
                                    {car.originalPrice!.toLocaleString("sl-SI")} €
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color={{ base: "blue.600", _dark: "blue.400" }}
                                  >
                                    {price}
                                  </Text>
                                </HStack>
                              ) : (
                                <Text
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  color={{ base: "blue.600", _dark: "blue.400" }}
                                >
                                  {price}
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                        </Box>
                      );
                    })}
                  </VStack>
                ) : searchQuery.length >= 3 ? (
                  <Box p={4} textAlign="center">
                    <Text color={{ base: "#6b7280", _dark: "#9ca3af" }}>
                      <Trans>Ni rezultatov</Trans>
                    </Text>
                  </Box>
                ) : null}
            </Box>
          )}
        </Box>

        {/* Navigation Links */}
        <HStack gap={3} alignItems="center">
          {/* Comparison Link */}
          <Link href="/compare">
            <Button
              variant="ghost"
              size="sm"
              color={{ base: "#374151", _dark: "#f3f4f6" }}
              _hover={{
                bg: { base: "#f3f4f6", _dark: "#374151" },
              }}
            >
              <LuGitCompare style={{ width: "20px", height: "20px", marginRight: "8px" }} />
              <Trans>Primerjava</Trans>
            </Button>
          </Link>

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
                      <HStack gap={2}>
                        <Icon as={LuHeart} boxSize={4} />
                        <Trans>Priljubljene</Trans>
                      </HStack>
                    </MenuItem>
                    <MenuItem
                      value="my-posts"
                      onClick={() => router.push("/my-posts")}
                      color={{ base: "#374151", _dark: "#f3f4f6" }}
                      _hover={{
                        bg: { base: "#f3f4f6", _dark: "#374151" },
                      }}
                    >
                      <HStack gap={2}>
                        <Icon as={LuFileText} boxSize={4} />
                        <Trans>Moji oglasi</Trans>
                      </HStack>
                    </MenuItem>
                    <MenuItem
                      value="view-history"
                      onClick={() => router.push("/view-history")}
                      color={{ base: "#374151", _dark: "#f3f4f6" }}
                      _hover={{
                        bg: { base: "#f3f4f6", _dark: "#374151" },
                      }}
                    >
                      <HStack gap={2}>
                        <Icon as={LuHistory} boxSize={4} />
                        <Trans>Zgodovina ogledov</Trans>
                      </HStack>
                    </MenuItem>
                    <MenuItem
                      value="profile"
                      onClick={() => router.push("/profile")}
                      color={{ base: "#374151", _dark: "#f3f4f6" }}
                      _hover={{
                        bg: { base: "#f3f4f6", _dark: "#374151" },
                      }}
                    >
                      <HStack gap={2}>
                        <Icon as={LuUser} boxSize={4} />
                        <Trans>Profile</Trans>
                      </HStack>
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem
                        value="admin-users"
                        onClick={() => router.push("/admin/users")}
                        color={{ base: "#374151", _dark: "#f3f4f6" }}
                        _hover={{
                          bg: { base: "#f3f4f6", _dark: "#374151" },
                        }}
                      >
                        <HStack gap={2}>
                          <Icon as={LuShield} boxSize={4} />
                          <Trans>Upravljanje uporabnikov</Trans>
                        </HStack>
                      </MenuItem>
                    )}
                    <MenuItem
                      value="logout"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      color={{ base: "#374151", _dark: "#f3f4f6" }}
                      _hover={{
                        bg: { base: "#f3f4f6", _dark: "#374151" },
                      }}
                    >
                      <HStack gap={2}>
                        <Icon as={LuLogOut} boxSize={4} />
                        {isLoggingOut ? <Trans>Logging out...</Trans> : <Trans>Log out</Trans>}
                      </HStack>
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
