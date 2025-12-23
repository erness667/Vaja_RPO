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
import { useFriendRequests } from "@/lib/hooks/useFriendRequests";
import { useAcceptFriendRequest } from "@/lib/hooks/useAcceptFriendRequest";
import { useRejectFriendRequest } from "@/lib/hooks/useRejectFriendRequest";
import { useCancelFriendRequest } from "@/lib/hooks/useCancelFriendRequest";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import type { FriendRequest } from "@/lib/types/friend";
import { Trans } from "@lingui/macro";

function ChatListItem({
  request,
  currentUserId,
  isSelected,
  onClick,
}: {
  request: FriendRequest;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isReceived = request.addresseeId === currentUserId;
  const otherUser = isReceived ? request.requester : request.addressee;
  const fullName = otherUser ? `${otherUser.name} ${otherUser.surname}` : "Unknown User";
  const username = otherUser?.username || "unknown";

  return (
    <Card.Root
      variant={isSelected ? "outline" : "subtle"}
      borderRadius="md"
      borderColor={isSelected ? { base: "blue.300", _dark: "blue.700" } : undefined}
      bg={isSelected ? { base: "blue.50", _dark: "blue.950" } : undefined}
      cursor="pointer"
      onClick={onClick}
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
            borderColor={isReceived ? { base: "orange.300", _dark: "orange.700" } : { base: "gray.300", _dark: "gray.600" }}
          >
            {otherUser?.avatarImageUrl ? (
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
              {isReceived && (
                <Badge colorPalette="orange" size="xs">
                  <Trans>Prejeto</Trans>
                </Badge>
              )}
            </HStack>
            <Text
              fontSize="xs"
              color={{ base: "gray.600", _dark: "gray.400" }}
              lineClamp={1}
            >
              @{username}
            </Text>
          </VStack>
        </HStack>
      </CardBody>
    </Card.Root>
  );
}

function ChatView({
  request,
  currentUserId,
  onAction,
}: {
  request: FriendRequest | null;
  currentUserId: string;
  onAction: () => void;
}) {
  const { acceptFriendRequest, isLoading: isAccepting } = useAcceptFriendRequest();
  const { rejectFriendRequest, isLoading: isRejecting } = useRejectFriendRequest();
  const { cancelFriendRequest, isLoading: isCanceling } = useCancelFriendRequest();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!request) {
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
        <Icon as={LuMail} boxSize={16} color={{ base: "gray.300", _dark: "gray.600" }} mb={4} />
        <Heading size="lg" color={{ base: "gray.600", _dark: "gray.400" }} mb={2}>
          <Trans>Vaša sporočila</Trans>
        </Heading>
        <Text color={{ base: "gray.500", _dark: "gray.500" }} mb={6}>
          <Trans>Izberite zahtevo za prijateljstvo za ogled podrobnosti</Trans>
        </Text>
        <Button colorPalette="blue" size="lg">
          <HStack gap={2}>
            <Icon as={LuSend} />
            <Text><Trans>Pošlji sporočilo</Trans></Text>
          </HStack>
        </Button>
      </Box>
    );
  }

  const isReceived = request.addresseeId === currentUserId;
  const otherUser = isReceived ? request.requester : request.addressee;
  const fullName = otherUser ? `${otherUser.name} ${otherUser.surname}` : "Unknown User";
  const username = otherUser?.username || "unknown";

  const handleAccept = async () => {
    setIsProcessing(true);
    const success = await acceptFriendRequest(request.id);
    if (success) {
      onAction();
    }
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    const success = await rejectFriendRequest(request.id);
    if (success) {
      onAction();
    }
    setIsProcessing(false);
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    const success = await cancelFriendRequest(request.id);
    if (success) {
      onAction();
    }
    setIsProcessing(false);
  };

  const isLoading = isProcessing || isAccepting || isRejecting || isCanceling;

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
            {otherUser?.avatarImageUrl ? (
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
              @{username}
            </Text>
          </VStack>
          <Badge
            colorPalette={isReceived ? "orange" : "gray"}
            size="md"
          >
            {isReceived ? <Trans>Prejeto</Trans> : <Trans>Poslano</Trans>}
          </Badge>
        </HStack>
      </Box>

      {/* Chat Content */}
      <Box flex={1} p={6} overflowY="auto">
        <VStack gap={4} align="stretch">
          <Card.Root variant="outline" borderRadius="lg">
            <CardBody p={4}>
              <VStack gap={3} align="stretch">
                <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                  <Trans>Zahteva za prijateljstvo</Trans>
                </Text>
                <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }}>
                  {new Date(request.createdAt).toLocaleDateString("sl-SI", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </VStack>
            </CardBody>
          </Card.Root>
        </VStack>
      </Box>

      {/* Chat Actions */}
      <Box
        p={4}
        borderTopWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        bg={{ base: "white", _dark: "gray.800" }}
      >
        {isReceived ? (
          <HStack gap={2} justify="flex-end">
            <Button
              size="md"
              colorPalette="blue"
              onClick={handleAccept}
              loading={isLoading}
              disabled={isLoading}
            >
              <HStack gap={2}>
                <Icon as={LuUserPlus} />
                <Text><Trans>Sprejmi</Trans></Text>
              </HStack>
            </Button>
            <Button
              size="md"
              variant="outline"
              colorPalette="red"
              onClick={handleReject}
              loading={isLoading}
              disabled={isLoading}
            >
              <HStack gap={2}>
                <Icon as={LuX} />
                <Text><Trans>Zavrni</Trans></Text>
              </HStack>
            </Button>
          </HStack>
        ) : (
          <HStack gap={2} justify="flex-end">
            <Button
              size="md"
              variant="outline"
              colorPalette="red"
              onClick={handleCancel}
              loading={isLoading}
              disabled={isLoading}
            >
              <HStack gap={2}>
                <Icon as={LuUserMinus} />
                <Text><Trans>Prekliči</Trans></Text>
              </HStack>
            </Button>
          </HStack>
        )}
      </Box>
    </VStack>
  );
}

export function MessagesPage() {
  const { user } = useUserProfile();
  const { requests, isLoading, error, refetch } = useFriendRequests();
  
  // Auto-select first received request if available
  const initialRequest = useMemo(() => {
    if (requests && user) {
      return requests.find((r) => r.addresseeId === user.id && r.status === 0) || null;
    }
    return null;
  }, [requests, user]);
  
  const [selectedRequest, setSelectedRequest] = useState<FriendRequest | null>(null);

  // Update selected request when initial request changes
  useEffect(() => {
    if (initialRequest && !selectedRequest) {
      // Use setTimeout to defer state update
      const timer = setTimeout(() => {
        setSelectedRequest(initialRequest);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialRequest, selectedRequest]);

  const handleAction = () => {
    setTimeout(() => {
      refetch();
      setSelectedRequest(null);
    }, 500);
  };

  const allRequests = (requests || [])
    .filter((r) => r.status === 0)
    .sort((a, b) => {
      // Sort: received requests first, then by date
      const aIsReceived = a.addresseeId === user?.id;
      const bIsReceived = b.addresseeId === user?.id;
      if (aIsReceived && !bIsReceived) return -1;
      if (!aIsReceived && bIsReceived) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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
                    request={selectedRequest}
                    currentUserId={user?.id || ""}
                    onAction={handleAction}
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
                    {allRequests.length === 0 ? (
                      <Box textAlign="center" py={8}>
                        <Icon as={LuMail} boxSize={8} color={{ base: "gray.400", _dark: "gray.500" }} mb={2} />
                        <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                          <Trans>Nimate zahtev</Trans>
                        </Text>
                      </Box>
                    ) : (
                      allRequests.map((request) => (
                        <ChatListItem
                          key={request.id}
                          request={request}
                          currentUserId={user?.id || ""}
                          isSelected={selectedRequest?.id === request.id}
                          onClick={() => setSelectedRequest(request)}
                        />
                      ))
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
