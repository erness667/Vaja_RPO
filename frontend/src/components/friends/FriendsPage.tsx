"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  Button,
  Icon,
  HStack,
  Card,
  CardBody,
  IconButton,
  MenuRoot,
  MenuTrigger,
  MenuPositioner,
  MenuContent,
  MenuItem,
  Input,
  Badge,
  Portal,
} from "@chakra-ui/react";
import { LuArrowLeft, LuUserX, LuSettings2, LuUserPlus, LuMail, LuX } from "react-icons/lu";
import { PageShell } from "@/components/layout/PageShell";
import { useFriends } from "@/lib/hooks/useFriends";
import { useRemoveFriend } from "@/lib/hooks/useRemoveFriend";
import { useSendFriendRequest } from "@/lib/hooks/useSendFriendRequest";
import { useFriendRequests } from "@/lib/hooks/useFriendRequests";
import { useSearchUsers } from "@/lib/hooks/useSearchUsers";
import type { Friend, UserInfo } from "@/lib/types/friend";
import { Trans, t } from "@lingui/macro";

function FriendCard({ friend, onRemove }: { friend: Friend; onRemove: (friendId: string) => void }) {
  const { removeFriend, isLoading } = useRemoveFriend();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    const success = await removeFriend(friend.userId);
    if (success) {
      onRemove(friend.userId);
    }
    setIsRemoving(false);
  };

  const fullName = `${friend.user.name} ${friend.user.surname}`;
  const friendsSinceDate = new Date(friend.friendsSince);
  const friendsSinceFormatted = friendsSinceDate.toLocaleDateString("sl-SI", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card.Root
      borderRadius="lg"
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      _hover={{
        boxShadow: "md",
        transform: "translateY(-2px)",
      }}
      transition="all 0.2s"
    >
      <CardBody>
        <HStack gap={4} align="start">
          {/* Avatar */}
          <Box
            width="60px"
            height="60px"
            borderRadius="full"
            overflow="hidden"
            bg={{ base: "gray.200", _dark: "gray.700" }}
            flexShrink={0}
            position="relative"
          >
            {friend.user.avatarImageUrl ? (
              <Image
                src={friend.user.avatarImageUrl}
                alt={fullName}
                fill
                style={{ objectFit: "cover" }}
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
                <Icon as={LuUserX} boxSize={6} color={{ base: "gray.500", _dark: "gray.400" }} />
              </Box>
            )}
          </Box>

          {/* Friend Info */}
          <VStack align="start" gap={1} flex={1} minWidth={0}>
            <Text
              fontWeight="semibold"
              fontSize="lg"
              color={{ base: "gray.800", _dark: "gray.100" }}
              lineClamp={1}
            >
              {fullName}
            </Text>
            <Text
              fontSize="sm"
              color={{ base: "gray.600", _dark: "gray.400" }}
              lineClamp={1}
            >
              @{friend.user.username}
            </Text>
            <Text
              fontSize="xs"
              color={{ base: "gray.500", _dark: "gray.500" }}
            >
              <Trans>Prijatelja od</Trans> {friendsSinceFormatted}
            </Text>
          </VStack>

          {/* Actions Menu */}
          <MenuRoot>
            <MenuTrigger asChild>
              <IconButton
                aria-label={t`Možnosti`}
                variant="ghost"
                size="sm"
                color={{ base: "gray.600", _dark: "gray.400" }}
                _hover={{
                  bg: { base: "gray.100", _dark: "gray.700" },
                }}
              >
                <Icon as={LuSettings2} />
              </IconButton>
            </MenuTrigger>
            <MenuPositioner>
              <MenuContent
                bg={{ base: "white", _dark: "gray.800" }}
                borderWidth="1px"
                borderColor={{ base: "gray.200", _dark: "gray.700" }}
                minW="150px"
              >
                <MenuItem
                  value="remove"
                  onClick={handleRemove}
                  disabled={isRemoving || isLoading}
                  color={{ base: "red.600", _dark: "red.400" }}
                  _hover={{
                    bg: { base: "red.50", _dark: "red.900" },
                  }}
                >
                  <Trans>Odstrani prijatelja</Trans>
                </MenuItem>
              </MenuContent>
            </MenuPositioner>
          </MenuRoot>
        </HStack>
      </CardBody>
    </Card.Root>
  );
}

