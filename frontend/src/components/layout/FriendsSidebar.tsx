"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  IconButton,
  Button,
  Card,
  CardBody,
  Spinner,
  Badge,
  MenuRoot,
  MenuTrigger,
  MenuPositioner,
  MenuContent,
  MenuItem,
  Portal,
} from "@chakra-ui/react";
import { LuUsers, LuChevronRight, LuChevronLeft, LuUserPlus, LuMail, LuHeart, LuGitCompare, LuLanguages } from "react-icons/lu";
import { HiSun, HiMoon } from "react-icons/hi";
import { useFriends } from "@/lib/hooks/useFriends";
import { useFriendRequests } from "@/lib/hooks/useFriendRequests";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useColorMode } from "@/components/ui/color-mode";
import { useAppLocale } from "@/components/i18n/LinguiProvider";
import { isAuthenticated } from "@/lib/utils/auth-storage";
import { Trans, t } from "@lingui/macro";

const LanguageFlag = ({ variant }: { variant: "sl" | "en" }) => {
  const countryCode = variant === "sl" ? "SI" : "GB";
  return (
    <Image
      src={`https://flagsapi.com/${countryCode}/flat/24.png`}
      alt={variant === "sl" ? "Slovenian flag" : "English flag"}
      width={22}
      height={20}
      unoptimized
      style={{ borderRadius: "2px" }}
    />
  );
};

