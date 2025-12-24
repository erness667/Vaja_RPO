"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
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
} from "@chakra-ui/react";
import { LuArrowLeft, LuUserX, LuUserPlus, LuUserMinus, LuX, LuMail, LuSend } from "react-icons/lu";
import { useConversations } from "@/lib/hooks/useConversations";
import { useFriends } from "@/lib/hooks/useFriends";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { ChatView } from "./ChatView";
import type { Conversation } from "@/lib/types/chat";
import type { Friend } from "@/lib/types/friend";
import { Trans } from "@lingui/macro";

export function MessagesPage() {
  const { user } = useUserProfile();
  const { conversations, isLoading: isLoadingConversations } = useConversations();
  const { friends, isLoading: isLoadingFriends } = useFriends();
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: string; user: import("@/lib/types/friend").UserInfo } | null>(null);

  // Compute items to show: conversations first, then friends if no conversations
  const displayItems = useMemo(() => {
    if (conversations && conversations.length > 0) {
      return {
        type: 'conversations' as const,
        items: conversations.sort((a, b) => 
          new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime()
        )
      };
    }
    if (friends && friends.length > 0) {
      return {
        type: 'friends' as const,
        items: friends
      };
    }
    return {
      type: 'empty' as const,
      items: []
    };
  }, [conversations, friends]);

  const isLoading = isLoadingConversations || isLoadingFriends;

  const handleUserSelect = (userId: string, userInfo: import("@/lib/types/friend").UserInfo) => {
    setSelectedUserId(userId);
    setSelectedUser({ id: userId, user: userInfo });
  };

  return (
    <Box
      minH="calc(100vh - 80px)"
      bg={{ base: "#f5f5f5", _dark: "#111827" }}
    >
      <Box maxW="72rem" mx="auto" p={4}>
        <VStack gap={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <HStack gap={4}>
              <Link href="/friends">
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
              <Heading size="xl" color={{ base: "gray.800", _dark: "gray.100" }}>
                <Trans>Sporočila</Trans>
              </Heading>
            </HStack>
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
                <Box flex={1} borderRightWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
                  <ChatView
                    otherUser={selectedUser?.user || null}
                    otherUserId={selectedUserId}
                    currentUserId={user?.id || ""}
                  />
                </Box>

                {/* Right: Chat List */}
                <Box width="380px" bg={{ base: "gray.50", _dark: "gray.900" }} overflowY="auto">
                  <Box p={4} borderBottomWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
                    <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                      <Trans>Zahteve</Trans>
                    </Heading>
                  </Box>
                  <VStack gap={2} p={4} align="stretch">
                    {isLoading ? (
                      <Box display="flex" justifyContent="center" py={8}>
                        <Spinner size="md" color="blue.500" />
                      </Box>
                    ) : displayItems.items.length === 0 ? (
                      <Box textAlign="center" py={8}>
                        <Icon as={LuMail} boxSize={8} color={{ base: "gray.400", _dark: "gray.500" }} mb={2} />
                        <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                          <Trans>Nimate pogovorov</Trans>
                        </Text>
                      </Box>
                    ) : displayItems.type === 'conversations' ? (
                      (displayItems.items as Conversation[]).map((conversation) => {
                        const otherUser = conversation.user;
                        const fullName = `${otherUser.name} ${otherUser.surname}`;
                        const isSelected = selectedUserId === conversation.userId;
                        return (
                          <Card.Root
                            key={conversation.userId}
                            variant={isSelected ? "outline" : "subtle"}
                            borderRadius="md"
                            borderColor={isSelected ? { base: "blue.300", _dark: "blue.700" } : undefined}
                            bg={isSelected ? { base: "blue.50", _dark: "blue.950" } : undefined}
                            cursor="pointer"
                            onClick={() => handleUserSelect(conversation.userId, conversation.user)}
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
                                  borderColor={{ base: "blue.300", _dark: "blue.700" }}
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
                                        const target = e.target as HTMLImageElement;
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
                                      bg={{ base: "gray.300", _dark: "gray.600" }}
                                    >
                                      <Icon as={LuUserX} boxSize={5} color={{ base: "gray.500", _dark: "gray.400" }} />
                                    </Box>
                                  )}
                                </Box>
                                <VStack align="start" gap={0} flex={1} minWidth={0}>
                                  <HStack gap={2} align="center" width="100%">
                                    <Text
                                      fontSize="sm"
                                      fontWeight="semibold"
                                      color={{ base: "gray.800", _dark: "gray.100" }}
                                      lineClamp={1}
                                    >
                                      {fullName}
                                    </Text>
                                    {conversation.unreadCount > 0 && (
                                      <Badge colorPalette="red" size="xs">
                                        {conversation.unreadCount}
                                      </Badge>
                                    )}
                                  </HStack>
                                  <Text
                                    fontSize="xs"
                                    color={{ base: "gray.600", _dark: "gray.400" }}
                                    lineClamp={1}
                                  >
                                    {conversation.lastMessage.content}
                                  </Text>
                                  <Text
                                    fontSize="2xs"
                                    color={{ base: "gray.500", _dark: "gray.500" }}
                                  >
                                    {new Date(conversation.lastMessage.sentAt).toLocaleDateString("sl-SI", {
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
                      })
                    ) : (
                      (displayItems.items as Friend[]).map((friend) => {
                        const fullName = `${friend.user.name} ${friend.user.surname}`;
                        const isSelected = selectedUserId === friend.userId;
                        return (
                          <Card.Root
                            key={friend.userId}
                            variant={isSelected ? "outline" : "subtle"}
                            borderRadius="md"
                            borderColor={isSelected ? { base: "blue.300", _dark: "blue.700" } : { base: "orange.200", _dark: "orange.800" }}
                            bg={isSelected ? { base: "blue.50", _dark: "blue.950" } : { base: "orange.50", _dark: "orange.950" }}
                            cursor="pointer"
                            onClick={() => handleUserSelect(friend.userId, friend.user)}
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
                                  borderColor={{ base: "blue.300", _dark: "blue.700" }}
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
                                        const target = e.target as HTMLImageElement;
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
                                      bg={{ base: "gray.300", _dark: "gray.600" }}
                                    >
                                      <Icon as={LuUserX} boxSize={5} color={{ base: "gray.500", _dark: "gray.400" }} />
                                    </Box>
                                  )}
                                </Box>
                                <VStack align="start" gap={0} flex={1} minWidth={0}>
                                  <Text
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color={{ base: "gray.800", _dark: "gray.100" }}
                                    lineClamp={1}
                                  >
                                    {fullName}
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    color={{ base: "gray.600", _dark: "gray.400" }}
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
    </Box>
  );
}
