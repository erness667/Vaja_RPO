"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Spinner,
  Text,
  Button,
  Icon,
  Card,
  CardBody,
  Badge,
  Input,
  Portal,
  IconButton,
} from "@chakra-ui/react";
import { LuArrowLeft, LuUserX, LuMail, LuCheck, LuX } from "react-icons/lu";
import { BsPencilSquare } from "react-icons/bs";
import { useConversations } from "@/lib/hooks/useConversations";
import { useFriends } from "@/lib/hooks/useFriends";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useMessageRequests } from "@/lib/hooks/useMessageRequests";
import { useAcceptMessageRequest } from "@/lib/hooks/useAcceptMessageRequest";
import { useDeclineMessageRequest } from "@/lib/hooks/useDeclineMessageRequest";
import { useSearchUsers } from "@/lib/hooks/useSearchUsers";
import { ChatView } from "./ChatView";
import type { Conversation, MessageRequest } from "@/lib/types/chat";
import type { Friend } from "@/lib/types/friend";
import { Trans } from "@lingui/macro";

export function MessagesPage() {
  const searchParams = useSearchParams();
  const { user } = useUserProfile();
  const { conversations, isLoading: isLoadingConversations, refetch: refetchConversations } =
    useConversations();
  const { friends, isLoading: isLoadingFriends } = useFriends();
  const { requests, isLoading: isLoadingRequests, refetch: refetchRequests } = useMessageRequests();
  const { acceptMessageRequest, isLoading: isAccepting } = useAcceptMessageRequest();
  const { declineMessageRequest, isLoading: isDeclining } = useDeclineMessageRequest();
  const { users: searchResults, isLoading: isSearching, searchUsers, clearResults } = useSearchUsers();

  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    user: import("@/lib/types/friend").UserInfo;
  } | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const urlInitializedRef = useRef(false);

  // Compute items to show: conversations first, then friends if no conversations
  const displayItems = useMemo(() => {
    if (conversations && conversations.length > 0) {
      return {
        type: "conversations" as const,
        items: conversations.sort(
          (a, b) =>
            new Date(b.lastMessage.sentAt).getTime() -
            new Date(a.lastMessage.sentAt).getTime()
        ),
      };
    }
    if (friends && friends.length > 0) {
      return {
        type: "friends" as const,
        items: friends,
      };
    }
    return {
      type: "empty" as const,
      items: [],
    };
  }, [conversations, friends]);

  const isLoading = activeTab === "friends" 
    ? (isLoadingConversations || isLoadingFriends)
    : isLoadingRequests;

  const handleAcceptRequest = async (userId: string) => {
    const success = await acceptMessageRequest(userId);
    if (success) {
      await refetchRequests();
      await refetchConversations();
      // Switch to friends tab and select the user
      setActiveTab("friends");
      const request = requests.find(r => r.userId === userId);
      if (request) {
        setSelectedUserId(userId);
        setSelectedUser({ id: userId, user: request.user });
      }
    }
  };

  const handleDeclineRequest = async (userId: string) => {
    const success = await declineMessageRequest(userId);
    if (success) {
      await refetchRequests();
      // Clear selection if it was the declined user
      if (selectedUserId === userId) {
        setSelectedUserId(null);
        setSelectedUser(null);
      }
    }
  };

  // Handle user search
  useEffect(() => {
    if (searchInput.trim().length >= 2) {
      const timer = setTimeout(() => {
        searchUsers(searchInput.trim());
        setShowSuggestions(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearResults();
      setShowSuggestions(false);
    }
  }, [searchInput, searchUsers, clearResults]);

  const handleSelectUserFromSearch = (user: import("@/lib/types/friend").UserInfo) => {
    setSelectedUserId(user.id);
    setSelectedUser({ id: user.id, user });
    setShowSearchModal(false);
    setSearchInput("");
    clearResults();
    setShowSuggestions(false);
    // Switch to friends tab if not already
    setActiveTab("friends");
  };

  const handleUserSelect = (
    userId: string,
    userInfo: import("@/lib/types/friend").UserInfo
  ) => {
    setSelectedUserId(userId);
    setSelectedUser({ id: userId, user: userInfo });
    // Don't refetch immediately - let ChatView handle it when marking messages as read
  };

  // Handle userId from URL query parameter
  useEffect(() => {
    const userIdFromUrl = searchParams.get("userId");
    if (userIdFromUrl && userIdFromUrl !== selectedUserId && !urlInitializedRef.current) {
      // Wait for data to load
      if (isLoadingConversations || isLoadingFriends) {
        return;
      }

      // Try to find the user in conversations first
      const conversation = conversations?.find(
        (c) => c.userId === userIdFromUrl
      );
      if (conversation) {
        urlInitializedRef.current = true;
        // Use setTimeout to defer state update and satisfy linter
        setTimeout(() => {
          setSelectedUserId(conversation.userId);
          setSelectedUser({ id: conversation.userId, user: conversation.user });
        }, 0);
        return;
      }

      // If not in conversations, try to find in friends
      const friend = friends?.find((f) => f.userId === userIdFromUrl);
      if (friend) {
        urlInitializedRef.current = true;
        // Use setTimeout to defer state update and satisfy linter
        setTimeout(() => {
          setSelectedUserId(friend.userId);
          setSelectedUser({ id: friend.userId, user: friend.user });
        }, 0);
        return;
      }
    }

    // Reset initialization flag when URL changes
    if (!userIdFromUrl) {
      urlInitializedRef.current = false;
    }
  }, [searchParams, conversations, friends, selectedUserId, isLoadingConversations, isLoadingFriends]);

  return (
    <Box minH="calc(100vh - 80px)" bg={{ base: "#f5f5f5", _dark: "#111827" }}>
      <Box maxW="72rem" mx="auto" p={4}>
        <VStack gap={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Link href="/friends">
              <Button
                variant="ghost"
                color={{ base: "gray.600", _dark: "gray.400" }}
              >
                <HStack gap={2}>
                  <Icon as={LuArrowLeft} />
                  <Text>
                    <Trans>Nazaj</Trans>
                  </Text>
                </HStack>
              </Button>
            </Link>
          </HStack>

          {/* Main Content */}
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={20}>
              <Spinner size="lg" color="blue.500" />
            </Box>
          ) : (
            <Card.Root
              borderRadius="xl"
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              bg={{ base: "white", _dark: "gray.800" }}
              boxShadow="lg"
              overflow="hidden"
            >
              <HStack height="calc(100vh - 200px)" align="stretch" gap={0}>
                {/* Left: Chat View */}
                <Box
                  flex={1}
                  borderRightWidth="1px"
                  borderColor={{ base: "gray.200", _dark: "gray.700" }}
                >
                  <ChatView
                    otherUser={selectedUser?.user || null}
                    otherUserId={selectedUserId}
                    currentUserId={user?.id || ""}
                    isMessageRequest={activeTab === "requests"}
                  />
                </Box>

                {/* Right: Chat List */}
                <Box
                  width="380px"
                  bg={{ base: "gray.50", _dark: "gray.900" }}
                  overflowY="auto"
                >
                  {/* Tabs */}
                  <Box
                    p={4}
                    borderBottomWidth="1px"
                    borderColor={{ base: "gray.200", _dark: "gray.700" }}
                  >
                    <HStack gap={2}>
                      <Button
                        variant={activeTab === "friends" ? "solid" : "ghost"}
                        colorPalette={activeTab === "friends" ? "blue" : "gray"}
                        size="sm"
                        onClick={() => {
                          setActiveTab("friends");
                          setSelectedUserId(null);
                          setSelectedUser(null);
                        }}
                        flex={1}
                      >
                        <Trans>Prijatelji</Trans>
                      </Button>
                      <Button
                        variant={activeTab === "requests" ? "solid" : "ghost"}
                        colorPalette={activeTab === "requests" ? "blue" : "gray"}
                        size="sm"
                        onClick={() => {
                          setActiveTab("requests");
                          setSelectedUserId(null);
                          setSelectedUser(null);
                        }}
                        flex={1}
                        position="relative"
                      >
                        <Trans>Zahteve</Trans>
                        {requests.length > 0 && (
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
                            fontWeight="bold"
                          >
                            {requests.length}
                          </Badge>
                        )}
                      </Button>
                      <IconButton
                        variant="ghost"
                        size="md"
                        aria-label="Išči uporabnika"
                        onClick={() => setShowSearchModal(true)}
                        color={{ base: "gray.600", _dark: "gray.400" }}
                        _hover={{
                          bg: { base: "gray.100", _dark: "gray.700" },
                          color: { base: "gray.800", _dark: "gray.200" },
                        }}
                      >
                        <Icon as={BsPencilSquare} boxSize={5} fontWeight="bold" />
                      </IconButton>
                    </HStack>
                  </Box>
                  <VStack gap={2} p={4} align="stretch">
                    {isLoading ? (
                      <Box display="flex" justifyContent="center" py={8}>
                        <Spinner size="md" color="blue.500" />
                      </Box>
                    ) : activeTab === "requests" ? (
                      // Message Requests Tab
                      requests.length === 0 ? (
                        <Box textAlign="center" py={8}>
                          <Icon
                            as={LuMail}
                            boxSize={8}
                            color={{ base: "gray.400", _dark: "gray.500" }}
                            mb={2}
                          />
                          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                            <Trans>Nimate zahtev za sporočila</Trans>
                          </Text>
                        </Box>
                      ) : (
                        requests
                          .filter((request) => request.user !== null)
                          .map((request) => {
                            const otherUser = request.user!;
                            const fullName = `${otherUser.name} ${otherUser.surname}`;
                            const isSelected = selectedUserId === request.userId;
                          return (
                            <Card.Root
                              key={request.userId}
                              variant={isSelected ? "outline" : "subtle"}
                              borderRadius="md"
                              borderColor={
                                isSelected
                                  ? { base: "blue.300", _dark: "blue.700" }
                                  : { base: "blue.200", _dark: "blue.800" }
                              }
                              bg={
                                isSelected
                                  ? { base: "blue.50", _dark: "blue.950" }
                                  : { base: "blue.50", _dark: "blue.950" }
                              }
                              cursor="pointer"
                              onClick={() =>
                                handleUserSelect(request.userId, request.user)
                              }
                            >
                              <CardBody p={3}>
                                <VStack gap={2} align="stretch">
                                  <HStack gap={3}>
                                    <Box
                                      width="48px"
                                      height="48px"
                                      borderRadius="full"
                                      overflow="hidden"
                                      bg={{ base: "gray.200", _dark: "gray.700" }}
                                      flexShrink={0}
                                      position="relative"
                                      borderWidth="2px"
                                      borderColor={{
                                        base: "blue.300",
                                        _dark: "blue.700",
                                      }}
                                    >
                                      {otherUser.avatarImageUrl ? (
                                        <Image
                                          src={otherUser.avatarImageUrl}
                                          alt={fullName}
                                          width={48}
                                          height={48}
                                          unoptimized
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                          }}
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.style.display = "none";
                                          }}
                                        />
                                      ) : (
                                        <Box
                                          width="100%"
                                          height="100%"
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="center"
                                          bg={{
                                            base: "gray.300",
                                            _dark: "gray.600",
                                          }}
                                        >
                                          <Icon
                                            as={LuUserX}
                                            boxSize={5}
                                            color={{
                                              base: "gray.500",
                                              _dark: "gray.400",
                                            }}
                                          />
                                        </Box>
                                      )}
                                    </Box>
                                    <VStack
                                      align="start"
                                      gap={0}
                                      flex={1}
                                      minWidth={0}
                                    >
                                      <HStack gap={2} align="center" width="100%">
                                        <Text
                                          fontSize="sm"
                                          fontWeight="semibold"
                                          color={{
                                            base: "gray.800",
                                            _dark: "gray.100",
                                          }}
                                          lineClamp={1}
                                        >
                                          {fullName}
                                        </Text>
                                        {request.unreadCount > 0 && (
                                          <Badge colorPalette="red" size="xs">
                                            {request.unreadCount}
                                          </Badge>
                                        )}
                                      </HStack>
                                      <Text
                                        fontSize="xs"
                                        color={{
                                          base: "gray.600",
                                          _dark: "gray.400",
                                        }}
                                        lineClamp={1}
                                      >
                                        {request.lastMessage.content}
                                      </Text>
                                      <Text
                                        fontSize="2xs"
                                        color={{
                                          base: "gray.500",
                                          _dark: "gray.500",
                                        }}
                                      >
                                        {new Date(
                                          request.lastMessage.sentAt
                                        ).toLocaleDateString("sl-SI", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                  <HStack gap={2} mt={1}>
                                    <Button
                                      size="xs"
                                      colorPalette="green"
                                      variant="solid"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAcceptRequest(request.userId);
                                      }}
                                      disabled={isAccepting || isDeclining}
                                      loading={isAccepting}
                                      flex={1}
                                    >
                                      <HStack gap={1}>
                                        <Icon as={LuCheck} />
                                        <Text><Trans>Sprejmi</Trans></Text>
                                      </HStack>
                                    </Button>
                                    <Button
                                      size="xs"
                                      colorPalette="red"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeclineRequest(request.userId);
                                      }}
                                      disabled={isAccepting || isDeclining}
                                      loading={isDeclining}
                                      flex={1}
                                    >
                                      <HStack gap={1}>
                                        <Icon as={LuX} />
                                        <Text><Trans>Zavrni</Trans></Text>
                                      </HStack>
                                    </Button>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card.Root>
                          );
                        })
                      )
                    ) : displayItems.items.length === 0 ? (
                      <Box textAlign="center" py={8}>
                        <Icon
                          as={LuMail}
                          boxSize={8}
                          color={{ base: "gray.400", _dark: "gray.500" }}
                          mb={2}
                        />
                        <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                          <Trans>Nimate pogovorov</Trans>
                        </Text>
                      </Box>
                    ) : displayItems.type === "conversations" ? (
                      (displayItems.items as Conversation[]).map(
                        (conversation) => {
                          const otherUser = conversation.user;
                          const fullName = `${otherUser.name} ${otherUser.surname}`;
                          const isSelected =
                            selectedUserId === conversation.userId;
                          return (
                            <Card.Root
                              key={conversation.userId}
                              variant={isSelected ? "outline" : "subtle"}
                              borderRadius="md"
                              borderColor={
                                isSelected
                                  ? { base: "blue.300", _dark: "blue.700" }
                                  : undefined
                              }
                              bg={
                                isSelected
                                  ? { base: "blue.50", _dark: "blue.950" }
                                  : undefined
                              }
                              cursor="pointer"
                              onClick={() =>
                                handleUserSelect(
                                  conversation.userId,
                                  conversation.user
                                )
                              }
                            >
                              <CardBody p={3}>
                                <HStack gap={3}>
                                  <Box
                                    width="48px"
                                    height="48px"
                                    borderRadius="full"
                                    overflow="hidden"
                                    bg={{ base: "gray.200", _dark: "gray.700" }}
                                    flexShrink={0}
                                    position="relative"
                                    borderWidth="2px"
                                    borderColor={{
                                      base: "blue.300",
                                      _dark: "blue.700",
                                    }}
                                  >
                                    {otherUser.avatarImageUrl ? (
                                      <Image
                                        src={otherUser.avatarImageUrl}
                                        alt={fullName}
                                        width={48}
                                        height={48}
                                        unoptimized
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                        }}
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <Box
                                        width="100%"
                                        height="100%"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        bg={{
                                          base: "gray.300",
                                          _dark: "gray.600",
                                        }}
                                      >
                                        <Icon
                                          as={LuUserX}
                                          boxSize={5}
                                          color={{
                                            base: "gray.500",
                                            _dark: "gray.400",
                                          }}
                                        />
                                      </Box>
                                    )}
                                  </Box>
                                  <VStack
                                    align="start"
                                    gap={0}
                                    flex={1}
                                    minWidth={0}
                                  >
                                    <HStack gap={2} align="center" width="100%">
                                      <Text
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={{
                                          base: "gray.800",
                                          _dark: "gray.100",
                                        }}
                                        lineClamp={1}
                                      >
                                        {fullName}
                                      </Text>
                                      {conversation.isFriend === false && (
                                        <Badge colorPalette="gray" size="xs" variant="outline">
                                          <Trans>Ni prijatelj</Trans>
                                        </Badge>
                                      )}
                                      {conversation.unreadCount > 0 && (
                                        <Badge colorPalette="red" size="xs">
                                          {conversation.unreadCount}
                                        </Badge>
                                      )}
                                    </HStack>
                                    <Text
                                      fontSize="xs"
                                      color={{
                                        base: "gray.600",
                                        _dark: "gray.400",
                                      }}
                                      lineClamp={1}
                                    >
                                      {conversation.lastMessage.content}
                                    </Text>
                                    <Text
                                      fontSize="2xs"
                                      color={{
                                        base: "gray.500",
                                        _dark: "gray.500",
                                      }}
                                    >
                                      {new Date(
                                        conversation.lastMessage.sentAt
                                      ).toLocaleDateString("sl-SI", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </CardBody>
                            </Card.Root>
                          );
                        }
                      )
                    ) : (
                      (displayItems.items as Friend[]).map((friend) => {
                        const fullName = `${friend.user.name} ${friend.user.surname}`;
                        const isSelected = selectedUserId === friend.userId;
                        return (
                          <Card.Root
                            key={friend.userId}
                            variant={isSelected ? "outline" : "subtle"}
                            borderRadius="md"
                            borderColor={
                              isSelected
                                ? { base: "blue.300", _dark: "blue.700" }
                                : { base: "orange.200", _dark: "orange.800" }
                            }
                            bg={
                              isSelected
                                ? { base: "blue.50", _dark: "blue.950" }
                                : { base: "orange.50", _dark: "orange.950" }
                            }
                            cursor="pointer"
                            onClick={() =>
                              handleUserSelect(friend.userId, friend.user)
                            }
                          >
                            <CardBody p={3}>
                              <HStack gap={3}>
                                <Box
                                  width="48px"
                                  height="48px"
                                  borderRadius="full"
                                  overflow="hidden"
                                  bg={{ base: "gray.200", _dark: "gray.700" }}
                                  flexShrink={0}
                                  position="relative"
                                  borderWidth="2px"
                                  borderColor={{
                                    base: "blue.300",
                                    _dark: "blue.700",
                                  }}
                                >
                                  {friend.user.avatarImageUrl ? (
                                    <Image
                                      src={friend.user.avatarImageUrl}
                                      alt={fullName}
                                      width={48}
                                      height={48}
                                      unoptimized
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      width="100%"
                                      height="100%"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      bg={{
                                        base: "gray.300",
                                        _dark: "gray.600",
                                      }}
                                    >
                                      <Icon
                                        as={LuUserX}
                                        boxSize={5}
                                        color={{
                                          base: "gray.500",
                                          _dark: "gray.400",
                                        }}
                                      />
                                    </Box>
                                  )}
                                </Box>
                                <VStack
                                  align="start"
                                  gap={0}
                                  flex={1}
                                  minWidth={0}
                                >
                                  <Text
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color={{
                                      base: "gray.800",
                                      _dark: "gray.100",
                                    }}
                                    lineClamp={1}
                                  >
                                    {fullName}
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    color={{
                                      base: "gray.600",
                                      _dark: "gray.400",
                                    }}
                                    lineClamp={1}
                                  >
                                    @{friend.user.username}
                                  </Text>
                                </VStack>
                              </HStack>
                            </CardBody>
                          </Card.Root>
                        );
                      })
                    )}
                  </VStack>
                </Box>
              </HStack>
            </Card.Root>
          )}
        </VStack>
      </Box>

      {/* Search Modal */}
      {showSearchModal && (
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
              setShowSearchModal(false);
              setSearchInput("");
              clearResults();
              setShowSuggestions(false);
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
                      <Trans>Išči uporabnika</Trans>
                    </Heading>
                    <IconButton
                      variant="ghost"
                      aria-label="Zapri"
                      onClick={() => {
                        setShowSearchModal(false);
                        setSearchInput("");
                        clearResults();
                        setShowSuggestions(false);
                      }}
                    >
                      <Icon as={LuX} />
                    </IconButton>
                  </HStack>
                  <Box position="relative">
                    <Input
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        setShowSuggestions(false);
                      }}
                      onFocus={() => {
                        if (searchResults.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      placeholder="Vnesite uporabniško ime"
                      autoFocus
                      autoComplete="off"
                    />
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
                            onClick={() => handleSelectUserFromSearch(user)}
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
                  <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                    <Trans>Začnite tipkati, da poiščete uporabnika</Trans>
                  </Text>
                </VStack>
              </CardBody>
            </Card.Root>
          </Box>
        </Portal>
      )}
    </Box>
  );
}
