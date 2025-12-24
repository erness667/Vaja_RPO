"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Textarea,
  Spinner,
} from "@chakra-ui/react";
import { LuSend, LuUserX } from "react-icons/lu";
import { useChatMessages } from "@/lib/hooks/useChatMessages";
import { useChatHub } from "@/lib/hooks/useChatHub";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { postApiChatMarkRead } from "@/client";
import "@/lib/api-client";
import type { Message } from "@/lib/types/chat";
import type { UserInfo } from "@/lib/types/friend";
import { Trans } from "@lingui/macro";

interface ChatViewProps {
  otherUser: UserInfo | null;
  otherUserId: string | null;
  currentUserId: string;
}

export function ChatView({ otherUser, otherUserId, currentUserId }: ChatViewProps) {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUserProfile();

  const { messages, isLoading, error, addMessage, updateMessageReadStatus, refetch } = useChatMessages(otherUserId);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (otherUserId && messages.length > 0) {
      const unreadMessages = messages.filter(
        (m) => m.receiverId === currentUserId && !m.isRead
      );
      if (unreadMessages.length > 0) {
        postApiChatMarkRead({
          body: { senderId: otherUserId },
        }).catch((err) => console.error("Error marking messages as read:", err));
      }
    }
  }, [otherUserId, messages, currentUserId]);

  const handleMessageReceived = (message: Message) => {
    // Only add if it's for the current conversation
    if (
      message.senderId === otherUserId ||
      message.receiverId === otherUserId
    ) {
      addMessage(message);
      // Mark as read if we're the receiver
      if (message.receiverId === currentUserId) {
        postApiChatMarkRead({
          body: { senderId: message.senderId },
        }).catch((err) => console.error("Error marking messages as read:", err));
      }
    }
  };

  const handleMessageSent = (message: Message) => {
    // Only add if it's for the current conversation
    if (
      message.senderId === otherUserId ||
      message.receiverId === otherUserId
    ) {
      addMessage(message);
    }
  };

  const { sendMessage } = useChatHub(
    handleMessageReceived,
    handleMessageSent,
    (messageId) => {
      updateMessageReadStatus(messageId, new Date().toISOString());
    }
  );

  const handleSend = async () => {
    if (!messageText.trim() || !otherUserId || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(otherUserId, messageText.trim());
      setMessageText("");
      // Refetch to get the latest messages
      setTimeout(() => refetch(), 500);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!otherUser || !otherUserId) {
    return (
      <Box
        height="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={8}
        textAlign="center"
      >
        <Icon as={LuSend} boxSize={16} color={{ base: "gray.300", _dark: "gray.600" }} mb={4} />
        <Heading size="lg" color={{ base: "gray.600", _dark: "gray.400" }} mb={2}>
          <Trans>Vaša sporočila</Trans>
        </Heading>
        <Text color={{ base: "gray.500", _dark: "gray.500" }} mb={6}>
          <Trans>Izberite pogovor za ogled sporočil</Trans>
        </Text>
      </Box>
    );
  }

  const fullName = `${otherUser.name} ${otherUser.surname}`;

  return (
    <VStack height="100%" align="stretch" gap={0}>
      {/* Chat Header */}
      <Box
        p={4}
        borderBottomWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        bg={{ base: "white", _dark: "gray.800" }}
      >
        <HStack gap={4}>
          <Box
            width="56px"
            height="56px"
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
                width={56}
                height={56}
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
                <Icon as={LuUserX} boxSize={6} color={{ base: "gray.500", _dark: "gray.400" }} />
              </Box>
            )}
          </Box>
          <VStack align="start" gap={0} flex={1} minWidth={0}>
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
              @{otherUser.username}
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Messages */}
      <Box
        flex={1}
        p={4}
        overflowY="auto"
        bg={{ base: "gray.50", _dark: "gray.900" }}
      >
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Spinner size="lg" color="blue.500" />
          </Box>
        ) : error ? (
          <Box textAlign="center" py={8}>
            <Text color={{ base: "red.600", _dark: "red.400" }}>{error}</Text>
          </Box>
        ) : messages.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color={{ base: "gray.500", _dark: "gray.400" }}>
              <Trans>Ni sporočil. Začnite pogovor!</Trans>
            </Text>
          </Box>
        ) : (
          <VStack gap={3} align="stretch">
            {messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              const sender = isOwn ? user : otherUser;

              return (
                <HStack
                  key={message.id}
                  gap={3}
                  align="flex-end"
                  justify={isOwn ? "flex-end" : "flex-start"}
                >
                  {!isOwn && (
                    <Box
                      width="32px"
                      height="32px"
                      borderRadius="full"
                      overflow="hidden"
                      bg={{ base: "gray.200", _dark: "gray.700" }}
                      flexShrink={0}
                    >
                      {sender?.avatarImageUrl ? (
                        <Image
                          src={sender.avatarImageUrl}
                          alt={sender?.name || ""}
                          width={32}
                          height={32}
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
                          <Icon
                            as={LuUserX}
                            boxSize={4}
                            color={{ base: "gray.500", _dark: "gray.400" }}
                          />
                        </Box>
                      )}
                    </Box>
                  )}
                  <VStack
                    align={isOwn ? "flex-end" : "flex-start"}
                    gap={0}
                    maxWidth="70%"
                  >
                    <Box
                      p={3}
                      borderRadius="lg"
                      bg={
                        isOwn
                          ? { base: "blue.500", _dark: "blue.600" }
                          : { base: "white", _dark: "gray.800" }
                      }
                      color={
                        isOwn
                          ? { base: "white", _dark: "white" }
                          : { base: "gray.800", _dark: "gray.100" }
                      }
                      borderWidth={isOwn ? "0" : "1px"}
                      borderColor={
                        isOwn ? undefined : { base: "gray.200", _dark: "gray.700" }
                      }
                      boxShadow="sm"
                    >
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {message.content}
                      </Text>
                    </Box>
                    <Text
                      fontSize="2xs"
                      color={{ base: "gray.500", _dark: "gray.400" }}
                      mt={1}
                      px={1}
                    >
                      {new Date(message.sentAt).toLocaleTimeString("sl-SI", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </VStack>
                  {isOwn && (
                    <Box
                      width="32px"
                      height="32px"
                      borderRadius="full"
                      overflow="hidden"
                      bg={{ base: "gray.200", _dark: "gray.700" }}
                      flexShrink={0}
                    >
                      {user?.avatarImageUrl ? (
                        <Image
                          src={user.avatarImageUrl}
                          alt={user?.name || ""}
                          width={32}
                          height={32}
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
                          <Icon
                            as={LuUserX}
                            boxSize={4}
                            color={{ base: "gray.500", _dark: "gray.400" }}
                          />
                        </Box>
                      )}
                    </Box>
                  )}
                </HStack>
              );
            })}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* Message Input */}
      <Box
        p={4}
        borderTopWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        bg={{ base: "white", _dark: "gray.800" }}
      >
        <HStack gap={2}>
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Napišite sporočilo..."
            resize="none"
            rows={3}
            disabled={isSending}
            bg={{ base: "gray.50", _dark: "gray.900" }}
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
          />
          <Button
            colorPalette="blue"
            onClick={handleSend}
            loading={isSending}
            disabled={!messageText.trim() || isSending}
            size="lg"
          >
            <Icon as={LuSend} />
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
}