export function FriendsPage() {
  const { friends, isLoading, error, refetch } = useFriends();
  const { requests, refetch: refetchRequests } = useFriendRequests();
  const { sendFriendRequest, isLoading: isSending, error: sendRequestError, setError: setSendError } = useSendFriendRequest();
  const { users: searchResults, isLoading: isSearching, searchUsers, clearResults } = useSearchUsers();
  const [friendsList, setFriendsList] = useState<Friend[]>(friends);
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [showSendRequestModal, setShowSendRequestModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update local list when friends change
  useEffect(() => {
    setFriendsList(friends);
  }, [friends]);

  // Count pending requests
  const pendingRequestsCount = requests.filter(r => r.status === 0).length;

  // Debounced search
  useEffect(() => {
    if (usernameInput.trim().length >= 2) {
      const timer = setTimeout(() => {
        searchUsers(usernameInput.trim());
        setShowSuggestions(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearResults();
      setShowSuggestions(false);
      setSelectedUser(null);
    }
  }, [usernameInput, searchUsers, clearResults]);

  const handleRemove = (friendId: string) => {
    setFriendsList((prev) => prev.filter((f) => f.userId !== friendId));
    // Optionally refetch to ensure consistency
    setTimeout(() => refetch(), 500);
  };

  const handleSelectUser = (user: UserInfo) => {
    setSelectedUser(user);
    setUsernameInput(user.username);
    setShowSuggestions(false);
    clearResults();
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);
    
    if (!selectedUser) {
      if (!usernameInput.trim()) {
        setSendError("Vnesite uporabniško ime");
        return;
      }
      // Try to find exact match in search results
      const exactMatch = searchResults.find(u => u.username.toLowerCase() === usernameInput.trim().toLowerCase());
      if (!exactMatch) {
        setSendError("Uporabnik s tem uporabniškim imenom ni najden");
        return;
      }
      const result = await sendFriendRequest(exactMatch.id);
      if (result !== null) {
        setUsernameInput("");
        setSelectedUser(null);
        setShowSendRequestModal(false);
        clearResults();
        // Refetch friends and requests to update the UI
        setTimeout(() => {
          refetchRequests();
          refetch();
        }, 500);
      }
      return;
    }

    const result = await sendFriendRequest(selectedUser.id);
    if (result !== null) {
      setUsernameInput("");
      setSelectedUser(null);
      setShowSendRequestModal(false);
      clearResults();
      // Refetch friends and requests to update the UI
      setTimeout(() => {
        refetchRequests();
        refetch();
      }, 500);
    }
  };

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <VStack gap={6} align="stretch">
        {/* Header */}
        <VStack align="start" gap={2}>
          <HStack gap={4} align="center" w="full" justify="space-between">
            <Link href="/">
              <Button
                variant="ghost"
                color={{ base: "gray.600", _dark: "gray.400" }}
              >
                <HStack gap={2}>
                  <Icon as={LuArrowLeft} />
                  <Text><Trans>Nazaj</Trans></Text>
                </HStack>
              </Button>
            </Link>
            <HStack gap={2}>
              <Link href="/friends/requests">
                <IconButton
                  variant="outline"
                  colorPalette="blue"
                  position="relative"
                  aria-label={t`Zahteve`}
                >
                  <Icon as={LuMail} />
                  {pendingRequestsCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-1"
                      right="-1"
                      colorPalette="red"
                      borderRadius="full"
                      minW="20px"
                      h="20px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xs"
                    >
                      {pendingRequestsCount}
                    </Badge>
                  )}
                </IconButton>
              </Link>
              <IconButton
                colorPalette="blue"
                aria-label={t`Pošlji zahtevo`}
                onClick={() => setShowSendRequestModal(true)}
              >
                <Icon as={LuUserPlus} />
              </IconButton>
            </HStack>
          </HStack>
          <Heading size="xl" color={{ base: "gray.800", _dark: "gray.100" }}>
            <Trans>Moji prijatelji</Trans>
          </Heading>
        </VStack>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <Spinner size="lg" color="blue.500" />
          </Box>
        ) : error ? (
          <Box
            p={4}
            borderRadius="lg"
            bg={{ base: "red.50", _dark: "red.900" }}
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
          >
            <Text color={{ base: "red.800", _dark: "red.200" }}>{error}</Text>
          </Box>
        ) : friendsList.length === 0 ? (
          <Box
            p={6}
            borderRadius="lg"
            bg={{ base: "gray.50", _dark: "gray.800" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            textAlign="center"
          >
            <Icon as={LuUserX} boxSize={8} color={{ base: "gray.400", _dark: "gray.500" }} mb={2} />
            <Text color={{ base: "gray.600", _dark: "gray.400" }} mb={3}>
              <Trans>Trenutno nimate prijateljev.</Trans>
            </Text>
            <Link href="/friends/requests">
              <Button colorPalette="blue">
                <Trans>Poišči prijatelje</Trans>
              </Button>
            </Link>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            {friendsList.map((friend) => (
              <FriendCard key={friend.userId} friend={friend} onRemove={handleRemove} />
            ))}
          </SimpleGrid>
        )}

        {/* Send Friend Request Modal */}
        {showSendRequestModal && (
          <Portal>
            <Box
              position="fixed"
              inset={0}
              zIndex={10000}
              bg="blackAlpha.600"
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={() => {
                setShowSendRequestModal(false);
                setUsernameInput("");
                setSelectedUser(null);
                setSendError(null);
                clearResults();
              }}
            >
              <Card.Root
                maxW="md"
                w="full"
                mx={4}
                onClick={(e) => e.stopPropagation()}
              >
                <CardBody p={6}>
                  <VStack align="stretch" gap={4}>
                    <HStack justify="space-between" align="center">
                      <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                        <Trans>Pošlji zahtevo za prijateljstvo</Trans>
                      </Heading>
                      <IconButton
                        variant="ghost"
                        aria-label={t`Zapri`}
                        onClick={() => {
                          setShowSendRequestModal(false);
                          setUsernameInput("");
                          setSelectedUser(null);
                          setSendError(null);
                          clearResults();
                        }}
                      >
                        <Icon as={LuX} />
                      </IconButton>
                    </HStack>
                    <form onSubmit={handleSendRequest}>
                      <VStack align="stretch" gap={4}>
                        <Box position="relative">
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={{ base: "gray.700", _dark: "gray.300" }}
                            mb={2}
                          >
                            <Trans>Uporabniško ime</Trans>
                          </Text>
                          <Input
                            value={usernameInput}
                            onChange={(e) => {
                              setUsernameInput(e.target.value);
                              setSendError(null);
                              setSelectedUser(null);
                            }}
                            onFocus={() => {
                              if (searchResults.length > 0) {
                                setShowSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              // Delay to allow clicking on suggestions
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                            placeholder={t`Vnesite uporabniško ime`}
                            disabled={isSending}
                            autoComplete="off"
                          />
                          <Text
                            fontSize="xs"
                            color={{ base: "gray.500", _dark: "gray.400" }}
                            mt={1}
                          >
                            <Trans>Začnite tipkati, da poiščete uporabnika</Trans>
                          </Text>
                          
                          {/* Autocomplete Suggestions */}
                          {showSuggestions && searchResults.length > 0 && (
                            <Box
                              position="absolute"
                              top="100%"
                              left={0}
                              right={0}
                              mt={1}
                              bg={{ base: "white", _dark: "gray.800" }}
                              borderWidth="1px"
                              borderColor={{ base: "gray.200", _dark: "gray.700" }}
                              borderRadius="md"
                              boxShadow="lg"
                              zIndex={1000}
                              maxH="300px"
                              overflowY="auto"
                            >
                              {isSearching && (
                                <Box p={4} textAlign="center">
                                  <Spinner size="sm" />
                                </Box>
                              )}
                              {!isSearching && searchResults.map((user) => (
                                <Box
                                  key={user.id}
                                  p={3}
                                  cursor="pointer"
                                  _hover={{
                                    bg: { base: "gray.100", _dark: "gray.700" },
                                  }}
                                  onClick={() => handleSelectUser(user)}
                                  borderBottomWidth="1px"
                                  borderColor={{ base: "gray.100", _dark: "gray.700" }}
                                  _last={{ borderBottomWidth: 0 }}
                                >
                                  <HStack gap={3}>
                                    <Box
                                      width="40px"
                                      height="40px"
                                      borderRadius="full"
                                      overflow="hidden"
                                      bg={{ base: "gray.200", _dark: "gray.700" }}
                                      flexShrink={0}
                                      position="relative"
                                    >
                                      {user.avatarImageUrl ? (
                                        <Image
                                          src={user.avatarImageUrl}
                                          alt={`${user.name} ${user.surname}`}
                                          fill
                                          style={{ objectFit: "cover" }}
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
                                          <Icon as={LuUserX} boxSize={5} color={{ base: "gray.500", _dark: "gray.400" }} />
                                        </Box>
                                      )}
                                    </Box>
                                    <VStack align="start" gap={0} flex={1} minWidth={0}>
                                      <Text
                                        fontWeight="semibold"
                                        fontSize="sm"
                                        color={{ base: "gray.800", _dark: "gray.100" }}
                                        lineClamp={1}
                                      >
                                        {user.name} {user.surname}
                                      </Text>
                                      <Text
                                        fontSize="xs"
                                        color={{ base: "gray.600", _dark: "gray.400" }}
                                        lineClamp={1}
                                      >
                                        @{user.username}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                        {sendRequestError && (
                          <Text color="red.500" fontSize="sm">
                            {sendRequestError}
                          </Text>
                        )}
                        <HStack gap={2} justify="flex-end">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setShowSendRequestModal(false);
                              setUsernameInput("");
                              setSelectedUser(null);
                              setSendError(null);
                              clearResults();
                            }}
                          >
                            <Trans>Prekliči</Trans>
                          </Button>
                          <Button
                            type="submit"
                            colorPalette="blue"
                            loading={isSending}
                            disabled={isSending}
                          >
                            <Trans>Pošlji</Trans>
                          </Button>
                        </HStack>
                      </VStack>
                    </form>
                  </VStack>
                </CardBody>
              </Card.Root>
            </Box>
          </Portal>
        )}

      </VStack>
    </PageShell>
  );
}