export function FriendsSidebar() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { locale, setLocale } = useAppLocale();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUserProfile();
  const { friends, isLoading: isLoadingFriends } = useFriends();
  const { requests } = useFriendRequests();
  const authenticated = typeof window !== "undefined" ? isAuthenticated() : false;

  // Compute recent requests from props
  const recentRequests = useMemo(() => {
    if (!requests || !user) return [];
    return requests
      .filter((r) => r.addresseeId === user.id && r.status === 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
  }, [requests, user]);

  // Use friends directly
  const friendsList = friends || [];
  const displayedFriends = friendsList.slice(0, 8); // Show max 8 friends
  const hasMoreFriends = friendsList.length > 8;

  // Only render if user exists (client-side check)
  if (!user) {
    return null;
  }

  return (
    <Box
      position="fixed"
      left={0}
      top="100px"
      height="calc(100vh - 140px)"
      zIndex={100}
      display={{ base: "none", lg: "block" }}
      suppressHydrationWarning
    >
      {/* Toggle Button */}
      <Box
        position="absolute"
        right="-16px"
        top="20px"
        zIndex={110}
      >
        <IconButton
          size="sm"
          variant="solid"
          colorPalette="blue"
          borderRadius="full"
          boxShadow="md"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon as={isCollapsed ? LuChevronRight : LuChevronLeft} />
        </IconButton>
      </Box>
      <Box
        width={isCollapsed ? "50px" : "260px"}
        height="100%"
        bg={{ base: "white", _dark: "gray.800" }}
        borderRightWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        boxShadow="lg"
        transition="width 0.3s ease"
        overflow="hidden"
        position="relative"
        borderTopRightRadius="lg"
        borderBottomRightRadius="lg"
      >

          {!isCollapsed && (
            <VStack
              align="stretch"
              gap={0}
              height="100%"
              overflowY="auto"
              p={4}
              display="flex"
              flexDirection="column"
              css={{
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "rgba(0,0,0,0.3)",
                },
              }}
            >
              {/* Recent Friend Requests */}
              {recentRequests.length > 0 && (
                <Box mb={4}>
                  <HStack justify="space-between" align="center" mb={2}>
                    <HStack gap={2}>
                      <Icon as={LuMail} boxSize={4} color={{ base: "orange.500", _dark: "orange.400" }} />
                      <Text fontWeight="semibold" fontSize="sm" color={{ base: "gray.700", _dark: "gray.300" }}>
                        <Trans>Zahteve</Trans>
                      </Text>
                    </HStack>
                    <Link href="/messages">
                      <Button size="xs" variant="ghost" colorPalette="orange">
                        <Trans>Vse</Trans>
                      </Button>
                    </Link>
                  </HStack>
                  <VStack gap={2} align="stretch">
                    {recentRequests.map((request) => {
                      const requester = request.requester;
                      if (!requester) return null;
                      const fullName = `${requester.name} ${requester.surname}`;
                      return (
                        <Link key={request.id} href="/messages">
                          <Card.Root
                            size="sm"
                            variant="outline"
                            borderRadius="md"
                            borderColor={{ base: "orange.200", _dark: "orange.800" }}
                            bg={{ base: "orange.50", _dark: "orange.950" }}
                            cursor="pointer"
                          >
                            <CardBody p={2}>
                              <HStack gap={2}>
                                <Box
                                  width="40px"
                                  height="40px"
                                  borderRadius="full"
                                  overflow="hidden"
                                  bg={{ base: "gray.200", _dark: "gray.700" }}
                                  flexShrink={0}
                                  position="relative"
                                  borderWidth="2px"
                                  borderColor={{ base: "orange.300", _dark: "orange.700" }}
                                >
                                  {requester.avatarImageUrl ? (
                                    <Image
                                      src={requester.avatarImageUrl}
                                      alt={fullName}
                                      width={40}
                                      height={40}
                                      unoptimized
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      width="100%"
                                      height="100%"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      bg={{ base: "gray.300", _dark: "gray.600" }}
                                    >
                                      <Icon as={LuUserPlus} boxSize={4} color={{ base: "gray.500", _dark: "gray.400" }} />
                                    </Box>
                                  )}
                                </Box>
                                <VStack align="start" gap={0} flex={1} minWidth={0}>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color={{ base: "gray.800", _dark: "gray.100" }}
                                    lineClamp={1}
                                  >
                                    {fullName}
                                  </Text>
                                  <Text
                                    fontSize="2xs"
                                    color={{ base: "gray.600", _dark: "gray.400" }}
                                    lineClamp={1}
                                  >
                                    @{requester.username}
                                  </Text>
                                </VStack>
                              </HStack>
                            </CardBody>
                          </Card.Root>
                        </Link>
                      );
                    })}
                  </VStack>
                </Box>
              )}

              {recentRequests.length > 0 && (
                <Box
                  height="1px"
                  bg={{ base: "gray.200", _dark: "gray.700" }}
                  my={2}
                />
              )}

              {/* Friends List */}
              <Box mb={4}>
                <HStack justify="space-between" align="center" mb={2}>
                  <HStack gap={2}>
                    <Icon as={LuUsers} boxSize={4} color={{ base: "blue.500", _dark: "blue.400" }} />
                    <Text fontWeight="semibold" fontSize="sm" color={{ base: "gray.700", _dark: "gray.300" }}>
                      <Trans>Prijatelji</Trans>
                    </Text>
                  </HStack>
                  <Link href="/friends">
                    <Button size="xs" variant="ghost" colorPalette="blue">
                      <Trans>Vsi</Trans>
                    </Button>
                  </Link>
                </HStack>
                <Box>
                {isLoadingFriends ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <Spinner size="sm" color="blue.500" />
                  </Box>
                ) : displayedFriends.length === 0 ? (
                  <Box
                    p={4}
                    borderRadius="md"
                    bg={{ base: "gray.50", _dark: "gray.900" }}
                    textAlign="center"
                  >
                    <Icon as={LuUsers} boxSize={6} color={{ base: "gray.400", _dark: "gray.500" }} mb={2} />
                    <Text fontSize="xs" color={{ base: "gray.600", _dark: "gray.400" }}>
                      <Trans>Nimate prijateljev</Trans>
                    </Text>
                  </Box>
                ) : (
                  <VStack gap={2} align="stretch">
                    {displayedFriends.map((friend) => {
                      const fullName = `${friend.user.name} ${friend.user.surname}`;
                      return (
                        <Link key={friend.userId} href="/friends">
                          <Card.Root
                            size="sm"
                            variant="outline"
                            borderRadius="md"
                            cursor="pointer"
                          >
                            <CardBody p={2}>
                              <HStack gap={2}>
                                <Box
                                  width="40px"
                                  height="40px"
                                  borderRadius="full"
                                  overflow="hidden"
                                  bg={{ base: "gray.200", _dark: "gray.700" }}
                                  flexShrink={0}
                                  position="relative"
                                  borderWidth="2px"
                                  borderColor={{ base: "blue.300", _dark: "blue.700" }}
                                >
                                  {friend.user.avatarImageUrl ? (
                                    <Image
                                      src={friend.user.avatarImageUrl}
                                      alt={fullName}
                                      width={40}
                                      height={40}
                                      unoptimized
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      width="100%"
                                      height="100%"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      bg={{ base: "gray.300", _dark: "gray.600" }}
                                    >
                                      <Icon as={LuUsers} boxSize={4} color={{ base: "gray.500", _dark: "gray.400" }} />
                                    </Box>
                                  )}
                                </Box>
                                <VStack align="start" gap={0} flex={1} minWidth={0}>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color={{ base: "gray.800", _dark: "gray.100" }}
                                    lineClamp={1}
                                  >
                                    {fullName}
                                  </Text>
                                  <Text
                                    fontSize="2xs"
                                    color={{ base: "gray.600", _dark: "gray.400" }}
                                    lineClamp={1}
                                  >
                                    @{friend.user.username}
                                  </Text>
                                </VStack>
                              </HStack>
                            </CardBody>
                          </Card.Root>
                        </Link>
                      );
                    })}
                    {hasMoreFriends && (
                      <Link href="/friends">
                        <Button
                          size="sm"
                          variant="ghost"
                          width="100%"
                          colorPalette="blue"
                          mt={2}
                        >
                          <Trans>Prikaži več ({friendsList.length - 8})</Trans>
                        </Button>
                      </Link>
                    )}
                  </VStack>
                )}
                </Box>
              </Box>

              {/* Settings Menu Items */}
              <Box mt="auto" pt={4}>
                <Box
                  height="1px"
                  bg={{ base: "gray.200", _dark: "gray.700" }}
                  mb={4}
                />
                <VStack gap={2} align="stretch">
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="purple"
                    onClick={toggleColorMode}
                    width="100%"
                  >
                    <HStack gap={2} justify="center">
                      <Icon as={isDark ? HiSun : HiMoon} />
                      <Text>{isDark ? <Trans>Svetel način</Trans> : <Trans>Temen način</Trans>}</Text>
                    </HStack>
                  </Button>
                  <MenuRoot>
                    <MenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="teal"
                        width="100%"
                      >
                        <HStack gap={2} justify="center">
                          <Icon as={LuLanguages} />
                          <Text><Trans>Jezik</Trans></Text>
                        </HStack>
                      </Button>
                    </MenuTrigger>
                    <MenuPositioner>
                      <MenuContent
                        bg={{ base: "white", _dark: "gray.800" }}
                        borderWidth="1px"
                        borderColor={{ base: "gray.200", _dark: "gray.700" }}
                        minW="180px"
                      >
                        <MenuItem
                          value="sl"
                          onClick={() => setLocale("sl")}
                        >
                          <HStack gap={2} w="full">
                            <LanguageFlag variant="sl" />
                            <Text fontWeight={locale === "sl" ? "semibold" : "normal"}>
                              <Trans>Slovenščina</Trans>
                            </Text>
                          </HStack>
                        </MenuItem>
                        <MenuItem
                          value="en"
                          onClick={() => setLocale("en")}
                        >
                          <HStack gap={2} w="full">
                            <LanguageFlag variant="en" />
                            <Text fontWeight={locale === "en" ? "semibold" : "normal"}>
                              <Trans>English</Trans>
                            </Text>
                          </HStack>
                        </MenuItem>
                      </MenuContent>
                    </MenuPositioner>
                  </MenuRoot>
                  {authenticated && (
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="pink"
                      onClick={() => router.push("/favourites")}
                      width="100%"
                    >
                      <HStack gap={2} justify="center">
                        <Icon as={LuHeart} />
                        <Text><Trans>Priljubljene</Trans></Text>
                      </HStack>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="orange"
                    onClick={() => router.push("/compare")}
                    width="100%"
                  >
                    <HStack gap={2} justify="center">
                      <Icon as={LuGitCompare} />
                      <Text><Trans>Primerjava</Trans></Text>
                    </HStack>
                  </Button>
                </VStack>
              </Box>
            </VStack>
          )}

          {/* Collapsed State - Just Icons */}
          {isCollapsed && (
            <VStack gap={6} p={2} align="center" height="100%" justify="center">
              <Link href="/friends">
                <IconButton
                  variant="ghost"
                  colorPalette="blue"
                  aria-label="Friends"
                  title="Prijatelji"
                >
                  <Icon as={LuUsers} />
                </IconButton>
              </Link>
              <Link href="/messages">
                <Box position="relative">
                  <IconButton
                    variant="ghost"
                    colorPalette="orange"
                    aria-label="Friend Requests"
                    title="Zahteve"
                  >
                    <Icon as={LuMail} />
                  </IconButton>
                  {recentRequests.length > 0 && (
                    <Badge
                      position="absolute"
                      top="-1"
                      right="-1"
                      colorPalette="red"
                      borderRadius="full"
                      minW="18px"
                      h="18px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="2xs"
                    >
                      {recentRequests.length}
                    </Badge>
                  )}
                </Box>
              </Link>
              <IconButton
                variant="ghost"
                colorPalette="purple"
                aria-label={isDark ? t`Svetel način` : t`Temen način`}
                title={isDark ? t`Svetel način` : t`Temen način`}
                onClick={toggleColorMode}
              >
                <Icon as={isDark ? HiSun : HiMoon} />
              </IconButton>
              <MenuRoot positioning={{ placement: "right-start", offset: { mainAxis: 12 } }}>
                <MenuTrigger asChild>
                  <IconButton
                    variant="ghost"
                    colorPalette="teal"
                    aria-label="Language"
                    title={t`Jezik`}
                  >
                    <Icon as={LuLanguages} />
                  </IconButton>
                </MenuTrigger>
                <Portal>
                  <MenuPositioner zIndex={110}>
                    <MenuContent
                      bg={{ base: "white", _dark: "gray.800" }}
                      borderWidth="1px"
                      borderColor={{ base: "gray.200", _dark: "gray.700" }}
                      minW="180px"
                      boxShadow="xl"
                    >
                      <MenuItem
                        value="sl"
                        onClick={() => setLocale("sl")}
                      >
                        <HStack gap={2} w="full">
                          <LanguageFlag variant="sl" />
                          <Text fontWeight={locale === "sl" ? "semibold" : "normal"}>
                            <Trans>Slovenščina</Trans>
                          </Text>
                        </HStack>
                      </MenuItem>
                      <MenuItem
                        value="en"
                        onClick={() => setLocale("en")}
                      >
                        <HStack gap={2} w="full">
                          <LanguageFlag variant="en" />
                          <Text fontWeight={locale === "en" ? "semibold" : "normal"}>
                            <Trans>English</Trans>
                          </Text>
                        </HStack>
                      </MenuItem>
                    </MenuContent>
                  </MenuPositioner>
                </Portal>
              </MenuRoot>
              {authenticated && (
                <IconButton
                  variant="ghost"
                  colorPalette="pink"
                  aria-label="Favourites"
                  title={t`Priljubljene`}
                  onClick={() => router.push("/favourites")}
                >
                  <Icon as={LuHeart} />
                </IconButton>
              )}
              <IconButton
                variant="ghost"
                colorPalette="orange"
                aria-label="Compare"
                title={t`Primerjava`}
                onClick={() => router.push("/compare")}
              >
                <Icon as={LuGitCompare} />
              </IconButton>
            </VStack>
          )}
        </Box>
    </Box>
  );
}

