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
import { LuSend, LuUserX, LuCheck, LuCheckCheck } from "react-icons/lu";
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
  isMessageRequest?: boolean;
  canSendMessages?: boolean; // Whether the user can send messages (false if request is pending)
}

export function ChatView({ otherUser, otherUserId, currentUserId, isMessageRequest = false, canSendMessages = true }: ChatViewProps) {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const markedAsReadRef = useRef<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasScrolledToBottomRef = useRef<boolean>(false);
  const isUserNearBottomRef = useRef<boolean>(true); // Track if user is near bottom
  const { user } = useUserProfile();

  const { messages, isLoading, error, addMessage, updateMessageReadStatus, markMessagesFromSenderAsRead } = useChatMessages(otherUserId, isMessageRequest);

  // Scroll to bottom only when new messages are added (not when read status changes)
  useEffect(() => {
    // Skip if no messages
    if (messages.length === 0) {
      return;
    }

    // Scroll on initial load (instant) or when new messages are added (only if user was near bottom)
    const isNewMessage = messages.length > lastMessageCountRef.current;
    const shouldScrollOnInitialLoad = !hasScrolledToBottomRef.current;
    const shouldScrollOnNewMessage = isNewMessage && isUserNearBottomRef.current;
    
    if (shouldScrollOnInitialLoad) {
      // Initial load - scroll instantly without animation
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      hasScrolledToBottomRef.current = true;
      isUserNearBottomRef.current = true;
    } else if (shouldScrollOnNewMessage) {
      // New message - scroll smoothly only if user was near bottom
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        scrollTimeoutRef.current = null;
      }, 50);
    }
    lastMessageCountRef.current = messages.length;
  }, [messages.length]);

  // Reset marked ref and scroll tracking when switching conversations or message request status
  useEffect(() => {
    markedAsReadRef.current = null;
    lastMessageCountRef.current = 0;
    hasScrolledToBottomRef.current = false;
    isUserNearBottomRef.current = true; // Reset to true when switching conversations
  }, [otherUserId, isMessageRequest]);

  // Track scroll position to determine if user is near bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Consider user "near bottom" if within 100px of bottom
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      isUserNearBottomRef.current = distanceFromBottom < 100;
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [otherUserId]); // Re-attach when conversation changes

  // Cleanup timeouts on unmount
  useEffect(() => {
    const scrollTimeout = scrollTimeoutRef.current;
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  // Mark messages as read when chat opens
  useEffect(() => {
    // Don't run if no user selected or still loading
    if (!otherUserId || isLoading) {
      return;
    }

    // Only mark once per conversation
    if (markedAsReadRef.current === otherUserId) {
      return;
    }

    // Wait for messages to load
    if (messages.length === 0) {
      return;
    }

    const unreadMessages = messages.filter(
      (m) => m.receiverId === currentUserId && !m.isRead
    );
    
    if (unreadMessages.length > 0) {
      // Mark as processed to prevent duplicate calls
      markedAsReadRef.current = otherUserId;
      
      // Update UI optimistically first (no refetch needed for messages)
      markMessagesFromSenderAsRead(otherUserId);
      
      // Mark as read on backend
      postApiChatMarkRead({
        body: { senderId: otherUserId },
      })
        .then(() => {
          // Dispatch global event to update conversations everywhere (sidebar, etc.)
          // This will trigger refetch in sidebar, but not in chat messages
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("messagesMarkedAsRead"));
          }
        })
        .catch((err) => {
          console.error("Error marking messages as read:", err);
          markedAsReadRef.current = null;
        });
    } else {
      markedAsReadRef.current = otherUserId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId, isLoading, currentUserId, messages.length]);

  const handleMessageReceived = (message: Message) => {
    // Only dispatch global event if we're the receiver (not the sender)
    // This updates requests/conversations lists for the receiver
    if (message.receiverId === currentUserId && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("newMessageReceived"));
    }
    
    // Only handle if it's for the current conversation
    if (
      message.senderId === otherUserId ||
      message.receiverId === otherUserId
    ) {
      addMessage(message);
      
      // Mark as read if we're the receiver and chat is open
      if (message.receiverId === currentUserId && otherUserId) {
        // Mark this specific message as read optimistically
        updateMessageReadStatus(message.id, new Date().toISOString());
        
        // Update backend
        postApiChatMarkRead({
          body: { senderId: message.senderId },
        })
          .then(() => {
            // Dispatch global event to update conversations everywhere (sidebar, etc.)
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("messagesMarkedAsRead"));
            }
          })
          .catch((err) => console.error("Error marking messages as read:", err));
      }
    }
  };

  const handleMessageSent = (message: Message) => {
    // Only add if it's for the current conversation
    if (
      message.senderId === otherUserId ||
      message.receiverId === otherUserId
    ) {
      // When user sends a message, they want to see it - always scroll
      isUserNearBottomRef.current = true;
      addMessage(message);
      
      // If this is a message request (sent to non-friend), dispatch event to update requests tab
      // The backend sets isMessageRequest = true when users are not friends
      // Always dispatch if message.isMessageRequest is true (regardless of current tab)
      // This ensures sent message requests appear in the "zahteve" tab
      if (message.isMessageRequest === true) {
        if (typeof window !== "undefined") {
          console.log("Message sent to non-friend, dispatching messageSent event");
          // Add a delay to ensure backend has processed the message and updated the database
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("messageSent"));
          }, 800);
        }
      }
      
      // Don't dispatch newMessageReceived here - message is already added locally
      // The receiver will get it via handleMessageReceived and dispatch the event there
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
      // The message will be added via SignalR's MessageSent event
      // Don't refetch conversations immediately to avoid flickering
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
      <VStack ref={chatContainerRef} height="100%" align="stretch" gap={0}>
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
        ref={messagesContainerRef}
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
                    <HStack gap={1} align="center" mt={1} px={1}>
                      <Text
                        fontSize="2xs"
                        color={{ base: "gray.500", _dark: "gray.400" }}
                      >
                        {new Date(message.sentAt).toLocaleTimeString("sl-SI", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      {isOwn && (
                        <Icon
                          as={message.isRead ? LuCheckCheck : LuCheck}
                          boxSize={3}
                          color={message.isRead 
                            ? { base: "blue.500", _dark: "blue.400" }
                            : { base: "gray.400", _dark: "gray.500" }
                          }
                        />
                      )}
                    </HStack>
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
        {isMessageRequest && !canSendMessages && (
          <Box
            p={2}
            mb={2}
            borderRadius="md"
            bg={{ base: "orange.50", _dark: "orange.950" }}
            borderWidth="1px"
            borderColor={{ base: "orange.200", _dark: "orange.800" }}
            textAlign="center"
          >
            <Text fontSize="xs" color={{ base: "orange.700", _dark: "orange.300" }}>
              <Trans>Sprejmite ali zavrnite zahtevo, da začnete pogovor.</Trans>
            </Text>
          </Box>
        )}
        <HStack gap={2}>
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isMessageRequest && !canSendMessages ? "Sprejmite zahtevo za pošiljanje sporočil..." : isMessageRequest ? "Odgovorite na zahtevo..." : "Napišite sporočilo..."}
            resize="none"
            rows={3}
            disabled={isSending || !canSendMessages}
            bg={{ base: "gray.50", _dark: "gray.900" }}
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
          />
          <Button
            colorPalette="blue"
            onClick={handleSend}
            loading={isSending}
            disabled={!messageText.trim() || isSending || !canSendMessages}
            size="lg"
          >
            <Icon as={LuSend} />
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
}

